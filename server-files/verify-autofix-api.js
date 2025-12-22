// Auto-Fix Verification API
// Automatically verifies that fixes are applied after auto-fix
const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/**
 * POST /api/seo/verify-autofix
 * Verify that auto-fixes are actually applied on the website
 */
router.post('/verify-autofix', async (req, res) => {
  let browser;
  
  try {
    const { scanId, url, domain } = req.body;

    if (!scanId || !url || !domain) {
      return res.status(400).json({
        success: false,
        error: 'scanId, url, and domain are required'
      });
    }

    console.log(`🔍 Verifying auto-fix for scan ${scanId} on ${url}`);

    // STEP 1: Fetch widget script
    const widgetResponse = await axios.get(
      `http://localhost:3001/api/seo/widget/auto-fixes?domain=${domain}`
    );
    
    const widgetScript = widgetResponse.data;

    // STEP 2: Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Capture console logs
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // STEP 3: Capture BEFORE state
    const before = await page.evaluate(() => {
      return {
        title: document.title || '',
        titleLength: (document.title || '').length,
        metaDescription: document.querySelector('meta[name="description"]')?.content || '',
        metaDescLength: (document.querySelector('meta[name="description"]')?.content || '').length,
        h1Count: document.querySelectorAll('h1').length,
        canonical: document.querySelector('link[rel="canonical"]')?.href || 'None',
        ogTitle: document.querySelector('meta[property="og:title"]')?.content || 'None',
        schemaCount: document.querySelectorAll('script[type="application/ld+json"]').length
      };
    });

    // STEP 4: Inject and execute widget script
    const executionResult = await page.evaluate((script) => {
      try {
        eval(script);
        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }, widgetScript);

    if (!executionResult.success) {
      await browser.close();
      return res.json({
        success: false,
        error: `Widget execution failed: ${executionResult.error}`,
        verified: false
      });
    }

    // Wait for DOM modifications
    await new Promise(resolve => setTimeout(resolve, 1000));

    // STEP 5: Capture AFTER state
    const after = await page.evaluate(() => {
      return {
        title: document.title || '',
        titleLength: (document.title || '').length,
        metaDescription: document.querySelector('meta[name="description"]')?.content || '',
        metaDescLength: (document.querySelector('meta[name="description"]')?.content || '').length,
        h1Count: document.querySelectorAll('h1').length,
        canonical: document.querySelector('link[rel="canonical"]')?.href || 'None',
        ogTitle: document.querySelector('meta[property="og:title"]')?.content || 'None',
        schemaCount: document.querySelectorAll('script[type="application/ld+json"]').length
      };
    });

    // STEP 6: Compare and detect changes
    const changes = [];
    let changeCount = 0;

    if (before.title !== after.title) {
      changes.push({
        field: 'title',
        before: before.title,
        after: after.title,
        beforeLength: before.titleLength,
        afterLength: after.titleLength
      });
      changeCount++;
    }

    if (before.metaDescription !== after.metaDescription) {
      changes.push({
        field: 'metaDescription',
        before: before.metaDescription.substring(0, 100),
        after: after.metaDescription.substring(0, 100),
        beforeLength: before.metaDescLength,
        afterLength: after.metaDescLength
      });
      changeCount++;
    }

    if (before.h1Count !== after.h1Count) {
      changes.push({
        field: 'h1Count',
        before: before.h1Count,
        after: after.h1Count
      });
      changeCount++;
    }

    if (before.canonical !== after.canonical) {
      changes.push({
        field: 'canonical',
        before: before.canonical,
        after: after.canonical
      });
      changeCount++;
    }

    if (before.ogTitle !== after.ogTitle) {
      changes.push({
        field: 'openGraph',
        before: before.ogTitle,
        after: after.ogTitle
      });
      changeCount++;
    }

    if (before.schemaCount !== after.schemaCount) {
      changes.push({
        field: 'schema',
        before: before.schemaCount,
        after: after.schemaCount
      });
      changeCount++;
    }

    // Extract widget logs
    const widgetLogs = logs.filter(log => 
      log.includes('OrganiTrafficBoost') || 
      log.includes('SEO Fix') ||
      log.includes('SEO fixes')
    );

    // STEP 7: Store verification result in database
    await pool.query(
      `INSERT INTO autofix_verifications 
       (scan_id, url, verified_at, changes_detected, change_count, before_state, after_state, widget_logs, verification_status)
       VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8)`,
      [
        scanId,
        url,
        JSON.stringify(changes),
        changeCount,
        JSON.stringify(before),
        JSON.stringify(after),
        JSON.stringify(widgetLogs),
        changeCount > 0 ? 'success' : 'no_changes'
      ]
    );

    await browser.close();

    // Return verification result
    res.json({
      success: true,
      verified: true,
      changeCount: changeCount,
      changes: changes,
      before: before,
      after: after,
      widgetLogs: widgetLogs,
      message: changeCount > 0 
        ? `✅ Auto-fix verified! ${changeCount} changes detected.`
        : '⚠️ Auto-fix executed but no changes detected.'
    });

  } catch (error) {
    console.error('❌ Verification error:', error);
    if (browser) await browser.close();
    
    res.status(500).json({
      success: false,
      verified: false,
      error: error.message
    });
  }
});

module.exports = router;
