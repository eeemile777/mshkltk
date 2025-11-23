const { query, getClient } = require('../connection');
const { awardPoints } = require('./users');
const { evaluateBadges } = require('../../services/badgeEvaluator');
const { createNotification } = require('./notifications');

/**
 * Report Query Functions
 * Handles all database operations related to reports
 */

// Create a new report
const createReport = async (reportData) => {
  const {
    title_en,
    title_ar,
    photo_urls = [],
    lat,
    lng,
    area,
    municipality,
    category,
    sub_category = null,
    note_en,
    note_ar,
    status = 'new',
    severity = 'medium',
    created_by,
  } = reportData;

  const result = await query(
    `INSERT INTO reports (
      title_en, title_ar, photo_urls, location, lat, lng, area, municipality,
      category, sub_category, note_en, note_ar, status, severity, created_by,
      subscribed_user_ids
    ) VALUES (
      $1, $2, $3, ST_SetSRID(ST_MakePoint($5, $4), 4326)::geography, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13, $14, ARRAY[$15]::text[]
    ) RETURNING *`,
    [
      title_en, title_ar, photo_urls, lat, lng, area, municipality,
      category, sub_category, note_en, note_ar, status, severity, created_by, created_by
    ]
  );

  // Increment user's report count
  await query(
    'UPDATE users SET reports_count = reports_count + 1 WHERE id = $1',
    [created_by]
  );

  // Award points for submitting a report
  await awardPoints(created_by, 'submit_report');

  // Check for newly earned badges
  await evaluateBadges(created_by);

  return result.rows[0];
};

// Get report by ID
const getReportById = async (reportId) => {
  const result = await query(
    'SELECT * FROM reports WHERE id = $1',
    [reportId]
  );
  return result.rows[0];
};

// Get all reports with filters
const getReports = async (filters = {}) => {
  const { municipality, category, status, created_by, limit = 100, offset = 0 } = filters;

  let queryText = 'SELECT * FROM reports WHERE 1=1';
  const params = [];
  let paramCount = 1;

  if (municipality) {
    queryText += ` AND municipality = $${paramCount}`;
    params.push(municipality);
    paramCount++;
  }

  if (category) {
    queryText += ` AND category = $${paramCount}`;
    params.push(category);
    paramCount++;
  }

  if (status) {
    queryText += ` AND status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  if (created_by) {
    queryText += ` AND created_by = $${paramCount}`;
    params.push(created_by);
    paramCount++;
  }

  queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await query(queryText, params);
  return result.rows;
};

// Get nearby reports (using PostGIS)
const getNearbyReports = async (lat, lng, radiusKm = 5, limit = 50) => {
  const result = await query(
    `SELECT *, 
      ST_Distance(location, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) / 1000 as distance_km
     FROM reports
     WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography, $3 * 1000)
     ORDER BY distance_km
     LIMIT $4`,
    [lat, lng, radiusKm, limit]
  );
  return result.rows;
};

// Update report
const updateReport = async (reportId, updates, userId = null) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Get current report state for history tracking
    const currentReport = await client.query(
      'SELECT * FROM reports WHERE id = $1',
      [reportId]
    );

    if (!currentReport.rows[0]) {
      await client.query('ROLLBACK');
      return null;
    }

    const oldReport = currentReport.rows[0];

    const allowedFields = [
      'title_en', 'title_ar', 'photo_urls', 'note_en', 'note_ar',
      'status', 'severity', 'category', 'sub_category', 'assigned_to',
      'resolution_photo_url'
    ];

    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      await client.query('ROLLBACK');
      throw new Error('No valid fields to update');
    }

    // Add updated_at timestamp
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(reportId);
    const result = await client.query(
      `UPDATE reports SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    const updatedReport = result.rows[0];

    // Track status changes in report_history
    if (updates.status && updates.status !== oldReport.status) {
      await client.query(
        `INSERT INTO report_history (report_id, old_status, new_status, changed_by, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          reportId,
          oldReport.status,
          updates.status,
          userId,
          `Status changed from ${oldReport.status} to ${updates.status}`
        ]
      );
      console.log(`📝 Tracked status change for report ${reportId}: ${oldReport.status} → ${updates.status}`);

      // Notify report creator and subscribers about status change
      const notifyUserIds = [oldReport.created_by, ...(oldReport.subscribed_user_ids || [])];
      const uniqueUserIds = [...new Set(notifyUserIds)].filter(id => id !== userId); // Don't notify the person who made the change

      const statusMessages = {
        new: { en: 'New', ar: 'جديد' },
        in_progress: { en: 'In Progress', ar: 'قيد المعالجة' },
        resolved: { en: 'Resolved', ar: 'تم الحل' }
      };

      for (const notifyUserId of uniqueUserIds) {
        try {
          await client.query(
            `INSERT INTO notifications (user_id, type, title_en, title_ar, body_en, body_ar, report_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              notifyUserId,
              'report_update',
              'Report Status Updated',
              'تم تحديث حالة البلاغ',
              `Your report status changed to ${statusMessages[updates.status].en}`,
              `تم تغيير حالة بلاغك إلى ${statusMessages[updates.status].ar}`,
              reportId
            ]
          );
        } catch (notifError) {
          console.error(`Failed to create notification for user ${notifyUserId}:`, notifError);
          // Continue processing - notifications are nice-to-have
        }
      }

      console.log(`📬 Sent ${uniqueUserIds.length} notifications for report ${reportId} status change`);
    }

    await client.query('COMMIT');
    return updatedReport;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Confirm a report (increment confirmations)
const confirmReport = async (reportId, userId) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Check if user is trying to confirm their own report
    const reportCheck = await client.query(
      'SELECT created_by FROM reports WHERE id = $1',
      [reportId]
    );

    if (reportCheck.rows[0]?.created_by === userId) {
      throw new Error('You cannot confirm your own report');
    }

    // Check if user already confirmed this report
    const userCheck = await client.query(
      'SELECT confirmed_report_ids FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows[0]?.confirmed_report_ids?.includes(reportId)) {
      throw new Error('User already confirmed this report');
    }

    // Increment report confirmations
    const reportResult = await client.query(
      'UPDATE reports SET confirmations_count = confirmations_count + 1 WHERE id = $1 RETURNING *',
      [reportId]
    );

    // Add to user's confirmed reports
    await client.query(
      `UPDATE users 
       SET confirmed_report_ids = array_append(confirmed_report_ids, $2),
           reports_confirmed = reports_confirmed + 1
       WHERE id = $1`,
      [userId, reportId]
    );

    // SECURITY FIX #8: Award points inside transaction to prevent race condition
    // If this fails, entire confirmation is rolled back
    try {
      await awardPoints(userId, 'confirm_report', client);
      // Check for newly earned badges after confirmation
      await evaluateBadges(userId, client);
    } catch (pointsError) {
      console.error('Failed to award points/badges during confirmation:', pointsError);
      // Continue without points - confirmation is more important
      // Points can be manually adjusted later
    }

    await client.query('COMMIT');

    return reportResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Add user to report subscribers
const addSubscriber = async (reportId, userId) => {
  const result = await query(
    `UPDATE reports 
     SET subscribed_user_ids = array_append(subscribed_user_ids, $2)
     WHERE id = $1 AND NOT ($2 = ANY(subscribed_user_ids))
     RETURNING *`,
    [reportId, userId]
  );
  return result.rows[0];
};

// Remove user from report subscribers
const removeSubscriber = async (reportId, userId) => {
  const result = await query(
    `UPDATE reports 
     SET subscribed_user_ids = array_remove(subscribed_user_ids, $2)
     WHERE id = $1
     RETURNING *`,
    [reportId, userId]
  );
  return result.rows[0];
};

// Delete report (cascade will handle comments, history, notifications)
const deleteReport = async (reportId) => {
  const result = await query(
    'DELETE FROM reports WHERE id = $1 RETURNING *',
    [reportId]
  );
  return result.rows[0];
};

// Get reports by municipality (for portal)
const getReportsByMunicipality = async (municipality, filters = {}) => {
  const { status, category, limit = 100, offset = 0 } = filters;

  let queryText = 'SELECT * FROM reports WHERE municipality = $1';
  const params = [municipality];
  let paramCount = 2;

  if (status) {
    queryText += ` AND status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  if (category) {
    queryText += ` AND category = $${paramCount}`;
    params.push(category);
    paramCount++;
  }

  queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await query(queryText, params);
  return result.rows;
};

// Get report statistics
const getReportStats = async (municipality = null) => {
  let queryText = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'new' THEN 1 END) as new,
      COUNT(CASE WHEN status = 'received' THEN 1 END) as received,
      COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
      COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
      COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_severity,
      COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_severity,
      COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_severity
    FROM reports
  `;

  const params = [];
  if (municipality) {
    queryText += ' WHERE municipality = $1';
    params.push(municipality);
  }

  const result = await query(queryText, params);
  return result.rows[0];
};

module.exports = {
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
};
