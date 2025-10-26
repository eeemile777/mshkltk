const express = require('express');
const router = express.Router();
const { query, pool: dbPool } = require('../db/connection');
const { authMiddleware, requireRole } = require('../middleware/auth');

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
router.get('/categories', async (req, res) => {
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
 *               label_en:
 *                 type: string
 *                 example: "Public Transport"
 *               label_ar:
 *                 type: string
 *                 example: "النقل العام"
 *               icon:
 *                 type: string
 *                 example: "🚌"
 *               color:
 *                 type: string
 *                 example: "#2196F3"
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
    const { id, label_en, label_ar, icon, color, is_active = true } = req.body;

    if (!label_en || !label_ar || !icon || !color) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate ID if not provided (for direct API calls)
    const categoryId = id || label_en.toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]/g, '');

    const result = await query(
      `INSERT INTO dynamic_categories (id, label_en, label_ar, icon, color, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [categoryId, label_en, label_ar, icon, color, is_active]
    );

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
 *               label_ar:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *               is_active:
 *                 type: boolean
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
    const { label_en, label_ar, icon, color, is_active } = req.body;

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
    if (icon !== undefined) {
      updates.push(`icon = $${paramCount++}`);
      values.push(icon);
    }
    if (color !== undefined) {
      updates.push(`color = $${paramCount++}`);
      values.push(color);
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
      `UPDATE dynamic_categories SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

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

    const result = await query(
      'DELETE FROM dynamic_categories WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

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

module.exports = router;
