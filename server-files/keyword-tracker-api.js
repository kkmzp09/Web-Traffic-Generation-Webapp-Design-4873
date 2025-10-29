// keyword-tracker-api.js
// API endpoints for Keyword Tracker with DataForSEO integration

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const dataforSEOKeywords = require('./dataforseo-keywords-service');

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
// GET /api/seo/tracked-keywords
// Get all tracked keywords for a user
// ============================================
router.get('/tracked-keywords', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.json({ success: false, error: 'User ID required' });
    }

    const result = await pool.query(
      `SELECT 
        id, keyword, domain, location_code, location_name, language_code,
        current_rank, previous_rank, search_volume, competition, cpc,
        best_rank, worst_rank, status, last_checked, created_at
       FROM tracked_keywords
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      keywords: result.rows
    });

  } catch (error) {
    console.error('Get Tracked Keywords Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// POST /api/seo/track-keyword
// Add a new keyword to track
// ============================================
router.post('/track-keyword', async (req, res) => {
  try {
    const { userId, keyword, domain, location, locationCode, languageCode } = req.body;

    if (!userId || !keyword || !domain) {
      return res.json({ success: false, error: 'Missing required fields' });
    }

    console.log(`📍 Adding keyword to track: "${keyword}" for ${domain}`);

    // Default location codes (DataForSEO format)
    const locCode = locationCode || 2840; // US default
    const langCode = languageCode || 'en';
    const locName = location || 'United States';

    // Step 1: Get keyword metrics (search volume, CPC, competition)
    const metricsResult = await dataforSEOKeywords.getKeywordMetrics(
      [keyword],
      locCode,
      langCode
    );

    let searchVolume = null;
    let competition = null;
    let cpc = null;

    if (metricsResult.success && metricsResult.keywords.length > 0) {
      const keywordData = metricsResult.keywords[0];
      searchVolume = keywordData.search_volume;
      competition = keywordData.competition;
      cpc = keywordData.cpc;
    }

    // Step 2: Get current ranking
    const rankingResult = await dataforSEOKeywords.getKeywordRanking(
      keyword,
      domain,
      locCode,
      langCode
    );

    const currentRank = rankingResult.success ? rankingResult.rankPosition : null;

    // Step 3: Save to database
    const insertResult = await pool.query(
      `INSERT INTO tracked_keywords 
       (user_id, keyword, domain, location_code, location_name, language_code,
        current_rank, search_volume, competition, cpc, best_rank, worst_rank,
        last_checked, next_check, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW() + INTERVAL '1 day', 'active')
       ON CONFLICT (user_id, keyword, domain) 
       DO UPDATE SET
         current_rank = EXCLUDED.current_rank,
         search_volume = EXCLUDED.search_volume,
         competition = EXCLUDED.competition,
         cpc = EXCLUDED.cpc,
         last_checked = NOW(),
         updated_at = NOW()
       RETURNING id`,
      [userId, keyword, domain, locCode, locName, langCode, currentRank, searchVolume, competition, cpc, currentRank, currentRank]
    );

    const keywordId = insertResult.rows[0].id;

    // Step 4: Save initial ranking history
    if (currentRank) {
      await pool.query(
        `INSERT INTO keyword_ranking_history 
         (keyword_id, rank_position, search_volume, cpc, competition, checked_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [keywordId, currentRank, searchVolume, cpc, competition]
      );
    }

    res.json({
      success: true,
      keywordId: keywordId,
      currentRank: currentRank,
      searchVolume: searchVolume,
      message: 'Keyword added successfully'
    });

  } catch (error) {
    console.error('Track Keyword Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// POST /api/seo/refresh-keyword/:keywordId
// Refresh ranking for a specific keyword
// ============================================
router.post('/refresh-keyword/:keywordId', async (req, res) => {
  try {
    const { keywordId } = req.params;

    // Get keyword details
    const keywordResult = await pool.query(
      `SELECT keyword, domain, location_code, language_code, current_rank, best_rank, worst_rank
       FROM tracked_keywords
       WHERE id = $1`,
      [keywordId]
    );

    if (keywordResult.rows.length === 0) {
      return res.json({ success: false, error: 'Keyword not found' });
    }

    const kw = keywordResult.rows[0];

    console.log(`🔄 Refreshing ranking for: "${kw.keyword}" on ${kw.domain}`);

    // Get current ranking
    const rankingResult = await dataforSEOKeywords.getKeywordRanking(
      kw.keyword,
      kw.domain,
      kw.location_code,
      kw.language_code
    );

    if (!rankingResult.success) {
      return res.json({ success: false, error: rankingResult.error });
    }

    const newRank = rankingResult.rankPosition;
    const previousRank = kw.current_rank;

    // Calculate best/worst ranks
    const bestRank = newRank && kw.best_rank ? Math.min(newRank, kw.best_rank) : (newRank || kw.best_rank);
    const worstRank = newRank && kw.worst_rank ? Math.max(newRank, kw.worst_rank) : (newRank || kw.worst_rank);

    // Update database
    await pool.query(
      `UPDATE tracked_keywords
       SET current_rank = $1,
           previous_rank = $2,
           best_rank = $3,
           worst_rank = $4,
           last_checked = NOW(),
           next_check = NOW() + INTERVAL '1 day',
           updated_at = NOW()
       WHERE id = $5`,
      [newRank, previousRank, bestRank, worstRank, keywordId]
    );

    // Save to history
    if (newRank) {
      await pool.query(
        `INSERT INTO keyword_ranking_history 
         (keyword_id, rank_position, url, checked_at)
         VALUES ($1, $2, $3, NOW())`,
        [keywordId, newRank, rankingResult.rankedUrl]
      );
    }

    res.json({
      success: true,
      currentRank: newRank,
      previousRank: previousRank,
      change: previousRank && newRank ? (previousRank - newRank) : null
    });

  } catch (error) {
    console.error('Refresh Keyword Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// DELETE /api/seo/tracked-keyword/:keywordId
// Stop tracking a keyword
// ============================================
router.delete('/tracked-keyword/:keywordId', async (req, res) => {
  try {
    const { keywordId } = req.params;

    await pool.query(
      `DELETE FROM tracked_keywords WHERE id = $1`,
      [keywordId]
    );

    res.json({
      success: true,
      message: 'Keyword removed from tracking'
    });

  } catch (error) {
    console.error('Delete Keyword Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GET /api/seo/keyword-history/:keywordId
// Get ranking history for a keyword
// ============================================
router.get('/keyword-history/:keywordId', async (req, res) => {
  try {
    const { keywordId } = req.params;
    const { limit = 30 } = req.query;

    const result = await pool.query(
      `SELECT rank_position, search_volume, cpc, competition, url, checked_at
       FROM keyword_ranking_history
       WHERE keyword_id = $1
       ORDER BY checked_at DESC
       LIMIT $2`,
      [keywordId, limit]
    );

    res.json({
      success: true,
      history: result.rows
    });

  } catch (error) {
    console.error('Get Keyword History Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GET /api/seo/locations
// Get available locations for tracking
// ============================================
router.get('/locations', async (req, res) => {
  try {
    const { search = '' } = req.query;

    const locationsResult = await dataforSEOKeywords.getLocations(search);

    if (locationsResult.success) {
      res.json({
        success: true,
        locations: locationsResult.locations
      });
    } else {
      res.json({ success: false, error: locationsResult.error });
    }

  } catch (error) {
    console.error('Get Locations Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// POST /api/seo/keyword-ideas
// Get keyword suggestions
// ============================================
router.post('/keyword-ideas', async (req, res) => {
  try {
    const { keywords, locationCode = 2840, languageCode = 'en' } = req.body;

    if (!keywords || keywords.length === 0) {
      return res.json({ success: false, error: 'Keywords required' });
    }

    const ideasResult = await dataforSEOKeywords.getKeywordIdeas(
      keywords,
      locationCode,
      languageCode
    );

    if (ideasResult.success) {
      res.json({
        success: true,
        keywords: ideasResult.keywords,
        totalCount: ideasResult.totalCount
      });
    } else {
      res.json({ success: false, error: ideasResult.error });
    }

  } catch (error) {
    console.error('Keyword Ideas Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// POST /api/seo/analyze-serp
// Analyze SERP for a keyword (show all ranking sites)
// ============================================
router.post('/analyze-serp', async (req, res) => {
  try {
    const { keyword, locationCode = 2840, languageCode = 'en', depth = 100 } = req.body;

    if (!keyword) {
      return res.json({ success: false, error: 'Keyword required' });
    }

    console.log(`🔍 Analyzing SERP for: "${keyword}"`);

    // Get keyword metrics (search volume, CPC, competition)
    const metricsPromise = dataforSEOKeywords.getKeywordMetrics(
      [keyword],
      locationCode,
      languageCode
    );

    // Get SERP results
    const serpPromise = dataforSEOKeywords.getSerpResults(
      keyword,
      locationCode,
      languageCode,
      depth
    );

    // Run both in parallel
    const [metricsResult, serpResult] = await Promise.all([metricsPromise, serpPromise]);

    if (!serpResult.success) {
      return res.json({ success: false, error: serpResult.error });
    }

    // Extract metrics
    let keywordMetrics = null;
    if (metricsResult.success && metricsResult.keywords.length > 0) {
      const kw = metricsResult.keywords[0];
      keywordMetrics = {
        searchVolume: kw.search_volume,
        cpc: kw.cpc,
        competition: kw.competition,
        competitionLevel: kw.competition_level
      };
    }

    res.json({
      success: true,
      keyword: keyword,
      location: serpResult.location,
      metrics: keywordMetrics,
      results: serpResult.results,
      totalResults: serpResult.totalResults,
      checkUrl: serpResult.checkUrl
    });

  } catch (error) {
    console.error('SERP Analysis Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
