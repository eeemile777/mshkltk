const { query } = require('../connection');

/**
 * Audit Log Functions
 * Track all super admin actions for compliance and debugging
 */

/**
 * Log an audit event
 * @param {Object} eventData - Audit event details
 * @param {string} eventData.admin_id - User ID performing the action
 * @param {string} eventData.action - Action performed (e.g., 'create_category', 'update_user')
 * @param {string} eventData.entity_type - Type of entity (e.g., 'category', 'badge', 'user')
 * @param {string} eventData.entity_id - ID of the affected entity
 * @param {object} eventData.details - Additional details (old/new values, etc.)
 * @returns {Promise<Object>} Created audit log entry
 */
const logAuditEvent = async (eventData) => {
  const {
    admin_id,
    action,
    entity_type,
    entity_id,
    details = {}
  } = eventData;

  try {
    const result = await query(
      `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [admin_id, action, entity_type, entity_id, JSON.stringify(details)]
    );

    console.log(`📋 Audit log created: ${action} on ${entity_type} ${entity_id} by admin ${admin_id}`);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw - audit logs are important but shouldn't break operations
    return null;
  }
};

/**
 * Get audit logs with optional filters
 * @param {Object} filters - Query filters
 * @param {string} filters.admin_id - Filter by admin user
 * @param {string} filters.action - Filter by action type
 * @param {string} filters.entity_type - Filter by entity type
 * @param {string} filters.entity_id - Filter by specific entity
 * @param {Date} filters.start_date - Filter from date
 * @param {Date} filters.end_date - Filter until date
 * @param {number} filters.limit - Results limit (default 100)
 * @param {number} filters.offset - Results offset (default 0)
 * @returns {Promise<Array>} Array of audit log entries
 */
const getAuditLogs = async (filters = {}) => {
  const {
    admin_id,
    action,
    entity_type,
    entity_id,
    start_date,
    end_date,
    limit = 100,
    offset = 0
  } = filters;

  let queryText = `
    SELECT a.*, u.username as admin_username, u.display_name as admin_display_name
    FROM audit_logs a
    LEFT JOIN users u ON a.admin_id = u.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 1;

  if (admin_id) {
    queryText += ` AND a.admin_id = $${paramCount}`;
    params.push(admin_id);
    paramCount++;
  }

  if (action) {
    queryText += ` AND a.action = $${paramCount}`;
    params.push(action);
    paramCount++;
  }

  if (entity_type) {
    queryText += ` AND a.entity_type = $${paramCount}`;
    params.push(entity_type);
    paramCount++;
  }

  if (entity_id) {
    queryText += ` AND a.entity_id = $${paramCount}`;
    params.push(entity_id);
    paramCount++;
  }

  if (start_date) {
    queryText += ` AND a.timestamp >= $${paramCount}`;
    params.push(start_date);
    paramCount++;
  }

  if (end_date) {
    queryText += ` AND a.timestamp <= $${paramCount}`;
    params.push(end_date);
    paramCount++;
  }

  queryText += ` ORDER BY a.timestamp DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await query(queryText, params);
  return result.rows;
};

/**
 * Get audit log statistics
 * @param {Object} filters - Optional filters (admin_id, start_date, end_date)
 * @returns {Promise<Object>} Statistics summary
 */
const getAuditStats = async (filters = {}) => {
  const { admin_id, start_date, end_date } = filters;

  let whereClause = 'WHERE 1=1';
  const params = [];
  let paramCount = 1;

  if (admin_id) {
    whereClause += ` AND admin_id = $${paramCount}`;
    params.push(admin_id);
    paramCount++;
  }

  if (start_date) {
    whereClause += ` AND timestamp >= $${paramCount}`;
    params.push(start_date);
    paramCount++;
  }

  if (end_date) {
    whereClause += ` AND timestamp <= $${paramCount}`;
    params.push(end_date);
    paramCount++;
  }

  const result = await query(
    `SELECT 
       COUNT(*) as total_events,
       COUNT(DISTINCT admin_id) as unique_admins,
       COUNT(DISTINCT entity_type) as unique_entity_types,
       action,
       COUNT(*) as action_count
     FROM audit_logs
     ${whereClause}
     GROUP BY action
     ORDER BY action_count DESC`,
    params
  );

  return {
    summary: result.rows.find(r => true) || { total_events: 0 },
    actionBreakdown: result.rows
  };
};

module.exports = {
  logAuditEvent,
  getAuditLogs,
  getAuditStats
};
