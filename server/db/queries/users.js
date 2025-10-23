const { query, getClient } = require('../connection');

/**
 * User Query Functions
 * Handles all database operations related to users
 */

// Create a new user
const createUser = async (userData) => {
  const {
    username,
    first_name,
    last_name,
    display_name,
    is_anonymous = false,
    password_hash,
    salt,
    role = 'citizen',
    municipality_id = null,
    portal_access_level = null,
    avatar_url = null,
  } = userData;

  const result = await query(
    `INSERT INTO users (
      username, first_name, last_name, display_name, is_anonymous,
      password_hash, salt, role, municipality_id, portal_access_level, avatar_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [username, first_name, last_name, display_name, is_anonymous, password_hash, salt, role, municipality_id, portal_access_level, avatar_url]
  );

  return result.rows[0];
};

// Find user by username
const findUserByUsername = async (username) => {
  const result = await query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0];
};

// Find user by ID
const findUserById = async (userId) => {
  const result = await query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0];
};

// Update user profile
const updateUser = async (userId, updates) => {
  const allowedFields = [
    'first_name', 'last_name', 'display_name', 'avatar_url',
    'onboarding_complete', 'points', 'achievements', 'reports_count',
    'reports_confirmed', 'is_active'
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
    throw new Error('No valid fields to update');
  }

  values.push(userId);
  const result = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  return result.rows[0];
};

// Add a confirmed report ID to user
const addConfirmedReport = async (userId, reportId) => {
  const result = await query(
    `UPDATE users 
     SET confirmed_report_ids = array_append(confirmed_report_ids, $2),
         reports_confirmed = reports_confirmed + 1
     WHERE id = $1 AND NOT ($2 = ANY(confirmed_report_ids))
     RETURNING *`,
    [userId, reportId]
  );
  return result.rows[0];
};

// Subscribe user to a report
const subscribeToReport = async (userId, reportId) => {
  const result = await query(
    `UPDATE users 
     SET subscribed_report_ids = array_append(subscribed_report_ids, $2)
     WHERE id = $1 AND NOT ($2 = ANY(subscribed_report_ids))
     RETURNING *`,
    [userId, reportId]
  );
  return result.rows[0];
};

// Unsubscribe user from a report
const unsubscribeFromReport = async (userId, reportId) => {
  const result = await query(
    `UPDATE users 
     SET subscribed_report_ids = array_remove(subscribed_report_ids, $2)
     WHERE id = $1
     RETURNING *`,
    [userId, reportId]
  );
  return result.rows[0];
};

// Get leaderboard (top users by points)
const getLeaderboard = async (limit = 50) => {
  const result = await query(
    `SELECT id, display_name, avatar_url, points, achievements, reports_count, reports_confirmed
     FROM users
     WHERE role = 'citizen' AND NOT is_anonymous
     ORDER BY points DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

// Award badge to user
const awardBadge = async (userId, badgeId) => {
  const result = await query(
    `UPDATE users 
     SET achievements = array_append(achievements, $2)
     WHERE id = $1 AND NOT ($2 = ANY(achievements))
     RETURNING *`,
    [userId, badgeId]
  );
  return result.rows[0];
};

// Get all portal users (for super admin)
const getAllPortalUsers = async () => {
  const result = await query(
    `SELECT * FROM users 
     WHERE role IN ('municipality', 'utility', 'union_of_municipalities', 'super_admin')
     ORDER BY created_at DESC`
  );
  return result.rows;
};

// Get ALL users (including citizens) - for Super Admin
const getAllUsers = async () => {
  const result = await query(
    `SELECT * FROM users 
     ORDER BY created_at DESC`
  );
  return result.rows;
};

// Delete user (anonymize their content)
const deleteUser = async (userId) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    // Anonymize user's reports
    await client.query(
      'UPDATE reports SET created_by = NULL WHERE created_by = $1',
      [userId]
    );

    // Anonymize user's comments
    await client.query(
      'UPDATE comments SET user_id = NULL WHERE user_id = $1',
      [userId]
    );

    // Remove user from subscribed_user_ids in all reports
    await client.query(
      'UPDATE reports SET subscribed_user_ids = array_remove(subscribed_user_ids, $1)',
      [userId]
    );

    // Delete the user
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Award points to a user based on action
const awardPoints = async (userId, action) => {
  try {
    // Fetch gamification settings
    const settingsResult = await query(
      'SELECT points_rules FROM gamification_settings WHERE id = $1',
      ['default']
    );

    if (!settingsResult.rows[0]) {
      console.log('No gamification settings found');
      return;
    }

    const pointsRules = settingsResult.rows[0].points_rules;
    const rule = pointsRules.find(r => r.id === action);

    if (!rule || rule.points === 0) {
      console.log(`No points rule found for action: ${action}`);
      return;
    }

    // Award points to user
    await query(
      'UPDATE users SET points = points + $1 WHERE id = $2',
      [rule.points, userId]
    );

    console.log(`✅ Awarded ${rule.points} points to user ${userId} for action: ${action}`);
  } catch (error) {
    console.error('Error awarding points:', error);
    // Don't throw - points are a nice-to-have, shouldn't break main flow
  }
};

module.exports = {
  createUser,
  findUserByUsername,
  findUserById,
  updateUser,
  addConfirmedReport,
  subscribeToReport,
  unsubscribeFromReport,
  getLeaderboard,
  awardBadge,
  awardPoints,
  getAllPortalUsers,
  getAllUsers,
  deleteUser,
};
