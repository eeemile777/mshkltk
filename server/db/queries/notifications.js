const { query, getClient } = require('../connection');

/**
 * Notification Query Functions
 * Handles all database operations related to notifications
 */

// Create a new notification
const createNotification = async (notificationData) => {
  const {
    user_id,
    type,
    title_en,
    title_ar,
    body_en = null,
    body_ar = null,
    report_id = null,
  } = notificationData;

  const result = await query(
    `INSERT INTO notifications (user_id, type, title_en, title_ar, body_en, body_ar, report_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [user_id, type, title_en, title_ar, body_en, body_ar, report_id]
  );

  return result.rows[0];
};

// Create notifications for multiple users (bulk)
const createBulkNotifications = async (userIds, notificationData) => {
  const { type, title_en, title_ar, body_en, body_ar, report_id } = notificationData;

  const client = await getClient();
  const notifications = [];

  try {
    await client.query('BEGIN');

    for (const user_id of userIds) {
      const result = await client.query(
        `INSERT INTO notifications (user_id, type, title_en, title_ar, body_en, body_ar, report_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [user_id, type, title_en, title_ar, body_en, body_ar, report_id]
      );
      notifications.push(result.rows[0]);
    }

    await client.query('COMMIT');
    return notifications;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Get all notifications for a user
const getNotificationsByUserId = async (userId, limit = 50, offset = 0) => {
  const result = await query(
    `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

// Get unread notification count for a user
const getUnreadCount = async (userId) => {
  const result = await query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
    [userId]
  );

  return parseInt(result.rows[0].count);
};

// Mark a notification as read
const markAsRead = async (notificationId) => {
  const result = await query(
    'UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *',
    [notificationId]
  );

  return result.rows[0];
};

// Mark all notifications as read for a user
const markAllAsRead = async (userId) => {
  const result = await query(
    'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false RETURNING *',
    [userId]
  );

  return result.rows;
};

// Delete a notification
const deleteNotification = async (notificationId) => {
  const result = await query(
    'DELETE FROM notifications WHERE id = $1 RETURNING *',
    [notificationId]
  );

  return result.rows[0];
};

// Delete all notifications for a user
const deleteAllByUserId = async (userId) => {
  const result = await query(
    'DELETE FROM notifications WHERE user_id = $1',
    [userId]
  );

  return result.rowCount;
};

module.exports = {
  createNotification,
  createBulkNotifications,
  getNotificationsByUserId,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllByUserId,
};
