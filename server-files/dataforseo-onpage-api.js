// dataforseo-onpage-api.js - API Routes for DataForSEO On-Page Integration
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const dataforSEOOnPage = require('./dataforseo-onpage-service');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Set search_path for Neon database
pool.on('connect', (client) => {
  client.query('SET search_path TO public');
});

// CORS middleware
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ============================================
// POST /api/dataforseo/onpage/scan
// Start a new On-Page crawl
// ============================================
router.post('/scan', async (req, res) => {
  try {
    const {
      url,
      userId,
      maxPages = 10,
      enableJavaScript = true,
      enableBrowserRendering = false,
      calculateKeywordDensity = false
    } = req.body;

    if (!url) {
      return res.json({ success: false, error: 'URL is required' });
    }

    console.log(`🔍 Starting DataForSEO On-Page scan for: ${url}`);

    // Post task to DataForSEO
    const taskResult = await dataforSEOOnPage.postOnPageTask({
      target: url,
      max_crawl_pages: maxPages,
      enable_javascript: enableJavaScript,
      enable_browser_rendering: enableBrowserRendering,
      load_resources: true,
      calculate_keyword_density: calculateKeywordDensity
    });

    if (!taskResult.success) {
      return res.json({
        success: false,
        error: taskResult.error || 'Failed to start crawl'
      });
    }

    // Save scan to database
    const scanResult = await pool.query(
      `INSERT INTO seo_scans 
       (url, status, dataforseo_task_id, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id`,
      [url, 'crawling', taskResult.taskId]
    );

    const scanId = scanResult.rows[0].id;

    res.json({
      success: true,
      scanId: scanId,
      taskId: taskResult.taskId,
      status: 'crawling',
      message: 'Crawl started successfully',
      cost: taskResult.cost
    });

  } catch (error) {
    console.error('❌ DataForSEO On-Page Scan Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/dataforseo/onpage/status/:scanId
// Check scan status
// ============================================
router.get('/status/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;

    // Get scan from database
    const scanResult = await pool.query(
      `SELECT id, url, status, dataforseo_task_id, created_at 
       FROM seo_scans 
       WHERE id = $1`,
      [scanId]
    );

    if (scanResult.rows.length === 0) {
      return res.json({ success: false, error: 'Scan not found' });
    }

    const scan = scanResult.rows[0];
    const taskId = scan.dataforseo_task_id;

    // Check status with DataForSEO
    const statusResult = await dataforSEOOnPage.getTaskStatus(taskId);

    if (!statusResult.success) {
      return res.json({
        success: true,
        scan: {
          id: scan.id,
          url: scan.url,
          status: scan.status,
          createdAt: scan.created_at
        }
      });
    }

    // Update database status if completed
    if (statusResult.completed && scan.status !== 'completed') {
      await pool.query(
        `UPDATE seo_scans 
         SET status = 'completed', updated_at = NOW()
         WHERE id = $1`,
        [scanId]
      );
    }

    res.json({
      success: true,
      scan: {
        id: scan.id,
        url: scan.url,
        status: statusResult.completed ? 'completed' : 'crawling',
        pagesCrawled: statusResult.pagesCrawled,
        pagesInQueue: statusResult.pagesInQueue,
        createdAt: scan.created_at
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GET /api/dataforseo/onpage/results/:scanId
// Get comprehensive scan results
// ============================================
router.get('/results/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;

    // Get scan from database
    const scanResult = await pool.query(
      `SELECT id, url, status, dataforseo_task_id, created_at 
       FROM seo_scans 
       WHERE id = $1`,
      [scanId]
    );

    if (scanResult.rows.length === 0) {
      return res.json({ success: false, error: 'Scan not found' });
    }

    const scan = scanResult.rows[0];
    const taskId = scan.dataforseo_task_id;

    console.log(`📊 Fetching results for scan ${scanId}, task ${taskId}`);

    // Get comprehensive analysis
    const analysis = await dataforSEOOnPage.getComprehensiveAnalysis(taskId);

    if (!analysis.success) {
      return res.json({
        success: false,
        error: analysis.error || 'Failed to fetch results'
      });
    }

    // Update database with results
    await pool.query(
      `UPDATE seo_scans 
       SET status = 'completed', 
           seo_score = $1,
           pages_crawled = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [
        analysis.summary?.onPageScore || 0,
        analysis.totalPages || 0,
        scanId
      ]
    );

    res.json({
      success: true,
      scan: {
        id: scan.id,
        url: scan.url,
        status: 'completed',
        createdAt: scan.created_at
      },
      analysis: analysis
    });

  } catch (error) {
    console.error('Results fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GET /api/dataforseo/onpage/summary/:scanId
// Get scan summary only
// ============================================
router.get('/summary/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;

    const scanResult = await pool.query(
      `SELECT dataforseo_task_id FROM seo_scans WHERE id = $1`,
      [scanId]
    );

    if (scanResult.rows.length === 0) {
      return res.json({ success: false, error: 'Scan not found' });
    }

    const taskId = scanResult.rows[0].dataforseo_task_id;
    const summary = await dataforSEOOnPage.getSummary(taskId);

    res.json(summary);

  } catch (error) {
    console.error('Summary fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GET /api/dataforseo/onpage/pages/:scanId
// Get all crawled pages
// ============================================
router.get('/pages/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;
    const { limit = 100 } = req.query;

    const scanResult = await pool.query(
      `SELECT dataforseo_task_id FROM seo_scans WHERE id = $1`,
      [scanId]
    );

    if (scanResult.rows.length === 0) {
      return res.json({ success: false, error: 'Scan not found' });
    }

    const taskId = scanResult.rows[0].dataforseo_task_id;
    const pages = await dataforSEOOnPage.getPages(taskId, parseInt(limit));

    res.json(pages);

  } catch (error) {
    console.error('Pages fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GET /api/dataforseo/onpage/resources/:scanId
// Get page resources
// ============================================
router.get('/resources/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;

    const scanResult = await pool.query(
      `SELECT dataforseo_task_id FROM seo_scans WHERE id = $1`,
      [scanId]
    );

    if (scanResult.rows.length === 0) {
      return res.json({ success: false, error: 'Scan not found' });
    }

    const taskId = scanResult.rows[0].dataforseo_task_id;
    const resources = await dataforSEOOnPage.getResources(taskId);

    res.json(resources);

  } catch (error) {
    console.error('Resources fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
