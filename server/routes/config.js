const express = require('express');
const router = express.Router();
const { query, pool: dbPool } = require('../db/connection');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { cacheMiddleware, invalidateCache } = require('../middleware/cache');
const { reevaluateAllBadges, batchEvaluateBadges } = require('../services/badgeEvaluator');
const { logAuditEvent } = require('../db/queries/auditLogs');

// SECURITY FIX #14: Cache static configuration data for 10 minutes
const configCacheMiddleware = cacheMiddleware(600); // 10 minutes

/**
 * @swagger
 * /api/config/dashboard-stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieve summary statistics for Super Admin dashboard
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalReports:
 *                   type: integer
 *                 totalUsers:
 *                   type: integer
 *                 totalCategories:
 *                   type: integer
 *                 totalBadges:
 *                   type: integer
 *                 reportsByStatus:
 *                   type: object
 *                 recentActivity:
 *                   type: array
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin only
 *       500:
 *         description: Server error
 */
router.get('/dashboard-stats', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM reports) as total_reports,
        (SELECT COUNT(*) FROM users WHERE role != 'super_admin') as total_users,
        (SELECT COUNT(*) FROM dynamic_categories WHERE is_active = true) as total_categories,
        (SELECT COUNT(*) FROM dynamic_badges WHERE is_active = true) as total_badges,
        (SELECT COUNT(*) FROM reports WHERE status = 'new') as reports_new,
        (SELECT COUNT(*) FROM reports WHERE status = 'in_progress') as reports_in_progress,
        (SELECT COUNT(*) FROM reports WHERE status = 'resolved') as reports_resolved
    `);

    const recentActivity = await query(`
      SELECT id, action, entity_type, entity_id, timestamp, admin_id
      FROM audit_logs
      ORDER BY timestamp DESC
      LIMIT 20
    `);

    res.json({
      totalReports: parseInt(stats.rows[0].total_reports),
      totalUsers: parseInt(stats.rows[0].total_users),
      totalCategories: parseInt(stats.rows[0].total_categories),
      totalBadges: parseInt(stats.rows[0].total_badges),
      reportsByStatus: {
        new: parseInt(stats.rows[0].reports_new),
        in_progress: parseInt(stats.rows[0].reports_in_progress),
        resolved: parseInt(stats.rows[0].reports_resolved)
      },
      recentActivity: recentActivity.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

/**
 * @swagger
 * /api/config/categories:
 *   get:
 *     summary: Get all dynamic categories
 *     description: Retrieve all report categories (active and inactive)
 *     tags: [Configuration]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DynamicCategory'
 *       500:
 *         description: Server error
 */
router.get('/categories', configCacheMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM dynamic_categories ORDER BY label_en ASC'
    );
    res.json({ categories: result.rows });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * @swagger
 * /api/config/categories:
 *   post:
 *     summary: Create new category
 *     description: Create a new report category (Super Admin only)
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - label_en
 *               - label_ar
 *               - icon
 *               - color
 *             properties:
 *               id:
 *                 type: string
 *                 description: Category ID (auto-generated from label_en if not provided)
 *                 example: "public_transport"
 *               label_en:
 *                 type: string
 *                 description: English label (also sets name_en)
 *                 example: "Public Transport"
 *               label_ar:
 *                 type: string
 *                 description: Arabic label (also sets name_ar)
 *                 example: "النقل العام"
 *               name_en:
 *                 type: string
 *                 description: English name (alternative to label_en)
 *                 example: "Public Transport"
 *               name_ar:
 *                 type: string
 *                 description: Arabic name (alternative to label_ar)
 *                 example: "النقل العام"
 *               icon:
 *                 type: string
 *                 example: "🚌"
 *               color:
 *                 type: string
 *                 description: Light theme color
 *                 example: "#2196F3"
 *               color_dark:
 *                 type: string
 *                 description: Dark theme color (defaults to color if not provided)
 *                 example: "#1976D2"
 *               sub_categories:
 *                 type: array
 *                 description: Array of sub-category names
 *                 items:
 *                   type: string
 *                 example: ["Bus", "Metro", "Tram"]
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not super admin)
 *       500:
 *         description: Server error
 */
router.post('/categories', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const { 
      id, 
      label_en, 
      label_ar, 
      name_en, 
      name_ar, 
      icon, 
      color, 
      color_dark,
      sub_categories = [],
      is_active = true 
    } = req.body;

    // Accept either label or name fields
    const finalLabelEn = label_en || name_en;
    const finalLabelAr = label_ar || name_ar;
    const finalNameEn = name_en || label_en;
    const finalNameAr = name_ar || label_ar;
    const finalColorDark = color_dark || color;

    if (!finalLabelEn || !finalLabelAr || !icon || !color) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate ID if not provided (for direct API calls)
    const categoryId = id || finalLabelEn.toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]/g, '');

    const result = await query(
      `INSERT INTO dynamic_categories (id, label_en, label_ar, name_en, name_ar, icon, color, color_dark, sub_categories, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING *`,
      [categoryId, finalLabelEn, finalLabelAr, finalNameEn, finalNameAr, icon, color, finalColorDark, JSON.stringify(sub_categories), is_active]
    );

    // Audit log
    await logAuditEvent({
      admin_id: req.user.id,
      action: 'create_category',
      entity_type: 'category',
      entity_id: categoryId,
      details: { category: result.rows[0] }
    });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

/**
 * @swagger
 * /api/config/categories/{id}:
 *   put:
 *     summary: Update category
 *     description: Update an existing category (Super Admin only)
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label_en:
 *                 type: string
 *                 description: English label (also updates name_en)
 *                 example: "Public Transport"
 *               label_ar:
 *                 type: string
 *                 description: Arabic label (also updates name_ar)
 *                 example: "النقل العام"
 *               name_en:
 *                 type: string
 *                 description: English name (alternative to label_en)
 *                 example: "Public Transport"
 *               name_ar:
 *                 type: string
 *                 description: Arabic name (alternative to label_ar)
 *                 example: "النقل العام"
 *               icon:
 *                 type: string
 *                 example: "🚌"
 *               color:
 *                 type: string
 *                 description: Light theme color
 *                 example: "#2196F3"
 *               color_dark:
 *                 type: string
 *                 description: Dark theme color
 *                 example: "#1976D2"
 *               sub_categories:
 *                 type: array
 *                 description: Array of sub-category names
 *                 items:
 *                   type: string
 *                 example: ["Bus", "Metro", "Tram"]
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.put('/categories/:id', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { label_en, label_ar, name_en, name_ar, icon, color, color_dark, sub_categories, is_active } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (label_en !== undefined || name_en !== undefined) {
      const value = label_en || name_en;
      updates.push(`label_en = $${paramCount}`, `name_en = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
    if (label_ar !== undefined || name_ar !== undefined) {
      const value = label_ar || name_ar;
      updates.push(`label_ar = $${paramCount}`, `name_ar = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
    if (icon !== undefined) {
      updates.push(`icon = $${paramCount++}`);
      values.push(icon);
    }
    if (color !== undefined) {
      updates.push(`color = $${paramCount++}`);
      values.push(color);
    }
    if (color_dark !== undefined) {
      updates.push(`color_dark = $${paramCount++}`);
      values.push(color_dark);
    }
    if (sub_categories !== undefined) {
      updates.push(`sub_categories = $${paramCount++}`);
      values.push(JSON.stringify(sub_categories));
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const result = await query(
      `UPDATE dynamic_categories
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Audit log
    await logAuditEvent({
      admin_id: req.user.id,
      action: 'update_category',
      entity_type: 'category',
      entity_id: id,
      details: { updates: req.body, updated_category: result.rows[0] }
    });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

/**
 * @swagger
 * /api/config/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     description: Delete a category (Super Admin only)
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.delete('/categories/:id', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete: mark as inactive instead of hard delete
    const result = await query(
      'UPDATE dynamic_categories SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Audit log
    await logAuditEvent({
      admin_id: req.user.id,
      action: 'soft_delete_category',
      entity_type: 'category',
      entity_id: id,
      details: { deleted_category: result.rows[0] }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

/**
 * @swagger
 * /api/config/badges:
 *   get:
 *     summary: Get all gamification badges
 *     description: Retrieve all available badges
 *     tags: [Configuration]
 *     responses:
 *       200:
 *         description: List of badges
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 badges:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DynamicBadge'
 *       500:
 *         description: Server error
 */
router.get('/badges', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM dynamic_badges ORDER BY requirement_value ASC'
    );
    res.json({ badges: result.rows });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

/**
 * @swagger
 * /api/config/badges:
 *   post:
 *     summary: Create new badge
 *     description: Create a new gamification badge (Super Admin only)
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - label_en
 *               - label_ar
 *               - description_en
 *               - description_ar
 *               - icon
 *               - condition_type
 *               - condition_value
 *               - points_reward
 *             properties:
 *               label_en:
 *                 type: string
 *                 example: "Reporter Hero"
 *               label_ar:
 *                 type: string
 *                 example: "بطل البلاغات"
 *               description_en:
 *                 type: string
 *                 example: "Submit 50 reports"
 *               description_ar:
 *                 type: string
 *                 example: "قدم 50 بلاغ"
 *               icon:
 *                 type: string
 *                 example: "🏆"
 *               condition_type:
 *                 type: string
 *                 example: "reports_count"
 *               condition_value:
 *                 type: integer
 *                 example: 50
 *               points_reward:
 *                 type: integer
 *                 example: 100
 *     responses:
 *       201:
 *         description: Badge created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post('/badges', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const { 
      label_en, label_ar, description_en, description_ar, 
      icon, condition_type, condition_value, points_reward, is_active = true 
    } = req.body;

    if (!label_en || !label_ar || !description_en || !description_ar || 
        !icon || !condition_type || condition_value === undefined || points_reward === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await query(
      `INSERT INTO dynamic_badges 
       (label_en, label_ar, description_en, description_ar, icon, condition_type, condition_value, points_reward, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [label_en, label_ar, description_en, description_ar, icon, condition_type, condition_value, points_reward, is_active]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating badge:', error);
    res.status(500).json({ error: 'Failed to create badge' });
  }
});

/**
 * @swagger
 * /api/config/badges/{id}:
 *   put:
 *     summary: Update badge
 *     description: Update an existing badge (Super Admin only)
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label_en:
 *                 type: string
 *               label_ar:
 *                 type: string
 *               icon:
 *                 type: string
 *               points_reward:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Badge updated successfully
 *       404:
 *         description: Badge not found
 *       500:
 *         description: Server error
 */
router.put('/badges/:id', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { label_en, label_ar, description_en, description_ar, icon, condition_value, points_reward, is_active } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (label_en !== undefined) {
      updates.push(`label_en = $${paramCount++}`);
      values.push(label_en);
    }
    if (label_ar !== undefined) {
      updates.push(`label_ar = $${paramCount++}`);
      values.push(label_ar);
    }
    if (description_en !== undefined) {
      updates.push(`description_en = $${paramCount++}`);
      values.push(description_en);
    }
    if (description_ar !== undefined) {
      updates.push(`description_ar = $${paramCount++}`);
      values.push(description_ar);
    }
    if (icon !== undefined) {
      updates.push(`icon = $${paramCount++}`);
      values.push(icon);
    }
    if (condition_value !== undefined) {
      updates.push(`condition_value = $${paramCount++}`);
      values.push(condition_value);
    }
    if (points_reward !== undefined) {
      updates.push(`points_reward = $${paramCount++}`);
      values.push(points_reward);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const result = await query(
      `UPDATE dynamic_badges SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Badge not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating badge:', error);
    res.status(500).json({ error: 'Failed to update badge' });
  }
});

/**
 * @swagger
 * /api/config/badges/{id}:
 *   delete:
 *     summary: Delete badge
 *     description: Delete a badge (Super Admin only)
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Badge deleted successfully
 *       404:
 *         description: Badge not found
 *       500:
 *         description: Server error
 */
router.delete('/badges/:id', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM dynamic_badges WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Badge not found' });
    }

    res.json({ message: 'Badge deleted successfully' });
  } catch (error) {
    console.error('Error deleting badge:', error);
    res.status(500).json({ error: 'Failed to delete badge' });
  }
});

/**
 * @swagger
 * /api/config/gamification:
 *   get:
 *     summary: Get gamification settings
 *     description: Retrieve current points configuration
 *     tags: [Configuration]
 *     responses:
 *       200:
 *         description: Gamification settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "default"
 *                 pointsRules:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "submit_report"
 *                       points:
 *                         type: integer
 *                         example: 10
 *                       description:
 *                         type: string
 *                         example: "For submitting a new report"
 *       500:
 *         description: Server error
 */
router.get('/gamification', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM gamification_settings WHERE id = $1',
      ['default']
    );

    if (result.rows.length === 0) {
      // Return default settings
      return res.json({
        rules: [
          {"id": "submit_report", "points": 10, "description": "For submitting a new report"},
          {"id": "confirm_report", "points": 3, "description": "For confirming an existing report"},
          {"id": "earn_badge", "points": 25, "description": "Bonus for earning a new badge"},
          {"id": "comment", "points": 2, "description": "For adding a comment to a report"}
        ]
      });
    }

    res.json({
      rules: result.rows[0].points_rules
    });
  } catch (error) {
    console.error('Error fetching gamification settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * @swagger
 * /api/config/gamification:
 *   put:
 *     summary: Update gamification settings
 *     description: Update points configuration (Super Admin only)
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pointsRules
 *             properties:
 *               pointsRules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - points
 *                     - description
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "submit_report"
 *                     points:
 *                       type: integer
 *                       example: 10
 *                     description:
 *                       type: string
 *                       example: "For submitting a new report"
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       400:
 *         description: Invalid values
 *       500:
 *         description: Server error
 */
router.put('/gamification', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const { pointsRules } = req.body;

    if (!pointsRules || !Array.isArray(pointsRules)) {
      return res.status(400).json({ error: 'pointsRules must be an array' });
    }

    const result = await query(
      `UPDATE gamification_settings 
       SET points_rules = $1, updated_at = NOW()
       WHERE id = 'default'
       RETURNING *`,
      [JSON.stringify(pointsRules)]
    );

    if (result.rows.length === 0) {
      // Insert if doesn't exist
      const insertResult = await query(
        `INSERT INTO gamification_settings (id, points_rules)
         VALUES ('default', $1)
         RETURNING *`,
        [JSON.stringify(pointsRules)]
      );
      return res.json({
        id: insertResult.rows[0].id,
        pointsRules: insertResult.rows[0].points_rules
      });
    }

    res.json({
      id: result.rows[0].id,
      pointsRules: result.rows[0].points_rules
    });
  } catch (error) {
    console.error('Error updating gamification settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

/**
 * @swagger
 * /api/config/badges/reevaluate:
 *   post:
 *     summary: Re-evaluate badges for all users
 *     description: Triggers badge evaluation for all users (Super Admin only)
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional array of user IDs to re-evaluate (omit to evaluate all)
 *     responses:
 *       200:
 *         description: Badge re-evaluation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     processed:
 *                       type: integer
 *                     failed:
 *                       type: integer
 *                     newBadgesAwarded:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin only
 *       500:
 *         description: Server error
 */
router.post('/badges/reevaluate', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const { userIds } = req.body;

    let summary;
    if (userIds && Array.isArray(userIds)) {
      summary = await batchEvaluateBadges(userIds);
    } else {
      summary = await reevaluateAllBadges();
    }

    res.json({
      message: 'Badge re-evaluation completed',
      summary
    });
  } catch (error) {
    console.error('Error re-evaluating badges:', error);
    res.status(500).json({ error: 'Failed to re-evaluate badges' });
  }
});

module.exports = router;
