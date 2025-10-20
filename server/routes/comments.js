const express = require('express');
const router = express.Router();
const {
  createComment,
  getCommentsByReportId,
  getCommentById,
  updateComment,
  deleteComment,
} = require('../db/queries/comments');
const { createBulkNotifications } = require('../db/queries/notifications');
const { getReportById } = require('../db/queries/reports');
const { authMiddleware, requireRole } = require('../middleware/auth');

/**
 * POST /api/comments
 * Create a new comment on a report (requires authentication)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { report_id, text } = req.body;

    if (!report_id || !text) {
      return res.status(400).json({ error: 'report_id and text are required' });
    }

    // Verify report exists
    const report = await getReportById(report_id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Create comment
    const newComment = await createComment({
      report_id,
      user_id: req.user.id,
      text,
    });

    // Create notifications for all subscribed users (except the commenter)
    const subscribedUsers = report.subscribed_user_ids.filter(
      (userId) => userId !== req.user.id
    );

    if (subscribedUsers.length > 0) {
      await createBulkNotifications(subscribedUsers, {
        type: 'new_comment',
        title_en: 'New Comment on Report',
        title_ar: 'تعليق جديد على التقرير',
        body_en: `Someone commented on a report you're following`,
        body_ar: `قام شخص ما بالتعليق على تقرير تتابعه`,
        report_id,
      });
    }

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

/**
 * GET /api/comments/report/:reportId
 * Get all comments for a specific report
 */
router.get('/report/:reportId', async (req, res) => {
  try {
    const comments = await getCommentsByReportId(req.params.reportId);
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

/**
 * GET /api/comments/:id
 * Get a single comment by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const comment = await getCommentById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json(comment);
  } catch (error) {
    console.error('Get comment error:', error);
    res.status(500).json({ error: 'Failed to fetch comment' });
  }
});

/**
 * PATCH /api/comments/:id
 * Update a comment (only by the author or admin)
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const comment = await getCommentById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only allow the comment author or super admin to edit
    if (comment.user_id !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    const updatedComment = await updateComment(req.params.id, text);
    res.json(updatedComment);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

/**
 * DELETE /api/comments/:id
 * Delete a comment (only by the author or admin)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const comment = await getCommentById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only allow the comment author or super admin to delete
    if (comment.user_id !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    const deletedComment = await deleteComment(req.params.id);
    res.json({ message: 'Comment deleted successfully', comment: deletedComment });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;
