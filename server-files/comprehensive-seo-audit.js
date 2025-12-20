// server-files/comprehensive-seo-audit.js
// Comprehensive SEO audit with REAL DataForSEO On-Page scanning

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const dataforSEOOnPage = require('./dataforseo-onpage-service');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// HARD PLAN LIMITS - ENFORCED STRICTLY
const PLAN_LIMITS = {
  'starter': 10,
  'growth': 50,
  'professional': 200,
  'enterprise': 1000,
  'default': 10  // Safety fallback
};

/**
 * POST /api/seo/comprehensive-audit
 * Comprehensive SEO audit with REAL DataForSEO On-Page API
 * Now triggers actual DataForSEO crawl instead of instant Cheerio scan
 * ENFORCES HARD PAGE LIMITS based on user plan
 */
router.post('/comprehensive-audit', async (req, res) => {
  try {
    const { url, userId, force_fresh = true } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
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

    // FETCH USER PLAN AND ENFORCE HARD LIMIT
    let maxPages = PLAN_LIMITS.default;
    let userPlan = 'starter';
    
    if (userId) {
      try {
        const userResult = await pool.query(
          'SELECT plan FROM users WHERE id = $1',
          [userId]
        );
        
        if (userResult.rows.length > 0) {
          userPlan = (userResult.rows[0].plan || 'starter').toLowerCase();
          maxPages = PLAN_LIMITS[userPlan] || PLAN_LIMITS.default;
        }
      } catch (error) {
        console.error('⚠️ Error fetching user plan, using default limit:', error);
        maxPages = PLAN_LIMITS.default;
      }
    }

    console.log(`🔍 Starting REAL DataForSEO audit for: ${url}`);
    console.log(`📊 User plan: ${userPlan}, Max pages: ${maxPages}`);

    // Start DataForSEO On-Page crawl task with HARD LIMIT
    const taskResult = await dataforSEOOnPage.postOnPageTask({
      target: url,
      max_crawl_pages: maxPages,  // ENFORCED HARD LIMIT
      enable_javascript: true,
      enable_browser_rendering: false,
      load_resources: true,
      calculate_keyword_density: false
    });

    if (!taskResult.success) {
      console.error('❌ DataForSEO task failed:', taskResult.error);
      return res.status(500).json({
        success: false,
        error: taskResult.error || 'Failed to start DataForSEO scan'
      });
    }

    const taskId = taskResult.taskId;
    console.log(`✅ DataForSEO task started: ${taskId}`);

    // Save scan to seo_scans table (using existing schema)
    const scanResult = await pool.query(
      `INSERT INTO seo_scans 
       (url, status, dataforseo_task_id, user_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id`,
      [url, 'crawling', taskId, userId]
    );

    const scanId = scanResult.rows[0].id;
    console.log(`📝 Scan record created: ${scanId}`);

    // Return immediately - scan is running asynchronously
    // Frontend should poll or wait for completion
    res.json({
      success: true,
      scanId: scanId,
      taskId: taskId,
      url: url,
      hostname: hostname,
      scannedAt: new Date().toISOString(),
      status: 'crawling',
      maxPages: maxPages,
      userPlan: userPlan,
      message: `Scanning first ${maxPages} pages (${userPlan} plan limit)`,
      analysis: {
        score: 0,
        issues: [],
        summary: {
          total: 0,
          critical: 0,
          high: 0,
          medium: 0
        },
        pageData: {
          title: 'Scanning...',
          description: 'Scan in progress'
        }
      }
    });

    // Note: The actual scan results will be available via:
    // GET /api/dataforseo/onpage/status/:scanId
    // Frontend can poll this endpoint to get final results

  } catch (error) {
    console.error('Comprehensive audit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform comprehensive audit'
    });
  }
});

module.exports = router;
