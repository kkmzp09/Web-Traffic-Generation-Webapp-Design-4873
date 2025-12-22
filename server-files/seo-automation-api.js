// server-files/seo-automation-api.js
// SEO Automation API Endpoints

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const axios = require('axios');
const seoScanner = require('./seo-scanner-service');
const seoScannerPuppeteer = require('./seo-scanner-puppeteer');
const seoAIFixer = require('./seo-ai-fixer');
const MultiPageScanner = require('./multi-page-scanner');
const progressTracker = require('./scan-progress-tracker');
const quickAuditRoutes = require('./seo-quick-audit-api');
const comprehensiveAuditRoutes = require('./comprehensive-seo-audit');
const scanHistoryRoutes = require('./seo-scan-history-api');
const { sendScanEmail } = require('./send-scan-email');
const { generateAutoFixesForScan } = require('./generate-auto-fixes');

// Use Puppeteer scanner for JavaScript-rendered pages (set to true to enable)
const USE_PUPPETEER = process.env.USE_PUPPETEER_SCANNER === 'true' || false;

// CORS middleware for all routes
router.use((req, res, next) => {
  // Allow all origins
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }
  
  next();
});

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/**
 * Get user's subscription page limit
 */
async function getUserPageLimit(userId) {
  try {
    // Check if user has active SEO subscription
    const subResult = await pool.query(
      `SELECT plan_type, seo_page_limit, seo_scans_per_month 
       FROM subscriptions 
       WHERE user_id = $1 
       AND status = 'active' 
       AND plan_type LIKE 'seo_%'
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    
    if (subResult.rows.length > 0) {
      return subResult.rows[0].seo_page_limit || 10;
    }
    
    // Default to basic plan: 10 pages
    return 10;
  } catch (error) {
    console.error('Error getting page limit:', error);
    return 10; // Default to basic plan
  }
}

/**
 * POST /api/seo/validate-widget
 * Check if SEO widget is installed on a website
 */
router.post('/validate-widget', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL is required' 
      });
    }

    console.log(`🔍 Checking widget installation on: ${url}`);

    // Fetch the page HTML
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = response.data;

    // Check for widget script tag with multiple patterns
    const patterns = [
      /organitrafficboost\.com\/widget\/widget\.js/i,  // Main widget script
      /organitrafficboost\.com\/widget\.js/i,          // Alternative path
      /api\.organitrafficboost\.com\/widget/i,         // API subdomain
      /data-site-id/i,                                  // Widget data attribute
      /seo-auto-fix-widget/i,
      /organitrafficboost\.com\/seo-widget/i
    ];

    let widgetInstalled = false;
    let foundPattern = null;

    for (const pattern of patterns) {
      if (pattern.test(html)) {
        widgetInstalled = true;
        foundPattern = pattern.toString();
        break;
      }
    }

    console.log(`Widget validation for ${url}:`);
    console.log(`  Status: ${widgetInstalled ? '✅ FOUND' : '❌ NOT FOUND'}`);
    if (foundPattern) {
      console.log(`  Pattern matched: ${foundPattern}`);
    }
    console.log(`  HTML length: ${html.length} chars`);

    res.json({
      success: true,
      widgetInstalled,
      url,
      foundPattern,
      message: widgetInstalled 
        ? 'Widget is installed and active' 
        : 'Widget not found on this page. Make sure the widget script is properly installed.'
    });

  } catch (error) {
    console.error('Widget validation error:', error.message);
    res.json({
      success: true,
      widgetInstalled: false,
      error: error.message,
      message: 'Could not verify widget installation'
    });
  }
});

/**
 * POST /api/seo/scan-page
 * Scan a page for SEO issues
 */
router.post('/scan-page', async (req, res) => {
  try {
    let { url, userId } = req.body;

    if (!url) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL is required' 
      });
    }

    // Validate and fix userId - use default if not valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!userId || !uuidRegex.test(userId)) {
      // Use a default UUID for non-UUID user IDs
      userId = '00000000-0000-0000-0000-000000000000';
      console.log('Using default UUID for userId:', req.body.userId);
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

    // Check subscription limit BEFORE starting scan
    const pageLimit = await getUserPageLimit(userId);
    
    // Get current month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const usageResult = await pool.query(
      `SELECT COUNT(*) as pages_scanned 
       FROM seo_monitoring 
       WHERE user_id = $1 
       AND measured_at >= $2`,
      [userId, startOfMonth]
    );
    
    const pagesScanned = parseInt(usageResult.rows[0].pages_scanned) || 0;
    
    // Enforce limit
    if (pagesScanned >= pageLimit) {
      // Get subscription details for upgrade options
      const subResult = await pool.query(
        `SELECT plan_type, seo_page_limit 
         FROM subscriptions 
         WHERE user_id = $1 
         AND status = 'active' 
         AND plan_type LIKE 'seo_%'
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      
      const currentPlan = subResult.rows[0]?.plan_type || 'seo_starter';
      
      return res.json({
        success: false,
        limitReached: true,
        message: `Monthly page limit reached. You've scanned ${pagesScanned}/${pageLimit} pages this month.`,
        currentPlan: currentPlan.replace('seo_', ''),
        pagesScanned,
        pageLimit,
        upgradeOptions: [
          { plan: 'Professional', limit: 500, price: 79, features: 'Priority support, API access, Scheduled scans' },
          { plan: 'Business', limit: 2500, price: 199, features: 'Dedicated support, White-label, Team collaboration' }
        ],
        addOnOptions: [
          { name: 'Extra 100 pages', pages: 100, price: 10 },
          { name: 'Extra 500 pages', pages: 500, price: 40 },
          { name: 'Extra 1,000 pages', pages: 1000, price: 70 }
        ]
      });
    }

    // Create initial scan record
    const scanResult = await pool.query(
      `INSERT INTO seo_scans (user_id, url, domain, status, scan_type) 
       VALUES ($1, $2, $3, 'scanning', 'on_demand') 
       RETURNING id`,
      [userId, url, domain]
    );

    const scanId = scanResult.rows[0].id;

    // Perform the scan (async)
    // IMPORTANT: Always use 10 pages per scan, regardless of monthly limit
    const perScanLimit = 10;
    performScan(scanId, url, userId, domain, perScanLimit);

    res.json({
      success: true,
      scanId,
      message: 'Multi-page scan started',
      status: 'scanning',
      pageLimit: pageLimit
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
async function performScan(scanId, url, userId, domain, pageLimit = 10) {
  const startTime = Date.now();
  
  try {
    console.log(`🚀 Starting multi-page scan for ${url} (limit: ${pageLimit} pages)`);
    
    // Initialize progress tracking
    progressTracker.initScan(scanId, pageLimit, userId);
    
    // Step 1: Crawl website to discover pages
    const progressCallback = (phase, current, total) => {
      if (phase === 'crawling') {
        progressTracker.updateCrawling(scanId, current);
      }
    };
    
    const multiPageScanner = new MultiPageScanner(pageLimit, progressCallback);
    const discoveredPages = await multiPageScanner.crawlWebsite(url);
    
    console.log(`📄 Found ${discoveredPages.length} pages to scan`);
    
    // Step 1.5: Filter out pages with pending issues (smart skip)
    const pagesToScan = [];
    const skippedPages = [];
    
    for (const pageUrl of discoveredPages) {
      // Check if page was scanned before and has pending issues
      const pendingIssuesResult = await pool.query(
        `SELECT COUNT(*) as pending_count
         FROM seo_issues si
         JOIN seo_scans ss ON si.scan_id = ss.id
         WHERE si.user_id = $1 
         AND si.title LIKE $2
         AND si.fix_status != 'fixed'
         AND ss.domain = $3
         AND ss.scanned_at > NOW() - INTERVAL '30 days'`,
        [userId, `%${pageUrl}%`, domain]
      );
      
      const pendingCount = parseInt(pendingIssuesResult.rows[0]?.pending_count || 0);
      
      if (pendingCount > 0) {
        // Skip this page - it has pending issues
        skippedPages.push(pageUrl);
        console.log(`⏭️  Skipping ${pageUrl} (${pendingCount} pending issues)`);
      } else {
        // Scan this page - either new or issues were fixed
        pagesToScan.push(pageUrl);
      }
    }
    
    console.log(`✅ Pages to scan: ${pagesToScan.length} (Skipped: ${skippedPages.length} with pending issues)`);
    progressTracker.startScanning(scanId, pagesToScan.length);
    
    // Step 2: Scan each page
    const scanner = USE_PUPPETEER ? seoScannerPuppeteer : seoScanner;
    let totalIssues = 0;
    let totalCritical = 0;
    let totalWarnings = 0;
    let totalPassed = 0;
    let totalScore = 0;
    let scannedCount = 0;
    
    for (const pageUrl of pagesToScan) {
      try {
        // Update progress before scanning
        progressTracker.updateScanning(scanId, scannedCount, pageUrl);
        
        const scanResults = await scanner.scanPage(pageUrl);
        scannedCount++;
        
        // Update progress after scanning
        progressTracker.updateScanning(scanId, scannedCount, pageUrl);
        
        totalScore += scanResults.seoScore;
        totalIssues += scanResults.issues.length;
        totalCritical += scanResults.issues.filter(i => i.severity === 'critical').length;
        totalWarnings += scanResults.issues.filter(i => i.severity === 'warning').length;
        totalPassed += scanResults.passed.length;
        
        // Insert issues for this page
        for (const issue of scanResults.issues) {
          await pool.query(
            `INSERT INTO seo_issues 
             (scan_id, user_id, category, severity, title, description, current_value, element_selector, page_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [scanId, userId, issue.category, issue.severity, 
             issue.title, issue.description, 
             issue.currentValue, issue.elementSelector, pageUrl]
          );
        }
        
        // Track each page in monitoring for subscription usage
        await pool.query(
          `INSERT INTO seo_monitoring 
           (user_id, url, domain, seo_score, total_issues, critical_issues, warnings)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [userId, pageUrl, domain, scanResults.seoScore, 
           scanResults.issues.length,
           scanResults.issues.filter(i => i.severity === 'critical').length,
           scanResults.issues.filter(i => i.severity === 'warning').length]
        );
        
      } catch (error) {
        console.error(`Error scanning ${pageUrl}:`, error.message);
      }
    }
    
    // Calculate averages
    const avgScore = scannedCount > 0 ? Math.round(totalScore / scannedCount) : 0;
    const scanDuration = Date.now() - startTime;
    
    // Update scan record with aggregated results
    await pool.query(
      `UPDATE seo_scans 
       SET status = 'completed', 
           seo_score = $1, 
           critical_issues = $2, 
           warnings = $3, 
           passed_checks = $4,
           scan_duration_ms = $5,
           pages_scanned = $6,
           pages_skipped = $7,
           scanned_at = NOW()
       WHERE id = $8`,
      [avgScore, totalCritical, totalWarnings, totalPassed, scanDuration, scannedCount, skippedPages.length, scanId]
    );

    console.log(`✅ Scan ${scanId} completed: ${scannedCount} pages scanned, ${skippedPages.length} pages skipped (pending issues), avg score ${avgScore}, ${totalIssues} total issues`);
    
    // Mark progress as complete
    progressTracker.completeScan(scanId, {
      avgScore,
      totalIssues,
      totalCritical,
      totalWarnings,
      scannedCount
    });

    // Generate auto-fixes for detected issues
    console.log(`🔧 Generating auto-fixes for scan ${scanId}...`);
    try {
      const autoFixResult = await generateAutoFixesForScan(scanId);
      console.log(`✅ Generated ${autoFixResult.fixedCount} auto-fixes`);
    } catch (autoFixError) {
      console.error('⚠️  Auto-fix generation failed:', autoFixError.message);
      // Don't fail the scan if auto-fix generation fails
    }

    // Send email notification
    try {
      // Get user email
      const userResult = await pool.query(
        `SELECT u.email, u.name 
         FROM users u 
         WHERE u.id = $1`,
        [userId]
      );

      if (userResult.rows.length > 0 && userResult.rows[0].email) {
        const userEmail = userResult.rows[0].email;
        const userName = userResult.rows[0].name || 'there';

        // Get top issues for email
        const topIssuesResult = await pool.query(
          `SELECT title, description, severity 
           FROM seo_issues 
           WHERE scan_id = $1 
           ORDER BY 
             CASE severity 
               WHEN 'critical' THEN 1 
               WHEN 'warning' THEN 2 
               ELSE 3 
             END,
             id 
           LIMIT 5`,
          [scanId]
        );

        // Send email
        await sendScanEmail({
          scanId,
          domain,
          seoScore: avgScore,
          criticalIssues: totalCritical,
          warnings: totalWarnings,
          passedChecks: totalPassed,
          pagesScanned: scannedCount,
          pagesSkipped: skippedPages.length,
          scanDuration: scanDuration,
          topIssues: topIssuesResult.rows
        }, userEmail, userName);

        // Log email in database
        await pool.query(
          `INSERT INTO email_reports (user_id, domain, report_type, email_to, subject, fixes_count, issues_found, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [userId, domain, 'manual_scan', userEmail, `SEO Scan Complete: ${avgScore}/100`, 0, totalIssues, 'sent']
        );

        console.log(`📧 Email notification sent to ${userEmail}`);
      }
    } catch (emailError) {
      console.error('❌ Error sending email notification:', emailError.message);
      // Don't fail the scan if email fails
    }

  } catch (error) {
    console.error('Scan execution error:', error);
    
    // Update scan as failed
    await pool.query(
      `UPDATE seo_scans SET status = 'failed' WHERE id = $1`,
      [scanId]
    );
    
    // Mark progress as failed
    progressTracker.failScan(scanId, error.message);
  }
}

/**
 * GET /api/seo/subscription-usage/:userId
 * Get user's subscription usage (pages scanned this month)
 */
router.get('/subscription-usage/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get subscription limit
    const pageLimit = await getUserPageLimit(userId);
    
    // Count pages scanned this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const usageResult = await pool.query(
      `SELECT COUNT(*) as pages_scanned 
       FROM seo_monitoring 
       WHERE user_id = $1 
       AND measured_at >= $2`,
      [userId, startOfMonth]
    );
    
    const pagesScanned = parseInt(usageResult.rows[0].pages_scanned) || 0;
    const pagesRemaining = Math.max(0, pageLimit - pagesScanned);
    
    res.json({
      success: true,
      pageLimit,
      pagesScanned,
      pagesRemaining,
      percentUsed: Math.round((pagesScanned / pageLimit) * 100)
    });
    
  } catch (error) {
    console.error('Error getting subscription usage:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/seo/scan-progress/:scanId
 * Server-Sent Events endpoint for real-time scan progress
 */
router.get('/scan-progress/:scanId', (req, res) => {
  const { scanId } = req.params;
  
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
  
  // Send initial connection message
  res.write(': connected\n\n');
  
  // Register client for progress updates
  progressTracker.registerClient(parseInt(scanId), res);
  
  // Send heartbeat every 15 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);
  
  // Handle client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    console.log(`Client disconnected from scan ${scanId} progress`);
  });
});

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
      // Get page_url from the issue
      const issueResult = await pool.query(
        `SELECT page_url FROM seo_issues WHERE id = $1`,
        [fix.issueId]
      );
      const pageUrl = issueResult.rows[0]?.page_url || scan.url;
      
      await pool.query(
        `INSERT INTO seo_fixes 
         (issue_id, scan_id, user_id, fix_type, original_content, optimized_content, 
          ai_model, confidence_score, keywords_used, page_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [fix.issueId, scanId, scan.user_id, fix.fixType, fix.originalContent, 
         fix.optimizedContent, fix.aiModel, fix.confidenceScore, fix.keywords, pageUrl]
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

    // Get fix details (fixId is integer, not UUID)
    const fixResult = await pool.query(
      `SELECT f.*, s.domain FROM seo_fixes f
       JOIN seo_scans s ON f.scan_id = s.id
       WHERE f.id = $1`,
      [parseInt(fixId)]
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
          parseInt(fixId),
          fix.fix_type,
          JSON.stringify({
            optimized_content: fix.optimized_content,
            original_content: fix.original_content
          })
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
        [method, parseInt(fixId)]
      );

      await pool.query(
        `UPDATE seo_issues 
         SET fix_status = 'fixed', 
             fixed_at = NOW()
         WHERE id = (SELECT issue_id FROM seo_fixes WHERE id = $1)`,
        [parseInt(fixId)]
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
    let { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId is required' 
      });
    }

    // Validate and fix userId - use default if not valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      userId = '00000000-0000-0000-0000-000000000000';
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

    // Get pages_scanned and pages_skipped from most recent scan
    const latestScanStats = await pool.query(
      `SELECT pages_scanned, pages_skipped
       FROM seo_scans 
       WHERE user_id = $1 
       AND pages_scanned IS NOT NULL
       ORDER BY scanned_at DESC 
       LIMIT 1`,
      [userId]
    );

    const stats = statsResult.rows[0] || {
      total_domains: 0,
      total_pages_scanned: 0,
      total_critical_issues: 0,
      total_warnings: 0,
      avg_seo_score: 0
    };

    // Add latest scan stats
    if (latestScanStats.rows.length > 0) {
      stats.pages_scanned = latestScanStats.rows[0].pages_scanned || 0;
      stats.pages_skipped = latestScanStats.rows[0].pages_skipped || 0;
    }

    res.json({
      success: true,
      stats,
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
 * POST /api/seo/auto-fix
 * Auto-fix issues by category from dashboard
 */
router.post('/auto-fix', async (req, res) => {
  try {
    const { userId, category, severity } = req.body;

    if (!userId || !category) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId and category are required' 
      });
    }

    // Get the most recent scan for this user with issues in this category
    const scanResult = await pool.query(
      `SELECT DISTINCT s.* 
       FROM seo_scans s
       JOIN seo_issues i ON i.scan_id = s.id
       WHERE s.user_id = $1 
       AND i.category = $2
       AND i.fix_status = 'pending'
       ORDER BY s.scanned_at DESC
       LIMIT 1`,
      [userId, category]
    );

    if (scanResult.rows.length === 0) {
      return res.json({
        success: false,
        error: 'No pending issues found in this category'
      });
    }

    const scan = scanResult.rows[0];

    // Get all pending issues in this category
    const issuesResult = await pool.query(
      `SELECT * FROM seo_issues 
       WHERE scan_id = $1 
       AND category = $2
       AND fix_status = 'pending'
       ${severity ? 'AND severity = $3' : ''}
       ORDER BY severity DESC`,
      severity ? [scan.id, category, severity] : [scan.id, category]
    );

    const issues = issuesResult.rows;

    if (issues.length === 0) {
      return res.json({
        success: false,
        error: 'No pending issues found'
      });
    }

    // Generate fixes using AI
    console.log(`Generating AI fixes for ${issues.length} ${category} issues...`);
    console.log('Issues to fix:', issues.map(i => ({ id: i.id, category: i.category, title: i.title })));
    
    const fixes = await seoAIFixer.generateFixes(scan.url, issues);
    
    console.log(`Generated ${fixes.length} fixes`);
    
    if (fixes.length === 0) {
      console.error('No fixes generated. Check OpenAI API key and quota.');
      return res.json({
        success: false,
        error: 'Failed to generate fixes. Please check server logs or try again later.'
      });
    }

    // Store fixes in database and mark issues as fixed
    let appliedCount = 0;
    for (const fix of fixes) {
      // Store the fix
      const fixResult = await pool.query(
        `INSERT INTO seo_fixes 
         (scan_id, issue_id, user_id, fix_type, original_content, optimized_content, 
          ai_model, confidence_score, keywords, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'generated')
         RETURNING id`,
        [
          scan.id,
          fix.issueId,
          userId,
          fix.fixType,
          fix.originalContent,
          fix.optimizedContent,
          fix.aiModel,
          fix.confidenceScore,
          fix.keywords
        ]
      );

      // Update issue status
      await pool.query(
        `UPDATE seo_issues 
         SET fix_status = 'fixed', 
             fixed_at = NOW(),
             fix_id = $1
         WHERE id = $2`,
        [fixResult.rows[0].id, fix.issueId]
      );

      appliedCount++;
    }

    res.json({
      success: true,
      message: `Successfully generated fixes for ${appliedCount} issues`,
      fixedCount: appliedCount,
      category: category,
      scanId: scan.id
    });

  } catch (error) {
    console.error('Auto-fix error:', error);
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

// Mount GSC routes
const gscRoutes = require('./gsc-api-endpoints');
router.use('/gsc', gscRoutes);

// Mount quick audit routes
router.use('/', quickAuditRoutes);

// Mount comprehensive audit routes
router.use('/', comprehensiveAuditRoutes);

// Mount scan history routes
router.use('/', scanHistoryRoutes);

// Mount widget fixes routes
const widgetFixesRoutes = require('./widget-fixes-api');
router.use('/widget', widgetFixesRoutes);

// Mount auto-fix widget API
const autoFixWidgetAPI = require('./auto-fix-widget-api');
router.use('/widget', autoFixWidgetAPI);

// Mount apply fixes API
const applyFixesAPI = require('./apply-fixes-api');
router.use('/', applyFixesAPI);

// Mount widget validation API
const validateWidgetAPI = require('./validate-widget-api');
router.use('/', validateWidgetAPI);

// Mount auto-fix verification API
const verifyAutofixAPI = require('./verify-autofix-api');
router.use('/', verifyAutofixAPI);

// Mount widget validation status API
const widgetValidationStatusAPI = require('./widget-validation-status-api');
router.use('/', widgetValidationStatusAPI);

// Website management routes
const websitesRoutes = require('./websites-api');
router.use('/websites', websitesRoutes);

module.exports = router;
