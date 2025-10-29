// dataforseo-keywords-service.js
// Service for DataForSEO Keywords Data API and SERP API

const axios = require('axios');
require('dotenv').config();

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;
const DATAFORSEO_API_BASE = 'https://api.dataforseo.com';

// Create auth header
const authHeader = () => ({
  Authorization: `Basic ${Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64')}`
});

// ============================================
// KEYWORDS DATA API - Search Volume & Metrics
// ============================================

/**
 * Get search volume and keyword metrics
 * Uses Google Ads Keywords Data API
 */
async function getKeywordMetrics(keywords, locationCode = 2840, languageCode = 'en') {
  try {
    console.log(`📊 Fetching keyword metrics for ${keywords.length} keywords`);
    
    const response = await axios.post(
      `${DATAFORSEO_API_BASE}/v3/keywords_data/google_ads/search_volume/live`,
      [{
        keywords: keywords,
        location_code: locationCode,
        language_code: languageCode,
        search_partners: false,
        date_from: null, // Get current data
        date_to: null
      }],
      { 
        headers: authHeader(),
        timeout: 30000
      }
    );

    if (response.data.tasks && response.data.tasks[0].result) {
      const result = response.data.tasks[0].result[0];
      
      return {
        success: true,
        keywords: result.items || [],
        totalCost: response.data.cost || 0
      };
    }

    return {
      success: false,
      error: 'No data returned'
    };
  } catch (error) {
    console.error('Keywords Data API Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.status_message || error.message
    };
  }
}

/**
 * Get keyword ideas and related keywords
 */
async function getKeywordIdeas(seed_keywords, locationCode = 2840, languageCode = 'en') {
  try {
    console.log(`💡 Fetching keyword ideas for: ${seed_keywords.join(', ')}`);
    
    const response = await axios.post(
      `${DATAFORSEO_API_BASE}/v3/keywords_data/google_ads/keywords_for_keywords/live`,
      [{
        keywords: seed_keywords,
        location_code: locationCode,
        language_code: languageCode,
        include_seed_keyword: true,
        include_serp_info: true,
        limit: 100
      }],
      { 
        headers: authHeader(),
        timeout: 30000
      }
    );

    if (response.data.tasks && response.data.tasks[0].result) {
      const result = response.data.tasks[0].result[0];
      
      return {
        success: true,
        keywords: result.items || [],
        totalCount: result.total_count || 0,
        totalCost: response.data.cost || 0
      };
    }

    return {
      success: false,
      error: 'No data returned'
    };
  } catch (error) {
    console.error('Keyword Ideas API Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.status_message || error.message
    };
  }
}

// ============================================
// SERP API - Get Actual Rankings
// ============================================

/**
 * Get keyword ranking for a specific domain
 * Uses Google SERP API
 */
async function getKeywordRanking(keyword, domain, locationCode = 2840, languageCode = 'en') {
  try {
    console.log(`🔍 Checking ranking for "${keyword}" on ${domain}`);
    
    const response = await axios.post(
      `${DATAFORSEO_API_BASE}/v3/serp/google/organic/live/advanced`,
      [{
        keyword: keyword,
        location_code: locationCode,
        language_code: languageCode,
        device: 'desktop',
        os: 'windows',
        depth: 100, // Check top 100 results
        calculate_rectangles: false
      }],
      { 
        headers: authHeader(),
        timeout: 30000
      }
    );

    if (response.data.tasks && response.data.tasks[0].result && response.data.tasks[0].result[0]) {
      const result = response.data.tasks[0].result[0];
      const items = result.items || [];
      
      // Clean domain for comparison (remove www, protocol, trailing slash)
      const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').toLowerCase();
      
      // Find the ranking position
      let rankPosition = null;
      let rankedUrl = null;
      
      for (const item of items) {
        if (item.type === 'organic') {
          const itemDomain = item.domain?.toLowerCase() || '';
          
          if (itemDomain.includes(cleanDomain) || cleanDomain.includes(itemDomain)) {
            rankPosition = item.rank_absolute;
            rankedUrl = item.url;
            break;
          }
        }
      }
      
      return {
        success: true,
        keyword: keyword,
        domain: domain,
        rankPosition: rankPosition,
        rankedUrl: rankedUrl,
        totalResults: result.items_count || 0,
        checkUrl: result.check_url,
        totalCost: response.data.cost || 0
      };
    }

    return {
      success: false,
      error: 'No SERP data returned'
    };
  } catch (error) {
    console.error('SERP API Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.status_message || error.message
    };
  }
}

/**
 * Get rankings for multiple keywords (batch)
 */
async function getBatchKeywordRankings(keywordDomainPairs, locationCode = 2840, languageCode = 'en') {
  try {
    console.log(`🔍 Batch checking ${keywordDomainPairs.length} keyword rankings`);
    
    const tasks = keywordDomainPairs.map(pair => ({
      keyword: pair.keyword,
      location_code: locationCode,
      language_code: languageCode,
      device: 'desktop',
      os: 'windows',
      depth: 100,
      calculate_rectangles: false,
      tag: `${pair.keyword}|${pair.domain}` // Use tag to identify results
    }));
    
    const response = await axios.post(
      `${DATAFORSEO_API_BASE}/v3/serp/google/organic/live/advanced`,
      tasks,
      { 
        headers: authHeader(),
        timeout: 60000
      }
    );

    if (response.data.tasks) {
      const results = [];
      
      for (const task of response.data.tasks) {
        if (task.result && task.result[0]) {
          const result = task.result[0];
          const [keyword, domain] = task.data.tag.split('|');
          const items = result.items || [];
          
          const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').toLowerCase();
          
          let rankPosition = null;
          let rankedUrl = null;
          
          for (const item of items) {
            if (item.type === 'organic') {
              const itemDomain = item.domain?.toLowerCase() || '';
              
              if (itemDomain.includes(cleanDomain) || cleanDomain.includes(itemDomain)) {
                rankPosition = item.rank_absolute;
                rankedUrl = item.url;
                break;
              }
            }
          }
          
          results.push({
            keyword: keyword,
            domain: domain,
            rankPosition: rankPosition,
            rankedUrl: rankedUrl,
            totalResults: result.items_count || 0
          });
        }
      }
      
      return {
        success: true,
        results: results,
        totalCost: response.data.cost || 0
      };
    }

    return {
      success: false,
      error: 'No batch results returned'
    };
  } catch (error) {
    console.error('Batch SERP API Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.status_message || error.message
    };
  }
}

/**
 * Get location list for DataForSEO
 */
async function getLocations(searchTerm = '') {
  try {
    const response = await axios.get(
      `${DATAFORSEO_API_BASE}/v3/serp/google/locations`,
      { 
        headers: authHeader(),
        timeout: 10000
      }
    );

    if (response.data.tasks && response.data.tasks[0].result) {
      let locations = response.data.tasks[0].result;
      
      if (searchTerm) {
        locations = locations.filter(loc => 
          loc.location_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      return {
        success: true,
        locations: locations.slice(0, 100) // Limit to 100 results
      };
    }

    return {
      success: false,
      error: 'No locations data'
    };
  } catch (error) {
    console.error('Locations API Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get full SERP results for keyword research
 * Returns all ranking sites with details
 */
async function getSerpResults(keyword, locationCode = 2840, languageCode = 'en', depth = 100) {
  try {
    console.log(`🔍 Getting SERP results for "${keyword}"`);
    
    const response = await axios.post(
      `${DATAFORSEO_API_BASE}/v3/serp/google/organic/live/advanced`,
      [{
        keyword: keyword,
        location_code: locationCode,
        language_code: languageCode,
        device: 'desktop',
        os: 'windows',
        depth: depth,
        calculate_rectangles: false
      }],
      { 
        headers: authHeader(),
        timeout: 30000
      }
    );

    if (response.data.tasks && response.data.tasks[0].result && response.data.tasks[0].result[0]) {
      const result = response.data.tasks[0].result[0];
      const items = result.items || [];
      
      // Extract organic results with details
      const organicResults = items
        .filter(item => item.type === 'organic')
        .map(item => ({
          position: item.rank_absolute,
          url: item.url,
          domain: item.domain,
          title: item.title,
          description: item.description,
          breadcrumb: item.breadcrumb,
          isAmp: item.is_amp || false,
          rating: item.rating ? {
            value: item.rating.rating_value,
            votesCount: item.rating.votes_count,
            ratingType: item.rating.rating_type
          } : null
        }));
      
      return {
        success: true,
        keyword: keyword,
        location: result.location_code,
        results: organicResults,
        totalResults: result.items_count || 0,
        checkUrl: result.check_url,
        totalCost: response.data.cost || 0
      };
    }

    return {
      success: false,
      error: 'No SERP data returned'
    };
  } catch (error) {
    console.error('Get SERP Results Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.status_message || error.message
    };
  }
}

module.exports = {
  getKeywordMetrics,
  getKeywordIdeas,
  getKeywordRanking,
  getBatchKeywordRankings,
  getLocations,
  getSerpResults
};
