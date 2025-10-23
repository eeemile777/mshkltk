const { query } = require('../connection');
const { awardPoints } = require('./users');

/**
 * Comment Query Functions
 * Handles all database operations related to comments
 */

// Create a new comment
const createComment = async (commentData) => {
  const { report_id, user_id, text } = commentData;

  const result = await query(
    `INSERT INTO comments (report_id, user_id, text)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [report_id, user_id, text]
  );

  // Award points for commenting
  await awardPoints(user_id, 'comment');

  return result.rows[0];
};

// Get all comments for a report
const getCommentsByReportId = async (reportId) => {
  const result = await query(
    `SELECT c.*, u.display_name, u.avatar_url, u.role
     FROM comments c
     LEFT JOIN users u ON c.user_id = u.id
     WHERE c.report_id = $1
     ORDER BY c.created_at ASC`,
    [reportId]
  );

  return result.rows;
};

// Get a single comment by ID
const getCommentById = async (commentId) => {
  const result = await query(
    'SELECT * FROM comments WHERE id = $1',
    [commentId]
  );

  return result.rows[0];
};

// Update a comment
const updateComment = async (commentId, text) => {
  const result = await query(
    'UPDATE comments SET text = $1 WHERE id = $2 RETURNING *',
    [text, commentId]
  );

  return result.rows[0];
};

// Delete a comment
const deleteComment = async (commentId) => {
  const result = await query(
    'DELETE FROM comments WHERE id = $1 RETURNING *',
    [commentId]
  );

  return result.rows[0];
};

// Get total comment count for a report
const getCommentCount = async (reportId) => {
  const result = await query(
    'SELECT COUNT(*) as count FROM comments WHERE report_id = $1',
    [reportId]
  );

  return parseInt(result.rows[0].count);
};

module.exports = {
  createComment,
  getCommentsByReportId,
  getCommentById,
  updateComment,
  deleteComment,
  getCommentCount,
};
