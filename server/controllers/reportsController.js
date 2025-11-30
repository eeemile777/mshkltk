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
    getReportStats,
} = require('../db/queries/reports');

const reportsController = {
    create: async (req, res) => {
        try {
            // Block anonymous users from creating reports
            if (req.user && req.user.is_anonymous) {
                return res.status(403).json({
                    error: 'Anonymous users cannot submit reports. Please sign up to submit reports.'
                });
            }

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
    },

    getAll: async (req, res) => {
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
    },

    getNearby: async (req, res) => {
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
    },

    getFullDetails: async (req, res) => {
        try {
            const { id } = req.params;

            // PERFORMANCE FIX #20: Fetch all data in parallel to avoid N+1 queries
            const [report, commentsResult, historyResult] = await Promise.all([
                getReportById(id),
                queryDb('SELECT * FROM comments WHERE report_id = $1 ORDER BY created_at ASC', [id]),
                queryDb('SELECT * FROM report_history WHERE report_id = $1 ORDER BY created_at DESC', [id]),
            ]);

            if (!report) {
                return res.status(404).json({ error: 'Report not found' });
            }

            res.json({
                report,
                comments: commentsResult.rows,
                history: historyResult.rows,
            });
        } catch (error) {
            console.error('Get full report error:', error);
            res.status(500).json({ error: 'Failed to fetch report details' });
        }
    },

    getTrending: async (req, res) => {
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
    },

    getStats: async (req, res) => {
        try {
            const { municipality } = req.query;
            const stats = await getReportStats(municipality);
            res.json(stats);
        } catch (error) {
            console.error('Get stats error:', error);
            res.status(500).json({ error: 'Failed to fetch statistics' });
        }
    },

    getById: async (req, res) => {
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
    },

    getHistory: async (req, res) => {
        try {
            const result = await queryDb(
                `SELECT h.*, u.username as changed_by_username, u.display_name as changed_by_display_name
         FROM report_history h
         LEFT JOIN users u ON h.changed_by = u.id
         WHERE h.report_id = $1
         ORDER BY h.timestamp DESC`,
                [req.params.id]
            );

            res.json({ history: result.rows });
        } catch (error) {
            console.error('Get report history error:', error);
            res.status(500).json({ error: 'Failed to fetch report history' });
        }
    },

    getAllHistory: async (req, res) => {
        try {
            // PERFORMANCE FIX: Bulk fetch history for all reports
            const result = await queryDb(
                `SELECT h.*, u.username as changed_by_username, u.display_name as changed_by_display_name
         FROM report_history h
         LEFT JOIN users u ON h.changed_by = u.id
         ORDER BY h.timestamp DESC`
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Get all history error:', error);
            res.status(500).json({ error: 'Failed to fetch all history' });
        }
    },

    update: async (req, res) => {
        try {
            const updatedReport = await updateReport(req.params.id, req.body, req.user.id);

            if (!updatedReport) {
                return res.status(404).json({ error: 'Report not found' });
            }

            res.json(updatedReport);
        } catch (error) {
            console.error('Update report error:', error);
            res.status(500).json({ error: 'Failed to update report' });
        }
    },

    confirm: async (req, res) => {
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
    },

    subscribe: async (req, res) => {
        try {
            const updatedReport = await addSubscriber(req.params.id, req.user.id);
            res.json(updatedReport);
        } catch (error) {
            console.error('Subscribe error:', error);
            res.status(500).json({ error: 'Failed to subscribe' });
        }
    },

    unsubscribe: async (req, res) => {
        try {
            const updatedReport = await removeSubscriber(req.params.id, req.user.id);
            res.json(updatedReport);
        } catch (error) {
            console.error('Unsubscribe error:', error);
            res.status(500).json({ error: 'Failed to unsubscribe' });
        }
    },

    delete: async (req, res) => {
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
    },
};

module.exports = reportsController;
