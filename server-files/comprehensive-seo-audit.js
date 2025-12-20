// server-files/comprehensive-seo-audit.js
// Comprehensive SEO audit with REAL DataForSEO On-Page scanning

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const dataforSEOOnPage = require('./dataforseo-onpage-service');
const cheerioScanner = require('./cheerio-page-scanner');

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
 * 
 * PRODUCTION SAFETY:
 * - One scan = one DataForSEO task (no caching)
 * - max_crawl_pages strictly enforced by user plan
 * - Requires authenticated userId (UUID)
 * - No background polling after completion
 * - No repeated scans without explicit user action
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

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User authentication required'
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
        // Try to get subscription plan from subscriptions table
        const subResult = await pool.query(
          'SELECT plan_name FROM subscriptions WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
          [userId, 'active']
        );
        
        if (subResult.rows.length > 0) {
          userPlan = (subResult.rows[0].plan_name || 'starter').toLowerCase();
          maxPages = PLAN_LIMITS[userPlan] || PLAN_LIMITS.default;
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch user plan, using default limit:', error.message);
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

    // QUICK CHEERIO SCAN - Run on homepage + 2 additional pages
    // This runs in background, doesn't block response
    runCheerioPageScans(scanId, url, hostname).catch(err => {
      console.error('⚠️ Cheerio scan failed:', err);
    });

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

/**
 * Background function to run Cheerio page scans
 * Scans homepage + discovers 2-3 additional pages
 */
async function runCheerioPageScans(scanId, baseUrl, hostname) {
  try {
    console.log(`🔍 Starting Cheerio page scans for scan ${scanId}`);
    
    // Pages to scan (homepage + common pages)
    const pagesToScan = [
      baseUrl, // Homepage
      `${baseUrl.replace(/\/$/, '')}/about`,
      `${baseUrl.replace(/\/$/, '')}/contact`,
      `${baseUrl.replace(/\/$/, '')}/services`
    ];
    
    // Scan each page
    for (const pageUrl of pagesToScan) {
      try {
        console.log(`📄 Scanning: ${pageUrl}`);
        const scanResult = await cheerioScanner.scanPageHTML(pageUrl);
        
        if (scanResult.success) {
          // Store in database
          await pool.query(
            `INSERT INTO seo_page_scans 
             (scan_id, page_url, page_title, meta_description, h1_tags, 
              image_count, images_without_alt, has_canonical, is_noindex, 
              issues, scan_success, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
            [
              scanId,
              scanResult.url,
              scanResult.pageTitle,
              scanResult.metaDescription,
              scanResult.h1Tags,
              scanResult.imageCount,
              scanResult.imagesWithoutAlt,
              scanResult.hasCanonical,
              scanResult.isNoindex,
              JSON.stringify(scanResult.issues),
              true
            ]
          );
          console.log(`✅ Stored ${scanResult.issues.length} issues for ${pageUrl}`);
        } else {
          // Store failed scan
          await pool.query(
            `INSERT INTO seo_page_scans 
             (scan_id, page_url, issues, scan_success, error_message, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [scanId, pageUrl, JSON.stringify([]), false, scanResult.error]
          );
          console.log(`⚠️ Failed to scan ${pageUrl}: ${scanResult.error}`);
        }
      } catch (pageError) {
        console.error(`❌ Error scanning ${pageUrl}:`, pageError);
      }
    }
    
    console.log(`✅ Cheerio page scans complete for scan ${scanId}`);
  } catch (error) {
    console.error(`❌ Cheerio scan background job failed:`, error);
  }
}

module.exports = router;
