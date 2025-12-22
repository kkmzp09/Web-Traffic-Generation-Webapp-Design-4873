// Widget Validation Status API - Save and retrieve widget validation status
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/**
 * GET /api/seo/widget-validation-status
 * Check if widget is already validated for a domain
 */
router.get('/widget-validation-status', async (req, res) => {
  try {
    const { domain, userId } = req.query;

    if (!domain || !userId) {
      return res.json({ success: false, validated: false });
    }

    const result = await pool.query(
      `SELECT * FROM widget_validations 
       WHERE domain = $1 AND user_id = $2 AND validated = true
       ORDER BY validated_at DESC LIMIT 1`,
      [domain, userId]
    );

    if (result.rows.length > 0) {
      const validation = result.rows[0];
      return res.json({
        success: true,
        validated: true,
        widgetInstalled: true,
        validatedAt: validation.validated_at,
        scriptTag: validation.script_tag
      });
    }

    res.json({ success: true, validated: false });
  } catch (error) {
    console.error('Error checking widget validation status:', error);
    res.json({ success: false, validated: false });
  }
});

/**
 * POST /api/seo/save-widget-validation
 * Save widget validation status (called by validate-widget-strict)
 */
router.post('/save-widget-validation', async (req, res) => {
  try {
    const { domain, userId, validated, scriptTag } = req.body;

    if (!domain || !userId) {
      return res.status(400).json({ success: false, error: 'domain and userId required' });
    }

    // Check if already exists
    const existing = await pool.query(
      'SELECT id FROM widget_validations WHERE domain = $1 AND user_id = $2',
      [domain, userId]
    );

    if (existing.rows.length > 0) {
      // Update existing
      await pool.query(
        `UPDATE widget_validations 
         SET validated = $1, script_tag = $2, validated_at = NOW()
         WHERE domain = $3 AND user_id = $4`,
        [validated, scriptTag, domain, userId]
      );
    } else {
      // Insert new
      await pool.query(
        `INSERT INTO widget_validations (domain, user_id, validated, script_tag, validated_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [domain, userId, validated, scriptTag]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving widget validation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
