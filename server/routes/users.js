const express = require('express');
const router = express.Router();
const {
  findUserById,
  updateUser,
  getLeaderboard,
  getAllPortalUsers,
  deleteUser,
} = require('../db/queries/users');
const { authMiddleware, requireRole } = require('../middleware/auth');

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get authenticated user's profile
 *     description: Retrieve the full profile of the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't send password hash and salt
    delete user.password_hash;
    delete user.salt;

    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user's public profile
 *     description: Retrieve public profile information for any user (no authentication required)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "user-123"
 *     responses:
 *       200:
 *         description: Public profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 display_name:
 *                   type: string
 *                 avatar_url:
 *                   type: string
 *                 points:
 *                   type: integer
 *                 achievements:
 *                   type: array
 *                   items:
 *                     type: string
 *                 reports_count:
 *                   type: integer
 *                 reports_confirmed:
 *                   type: integer
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await findUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return only public information
    const publicProfile = {
      id: user.id,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      points: user.points,
      achievements: user.achievements,
      reports_count: user.reports_count,
      reports_confirmed: user.reports_confirmed,
      created_at: user.created_at,
    };

    res.json(publicProfile);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     summary: Update authenticated user's profile
 *     description: Update profile information for the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               display_name:
 *                 type: string
 *                 example: "Johnny"
 *               avatar_url:
 *                 type: string
 *                 example: "https://example.com/avatar.jpg"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Server error
 */
router.patch('/me', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;

    // Prevent updating sensitive fields via this endpoint
    delete updates.password_hash;
    delete updates.salt;
    delete updates.role;
    delete updates.points;
    delete updates.achievements;
    delete updates.reports_count;
    delete updates.reports_confirmed;

    const updatedUser = await updateUser(req.user.id, updates);

    // Don't send password hash and salt
    delete updatedUser.password_hash;
    delete updatedUser.salt;

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

/**
 * @swagger
 * /api/users/leaderboard:
 *   get:
 *     summary: Get leaderboard
 *     description: Retrieve top users ranked by points (no authentication required)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of users to return
 *         example: 20
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   display_name:
 *                     type: string
 *                   avatar_url:
 *                     type: string
 *                   points:
 *                     type: integer
 *                   achievements:
 *                     type: array
 *                     items:
 *                       type: string
 *                   reports_count:
 *                     type: integer
 *                   reports_confirmed:
 *                     type: integer
 *       500:
 *         description: Server error
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const leaderboard = await getLeaderboard(parseInt(limit));
    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * @swagger
 * /api/users/portal/all:
 *   get:
 *     summary: Get all portal users
 *     description: Retrieve all municipality portal users (super admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Portal users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - super admin role required
 *       500:
 *         description: Server error
 */
router.get('/portal/all', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const users = await getAllPortalUsers();

    // Remove sensitive data
    const sanitizedUsers = users.map(user => {
      delete user.password_hash;
      delete user.salt;
      return user;
    });

    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Get portal users error:', error);
    res.status(500).json({ error: 'Failed to fetch portal users' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user account
 *     description: Delete a user account (users can delete their own account, super admins can delete any)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *         example: "user-123"
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User account deleted successfully"
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - not authorized to delete this user
 *       500:
 *         description: Server error
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Allow users to delete their own account or super admins to delete any account
    if (req.user.id !== req.params.id && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Not authorized to delete this user' });
    }

    await deleteUser(req.params.id);
    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user account' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update any user (Super Admin only)
 *     description: Update any user's profile, role, or status (Super Admin privilege)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [citizen, portal_user, super_admin]
 *               portal_access_level:
 *                 type: string
 *                 enum: [read_only, read_write]
 *               municipality:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *               points:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin only
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if user exists
    const existingUser = await findUserById(id);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user
    const updatedUser = await updateUser(id, updateData);

    // Remove sensitive data
    delete updatedUser.password_hash;
    delete updatedUser.salt;

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (Super Admin only)
 *     description: Create a new portal user or admin account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - full_name
 *               - email
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 example: "portaluser1"
 *               password:
 *                 type: string
 *                 example: "securePassword123"
 *               full_name:
 *                 type: string
 *                 example: "Portal User"
 *               email:
 *                 type: string
 *                 example: "portal@example.com"
 *               role:
 *                 type: string
 *                 enum: [citizen, portal_user, super_admin]
 *                 example: "portal_user"
 *               portal_access_level:
 *                 type: string
 *                 enum: [read_only, read_write]
 *                 example: "read_write"
 *               municipality:
 *                 type: string
 *                 example: "beirut"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input or username already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin only
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const { username, password, full_name, email, role, portal_access_level, municipality } = req.body;

    // Validate required fields
    if (!username || !password || !full_name || !email || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if username already exists
    const pool = require('../db/connection');
    const existingUser = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const crypto = require('crypto');
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    // Create user ID
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Insert new user
    const query = `
      INSERT INTO users (
        id, username, password_hash, salt, full_name, email, role,
        portal_access_level, municipality, is_active, points, level, badges
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, 0, 1, '[]'::jsonb)
      RETURNING *
    `;

    const result = await pool.query(query, [
      userId,
      username,
      hash,
      salt,
      full_name,
      email,
      role,
      portal_access_level || null,
      municipality || null
    ]);

    const newUser = result.rows[0];

    // Remove sensitive data
    delete newUser.password_hash;
    delete newUser.salt;

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

module.exports = router;
