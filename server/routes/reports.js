const express = require('express');
const router = express.Router();
const { query: queryDb } = require('../db/connection');
const {
  createReport,
  getReportById,
  getReports,
  getNearbyReports,
  updateReport,
  confirmReport,
  addSubscriber,
  removeSubscriber,
  deleteReport,
  getReportsByMunicipality,
  getReportStats,
} = require('../db/queries/reports');
const { authMiddleware, requireRole, requireWriteAccess } = require('../middleware/auth');

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Create a new report
 *     description: Submit a new civic issue report (requires authentication)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - lat
 *               - lng
 *               - municipality
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Broken streetlight on Main St"
 *               description:
 *                 type: string
 *                 example: "The streetlight has been out for a week"
 *               category:
 *                 type: string
 *                 example: "infrastructure"
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               lat:
 *                 type: string
 *                 example: "33.888630"
 *               lng:
 *                 type: string
 *                 example: "35.495480"
 *               area:
 *                 type: string
 *                 example: "Downtown"
 *               municipality:
 *                 type: string
 *                 example: "beirut"
 *               photo_urls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of image URLs
 *     responses:
 *       201:
 *         description: Report created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('📝 Creating report with data:', JSON.stringify(req.body, null, 2).substring(0, 500));
    const reportData = {
      ...req.body,
      created_by: req.user.id,
    };

    const newReport = await createReport(reportData);
    console.log('✅ Report created successfully:', newReport.id);
    res.status(201).json(newReport);
  } catch (error) {
    console.error('❌ Create report error:', error.message);
    console.error('Error details:', error);
    res.status(500).json({ error: error.message || 'Failed to create report' });
  }
});

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all reports
 *     description: Retrieve reports with optional filters
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: municipality
 *         schema:
 *           type: string
 *         description: Filter by municipality
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, in_progress, resolved]
 *         description: Filter by status
 *       - in: query
 *         name: created_by
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by creator user ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: List of reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const { municipality, category, status, created_by, limit, offset } = req.query;
    
    const reports = await getReports({
      municipality,
      category,
      status,
      created_by,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0,
    });

    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

/**
 * @swagger
 * /api/reports/nearby:
 *   get:
 *     summary: Get nearby reports
 *     description: Find reports within a radius of given coordinates
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude
 *         example: 33.888630
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude
 *         example: 35.495480
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *         description: Search radius in kilometers
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: List of nearby reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5, limit = 50 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const reports = await getNearbyReports(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius),
      parseInt(limit)
    );

    res.json(reports);
  } catch (error) {
    console.error('Get nearby reports error:', error);
    res.status(500).json({ error: 'Failed to fetch nearby reports' });
  }
});

/**
 * @swagger
 * /api/reports/trending:
 *   get:
 *     summary: Get trending reports
 *     description: Retrieve reports that are trending based on confirmations, comments, and recency
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of reports to return
 *       - in: query
 *         name: municipality
 *         schema:
 *           type: string
 *         description: Filter by municipality (optional)
 *     responses:
 *       200:
 *         description: List of trending reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       500:
 *         description: Server error
 */
router.get('/trending', async (req, res) => {
  try {
    
    const { limit = 10, municipality } = req.query;

    // Trending algorithm:
    // Score = (confirmations_count * 3) + (comments_count * 2) + (1 / days_old)
    // Higher score = more trending
    let query = `
      SELECT 
        r.*,
        COUNT(DISTINCT c.id) as comments_count,
        COALESCE(
          (r.confirmations_count * 3) + 
          (COUNT(DISTINCT c.id) * 2) + 
          (1.0 / GREATEST(EXTRACT(EPOCH FROM (NOW() - r.created_at)) / 86400, 1)),
          0
        ) as trending_score
      FROM reports r
      LEFT JOIN comments c ON r.id = c.report_id
      WHERE r.status != 'resolved'
    `;

    const params = [];
    let paramCount = 1;

    if (municipality) {
      query += ` AND r.municipality = $${paramCount}`;
      params.push(municipality);
      paramCount++;
    }

    query += `
      GROUP BY r.id
      ORDER BY trending_score DESC
      LIMIT $${paramCount}
    `;
    params.push(parseInt(limit));

    const result = await queryDb(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Get trending reports error:', error);
    res.status(500).json({ error: 'Failed to fetch trending reports' });
  }
});

/**
 * @swagger
 * /api/reports/stats:
 *   get:
 *     summary: Get report statistics
 *     description: Retrieve aggregated statistics about reports, optionally filtered by municipality
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: municipality
 *         schema:
 *           type: string
 *         description: Filter statistics by municipality
 *         example: "beirut"
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 by_status:
 *                   type: object
 *                 by_category:
 *                   type: object
 *       500:
 *         description: Server error
 */
router.get('/stats', async (req, res) => {
  try {
    const { municipality } = req.query;
    const stats = await getReportStats(municipality);
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * @swagger
 * /api/reports/{id}:
 *   get:
 *     summary: Get report by ID
 *     description: Retrieve detailed information about a specific report
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *         example: "report-123"
 *     responses:
 *       200:
 *         description: Report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const report = await getReportById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

/**
 * @swagger
 * /api/reports/{id}:
 *   patch:
 *     summary: Update a report
 *     description: Update report details (portal staff with write access or super admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *         example: "report-123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title_en:
 *                 type: string
 *               title_ar:
 *                 type: string
 *               note_en:
 *                 type: string
 *               note_ar:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [new, under_review, in_progress, resolved, rejected]
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Report updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - write access required
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', authMiddleware, requireWriteAccess, async (req, res) => {
  try {
    const updatedReport = await updateReport(req.params.id, req.body);
    
    if (!updatedReport) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(updatedReport);
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

/**
 * @swagger
 * /api/reports/{id}/confirm:
 *   post:
 *     summary: Confirm a report
 *     description: Confirm that a report is accurate (cannot confirm own reports)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *         example: "report-123"
 *     responses:
 *       200:
 *         description: Report confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       400:
 *         description: Cannot confirm own report or already confirmed
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.post('/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const report = await getReportById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Prevent users from confirming their own reports
    if (report.created_by === req.user.id) {
      return res.status(400).json({ error: 'Cannot confirm your own report' });
    }

    const updatedReport = await confirmReport(req.params.id, req.user.id);
    res.json(updatedReport);
  } catch (error) {
    console.error('Confirm report error:', error);
    
    if (error.message === 'User already confirmed this report') {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to confirm report' });
  }
});

/**
 * @swagger
 * /api/reports/{id}/subscribe:
 *   post:
 *     summary: Subscribe to report updates
 *     description: Subscribe to receive notifications about changes to this report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *         example: "report-123"
 *     responses:
 *       200:
 *         description: Subscribed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Server error
 */
router.post('/:id/subscribe', authMiddleware, async (req, res) => {
  try {
    const updatedReport = await addSubscriber(req.params.id, req.user.id);
    res.json(updatedReport);
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

/**
 * @swagger
 * /api/reports/{id}/subscribe:
 *   delete:
 *     summary: Unsubscribe from report updates
 *     description: Unsubscribe from receiving notifications about this report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *         example: "report-123"
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Server error
 */
router.delete('/:id/subscribe', authMiddleware, async (req, res) => {
  try {
    const updatedReport = await removeSubscriber(req.params.id, req.user.id);
    res.json(updatedReport);
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

/**
 * @swagger
 * /api/reports/{id}:
 *   delete:
 *     summary: Delete a report
 *     description: Permanently delete a report and all associated data (super admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *         example: "report-123"
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Report deleted successfully"
 *                 report:
 *                   $ref: '#/components/schemas/Report'
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - super admin role required
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const deletedReport = await deleteReport(req.params.id);
    
    if (!deletedReport) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ message: 'Report deleted successfully', report: deletedReport });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

/**
 * @swagger
 * /api/reports/{id}/history:
 *   get:
 *     summary: Get report history timeline
 *     description: Retrieve all status changes and updates for a report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *         example: "report-123"
 *     responses:
 *       200:
 *         description: Report history timeline
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   report_id:
 *                     type: string
 *                   changed_by:
 *                     type: string
 *                   changed_by_name:
 *                     type: string
 *                   changed_by_role:
 *                     type: string
 *                   action:
 *                     type: string
 *                   old_status:
 *                     type: string
 *                   new_status:
 *                     type: string
 *                   comment:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.get('/:id/history', authMiddleware, async (req, res) => {
  try {
    
    const { id } = req.params;

    // First check if report exists
    const report = await getReportById(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Fetch history
    const historyQuery = `
      SELECT 
        id,
        report_id,
        changed_by,
        old_status,
        new_status,
        notes,
        proof_urls,
        timestamp
      FROM report_history
      WHERE report_id = $1
      ORDER BY timestamp DESC
    `;

    const result = await queryDb(historyQuery, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get report history error:', error);
    res.status(500).json({ error: 'Failed to fetch report history' });
  }
});

module.exports = router;
