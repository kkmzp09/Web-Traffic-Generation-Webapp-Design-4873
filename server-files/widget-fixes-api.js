// server-files/widget-fixes-api.js
// API endpoints for widget-based SEO fixes

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * GET /api/widget/fixes/:siteId
 * Fetch all active fixes for a specific site (called by widget)
 */
router.get('/fixes/:siteId', async (req, res) => {
  try {
    const { siteId } = req.params;

    const result = await pool.query(
      `SELECT id, fix_type, fix_data, priority, created_at
       FROM widget_fixes
       WHERE site_id = $1 
       AND status = 'active'
       AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY priority DESC, created_at DESC`,
      [siteId]
    );

    res.json({
      success: true,
      siteId,
      fixes: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching widget fixes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/widget/fixes/apply
 * Apply/enable a specific fix for a site
 */
router.post('/fixes/apply', async (req, res) => {
  try {
    const { siteId, domain, scanId, fixType, fixData, priority = 50 } = req.body;

    if (!siteId || !domain || !fixType || !fixData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: siteId, domain, fixType, fixData'
      });
    }

    // Check if fix already exists
    const existing = await pool.query(
      'SELECT id FROM widget_fixes WHERE site_id = $1 AND fix_type = $2 AND status = $3',
      [siteId, fixType, 'active']
    );

    let result;
    if (existing.rows.length > 0) {
      // Update existing fix
      result = await pool.query(
        `UPDATE widget_fixes 
         SET fix_data = $1, priority = $2, updated_at = NOW(), scan_id = $3
         WHERE id = $4
         RETURNING id, fix_type, status`,
        [JSON.stringify(fixData), priority, scanId, existing.rows[0].id]
      );
    } else {
      // Insert new fix
      result = await pool.query(
        `INSERT INTO widget_fixes (site_id, domain, scan_id, fix_type, fix_data, priority, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'active')
         RETURNING id, fix_type, status`,
        [siteId, domain, scanId, fixType, JSON.stringify(fixData), priority]
      );
    }

    res.json({
      success: true,
      message: 'Fix applied successfully',
      fix: result.rows[0]
    });

  } catch (error) {
    console.error('Error applying widget fix:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/widget/fixes/disable
 * Disable a specific fix
 */
router.post('/fixes/disable', async (req, res) => {
  try {
    const { fixId, siteId, fixType } = req.body;

    let query, params;
    
    if (fixId) {
      query = 'UPDATE widget_fixes SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id';
      params = ['disabled', fixId];
    } else if (siteId && fixType) {
      query = 'UPDATE widget_fixes SET status = $1, updated_at = NOW() WHERE site_id = $2 AND fix_type = $3 RETURNING id';
      params = ['disabled', siteId, fixType];
    } else {
      return res.status(400).json({
        success: false,
        error: 'Provide either fixId or (siteId + fixType)'
      });
    }

    const result = await pool.query(query, params);

    res.json({
      success: true,
      message: 'Fix disabled successfully',
      affectedRows: result.rowCount
    });

  } catch (error) {
    console.error('Error disabling widget fix:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/widget/fixes/list/:domain
 * List all fixes for a domain (for dashboard)
 */
router.get('/fixes/list/:domain', async (req, res) => {
  try {
    const { domain } = req.params;

    const result = await pool.query(
      `SELECT wf.*, ss.url, ss.status as scan_status
       FROM widget_fixes wf
       LEFT JOIN seo_scans ss ON wf.scan_id = ss.id
       WHERE wf.domain = $1
       ORDER BY wf.created_at DESC
       LIMIT 100`,
      [domain]
    );

    res.json({
      success: true,
      domain,
      fixes: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error listing widget fixes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
