// dataforseo-service.js - DataForSEO API Integration
// Provides domain analytics, keyword research, and competitor insights

import axios from 'axios';

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;
const DATAFORSEO_API_BASE = 'https://api.dataforseo.com';

// Check credentials on startup
if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
  console.warn('⚠️  DATAFORSEO_LOGIN or DATAFORSEO_PASSWORD not set in .env');
  console.warn('   DataForSEO features will return mock data');
}

// Basic Auth for DataForSEO
const authHeader = () => {
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    return {};
  }
  const credentials = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');
  return { 
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json'
  };
};

// ============================================
// DOMAIN OVERVIEW
// ============================================

export async function getDomainOverview(domain, location = 'United States') {
  // Return mock data if credentials not set
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    return {
      success: true,
      data: {
        domain: domain,
        metrics: {},
        organicKeywords: 1250,
        organicTraffic: 5000,
        organicCost: 2500,
        paidKeywords: 50,
        paidTraffic: 500,
        visibility: 75,
        isMockData: true
      }
    };
  }

  try {
    const response = await axios.post(
      `${DATAFORSEO_API_BASE}/v3/dataforseo_labs/google/domain_overview/live`,
      [{
        target: domain,
        location_name: location,
        language_name: 'English',
      }],
      { headers: authHeader() }
    );

    if (response.data.tasks && response.data.tasks[0].result) {
      const result = response.data.tasks[0].result[0];
      
      return {
        success: true,
        data: {
          domain: domain,
          metrics: result.metrics || {},
          organicKeywords: result.metrics?.organic?.count || 0,
          organicTraffic: result.metrics?.organic?.etv || 0,
          organicCost: result.metrics?.organic?.estimated_paid_traffic_cost || 0,
          paidKeywords: result.metrics?.paid?.count || 0,
          paidTraffic: result.metrics?.paid?.etv || 0,
          visibility: calculateVisibility(result.metrics),
        }
      };
    }

    return { success: false, error: 'No data returned' };
  } catch (error) {
    console.error('DataForSEO Domain Overview Error:', error.message);
    return { 
      success: false, 
      error: error.response?.data?.status_message || error.message 
    };
  }
}

// ============================================
// RANKED KEYWORDS
// ============================================

export async function getRankedKeywords(domain, limit = 50, location = 'United States') {
  try {
    const response = await axios.post(
      `${DATAFORSEO_API_BASE}/v3/dataforseo_labs/google/ranked_keywords/live`,
      [{
        target: domain,
        location_name: location,
        language_name: 'English',
        limit: limit,
        filters: ['ranked_serp_element.serp_item.rank_group', '<=', 20], // Top 20 positions
        order_by: ['ranked_serp_element.serp_item.rank_group,asc']
      }],
      { headers: authHeader() }
    );

    if (response.data.tasks && response.data.tasks[0].result) {
      const items = response.data.tasks[0].result[0]?.items || [];
      
      const keywords = items.map(item => ({
        keyword: item.keyword_data?.keyword || '',
        position: item.ranked_serp_element?.serp_item?.rank_group || 0,
        searchVolume: item.keyword_data?.keyword_info?.search_volume || 0,
        competition: item.keyword_data?.keyword_info?.competition || 0,
        cpc: item.keyword_data?.keyword_info?.cpc || 0,
        url: item.ranked_serp_element?.serp_item?.url || '',
        trafficEstimate: item.ranked_serp_element?.serp_item?.etv || 0,
      }));

      return {
        success: true,
        keywords: keywords,
        totalCount: response.data.tasks[0].result[0]?.total_count || 0,
      };
    }

    return { success: false, error: 'No keywords found' };
  } catch (error) {
    console.error('DataForSEO Ranked Keywords Error:', error.message);
    return { 
      success: false, 
      error: error.response?.data?.status_message || error.message 
    };
  }
}

// ============================================
// COMPETITOR DOMAINS
// ============================================

export async function getCompetitors(domain, limit = 10, location = 'United States') {
  try {
    const response = await axios.post(
      `${DATAFORSEO_API_BASE}/v3/dataforseo_labs/google/competitors_domain/live`,
      [{
        target: domain,
        location_name: location,
        language_name: 'English',
        limit: limit,
      }],
      { headers: authHeader() }
    );

    if (response.data.tasks && response.data.tasks[0].result) {
      const items = response.data.tasks[0].result[0]?.items || [];
      
      const competitors = items.map(item => ({
        domain: item.domain || '',
        avgPosition: item.avg_position || 0,
        sumPosition: item.sum_position || 0,
        intersections: item.intersections || 0,
        fullDomainMetrics: item.full_domain_metrics || {},
        organicKeywords: item.full_domain_metrics?.organic?.count || 0,
        organicTraffic: item.full_domain_metrics?.organic?.etv || 0,
      }));

      return {
        success: true,
        competitors: competitors,
      };
    }

    return { success: false, error: 'No competitors found' };
  } catch (error) {
    console.error('DataForSEO Competitors Error:', error.message);
    return { 
      success: false, 
      error: error.response?.data?.status_message || error.message 
    };
  }
}

// ============================================
// KEYWORD SUGGESTIONS
// ============================================

export async function getKeywordSuggestions(keyword, limit = 20, location = 'United States') {
  try {
    const response = await axios.post(
      `${DATAFORSEO_API_BASE}/v3/dataforseo_labs/google/related_keywords/live`,
      [{
        keyword: keyword,
        location_name: location,
        language_name: 'English',
        limit: limit,
        filters: ['keyword_data.keyword_info.search_volume', '>', 100], // Min 100 searches/month
        order_by: ['keyword_data.keyword_info.search_volume,desc']
      }],
      { headers: authHeader() }
    );

    if (response.data.tasks && response.data.tasks[0].result) {
      const items = response.data.tasks[0].result[0]?.items || [];
      
      const suggestions = items.map(item => ({
        keyword: item.keyword_data?.keyword || '',
        searchVolume: item.keyword_data?.keyword_info?.search_volume || 0,
        competition: item.keyword_data?.keyword_info?.competition || 0,
        competitionLevel: item.keyword_data?.keyword_info?.competition_level || 'UNKNOWN',
        cpc: item.keyword_data?.keyword_info?.cpc || 0,
        difficulty: calculateKeywordDifficulty(item.keyword_data?.keyword_info),
      }));

      return {
        success: true,
        suggestions: suggestions,
      };
    }

    return { success: false, error: 'No suggestions found' };
  } catch (error) {
    console.error('DataForSEO Keyword Suggestions Error:', error.message);
    return { 
      success: false, 
      error: error.response?.data?.status_message || error.message 
    };
  }
}

// ============================================
// BACKLINK SUMMARY
// ============================================

export async function getBacklinkSummary(domain) {
  try {
    const response = await axios.post(
      `${DATAFORSEO_API_BASE}/v3/backlinks/summary/live`,
      [{
        target: domain,
        internal_list_limit: 10,
        backlinks_status_type: 'live',
      }],
      { headers: authHeader() }
    );

    if (response.data.tasks && response.data.tasks[0].result) {
      const result = response.data.tasks[0].result[0];
      
      return {
        success: true,
        data: {
          domain: domain,
          backlinks: result.backlinks || 0,
          referringDomains: result.referring_domains || 0,
          referringMainDomains: result.referring_main_domains || 0,
          referringIps: result.referring_ips || 0,
          rank: result.rank || 0,
          domainRank: calculateDomainRank(result),
        }
      };
    }

    return { success: false, error: 'No backlink data found' };
  } catch (error) {
    console.error('DataForSEO Backlink Summary Error:', error.message);
    return { 
      success: false, 
      error: error.response?.data?.status_message || error.message 
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateVisibility(metrics) {
  if (!metrics || !metrics.organic) return 0;
  
  const keywords = metrics.organic.count || 0;
  const traffic = metrics.organic.etv || 0;
  
  // Simple visibility score (0-100)
  const keywordScore = Math.min(keywords / 1000, 1) * 50;
  const trafficScore = Math.min(traffic / 10000, 1) * 50;
  
  return Math.round(keywordScore + trafficScore);
}

function calculateKeywordDifficulty(keywordInfo) {
  if (!keywordInfo) return 'UNKNOWN';
  
  const competition = keywordInfo.competition || 0;
  const cpc = keywordInfo.cpc || 0;
  
  // Calculate difficulty (0-100)
  const competitionScore = competition * 50;
  const cpcScore = Math.min(cpc / 10, 1) * 50;
  
  const difficulty = Math.round(competitionScore + cpcScore);
  
  if (difficulty < 30) return 'EASY';
  if (difficulty < 60) return 'MEDIUM';
  return 'HARD';
}

function calculateDomainRank(backlinkData) {
  if (!backlinkData) return 0;
  
  const backlinks = backlinkData.backlinks || 0;
  const domains = backlinkData.referring_domains || 0;
  
  // Simple domain rank calculation (0-100)
  const backlinkScore = Math.min(Math.log10(backlinks + 1) * 10, 50);
  const domainScore = Math.min(Math.log10(domains + 1) * 15, 50);
  
  return Math.round(backlinkScore + domainScore);
}

// ============================================
// COMBINED DOMAIN ANALYTICS
// ============================================

export async function getFullDomainAnalytics(domain, location = 'United States') {
  try {
    console.log(`🔍 Fetching full analytics for: ${domain}`);
    
    // Fetch all data in parallel
    const [overview, keywords, competitors, backlinks] = await Promise.all([
      getDomainOverview(domain, location),
      getRankedKeywords(domain, 20, location),
      getCompetitors(domain, 5, location),
      getBacklinkSummary(domain),
    ]);

    return {
      success: true,
      domain: domain,
      overview: overview.success ? overview.data : null,
      topKeywords: keywords.success ? keywords.keywords : [],
      totalKeywords: keywords.success ? keywords.totalCount : 0,
      competitors: competitors.success ? competitors.competitors : [],
      backlinks: backlinks.success ? backlinks.data : null,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Full Domain Analytics Error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

export default {
  getDomainOverview,
  getRankedKeywords,
  getCompetitors,
  getKeywordSuggestions,
  getBacklinkSummary,
  getFullDomainAnalytics,
};
