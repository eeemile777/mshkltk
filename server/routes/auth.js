const express = require('express');
const router = express.Router();
const { createUser, findUserByUsername } = require('../db/queries/users');
const { generateSalt, hashPassword, verifyPassword } = require('../utils/crypto');
const { generateToken } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validators');
const { asyncHandler } = require('../utils/errors');
const rateLimit = require('express-rate-limit');

// SECURITY FIX #4: Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window per IP (dev mode)
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * SECURITY FIX #15: Enhanced password validation
 */
const validatePasswordComplexity = (password) => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account
 *     description: Creates a new user account with username and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "securePass123"
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               role:
 *                 type: string
 *                 enum: [citizen, portal_admin, super_admin]
 *                 default: citizen
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Username already exists
 *       500:
 *         description: Server error
 */
router.post('/register', authLimiter, validateRegistration, asyncHandler(async (req, res) => {
  const { username, password, first_name, last_name, role = 'citizen' } = req.body;

  // SECURITY FIX #15: Enhanced password validation
  const passwordError = validatePasswordComplexity(password);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }

  // Check if username already exists
  const existingUser = await findUserByUsername(username);
  if (existingUser) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  // Generate salt and hash password
  const salt = generateSalt();
  const password_hash = await hashPassword(password, salt);

  // Create user
  const display_name = first_name && last_name
    ? `${first_name} ${last_name}`
    : username;

  const newUser = await createUser({
    username,
    first_name: first_name || null,
    last_name: last_name || null,
    display_name,
    is_anonymous: false,
    password_hash,
    salt,
    role,
  });

  // Generate token
  const token = generateToken(newUser);

  // Don't send password hash and salt to client
  delete newUser.password_hash;
  delete newUser.salt;

  res.status(201).json({
    user: newUser,
    token,
  });
}));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with username and password
 *     description: Authenticate a user and receive a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securePass123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: Missing credentials
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account is suspended
 *       500:
 *         description: Server error
 */
router.post('/login', authLimiter, validateLogin, asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Find user
  const user = await findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Check if account is active
  if (!user.is_active) {
    return res.status(403).json({ error: 'Account is suspended' });
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.salt, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Generate token
  const token = generateToken(user);

  // Don't send password hash and salt to client
  delete user.password_hash;
  delete user.salt;

  res.json({
    user,
    token,
  });
}));

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify JWT token
 *     description: Verifies if a JWT token is still valid and returns decoded user information
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     role:
 *                       type: string
 *                       example: "citizen"
 *                     iat:
 *                       type: integer
 *                       description: Issued at timestamp
 *                     exp:
 *                       type: integer
 *                       description: Expiration timestamp
 *       401:
 *         description: Token is invalid or missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: false
 */
router.post('/verify', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }

  const token = authHeader.substring(7);
  const { verifyToken } = require('../middleware/auth');
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ valid: false });
  }

  res.json({ valid: true, user: decoded });
});

module.exports = router;
