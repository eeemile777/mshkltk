const express = require('express');
const router = express.Router();
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
 * POST /api/reports
 * Create a new report (requires authentication)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const reportData = {
      ...req.body,
      created_by: req.user.id,
    };

    const newReport = await createReport(reportData);
    res.status(201).json(newReport);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

/**
 * GET /api/reports
 * Get all reports with optional filters
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
 * GET /api/reports/nearby
 * Get reports near a location
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
 * GET /api/reports/stats
 * Get report statistics
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
 * GET /api/reports/:id
 * Get a single report by ID
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
 * PATCH /api/reports/:id
 * Update a report (portal staff or super admin)
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
 * POST /api/reports/:id/confirm
 * Confirm a report (requires authentication)
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
 * POST /api/reports/:id/subscribe
 * Subscribe to report updates
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
 * DELETE /api/reports/:id/subscribe
 * Unsubscribe from report updates
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
 * DELETE /api/reports/:id
 * Delete a report (super admin only)
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

module.exports = router;
