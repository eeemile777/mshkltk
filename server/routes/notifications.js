const express = require('express');
const router = express.Router();
const {
  getNotificationsByUserId,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllByUserId,
} = require('../db/queries/notifications');
const { authMiddleware } = require('../middleware/auth');

/**
 * GET /api/notifications
 * Get all notifications for the authenticated user
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const notifications = await getNotificationsByUserId(
      req.user.id,
      parseInt(limit),
      parseInt(offset)
    );

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * GET /api/notifications/unread-count
 * Get the count of unread notifications
 */
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const updatedNotification = await markAsRead(req.params.id);

    if (!updatedNotification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(updatedNotification);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read for the authenticated user
 */
router.post('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const updatedNotifications = await markAllAsRead(req.user.id);
    res.json({ message: 'All notifications marked as read', count: updatedNotifications.length });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedNotification = await deleteNotification(req.params.id);

    if (!deletedNotification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

/**
 * DELETE /api/notifications
 * Delete all notifications for the authenticated user
 */
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const count = await deleteAllByUserId(req.user.id);
    res.json({ message: 'All notifications deleted successfully', count });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({ error: 'Failed to delete all notifications' });
  }
});

module.exports = router;
