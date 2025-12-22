// Widget Validation API - Verify widget is installed before applying fixes
const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/**
 * POST /api/seo/validate-widget-strict
 * Strictly validate that widget is installed on the target website
 */
router.post('/validate-widget-strict', async (req, res) => {
  try {
    const { url, domain, userId } = req.body;

    if (!url && !domain) {
      return res.status(400).json({
        success: false,
        error: 'URL or domain required'
      });
    }

    const targetUrl = url || `https://${domain}`;
    
    console.log(`🔍 Validating widget installation on: ${targetUrl}`);

    // Fetch the webpage
    const response = await axios.get(targetUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OrganiTrafficBot/1.0)'
      },
      validateStatus: (status) => status < 500 // Accept 4xx responses
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Check for widget script tags
    const widgetPatterns = [
      'organitrafficboost.com/api/seo/widget',
      'api.organitrafficboost.com/api/seo/widget',
      'organitraffic-widget',
      'seo-auto-fix-widget'
    ];

    let widgetFound = false;
    let widgetType = null;
    let widgetUrl = null;

    // Check all script tags
    $('script').each((i, elem) => {
      const src = $(elem).attr('src');
      const content = $(elem).html();

      // Check src attribute
      if (src) {
        for (const pattern of widgetPatterns) {
          if (src.includes(pattern)) {
            widgetFound = true;
            widgetType = 'script-src';
            widgetUrl = src;
            return false; // break
          }
        }
      }

      // Check inline script content
      if (content) {
        for (const pattern of widgetPatterns) {
          if (content.includes(pattern)) {
            widgetFound = true;
            widgetType = 'inline-script';
            widgetUrl = 'inline';
            return false; // break
          }
        }
      }
    });

    if (widgetFound) {
      console.log(`✅ Widget found: ${widgetType} - ${widgetUrl}`);
      
      // Save validation status to database
      if (userId && domain) {
        try {
          const existing = await pool.query(
            'SELECT id FROM widget_validations WHERE domain = $1 AND user_id = $2',
            [domain, userId]
          );

          if (existing.rows.length > 0) {
            await pool.query(
              `UPDATE widget_validations 
               SET validated = true, script_tag = $1, validated_at = NOW()
               WHERE domain = $2 AND user_id = $3`,
              [widgetUrl, domain, userId]
            );
          } else {
            await pool.query(
              `INSERT INTO widget_validations (domain, user_id, validated, script_tag, validated_at)
               VALUES ($1, $2, true, $3, NOW())`,
              [domain, userId, widgetUrl]
            );
          }
        } catch (dbError) {
          console.error('Error saving validation:', dbError);
        }
      }
      
      return res.json({
        success: true,
        widgetInstalled: true,
        widgetType: widgetType,
        widgetUrl: widgetUrl,
        message: 'Widget is properly installed',
        verifiedAt: new Date().toISOString()
      });
    } else {
      console.log(`❌ Widget NOT found on ${targetUrl}`);
      
      return res.json({
        success: true,
        widgetInstalled: false,
        message: 'Widget not found on the website',
        checkedUrl: targetUrl,
        instructions: 'Please install the widget script before applying fixes'
      });
    }

  } catch (error) {
    console.error('Widget validation error:', error.message);
    
    return res.status(500).json({
      success: false,
      widgetInstalled: false,
      error: error.message,
      message: 'Could not validate widget installation'
    });
  }
});

/**
 * POST /api/seo/validate-widget-connection
 * Test if widget can connect to API and fetch fixes
 */
router.post('/validate-widget-connection', async (req, res) => {
  try {
    const { domain, scanId } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain required'
      });
    }

    console.log(`🔗 Testing widget connection for: ${domain}`);

    // Test the widget API endpoint
    const widgetApiUrl = `http://localhost:3001/api/seo/widget/auto-fixes?domain=${domain}`;
    
    const response = await axios.get(widgetApiUrl, {
      timeout: 5000
    });

    if (response.data.success) {
      const hasScript = response.data.script && response.data.script.length > 0;
      const fixCount = response.data.fixCount || 0;

      console.log(`✅ Widget API responding: ${fixCount} fixes available`);

      return res.json({
        success: true,
        apiWorking: true,
        fixesAvailable: fixCount,
        hasScript: hasScript,
        domain: response.data.domain,
        scanId: response.data.scanId,
        message: 'Widget API is working correctly'
      });
    } else {
      return res.json({
        success: false,
        apiWorking: false,
        message: 'Widget API returned error',
        details: response.data
      });
    }

  } catch (error) {
    console.error('Widget connection test error:', error.message);
    
    return res.status(500).json({
      success: false,
      apiWorking: false,
      error: error.message,
      message: 'Widget API connection failed'
    });
  }
});

module.exports = router;
