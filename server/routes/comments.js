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
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a new comment on a report
 *     description: Add a comment to a report and notify all subscribed users (requires authentication)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - report_id
 *               - text
 *             properties:
 *               report_id:
 *                 type: string
 *                 description: ID of the report to comment on
 *                 example: "report-123"
 *               text:
 *                 type: string
 *                 description: Comment text content
 *                 example: "I noticed this issue too!"
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, async (req, res) => {
  // Disallow anonymous users from commenting
  if (req.user && req.user.is_anonymous) {
    return res.status(403).json({ error: 'Anonymous users cannot comment' });
  }
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
 * @swagger
 * /api/comments/report/{reportId}:
 *   get:
 *     summary: Get all comments for a report
 *     description: Retrieve all comments associated with a specific report
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the report
 *         example: "report-123"
 *     responses:
 *       200:
 *         description: List of comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Server error
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
 * @swagger
 * /api/comments/{id}:
 *   get:
 *     summary: Get a single comment by ID
 *     description: Retrieve detailed information about a specific comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *         example: "comment-456"
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
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
 * @swagger
 * /api/comments/{id}:
 *   patch:
 *     summary: Update a comment
 *     description: Edit the text of an existing comment (only by author or super admin)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *         example: "comment-456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Updated comment text
 *                 example: "I noticed this issue has been fixed!"
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Missing required text field
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - not authorized to edit this comment
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
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
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     description: Remove a comment from a report (only by author or super admin)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *         example: "comment-456"
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment deleted successfully"
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - not authorized to delete this comment
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
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
