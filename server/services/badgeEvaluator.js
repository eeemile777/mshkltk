const { query } = require('../db/connection');

/**
 * Badge Auto-Awarding Engine
 * Evaluates user achievements and automatically awards badges
 * 
 * Badge Requirement Types:
 * - reports_count: Total reports submitted by user
 * - reports_confirmed: Total reports confirmed by others
 * - category_reports: Reports in specific category (uses category_filter)
 * - unique_categories: Number of unique categories reported
 * - points: Total points earned
 */

/**
 * Check and award badges for a user
 * @param {string} userId - User ID to evaluate
 * @param {object} client - Optional database client for transactions
 * @returns {Promise<Array>} Array of newly awarded badges
 */
const evaluateBadges = async (userId, client = null) => {
  const queryFunc = client ? client.query.bind(client) : query;
  
  try {
    // Fetch user data
    const userResult = await queryFunc(
      `SELECT id, points, reports_count, reports_confirmed, achievements 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (!userResult.rows[0]) {
      console.log(`User ${userId} not found`);
      return [];
    }

    const user = userResult.rows[0];
    const currentBadges = user.achievements || [];

    // Fetch category-specific report counts for this user
    const categoryCountsResult = await queryFunc(
      `SELECT category, COUNT(*) as count 
       FROM reports 
       WHERE created_by = $1 
       GROUP BY category`,
      [userId]
    );

    const categoryCounts = {};
    categoryCountsResult.rows.forEach(row => {
      categoryCounts[row.category] = parseInt(row.count);
    });

    const uniqueCategoriesCount = Object.keys(categoryCounts).length;

    // Fetch all active badges
    const badgesResult = await queryFunc(
      `SELECT id, requirement_type, requirement_value, category_filter 
       FROM dynamic_badges 
       WHERE is_active = true 
       ORDER BY requirement_value ASC`
    );

    const newlyAwardedBadges = [];

    // Normalize requirement types to support both legacy and new names
    const normalizeType = (t) => {
      switch (t) {
        case 'report_count':
        case 'reports_count':
          return 'reports_count';
        case 'confirmation_count':
        case 'reports_confirmed':
          return 'reports_confirmed';
        case 'category_reports':
          return 'category_reports';
        case 'unique_categories':
          return 'unique_categories';
        case 'point_threshold':
        case 'points':
          return 'points';
        default:
          return t;
      }
    };

    for (const badge of badgesResult.rows) {
      // Skip if user already has this badge
      if (currentBadges.includes(badge.id)) {
        continue;
      }

      let isEarned = false;

      const reqType = normalizeType(badge.requirement_type);
      switch (reqType) {
        case 'reports_count':
          isEarned = user.reports_count >= parseInt(badge.requirement_value);
          break;

        case 'reports_confirmed':
          isEarned = user.reports_confirmed >= parseInt(badge.requirement_value);
          break;

        case 'category_reports':
          if (badge.category_filter) {
            const categoryCount = categoryCounts[badge.category_filter] || 0;
            isEarned = categoryCount >= parseInt(badge.requirement_value);
          }
          break;

        case 'unique_categories':
          isEarned = uniqueCategoriesCount >= parseInt(badge.requirement_value);
          break;

        case 'points':
          isEarned = user.points >= parseInt(badge.requirement_value);
          break;

        default:
          console.warn(`Unknown requirement type: ${badge.requirement_type}`);
      }

      if (isEarned) {
        newlyAwardedBadges.push(badge.id);
      }
    }

    // Award newly earned badges
    if (newlyAwardedBadges.length > 0) {
      const updatedAchievements = [...currentBadges, ...newlyAwardedBadges];
      
      await queryFunc(
        `UPDATE users SET achievements = $1 WHERE id = $2`,
        [updatedAchievements, userId]
      );

      console.log(`🏆 Awarded ${newlyAwardedBadges.length} new badges to user ${userId}:`, newlyAwardedBadges);
    }

    return newlyAwardedBadges;

  } catch (error) {
    console.error('Error evaluating badges:', error);
    // If in transaction, rethrow to rollback
    if (client) throw error;
    return [];
  }
};

/**
 * Batch evaluate badges for multiple users
 * Used for admin operations or migrations
 * @param {Array<string>} userIds - Array of user IDs
 * @returns {Promise<Object>} Summary of awarded badges
 */
const batchEvaluateBadges = async (userIds) => {
  const results = {
    total: userIds.length,
    processed: 0,
    failed: 0,
    newBadgesAwarded: 0
  };

  for (const userId of userIds) {
    try {
      const newBadges = await evaluateBadges(userId);
      results.processed++;
      results.newBadgesAwarded += newBadges.length;
    } catch (error) {
      console.error(`Failed to evaluate badges for user ${userId}:`, error);
      results.failed++;
    }
  }

  return results;
};

/**
 * Re-evaluate badges for all users (admin operation)
 * @returns {Promise<Object>} Summary of operation
 */
const reevaluateAllBadges = async () => {
  try {
    const usersResult = await query(
      `SELECT id FROM users WHERE role = 'citizen' OR role = 'municipality'`
    );

    const userIds = usersResult.rows.map(row => row.id);
    console.log(`🔄 Re-evaluating badges for ${userIds.length} users...`);

    return await batchEvaluateBadges(userIds);
  } catch (error) {
    console.error('Error re-evaluating all badges:', error);
    throw error;
  }
};

module.exports = {
  evaluateBadges,
  batchEvaluateBadges,
  reevaluateAllBadges
};
