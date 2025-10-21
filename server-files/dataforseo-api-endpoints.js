// dataforseo-api-endpoints.js
// Add these endpoints to your relay-api server.js

import {
  getDomainOverview,
  getRankedKeywords,
  getCompetitors,
  getKeywordSuggestions,
  getBacklinkSummary,
  getFullDomainAnalytics,
} from './dataforseo-service.js';

// ============================================
// API ENDPOINTS
// ============================================

export function setupDataForSEORoutes(app) {
  
  // Domain Overview
  app.post('/api/seo/domain-overview', async (req, res) => {
    try {
      const { domain, location } = req.body;
      
      if (!domain) {
        return res.status(400).json({ success: false, error: 'Domain is required' });
      }
      
      const result = await getDomainOverview(domain, location);
      res.json(result);
    } catch (error) {
      console.error('Domain Overview API Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Ranked Keywords
  app.post('/api/seo/ranked-keywords', async (req, res) => {
    try {
      const { domain, limit, location } = req.body;
      
      if (!domain) {
        return res.status(400).json({ success: false, error: 'Domain is required' });
      }
      
      const result = await getRankedKeywords(domain, limit || 50, location);
      res.json(result);
    } catch (error) {
      console.error('Ranked Keywords API Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Competitors
  app.post('/api/seo/competitors', async (req, res) => {
    try {
      const { domain, limit, location } = req.body;
      
      if (!domain) {
        return res.status(400).json({ success: false, error: 'Domain is required' });
      }
      
      const result = await getCompetitors(domain, limit || 10, location);
      res.json(result);
    } catch (error) {
      console.error('Competitors API Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Keyword Suggestions
  app.post('/api/seo/keyword-suggestions', async (req, res) => {
    try {
      const { keyword, limit, location } = req.body;
      
      if (!keyword) {
        return res.status(400).json({ success: false, error: 'Keyword is required' });
      }
      
      const result = await getKeywordSuggestions(keyword, limit || 20, location);
      res.json(result);
    } catch (error) {
      console.error('Keyword Suggestions API Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Backlink Summary
  app.post('/api/seo/backlinks', async (req, res) => {
    try {
      const { domain } = req.body;
      
      if (!domain) {
        return res.status(400).json({ success: false, error: 'Domain is required' });
      }
      
      const result = await getBacklinkSummary(domain);
      res.json(result);
    } catch (error) {
      console.error('Backlinks API Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Full Domain Analytics (Combined)
  app.post('/api/seo/domain-analytics', async (req, res) => {
    try {
      const { domain, location } = req.body;
      
      if (!domain) {
        return res.status(400).json({ success: false, error: 'Domain is required' });
      }
      
      const result = await getFullDomainAnalytics(domain, location);
      res.json(result);
    } catch (error) {
      console.error('Domain Analytics API Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  console.log('✅ DataForSEO API routes registered');
}

// ============================================
// USAGE IN server.js
// ============================================

/*
// Add to your relay-api/server.js:

import { setupDataForSEORoutes } from './dataforseo-api-endpoints.js';

// After other middleware
setupDataForSEORoutes(app);

// Start server
app.listen(PORT, () => {
  console.log(`Relay API running on port ${PORT}`);
});
*/
