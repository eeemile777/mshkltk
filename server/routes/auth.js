const express = require('express');
const router = express.Router();
const { createUser, findUserByUsername } = require('../db/queries/users');
const { generateSalt, hashPassword, verifyPassword } = require('../utils/crypto');
const { generateToken } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Register a new user account
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, first_name, last_name, role = 'citizen' } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
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
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Login with username and password
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/auth/verify
 * Verify if a token is still valid
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
