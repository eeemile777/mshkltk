const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
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
 *               type: array
 *               items:
 *                 type: object
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
        id,
        admin_id,
        action,
        entity_type,
        entity_id,
        details,
        timestamp
      FROM audit_logs
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (entity_type) {
      query += ` AND entity_type = $${paramCount}`;
      params.push(entity_type);
      paramCount++;
    }

    if (actor_id) {
      query += ` AND admin_id = $${paramCount}`;
      params.push(actor_id);
      paramCount++;
    }

    query += ` ORDER BY timestamp DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    res.json(result.rows);
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

    const result = await pool.query(query, [type, id]);

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
    
    const result = await pool.query(query, [
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
