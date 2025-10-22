// domain-analytics-db.js
// Database operations for domain analytics history

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

// ============================================
// SAVE ANALYTICS RESULT
// ============================================

export async function saveAnalyticsResult(userId, domain, analyticsData) {
  try {
    const query = `
      INSERT INTO domain_analytics (
        user_id, 
        domain, 
        total_keywords, 
        organic_traffic,
        organic_cost,
        visibility_score,
        top_keywords, 
        competitors, 
        backlinks,
        raw_data,
        location,
        analyzed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING id, analyzed_at
    `;

    const values = [
      userId,
      domain,
      analyticsData.totalKeywords || 0,
      analyticsData.overview?.organicTraffic || 0,
      analyticsData.overview?.organicCost || 0,
      analyticsData.overview?.visibility || 0,
      JSON.stringify(analyticsData.topKeywords || []),
      JSON.stringify(analyticsData.competitors || []),
      JSON.stringify(analyticsData.backlinks || {}),
      JSON.stringify(analyticsData),
      analyticsData.location || 'United States'
    ];

    const result = await pool.query(query, values);
    
    return {
      success: true,
      id: result.rows[0].id,
      analyzedAt: result.rows[0].analyzed_at
    };
  } catch (error) {
    console.error('Save Analytics Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// GET USER'S ANALYTICS HISTORY
// ============================================

export async function getUserAnalyticsHistory(userId, limit = 50, offset = 0) {
  try {
    const query = `
      SELECT 
        id,
        domain,
        total_keywords,
        organic_traffic,
        visibility_score,
        location,
        analyzed_at,
        created_at
      FROM domain_analytics
      WHERE user_id = $1
      ORDER BY analyzed_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [userId, limit, offset]);
    
    // Get total count
    const countQuery = 'SELECT COUNT(*) FROM domain_analytics WHERE user_id = $1';
    const countResult = await pool.query(countQuery, [userId]);
    
    return {
      success: true,
      analyses: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset
    };
  } catch (error) {
    console.error('Get History Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// GET DOMAIN HISTORY (for specific domain)
// ============================================

export async function getDomainHistory(userId, domain, limit = 10) {
  try {
    const query = `
      SELECT 
        id,
        domain,
        total_keywords,
        organic_traffic,
        visibility_score,
        top_keywords,
        competitors,
        backlinks,
        location,
        analyzed_at
      FROM domain_analytics
      WHERE user_id = $1 AND domain = $2
      ORDER BY analyzed_at DESC
      LIMIT $3
    `;

    const result = await pool.query(query, [userId, domain, limit]);
    
    return {
      success: true,
      domain,
      history: result.rows
    };
  } catch (error) {
    console.error('Get Domain History Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// GET SINGLE ANALYSIS BY ID
// ============================================

export async function getAnalysisById(userId, analysisId) {
  try {
    const query = `
      SELECT *
      FROM domain_analytics
      WHERE id = $1 AND user_id = $2
    `;

    const result = await pool.query(query, [analysisId, userId]);
    
    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Analysis not found'
      };
    }
    
    return {
      success: true,
      analysis: result.rows[0]
    };
  } catch (error) {
    console.error('Get Analysis Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// DELETE ANALYSIS
// ============================================

export async function deleteAnalysis(userId, analysisId) {
  try {
    const query = `
      DELETE FROM domain_analytics
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;

    const result = await pool.query(query, [analysisId, userId]);
    
    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Analysis not found or unauthorized'
      };
    }
    
    return {
      success: true,
      message: 'Analysis deleted successfully'
    };
  } catch (error) {
    console.error('Delete Analysis Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// GET ANALYTICS STATS
// ============================================

export async function getUserAnalyticsStats(userId) {
  try {
    const query = `
      SELECT 
        COUNT(DISTINCT domain) as total_domains,
        COUNT(*) as total_analyses,
        MAX(analyzed_at) as last_analysis,
        MIN(analyzed_at) as first_analysis
      FROM domain_analytics
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [userId]);
    
    return {
      success: true,
      stats: result.rows[0]
    };
  } catch (error) {
    console.error('Get Stats Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// GET LATEST ANALYSIS FOR DOMAIN
// ============================================

export async function getLatestAnalysis(userId, domain) {
  try {
    const query = `
      SELECT *
      FROM domain_analytics
      WHERE user_id = $1 AND domain = $2
      ORDER BY analyzed_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [userId, domain]);
    
    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'No previous analysis found'
      };
    }
    
    return {
      success: true,
      analysis: result.rows[0]
    };
  } catch (error) {
    console.error('Get Latest Analysis Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default {
  saveAnalyticsResult,
  getUserAnalyticsHistory,
  getDomainHistory,
  getAnalysisById,
  deleteAnalysis,
  getUserAnalyticsStats,
  getLatestAnalysis
};
