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

import {
  saveAnalyticsResult,
  getUserAnalyticsHistory,
  getDomainHistory,
  getAnalysisById,
  deleteAnalysis,
  getUserAnalyticsStats,
  getLatestAnalysis
} from './domain-analytics-db.js';

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

  // Full Domain Analytics (Combined) - Now saves to database
  app.post('/api/seo/domain-analytics', async (req, res) => {
    try {
      const { domain, location, userId, saveResult = true } = req.body;
      
      if (!domain) {
        return res.status(400).json({ success: false, error: 'Domain is required' });
      }
      
      // Fetch analytics from DataForSEO
      const result = await getFullDomainAnalytics(domain, location);
      
      // Save to database if requested and userId provided
      if (saveResult && userId && result.success) {
        const saveResponse = await saveAnalyticsResult(userId, domain, result);
        result.savedAnalysisId = saveResponse.id;
        result.saved = saveResponse.success;
      }
      
      res.json(result);
    } catch (error) {
      console.error('Domain Analytics API Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get user's analytics history
  app.get('/api/seo/analytics-history', async (req, res) => {
    try {
      const { userId, limit, offset } = req.query;
      
      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
      }
      
      const result = await getUserAnalyticsHistory(userId, parseInt(limit) || 50, parseInt(offset) || 0);
      res.json(result);
    } catch (error) {
      console.error('Analytics History API Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get domain-specific history
  app.get('/api/seo/domain-history/:domain', async (req, res) => {
    try {
      const { domain } = req.params;
      const { userId, limit } = req.query;
      
      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
      }
      
      const result = await getDomainHistory(userId, domain, parseInt(limit) || 10);
      res.json(result);
    } catch (error) {
      console.error('Domain History API Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get single analysis by ID
  app.get('/api/seo/analysis/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
      }
      
      const result = await getAnalysisById(userId, id);
      res.json(result);
    } catch (error) {
      console.error('Get Analysis API Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Delete analysis
  app.delete('/api/seo/analysis/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
      }
      
      const result = await deleteAnalysis(userId, id);
      res.json(result);
    } catch (error) {
      console.error('Delete Analysis API Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get user analytics stats
  app.get('/api/seo/analytics-stats', async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
      }
      
      const result = await getUserAnalyticsStats(userId);
      res.json(result);
    } catch (error) {
      console.error('Analytics Stats API Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get latest analysis for a domain
  app.get('/api/seo/latest-analysis/:domain', async (req, res) => {
    try {
      const { domain } = req.params;
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
      }
      
      const result = await getLatestAnalysis(userId, domain);
      res.json(result);
    } catch (error) {
      console.error('Latest Analysis API Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  console.log('✅ DataForSEO API routes registered');
  console.log('✅ Analytics history routes registered');
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
