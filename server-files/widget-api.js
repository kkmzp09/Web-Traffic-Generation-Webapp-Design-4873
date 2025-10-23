// server-files/widget-api.js
// API endpoints for widget communication

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const crypto = require('crypto');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/**
 * POST /api/widget/register
 * Register a new widget installation
 */
router.post('/register', async (req, res) => {
  try {
    const { siteId, widgetKey, domain, userAgent, url } = req.body;

    if (!siteId || !domain) {
      return res.status(400).json({
        success: false,
        error: 'siteId and domain are required'
      });
    }

    // Check if widget already exists
    const existing = await pool.query(
      `SELECT * FROM widget_installations WHERE site_id = $1`,
      [siteId]
    );

    let newWidgetKey = widgetKey;

    if (existing.rows.length === 0) {
      // Generate new widget key if not provided
      newWidgetKey = widgetKey || crypto.randomBytes(32).toString('hex');

      // Create new installation
      await pool.query(
        `INSERT INTO widget_installations 
         (site_id, domain, widget_key, last_ping, user_id)
         VALUES ($1, $2, $3, NOW(), $4)`,
        [siteId, domain, newWidgetKey, req.body.userId || '00000000-0000-0000-0000-000000000000']
      );

      // Log installation
      await logActivity(siteId, 'install', { domain, url, userAgent });
    } else {
      // Update last ping
      newWidgetKey = existing.rows[0].widget_key;
      await pool.query(
        `UPDATE widget_installations 
         SET last_ping = NOW(), updated_at = NOW()
         WHERE site_id = $1`,
        [siteId]
      );
    }

    res.json({
      success: true,
      widgetKey: newWidgetKey,
      message: 'Widget registered successfully'
    });

  } catch (error) {
    console.error('Widget registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/widget/ping
 * Update widget last seen time
 */
router.post('/ping', async (req, res) => {
  try {
    const { siteId } = req.body;
    const widgetKey = req.headers['x-widget-key'];

    if (!authenticateWidget(siteId, widgetKey)) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    await pool.query(
      `UPDATE widget_installations 
       SET last_ping = NOW()
       WHERE site_id = $1`,
      [siteId]
    );

    res.json({ success: true });

  } catch (error) {
    console.error('Widget ping error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/widget/pending-fixes
 * Get pending fixes for a site
 */
router.get('/pending-fixes', async (req, res) => {
  try {
    const { siteId } = req.query;
    const widgetKey = req.headers['x-widget-key'];

    if (!siteId) {
      return res.status(400).json({
        success: false,
        error: 'siteId is required'
      });
    }

    // Get pending fixes
    const result = await pool.query(
      `SELECT * FROM widget_fix_queue 
       WHERE site_id = $1 
       AND status = 'pending'
       ORDER BY created_at ASC
       LIMIT 10`,
      [siteId]
    );

    res.json({
      success: true,
      fixes: result.rows
    });

  } catch (error) {
    console.error('Get pending fixes error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/widget/fix-status
 * Report fix application status
 */
router.post('/fix-status', async (req, res) => {
  try {
    const { siteId, fixId, success, error } = req.body;
    const widgetKey = req.headers['x-widget-key'];

    if (!siteId || !fixId) {
      return res.status(400).json({
        success: false,
        error: 'siteId and fixId are required'
      });
    }

    // Update fix status
    await pool.query(
      `UPDATE widget_fix_queue 
       SET status = $1, 
           applied_at = NOW(),
           error_message = $2
       WHERE id = $3 AND site_id = $4`,
      [success ? 'applied' : 'failed', error || null, fixId, siteId]
    );

    // Log activity
    await logActivity(siteId, success ? 'fix_applied' : 'fix_failed', {
      fixId,
      error
    });

    res.json({
      success: true,
      message: 'Fix status updated'
    });

  } catch (error) {
    console.error('Fix status update error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/widget/log
 * Log widget activity
 */
router.post('/log', async (req, res) => {
  try {
    const { siteId, activityType, details, url } = req.body;

    await logActivity(siteId, activityType, details, req.ip, req.headers['user-agent']);

    res.json({ success: true });

  } catch (error) {
    console.error('Widget log error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/widget/queue-fix
 * Queue a fix to be applied via widget
 */
router.post('/queue-fix', async (req, res) => {
  try {
    const { siteId, fixId, fixType, fixData, targetSelector } = req.body;

    if (!siteId || !fixId || !fixType || !fixData) {
      return res.status(400).json({
        success: false,
        error: 'siteId, fixId, fixType, and fixData are required'
      });
    }

    // Check if widget is installed
    const widget = await pool.query(
      `SELECT * FROM widget_installations WHERE site_id = $1 AND status = 'active'`,
      [siteId]
    );

    if (widget.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Widget not installed or inactive'
      });
    }

    // Queue the fix
    await pool.query(
      `INSERT INTO widget_fix_queue 
       (site_id, fix_id, fix_type, target_selector, fix_data)
       VALUES ($1, $2, $3, $4, $5)`,
      [siteId, fixId, fixType, targetSelector, fixData]
    );

    res.json({
      success: true,
      message: 'Fix queued successfully'
    });

  } catch (error) {
    console.error('Queue fix error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/widget/installations
 * Get all widget installations for a user
 */
router.get('/installations', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const result = await pool.query(
      `SELECT 
        id, site_id, domain, status, last_ping, installed_at,
        (last_ping > NOW() - INTERVAL '5 minutes') as is_online
       FROM widget_installations 
       WHERE user_id = $1 
       ORDER BY installed_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      installations: result.rows
    });

  } catch (error) {
    console.error('Get installations error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Helper: Authenticate widget
 */
async function authenticateWidget(siteId, widgetKey) {
  try {
    const result = await pool.query(
      `SELECT * FROM widget_installations 
       WHERE site_id = $1 AND widget_key = $2 AND status = 'active'`,
      [siteId, widgetKey]
    );

    return result.rows.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Helper: Log activity
 */
async function logActivity(siteId, activityType, details, ipAddress, userAgent) {
  try {
    await pool.query(
      `INSERT INTO widget_activity_log 
       (site_id, activity_type, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [siteId, activityType, details, ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Log activity error:', error);
  }
}

module.exports = router;
