// server-files/comprehensive-seo-audit-dataforseo.js
// REAL DataForSEO On-Page SEO audit with async task lifecycle

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const dataforSEOService = require('./dataforseo-onpage-service');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Plan limits for page scanning
const PLAN_LIMITS = {
  'starter': 10,
  'growth': 50,
  'professional': 200,
  'enterprise': 1000
};

/**
 * Get user's plan and page limit
 */
async function getUserPlanLimit(userId) {
  try {
    const result = await pool.query(
      'SELECT plan FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return { plan: 'starter', maxPages: 10 }; // Default
    }
    
    const plan = result.rows[0].plan || 'starter';
    const maxPages = PLAN_LIMITS[plan.toLowerCase()] || 10;
    
    return { plan, maxPages };
  } catch (error) {
    console.error('Error fetching user plan:', error);
    return { plan: 'starter', maxPages: 10 };
  }
}

/**
 * POST /api/seo/comprehensive-audit
 * Start a REAL DataForSEO On-Page crawl task
 */
router.post('/comprehensive-audit', async (req, res) => {
  try {
    const { url, userId } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
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

    const hostname = parsedUrl.hostname;

    console.log(`🔍 Starting REAL DataForSEO audit for: ${url} (user: ${userId})`);

    // Get user's plan limits
    const { plan, maxPages } = await getUserPlanLimit(userId);
    console.log(`📊 User plan: ${plan}, Max pages: ${maxPages}`);

    // Create initial scan record with status = 'queued'
    const insertResult = await pool.query(
      `INSERT INTO seo_scan_history 
       (user_id, url, status, max_pages, score, issues, summary, page_data, scanned_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
       RETURNING id`,
      [
        userId,
        url,
        'queued',
        maxPages,
        0, // Initial score
        JSON.stringify([]),
        JSON.stringify({ total: 0, critical: 0, high: 0, medium: 0 }),
        JSON.stringify({})
      ]
    );

    const scanId = insertResult.rows[0].id;
    console.log(`✅ Created scan record: ${scanId}`);

    // Start DataForSEO On-Page task
    const taskResult = await dataforSEOService.postOnPageTask({
      target: url,
      max_crawl_pages: maxPages,
      enable_javascript: true,
      enable_browser_rendering: false,
      load_resources: true,
      calculate_keyword_density: false,
      store_raw_html: false
    });

    if (!taskResult.success) {
      // Update scan status to failed
      await pool.query(
        'UPDATE seo_scan_history SET status = $1, error_message = $2 WHERE id = $3',
        ['failed', taskResult.error, scanId]
      );

      return res.status(500).json({
        success: false,
        error: taskResult.error || 'Failed to start DataForSEO task'
      });
    }

    const taskId = taskResult.taskId;
    console.log(`🚀 DataForSEO task started: ${taskId}`);

    // Update scan record with task ID and status = 'running'
    await pool.query(
      'UPDATE seo_scan_history SET dataforseo_task_id = $1, status = $2 WHERE id = $3',
      [taskId, 'running', scanId]
    );

    // Return immediately with task info (async scan)
    res.json({
      success: true,
      scanId: scanId,
      taskId: taskId,
      status: 'running',
      url: url,
      hostname: hostname,
      maxPages: maxPages,
      plan: plan,
      message: 'Scan started. Use /api/seo/scan-status/:scanId to check progress.',
      scannedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Comprehensive audit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start comprehensive audit'
    });
  }
});

/**
 * GET /api/seo/scan-status/:scanId
 * Check the status of a running scan
 */
router.get('/scan-status/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;

    // Get scan record
    const scanResult = await pool.query(
      'SELECT * FROM seo_scan_history WHERE id = $1',
      [scanId]
    );

    if (scanResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found'
      });
    }

    const scan = scanResult.rows[0];

    // If already completed or failed, return cached result
    if (scan.status === 'completed' || scan.status === 'failed') {
      return res.json({
        success: true,
        status: scan.status,
        scanId: scan.id,
        url: scan.url,
        score: scan.score,
        issues: scan.issues,
        summary: scan.summary,
        pageData: scan.page_data,
        pagesCrawled: scan.pages_crawled,
        maxPages: scan.max_pages,
        scannedAt: scan.scanned_at,
        errorMessage: scan.error_message
      });
    }

    // If still running, check DataForSEO status
    if (scan.dataforseo_task_id) {
      const taskStatus = await dataforSEOService.getTaskStatus(scan.dataforseo_task_id);

      if (!taskStatus.success) {
        return res.json({
          success: true,
          status: 'running',
          scanId: scan.id,
          message: 'Scan is still in progress'
        });
      }

      // Check if task is ready
      if (taskStatus.status === 'ready' || taskStatus.status === 'completed') {
        // Fetch full results
        const results = await dataforSEOService.getSummary(scan.dataforseo_task_id);

        if (results.success && results.data) {
          // Process and store results
          const processedData = processDataForSEOResults(results.data);

          await pool.query(
            `UPDATE seo_scan_history 
             SET status = $1, score = $2, issues = $3, summary = $4, 
                 page_data = $5, pages_crawled = $6, scanned_at = NOW() 
             WHERE id = $7`,
            [
              'completed',
              processedData.score,
              JSON.stringify(processedData.issues),
              JSON.stringify(processedData.summary),
              JSON.stringify(processedData.pageData),
              processedData.pagesCrawled,
              scan.id
            ]
          );

          return res.json({
            success: true,
            status: 'completed',
            scanId: scan.id,
            url: scan.url,
            hostname: new URL(scan.url).hostname,
            score: processedData.score,
            analysis: {
              score: processedData.score,
              issues: processedData.issues,
              summary: processedData.summary,
              pageData: processedData.pageData
            },
            pagesCrawled: processedData.pagesCrawled,
            maxPages: scan.max_pages,
            scannedAt: new Date().toISOString()
          });
        }
      }

      // Still running
      return res.json({
        success: true,
        status: 'running',
        scanId: scan.id,
        message: 'Scan is still in progress. Please check again in a few moments.'
      });
    }

    // No task ID yet (queued)
    return res.json({
      success: true,
      status: 'queued',
      scanId: scan.id,
      message: 'Scan is queued and will start shortly'
    });

  } catch (error) {
    console.error('❌ Scan status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check scan status'
    });
  }
});

/**
 * Process DataForSEO results into our format
 */
function processDataForSEOResults(data) {
  const issues = [];
  let score = 100;

  // Extract checks from DataForSEO response
  const checks = data.checks || {};
  const pages = data.pages || [];
  const pagesCrawled = pages.length;

  // Process each check category
  Object.keys(checks).forEach(checkKey => {
    const check = checks[checkKey];
    if (check && check.errors && check.errors.length > 0) {
      check.errors.forEach(error => {
        issues.push({
          category: checkKey,
          severity: 'critical',
          title: error.title || checkKey,
          description: error.description || 'Issue detected',
          impact: 'CRITICAL',
          autoFixAvailable: false
        });
        score -= 15;
      });
    }

    if (check && check.warnings && check.warnings.length > 0) {
      check.warnings.forEach(warning => {
        issues.push({
          category: checkKey,
          severity: 'high',
          title: warning.title || checkKey,
          description: warning.description || 'Warning detected',
          impact: 'HIGH',
          autoFixAvailable: false
        });
        score -= 10;
      });
    }
  });

  score = Math.max(0, Math.min(100, score));

  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const highIssues = issues.filter(i => i.severity === 'high').length;
  const mediumIssues = issues.filter(i => i.severity === 'medium').length;

  return {
    score,
    issues,
    summary: {
      total: issues.length,
      critical: criticalIssues,
      high: highIssues,
      medium: mediumIssues
    },
    pageData: {
      title: data.meta_title || 'No title',
      description: data.meta_description || 'No description',
      pagesCrawled: pagesCrawled
    },
    pagesCrawled
  };
}

module.exports = router;
