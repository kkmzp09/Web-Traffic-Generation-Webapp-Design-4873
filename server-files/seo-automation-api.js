// server-files/seo-automation-api.js
// SEO Automation API Endpoints

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const seoScanner = require('./seo-scanner-service');
const seoAIFixer = require('./seo-ai-fixer');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/**
 * POST /api/seo/scan-page
 * Scan a page for SEO issues
 */
router.post('/scan-page', async (req, res) => {
  try {
    const { url, userId } = req.body;

    if (!url || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL and userId are required' 
      });
    }

    // Validate URL
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid URL format' 
      });
    }

    const domain = parsedUrl.hostname;

    // Create initial scan record
    const scanResult = await pool.query(
      `INSERT INTO seo_scans (user_id, url, domain, status, scan_type) 
       VALUES ($1, $2, $3, 'scanning', 'on_demand') 
       RETURNING id`,
      [userId, url, domain]
    );

    const scanId = scanResult.rows[0].id;

    // Perform the scan (async)
    performScan(scanId, url, userId, domain);

    res.json({
      success: true,
      scanId,
      message: 'Scan started',
      status: 'scanning'
    });

  } catch (error) {
    console.error('Scan page error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Perform the actual scan (background process)
 */
async function performScan(scanId, url, userId, domain) {
  try {
    // Run the scanner
    const scanResults = await seoScanner.scanPage(url);

    // Count issues by severity
    const criticalIssues = scanResults.issues.filter(i => i.severity === 'critical').length;
    const warnings = scanResults.issues.filter(i => i.severity === 'warning').length;
    const passedChecks = scanResults.passed.length;

    // Update scan record
    await pool.query(
      `UPDATE seo_scans 
       SET status = 'completed', 
           seo_score = $1, 
           critical_issues = $2, 
           warnings = $3, 
           passed_checks = $4,
           scan_duration_ms = $5,
           scanned_at = NOW()
       WHERE id = $6`,
      [scanResults.seoScore, criticalIssues, warnings, passedChecks, scanResults.scanDuration, scanId]
    );

    // Insert issues
    for (const issue of scanResults.issues) {
      await pool.query(
        `INSERT INTO seo_issues 
         (scan_id, user_id, category, severity, title, description, current_value, element_selector)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [scanId, userId, issue.category, issue.severity, issue.title, issue.description, 
         issue.currentValue, issue.elementSelector]
      );
    }

    // Add to monitoring
    await pool.query(
      `INSERT INTO seo_monitoring 
       (user_id, url, domain, seo_score, total_issues, critical_issues, warnings)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, url, domain, scanResults.seoScore, scanResults.issues.length, criticalIssues, warnings]
    );

    console.log(`Scan ${scanId} completed with score ${scanResults.seoScore}`);

  } catch (error) {
    console.error('Scan execution error:', error);
    
    // Update scan as failed
    await pool.query(
      `UPDATE seo_scans SET status = 'failed' WHERE id = $1`,
      [scanId]
    );
  }
}

/**
 * GET /api/seo/scan/:scanId
 * Get scan details with issues
 */
router.get('/scan/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;

    // Get scan details
    const scanResult = await pool.query(
      `SELECT * FROM seo_scans WHERE id = $1`,
      [scanId]
    );

    if (scanResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Scan not found' 
      });
    }

    const scan = scanResult.rows[0];

    // Get issues
    const issuesResult = await pool.query(
      `SELECT * FROM seo_issues WHERE scan_id = $1 ORDER BY severity DESC, category`,
      [scanId]
    );

    // Get fixes if any
    const fixesResult = await pool.query(
      `SELECT * FROM seo_fixes WHERE scan_id = $1`,
      [scanId]
    );

    res.json({
      success: true,
      scan,
      issues: issuesResult.rows,
      fixes: fixesResult.rows
    });

  } catch (error) {
    console.error('Get scan error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/seo/scans
 * Get all scans for a user
 */
router.get('/scans', async (req, res) => {
  try {
    const { userId, limit = 20, offset = 0 } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId is required' 
      });
    }

    const result = await pool.query(
      `SELECT id, url, domain, seo_score, critical_issues, warnings, passed_checks, 
              status, scanned_at, created_at
       FROM seo_scans 
       WHERE user_id = $1 
       ORDER BY scanned_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM seo_scans WHERE user_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      scans: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Get scans error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/seo/generate-fixes/:scanId
 * Generate AI-powered fixes for a scan
 */
router.post('/generate-fixes/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;

    // Get scan and issues
    const scanResult = await pool.query(
      `SELECT * FROM seo_scans WHERE id = $1`,
      [scanId]
    );

    if (scanResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Scan not found' 
      });
    }

    const scan = scanResult.rows[0];

    // Get issues that need fixes
    const issuesResult = await pool.query(
      `SELECT * FROM seo_issues 
       WHERE scan_id = $1 
       AND severity IN ('critical', 'warning')
       AND category IN ('title', 'meta', 'images', 'schema', 'headings', 'content', 'links')
       AND fix_status = 'pending'`,
      [scanId]
    );

    const issues = issuesResult.rows;

    if (issues.length === 0) {
      return res.json({
        success: true,
        message: 'No issues requiring AI fixes',
        fixes: []
      });
    }

    // Generate fixes using AI
    const fixes = await seoAIFixer.generateFixes(scan.url, issues);

    // Store fixes in database
    for (const fix of fixes) {
      await pool.query(
        `INSERT INTO seo_fixes 
         (issue_id, scan_id, user_id, fix_type, original_content, optimized_content, 
          ai_model, confidence_score, keywords_used)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [fix.issueId, scanId, scan.user_id, fix.fixType, fix.originalContent, 
         fix.optimizedContent, fix.aiModel, fix.confidenceScore, fix.keywords]
      );
    }

    res.json({
      success: true,
      fixes,
      count: fixes.length
    });

  } catch (error) {
    console.error('Generate fixes error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/seo/apply-fix/:fixId
 * Apply fix via widget or mark as applied
 */
router.post('/apply-fix/:fixId', async (req, res) => {
  try {
    const { fixId } = req.params;
    const { method = 'one_click', siteId } = req.body;

    // Get fix details
    const fixResult = await pool.query(
      `SELECT f.*, s.domain FROM seo_fixes f
       JOIN seo_scans s ON f.scan_id = s.id
       WHERE f.id = $1`,
      [fixId]
    );

    if (fixResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Fix not found'
      });
    }

    const fix = fixResult.rows[0];

    // Check if widget is installed for this domain
    const widgetResult = await pool.query(
      `SELECT * FROM widget_installations 
       WHERE domain = $1 AND status = 'active'
       LIMIT 1`,
      [fix.domain]
    );

    if (widgetResult.rows.length > 0 && method !== 'manual') {
      // Queue fix for widget application
      const widget = widgetResult.rows[0];
      
      await pool.query(
        `INSERT INTO widget_fix_queue 
         (site_id, fix_id, fix_type, fix_data)
         VALUES ($1, $2, $3, $4)`,
        [
          widget.site_id,
          fixId,
          fix.fix_type,
          {
            optimized_content: fix.optimized_content,
            original_content: fix.original_content
          }
        ]
      );

      res.json({
        success: true,
        message: 'Fix queued for automatic application',
        method: 'widget'
      });
    } else {
      // Manual application - just mark as applied
      await pool.query(
        `UPDATE seo_fixes 
         SET applied = true, 
             applied_at = NOW(), 
             applied_method = $1
         WHERE id = $2`,
        [method, fixId]
      );

      await pool.query(
        `UPDATE seo_issues 
         SET fix_status = 'fixed', 
             fixed_at = NOW()
         WHERE id = (SELECT issue_id FROM seo_fixes WHERE id = $1)`,
        [fixId]
      );

      res.json({
        success: true,
        message: 'Fix marked as applied',
        method: 'manual'
      });
    }

  } catch (error) {
    console.error('Apply fix error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/seo/dashboard-stats
 * Get dashboard statistics for a user
 */
router.get('/dashboard-stats', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId is required' 
      });
    }

    // Get stats from the view
    const statsResult = await pool.query(
      `SELECT * FROM seo_dashboard_summary WHERE user_id = $1`,
      [userId]
    );

    // Get recent scans
    const recentScans = await pool.query(
      `SELECT id, url, domain, seo_score, critical_issues, warnings, scanned_at
       FROM seo_scans 
       WHERE user_id = $1 
       ORDER BY scanned_at DESC 
       LIMIT 5`,
      [userId]
    );

    // Get top issues
    const topIssues = await pool.query(
      `SELECT category, severity, COUNT(*) as count
       FROM seo_issues 
       WHERE user_id = $1 
       AND fix_status = 'pending'
       GROUP BY category, severity
       ORDER BY count DESC
       LIMIT 10`,
      [userId]
    );

    res.json({
      success: true,
      stats: statsResult.rows[0] || {
        total_domains: 0,
        total_pages_scanned: 0,
        total_critical_issues: 0,
        total_warnings: 0,
        avg_seo_score: 0
      },
      recentScans: recentScans.rows,
      topIssues: topIssues.rows
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/seo/schedule-scan
 * Schedule automated scans for a URL
 */
router.post('/schedule-scan', async (req, res) => {
  try {
    const { userId, url, frequency, autoFixEnabled, autoFixCategories, emailAlerts } = req.body;

    if (!userId || !url || !frequency) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId, url, and frequency are required' 
      });
    }

    // Calculate next run time
    const nextRunAt = calculateNextRun(frequency);

    const result = await pool.query(
      `INSERT INTO seo_schedules 
       (user_id, url, frequency, auto_fix_enabled, auto_fix_categories, email_alerts, next_run_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, url, frequency, autoFixEnabled || false, autoFixCategories || [], 
       emailAlerts !== false, nextRunAt]
    );

    res.json({
      success: true,
      schedule: result.rows[0]
    });

  } catch (error) {
    console.error('Schedule scan error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/seo/schedules
 * Get all schedules for a user
 */
router.get('/schedules', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId is required' 
      });
    }

    const result = await pool.query(
      `SELECT * FROM seo_schedules 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      schedules: result.rows
    });

  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * DELETE /api/seo/schedule/:scheduleId
 * Delete a schedule
 */
router.delete('/schedule/:scheduleId', async (req, res) => {
  try {
    const { scheduleId } = req.params;

    await pool.query(
      `DELETE FROM seo_schedules WHERE id = $1`,
      [scheduleId]
    );

    res.json({
      success: true,
      message: 'Schedule deleted'
    });

  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/seo/monitoring/:url
 * Get monitoring data for a URL
 */
router.get('/monitoring/:url', async (req, res) => {
  try {
    const { url } = req.params;
    const { userId, days = 30 } = req.query;

    const result = await pool.query(
      `SELECT * FROM seo_monitoring 
       WHERE url = $1 
       AND user_id = $2
       AND measured_at > NOW() - INTERVAL '${days} days'
       ORDER BY measured_at ASC`,
      [url, userId]
    );

    res.json({
      success: true,
      monitoring: result.rows
    });

  } catch (error) {
    console.error('Get monitoring error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Helper: Calculate next run time based on frequency
 */
function calculateNextRun(frequency) {
  const now = new Date();
  
  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
    default:
      now.setDate(now.getDate() + 7);
  }
  
  return now;
}

module.exports = router;
