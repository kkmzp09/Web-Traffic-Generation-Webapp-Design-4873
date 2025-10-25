// server-files/gsc-api-endpoints.js
// Google Search Console API Endpoints

const express = require('express');
const router = express.Router();
const gscService = require('./gsc-service');

// CORS middleware for all GSC routes
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

/**
 * GET /api/gsc/auth-url
 * Generate OAuth authorization URL
 */
router.get('/auth-url', async (req, res) => {
  try {
    const userId = req.query.userId || '00000000-0000-0000-0000-000000000000';
    const origin = req.get('origin') || req.get('referer');
    const authUrl = gscService.getAuthUrl(userId, origin);

    res.json({
      success: true,
      authUrl: authUrl
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate authorization URL'
    });
  }
});

/**
 * GET /api/gsc/callback
 * OAuth callback handler
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state; // userId passed as state
    
    // Detect which environment based on the callback URL
    const referer = req.get('referer') || '';
    const isDev = referer.includes('dev--trafficgen.netlify.app');
    const frontendUrl = isDev ? 'https://dev--trafficgen.netlify.app' : 'https://organitrafficboost.com';
    const origin = isDev ? 'https://dev--trafficgen.netlify.app' : 'https://api.organitrafficboost.com';

    if (!code) {
      return res.redirect(`${frontendUrl}/dashboard?gsc_error=no_code`);
    }

    // Exchange code for tokens with correct redirect URI
    const tokens = await gscService.getTokensFromCode(code, origin);

    // Get list of sites
    const oauth2Client = gscService.getOAuthClient(origin);
    oauth2Client.setCredentials(tokens);
    
    const { google } = require('googleapis');
    const webmasters = google.webmasters({ version: 'v3', auth: oauth2Client });
    const sitesResponse = await webmasters.sites.list();
    
    const sites = sitesResponse.data.siteEntry || [];

    // Save connection for each site
    for (const site of sites) {
      await gscService.saveConnection(userId, site.siteUrl, tokens);
    }

    // Redirect back to frontend dashboard
    res.redirect(`${frontendUrl}/dashboard?gsc_connected=true`);
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    const referer = req.get('referer') || '';
    const isDev = referer.includes('dev--trafficgen.netlify.app');
    const frontendUrl = isDev ? 'https://dev--trafficgen.netlify.app' : 'https://organitrafficboost.com';
    res.redirect(`${frontendUrl}/dashboard?gsc_error=auth_failed`);
  }
});

/**
 * GET /api/gsc/connections
 * Get user's GSC connections
 */
router.get('/connections', async (req, res) => {
  try {
    const userId = req.query.userId || '00000000-0000-0000-0000-000000000000';
    const connections = await gscService.getUserConnections(userId);

    res.json({
      success: true,
      connections: connections
    });
  } catch (error) {
    console.error('Error getting connections:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get connections'
    });
  }
});

/**
 * GET /api/gsc/sites/:connectionId
 * List sites for a connection
 */
router.get('/sites/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const sites = await gscService.listSites(connectionId);

    res.json({
      success: true,
      sites: sites
    });
  } catch (error) {
    console.error('Error listing sites:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list sites'
    });
  }
});

/**
 * GET /api/gsc/keywords/:connectionId
 * Get top keywords for a site
 */
router.get('/keywords/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { siteUrl, days = 30 } = req.query;

    if (!siteUrl) {
      return res.status(400).json({
        success: false,
        error: 'siteUrl is required'
      });
    }

    const keywords = await gscService.getSiteTopKeywords(
      connectionId,
      siteUrl,
      parseInt(days)
    );

    res.json({
      success: true,
      keywords: keywords,
      count: keywords.length
    });
  } catch (error) {
    console.error('Error getting keywords:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get keywords'
    });
  }
});

/**
 * GET /api/gsc/page-keywords/:connectionId
 * Get top keywords for a specific page
 */
router.get('/page-keywords/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { siteUrl, pageUrl, days = 30 } = req.query;

    if (!siteUrl || !pageUrl) {
      return res.status(400).json({
        success: false,
        error: 'siteUrl and pageUrl are required'
      });
    }

    // Try to get cached keywords first
    let keywords = await gscService.getCachedKeywords(connectionId, pageUrl);

    // If no cache or cache is old, fetch fresh data
    if (keywords.length === 0) {
      keywords = await gscService.getTopKeywordsForPage(
        connectionId,
        siteUrl,
        pageUrl,
        parseInt(days)
      );
    }

    res.json({
      success: true,
      keywords: keywords,
      count: keywords.length
    });
  } catch (error) {
    console.error('Error getting page keywords:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get page keywords'
    });
  }
});

/**
 * POST /api/gsc/refresh-keywords
 * Force refresh keywords for a page
 */
router.post('/refresh-keywords', async (req, res) => {
  try {
    const { connectionId, siteUrl, pageUrl, days = 30 } = req.body;

    if (!connectionId || !siteUrl || !pageUrl) {
      return res.status(400).json({
        success: false,
        error: 'connectionId, siteUrl, and pageUrl are required'
      });
    }

    const keywords = await gscService.getTopKeywordsForPage(
      connectionId,
      siteUrl,
      pageUrl,
      parseInt(days)
    );

    res.json({
      success: true,
      keywords: keywords,
      count: keywords.length
    });
  } catch (error) {
    console.error('Error refreshing keywords:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh keywords'
    });
  }
});

/**
 * DELETE /api/gsc/disconnect/:connectionId
 * Disconnect a GSC connection
 */
router.delete('/disconnect/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.query.userId || '00000000-0000-0000-0000-000000000000';

    await gscService.disconnectConnection(connectionId, userId);

    res.json({
      success: true,
      message: 'Connection disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect'
    });
  }
});

/**
 * POST /api/gsc/disconnect/:connectionId
 * Disconnect a GSC connection (POST alternative for CORS compatibility)
 */
router.post('/disconnect/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.query.userId || '00000000-0000-0000-0000-000000000000';

    await gscService.disconnectConnection(connectionId, userId);

    res.json({
      success: true,
      message: 'Connection disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect'
    });
  }
});

/**
 * GET /api/gsc/analytics/:connectionId
 * Get search analytics data
 */
router.get('/analytics/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { siteUrl, startDate, endDate, dimensions = 'query' } = req.query;

    if (!siteUrl || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'siteUrl, startDate, and endDate are required'
      });
    }

    const dimensionsArray = dimensions.split(',');
    const data = await gscService.getSearchAnalytics(
      connectionId,
      siteUrl,
      startDate,
      endDate,
      dimensionsArray
    );

    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics data'
    });
  }
});

/**
 * GET /api/gsc/keyword-history
 * Get historical keyword data for tracking trends
 */
router.get('/keyword-history', async (req, res) => {
  try {
    const { userId, keyword, siteUrl, days = 30 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const db = require('./db');
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let query = `
      SELECT date, keyword, clicks, impressions, ctr, position, site_url, page_url
      FROM gsc_keyword_history
      WHERE user_id = $1 AND date >= $2 AND date <= $3
    `;
    const params = [userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]];

    if (keyword) {
      query += ` AND keyword = $${params.length + 1}`;
      params.push(keyword);
    }

    if (siteUrl) {
      query += ` AND site_url = $${params.length + 1}`;
      params.push(siteUrl);
    }

    query += ` ORDER BY date DESC, clicks DESC`;

    const result = await db.query(query, params);

    res.json({
      success: true,
      history: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error getting keyword history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get keyword history'
    });
  }
});

module.exports = router;
