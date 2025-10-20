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
 * GET /api/users/me
 * Get the authenticated user's profile
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
 * GET /api/users/:id
 * Get a user's public profile
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
 * PATCH /api/users/me
 * Update the authenticated user's profile
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
 * GET /api/users/leaderboard
 * Get the leaderboard (top users by points)
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
 * GET /api/users/portal/all
 * Get all portal users (super admin only)
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
 * DELETE /api/users/:id
 * Delete a user account (super admin only or self)
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

module.exports = router;
