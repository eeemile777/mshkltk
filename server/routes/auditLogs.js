const express = require('express');
const router = express.Router();
const { query: queryDb } = require('../db/connection');
const { authMiddleware, requireRole } = require('../middleware/auth');

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Get all audit logs (Super Admin only)
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of logs to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of logs to skip
 *       - in: query
 *         name: entity_type
 *         schema:
 *           type: string
 *         description: Filter by entity type (report, user, category, badge)
 *       - in: query
 *         name: actor_id
 *         schema:
 *           type: string
 *         description: Filter by actor user ID
 *     responses:
 *       200:
 *         description: List of audit logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "audit-123"
 *                       actorId:
 *                         type: string
 *                         example: "user-456"
 *                       actorName:
 *                         type: string
 *                         example: "John Admin"
 *                       actorRole:
 *                         type: string
 *                         enum: [citizen, municipality, utility, union_of_municipalities, super_admin]
 *                         example: "super_admin"
 *                       message:
 *                         type: string
 *                         example: "create_category"
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-11-19T10:30:00Z"
 *                       actionType:
 *                         type: string
 *                         example: "create_category"
 *                       entityType:
 *                         type: string
 *                         example: "category"
 *                       entityId:
 *                         type: string
 *                         example: "lighting"
 *                       details:
 *                         type: object
 *                         example: {"category": {"id": "lighting", "name_en": "Lighting"}}
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin only
 */
router.get('/', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const { limit = 100, offset = 0, entity_type, actor_id } = req.query;

    let query = `
      SELECT 
        al.id,
        al.admin_id,
        al.action,
        al.entity_type,
        al.entity_id,
        al.details,
        al.timestamp,
        u.display_name,
        u.role
      FROM audit_logs al
      LEFT JOIN users u ON al.admin_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (entity_type) {
      query += ` AND al.entity_type = $${paramCount}`;
      params.push(entity_type);
      paramCount++;
    }

    if (actor_id) {
      query += ` AND al.admin_id = $${paramCount}`;
      params.push(actor_id);
      paramCount++;
    }

    query += ` ORDER BY al.timestamp DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await queryDb(query, params);

    // Transform to match frontend expectations
    const logs = result.rows.map(row => ({
      id: row.id,
      actorId: row.admin_id,
      actorName: row.display_name || 'Unknown User',
      actorRole: row.role || 'unknown',
      message: row.action || 'Action performed',
      timestamp: row.timestamp,
      // Include original fields for reference
      actionType: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      details: row.details
    }));

    res.json({ logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

/**
 * @swagger
 * /api/audit-logs/entity/{type}/{id}:
 *   get:
 *     summary: Get audit logs for a specific entity
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity type (report, user, category, badge)
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity ID
 *     responses:
 *       200:
 *         description: List of audit logs for the entity
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/entity/:type/:id', authMiddleware, async (req, res) => {
  try {
    const { type, id } = req.params;

    // Only super admins can see all entity logs
    // Portal users can only see logs for their municipality
    if (req.user.role !== 'super_admin' && req.user.role !== 'portal_user') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const query = `
      SELECT 
        id,
        admin_id,
        action,
        entity_type,
        entity_id,
        details,
        timestamp
      FROM audit_logs
      WHERE entity_type = $1 AND entity_id = $2
      ORDER BY timestamp DESC
    `;

    const result = await queryDb(query, [type, id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching entity audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch entity audit logs' });
  }
});

/**
 * Helper function to create an audit log entry
 * This can be imported and used by other routes
 */
async function createAuditLog(adminId, action, entityType, entityId, details = null) {
  try {
    const query = `
      INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await queryDb(query, [
      adminId,
      action,
      entityType,
      entityId,
      details ? JSON.stringify(details) : null
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('Error creating audit log:', error);
    throw error;
  }
}

module.exports = router;
module.exports.createAuditLog = createAuditLog;
