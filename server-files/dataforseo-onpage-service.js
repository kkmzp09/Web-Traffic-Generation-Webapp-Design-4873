// dataforseo-onpage-service.js - DataForSEO On-Page API Integration
// Full implementation of DataForSEO On-Page crawler for comprehensive SEO analysis

const axios = require('axios');

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;
const DATAFORSEO_API_BASE = 'https://api.dataforseo.com';

// Check credentials
if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
  console.warn('⚠️  DATAFORSEO_LOGIN or DATAFORSEO_PASSWORD not set in .env');
  console.warn('   DataForSEO On-Page API will not work');
}

// Basic Auth header
const authHeader = () => {
  if (DATAFORSEO_LOGIN && DATAFORSEO_PASSWORD) {
    const credentials = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    };
  }
  return { 'Content-Type': 'application/json' };
};

// ============================================
// TASK POST - Start On-Page Crawl
// ============================================

/**
 * Post a new On-Page crawl task
 * @param {Object} params - Crawl parameters
 * @param {string} params.target - URL or domain to crawl
 * @param {number} params.max_crawl_pages - Maximum pages to crawl (default: 10)
 * @param {boolean} params.enable_javascript - Execute JavaScript (default: true)
 * @param {boolean} params.enable_browser_rendering - Measure Core Web Vitals (default: false)
 * @param {boolean} params.load_resources - Analyze resources (images, scripts, etc.) (default: true)
 * @param {boolean} params.calculate_keyword_density - Calculate keyword density (default: false)
 * @param {boolean} params.store_raw_html - Store raw HTML (default: false)
 * @returns {Promise<Object>} Task ID and status
 */
async function postOnPageTask(params) {
  const {
    target,
    max_crawl_pages = 10,
    enable_javascript = true,
    enable_browser_rendering = false,
    load_resources = true,
    calculate_keyword_density = false,
    store_raw_html = false,
    custom_js = null,
    checks_threshold = null
  } = params;

  try {
    console.log(`🚀 Starting DataForSEO On-Page crawl for: ${target}`);

    const payload = [{
      target: target,
      max_crawl_pages: max_crawl_pages,
      enable_javascript: enable_javascript,
      enable_browser_rendering: enable_browser_rendering,
      load_resources: load_resources,
      calculate_keyword_density: calculate_keyword_density,
      store_raw_html: store_raw_html,
      ...(custom_js && { custom_js }),
      ...(checks_threshold && { checks_threshold })
    }];

    const response = await axios.post(
      `${DATAFORSEO_API_BASE}/v3/on_page/task_post`,
      payload,
      { headers: authHeader() }
    );

    if (response.data.tasks && response.data.tasks[0]) {
      const task = response.data.tasks[0];
      
      // Check if task was created successfully
      if (task.status_code === 20100 || task.status_message === 'Task Created.') {
        return {
          success: true,
          taskId: task.id,
          status: task.status_message,
          cost: task.cost || 0,
          data: task.data
        };
      }
      
      return {
        success: false,
        error: task.status_message || 'Task creation failed'
      };
    }

    return {
      success: false,
      error: 'No response from DataForSEO'
    };
  } catch (error) {
    console.error('❌ DataForSEO On-Page Task Post Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.status_message || error.message
    };
  }
}

// ============================================
// TASK STATUS - Check Task Progress
// ============================================

async function getTaskStatus(taskId) {
  try {
    const response = await axios.get(
      `${DATAFORSEO_API_BASE}/v3/on_page/tasks_ready`,
      { headers: authHeader() }
    );

    if (response.data.tasks && response.data.tasks[0].result) {
      const tasks = response.data.tasks[0].result;
      const task = tasks.find(t => t.id === taskId);

      if (task) {
        return {
          success: true,
          taskId: taskId,
          status: task.status_message,
          pagesInQueue: task.pages_in_queue || 0,
          pagesCrawled: task.pages_crawled || 0,
          completed: task.status_message === 'Ok.',
        };
      }
    }

    return {
      success: false,
      error: 'Task not found'
    };
  } catch (error) {
    console.error('DataForSEO Task Status Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.status_message || error.message
    };
  }
}

// ============================================
// SUMMARY - Get On-Page Issues Summary
// ============================================

async function getSummary(taskId) {
  try {
    const response = await axios.post(
      `${DATAFORSEO_API_BASE}/v3/on_page/summary`,
      [{ id: taskId }],
      { headers: authHeader() }
    );

    if (response.data.tasks && response.data.tasks[0].result) {
      const result = response.data.tasks[0].result[0];
      
      return {
        success: true,
        data: {
          crawlProgress: result.crawl_progress,
          crawlStatus: result.crawl_status,
          pagesCrawled: result.pages_crawled,
          pagesInQueue: result.pages_in_queue,
          onPageScore: result.onpage_score,
          checks: result.checks,
          totalDomainPages: result.total_domain_pages,
          brokenPages: result.broken_pages,
          httpsToHttpLinks: result.https_to_http_links,
          duplicateTitle: result.duplicate_title,
          duplicateDescription: result.duplicate_description,
          duplicateContent: result.duplicate_content
        }
      };
    }

    return { success: false, error: 'No summary data' };
  } catch (error) {
    console.error('DataForSEO Summary Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.status_message || error.message
    };
  }
}

// ============================================
// PAGES - Get Crawled Pages with Metrics
// ============================================

async function getPages(taskId, limit = 100, filters = null) {
  try {
    const payload = {
      id: taskId,
      limit: limit,
      offset: 0,
      ...(filters && { filters })
    };

    const response = await axios.post(
      `${DATAFORSEO_API_BASE}/v3/on_page/pages`,
      [payload],
      { headers: authHeader() }
    );

    if (response.data.tasks && response.data.tasks[0].result) {
      const items = response.data.tasks[0].result[0]?.items || [];
      
      const pages = items.map(item => ({
        url: item.url,
        statusCode: item.status_code,
        pageScore: item.onpage_score,
        checks: item.checks,
        metaTitle: item.meta?.title,
        metaDescription: item.meta?.description,
        h1: item.meta?.h1,
        imageCount: item.meta?.images_count,
        wordsCount: item.meta?.content?.plain_text_word_count,
        internalLinksCount: item.meta?.internal_links_count,
        externalLinksCount: item.meta?.external_links_count,
        loadTime: item.page_timing?.time_to_interactive,
        size: item.page_timing?.dom_complete,
        redirects: item.redirect_chain
      }));

      return {
        success: true,
        pages: pages,
        totalCount: response.data.tasks[0].result[0]?.total_count || 0
      };
    }

    return { success: false, error: 'No pages data' };
  } catch (error) {
    console.error('DataForSEO Pages Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.status_message || error.message
    };
  }
}

// ============================================
// RESOURCES - Get Page Resources (Images, Scripts, etc.)
// ============================================

async function getResources(taskId, limit = 100) {
  try {
    const response = await axios.post(
      `${DATAFORSEO_API_BASE}/v3/on_page/resources`,
      [{ id: taskId, limit: limit }],
      { headers: authHeader() }
    );

    if (response.data.tasks && response.data.tasks[0].result) {
      const items = response.data.tasks[0].result[0]?.items || [];
      
      const resources = items.map(item => ({
        url: item.url,
        type: item.resource_type,
        statusCode: item.status_code,
        size: item.size,
        encodedSize: item.encoded_size,
        totalTransferSize: item.total_transfer_size,
        fetchTime: item.fetch_time,
        brokenResource: item.resource_errors?.is_broken,
        alt: item.alt,
        anchor: item.anchor
      }));

      return {
        success: true,
        resources: resources,
        totalCount: response.data.tasks[0].result[0]?.total_count || 0
      };
    }

    return { success: false, error: 'No resources data' };
  } catch (error) {
    console.error('DataForSEO Resources Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.status_message || error.message
    };
  }
}

// ============================================
// DUPLICATE TAGS - Find Duplicate Titles/Descriptions
// ============================================

async function getDuplicateTags(taskId) {
  try {
    const response = await axios.post(
      `${DATAFORSEO_API_BASE}/v3/on_page/duplicate_tags`,
      [{ id: taskId }],
      { headers: authHeader() }
    );

    if (response.data.tasks && response.data.tasks[0].result) {
      const items = response.data.tasks[0].result[0]?.items || [];
      
      return {
        success: true,
        duplicates: items.map(item => ({
          type: item.type,
          value: item.value,
          firstSeenUrl: item.first_seen?.url,
          urls: item.urls
        }))
      };
    }

    return { success: false, error: 'No duplicate tags data' };
  } catch (error) {
    console.error('DataForSEO Duplicate Tags Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.status_message || error.message
    };
  }
}

// ============================================
// LINKS - Get Internal and External Links
// ============================================

async function getLinks(taskId, limit = 100) {
  try {
    const response = await axios.post(
      `${DATAFORSEO_API_BASE}/v3/on_page/links`,
      [{ id: taskId, limit: limit }],
      { headers: authHeader() }
    );

    if (response.data.tasks && response.data.tasks[0].result) {
      const items = response.data.tasks[0].result[0]?.items || [];
      
      const links = items.map(item => ({
        type: item.type,
        dofollow: item.dofollow,
        url: item.url,
        domain: item.domain_to,
        text: item.text,
        alt: item.alt
      }));

      return {
        success: true,
        links: links,
        totalCount: response.data.tasks[0].result[0]?.total_count || 0
      };
    }

    return { success: false, error: 'No links data' };
  } catch (error) {
    console.error('DataForSEO Links Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.status_message || error.message
    };
  }
}

// ============================================
// WATERFALL - Get Page Speed Insights
// ============================================

async function getWaterfall(taskId, url) {
  try {
    const response = await axios.post(
      `${DATAFORSEO_API_BASE}/v3/on_page/waterfall`,
      [{ id: taskId, url: url }],
      { headers: authHeader() }
    );

    if (response.data.tasks && response.data.tasks[0].result) {
      const result = response.data.tasks[0].result[0];
      
      return {
        success: true,
        data: {
          items: result.items,
          onloadTime: result.onload_time,
          timeToInteractive: result.time_to_interactive,
          domContentLoaded: result.dom_content_loaded,
          connectionTime: result.connection_time,
          totalTransferSize: result.total_transfer_size
        }
      };
    }

    return { success: false, error: 'No waterfall data' };
  } catch (error) {
    console.error('DataForSEO Waterfall Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.status_message || error.message
    };
  }
}

// ============================================
// KEYWORD DENSITY - Get Keyword Analysis
// ============================================

async function getKeywordDensity(taskId, url = null) {
  try {
    const payload = { id: taskId };
    if (url) payload.url = url;

    const response = await axios.post(
      `${DATAFORSEO_API_BASE}/v3/on_page/keyword_density`,
      [payload],
      { headers: authHeader() }
    );

    if (response.data.tasks && response.data.tasks[0].result) {
      const items = response.data.tasks[0].result[0]?.items || [];
      
      const keywords = items.map(item => ({
        keyword: item.keyword,
        frequency: item.frequency,
        density: item.density,
        type: item.type
      }));

      return {
        success: true,
        keywords: keywords
      };
    }

    return { success: false, error: 'No keyword density data' };
  } catch (error) {
    console.error('DataForSEO Keyword Density Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.status_message || error.message
    };
  }
}

// ============================================
// COMPREHENSIVE ANALYSIS - Get Everything
// ============================================

/**
 * Get comprehensive On-Page analysis
 * Fetches all available data for a crawl task
 */
async function getComprehensiveAnalysis(taskId) {
  try {
    console.log(`📊 Fetching comprehensive analysis for task: ${taskId}`);

    // Get summary directly (fast, single API call)
    const response = await axios.post(
      `${DATAFORSEO_API_BASE}/v3/on_page/summary`,
      [{ id: taskId }],
      { headers: authHeader(), timeout: 30000 }
    );

    if (response.data.tasks && response.data.tasks[0].result && response.data.tasks[0].result[0]) {
      const result = response.data.tasks[0].result[0];
      const domainInfo = result.domain_info || {};
      const pageMetrics = result.page_metrics || {};
      
      return {
        success: true,
        taskId: taskId,
        summary: {
          crawlProgress: result.crawl_progress,
          crawlStatus: result.crawl_status,
          onPageScore: pageMetrics.onpage_score || 0,
          totalPages: domainInfo.total_pages || 0,
          pagesCrawled: result.crawl_status?.pages_crawled || 0,
          pagesInQueue: result.crawl_status?.pages_in_queue || 0,
          
          // Issues
          brokenLinks: pageMetrics.broken_links || 0,
          brokenResources: pageMetrics.broken_resources || 0,
          duplicateTitle: pageMetrics.duplicate_title || 0,
          duplicateDescription: pageMetrics.duplicate_description || 0,
          duplicateContent: pageMetrics.duplicate_content || 0,
          
          // Links
          linksExternal: pageMetrics.links_external || 0,
          linksInternal: pageMetrics.links_internal || 0,
          
          // Checks
          checks: pageMetrics.checks || {},
          
          // Domain info
          domain: domainInfo.name,
          crawlStart: domainInfo.crawl_start,
          crawlEnd: domainInfo.crawl_end
        },
        pages: [],
        totalPages: domainInfo.total_pages || 0,
        resources: [],
        duplicateTags: [],
        links: [],
        generatedAt: new Date().toISOString()
      };
    }

    return {
      success: false,
      error: 'No analysis data available'
    };
  } catch (error) {
    console.error('Comprehensive Analysis Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.status_message || error.message
    };
  }
}

module.exports = {
  postOnPageTask,
  getTaskStatus,
  getSummary,
  getPages,
  getResources,
  getDuplicateTags,
  getLinks,
  getWaterfall,
  getKeywordDensity,
  getComprehensiveAnalysis
};
