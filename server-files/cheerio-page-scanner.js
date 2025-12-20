// cheerio-page-scanner.js
// Clean, isolated module for HTML-based SEO issue detection
// Used for generating fixable issues (NOT for scoring)

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scan a single page's HTML and detect fixable SEO issues
 * @param {string} url - Full URL to scan
 * @returns {Promise<Object>} Page scan result with issues
 */
async function scanPageHTML(url) {
  try {
    console.log(`🔍 Scanning page: ${url}`);
    
    // Fetch HTML with timeout
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OrganiTrafficBot/1.0; +https://organitrafficboost.com)'
      },
      maxRedirects: 5
    });

    const html = response.data;
    const $ = cheerio.load(html);
    
    // Detect all issue types
    const issues = [];
    
    // H1 issues
    issues.push(...detectH1Issues($, url));
    
    // Meta tag issues
    issues.push(...detectMetaIssues($, url));
    
    // Image alt text issues
    issues.push(...detectImageIssues($, url));
    
    // Canonical issues
    issues.push(...detectCanonicalIssues($, url));
    
    // Indexing issues
    issues.push(...detectIndexingIssues($, url));
    
    // Extract page metadata
    const pageTitle = $('title').text().trim();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const h1Tags = $('h1').map((i, el) => $(el).text().trim()).get();
    const imageCount = $('img').length;
    const imagesWithoutAlt = $('img:not([alt]), img[alt=""]').length;
    const hasCanonical = $('link[rel="canonical"]').length > 0;
    const isNoindex = $('meta[name="robots"]').attr('content')?.includes('noindex') || false;
    
    return {
      success: true,
      url,
      pageTitle,
      metaDescription,
      h1Tags,
      imageCount,
      imagesWithoutAlt,
      hasCanonical,
      isNoindex,
      issues,
      scannedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ Failed to scan ${url}:`, error.message);
    return {
      success: false,
      url,
      error: error.message,
      issues: []
    };
  }
}

/**
 * Detect H1 tag issues
 */
function detectH1Issues($, url) {
  const issues = [];
  const h1Tags = $('h1');
  
  if (h1Tags.length === 0) {
    issues.push({
      type: 'missing_h1',
      severity: 'critical',
      title: 'Missing H1 Tag',
      description: 'Page has no H1 heading. H1 tags are crucial for SEO and help search engines understand your page content.',
      impact: 'CRITICAL',
      fixable: true,
      fixType: 'inject_h1',
      pageUrl: url
    });
  } else if (h1Tags.length > 1) {
    issues.push({
      type: 'multiple_h1',
      severity: 'high',
      title: `Multiple H1 Tags (${h1Tags.length} found)`,
      description: 'Page has multiple H1 tags. Best practice is to have exactly one H1 per page.',
      impact: 'HIGH',
      fixable: false, // Cannot auto-fix multiple H1s
      pageUrl: url
    });
  }
  
  return issues;
}

/**
 * Detect meta tag issues (title, description)
 */
function detectMetaIssues($, url) {
  const issues = [];
  
  // Check title tag
  const title = $('title').text().trim();
  if (!title) {
    issues.push({
      type: 'missing_title',
      severity: 'critical',
      title: 'Missing Page Title',
      description: 'Page has no title tag. Title tags are essential for SEO and appear in search results.',
      impact: 'CRITICAL',
      fixable: true,
      fixType: 'inject_title',
      pageUrl: url
    });
  } else if (title.length < 30) {
    issues.push({
      type: 'short_title',
      severity: 'high',
      title: 'Title Too Short',
      description: `Title is only ${title.length} characters. Recommended: 50-60 characters for optimal search display.`,
      impact: 'HIGH',
      fixable: true,
      fixType: 'override_title',
      pageUrl: url,
      currentValue: title
    });
  } else if (title.length > 60) {
    issues.push({
      type: 'long_title',
      severity: 'medium',
      title: 'Title Too Long',
      description: `Title is ${title.length} characters. It may be truncated in search results. Recommended: 50-60 characters.`,
      impact: 'MEDIUM',
      fixable: true,
      fixType: 'override_title',
      pageUrl: url,
      currentValue: title
    });
  }
  
  // Check meta description
  const metaDesc = $('meta[name="description"]').attr('content');
  if (!metaDesc) {
    issues.push({
      type: 'missing_description',
      severity: 'high',
      title: 'Missing Meta Description',
      description: 'Page has no meta description. This tag appears in search results and affects click-through rates.',
      impact: 'HIGH',
      fixable: true,
      fixType: 'inject_description',
      pageUrl: url
    });
  } else if (metaDesc.trim().length < 120) {
    issues.push({
      type: 'short_description',
      severity: 'medium',
      title: 'Meta Description Too Short',
      description: `Description is only ${metaDesc.length} characters. Recommended: 150-160 characters.`,
      impact: 'MEDIUM',
      fixable: true,
      fixType: 'override_description',
      pageUrl: url,
      currentValue: metaDesc
    });
  } else if (metaDesc.trim().length > 160) {
    issues.push({
      type: 'long_description',
      severity: 'medium',
      title: 'Meta Description Too Long',
      description: `Description is ${metaDesc.length} characters. It may be truncated in search results. Recommended: 150-160 characters.`,
      impact: 'MEDIUM',
      fixable: true,
      fixType: 'override_description',
      pageUrl: url,
      currentValue: metaDesc
    });
  }
  
  return issues;
}

/**
 * Detect image alt text issues
 */
function detectImageIssues($, url) {
  const issues = [];
  const imagesWithoutAlt = $('img:not([alt]), img[alt=""]');
  
  if (imagesWithoutAlt.length > 0) {
    issues.push({
      type: 'missing_alt_text',
      severity: 'high',
      title: `${imagesWithoutAlt.length} Images Missing Alt Text`,
      description: 'Images without alt text hurt accessibility and SEO. Alt text helps search engines understand image content.',
      impact: 'HIGH',
      fixable: true,
      fixType: 'add_alt_text',
      pageUrl: url,
      count: imagesWithoutAlt.length
    });
  }
  
  return issues;
}

/**
 * Detect canonical tag issues
 */
function detectCanonicalIssues($, url) {
  const issues = [];
  const canonical = $('link[rel="canonical"]');
  
  if (canonical.length === 0) {
    issues.push({
      type: 'missing_canonical',
      severity: 'medium',
      title: 'Missing Canonical Tag',
      description: 'Page has no canonical tag. Canonical tags help prevent duplicate content issues.',
      impact: 'MEDIUM',
      fixable: true,
      fixType: 'inject_canonical',
      pageUrl: url
    });
  } else if (canonical.length > 1) {
    issues.push({
      type: 'multiple_canonical',
      severity: 'high',
      title: 'Multiple Canonical Tags',
      description: 'Page has multiple canonical tags. Only one canonical tag should be present.',
      impact: 'HIGH',
      fixable: false,
      pageUrl: url
    });
  }
  
  return issues;
}

/**
 * Detect indexing/robots issues
 */
function detectIndexingIssues($, url) {
  const issues = [];
  const robotsMeta = $('meta[name="robots"]').attr('content') || '';
  
  if (robotsMeta.includes('noindex')) {
    issues.push({
      type: 'noindex_detected',
      severity: 'critical',
      title: 'Page Set to Noindex',
      description: 'Page has noindex directive. This prevents search engines from indexing this page.',
      impact: 'CRITICAL',
      fixable: true,
      fixType: 'remove_noindex',
      pageUrl: url,
      currentValue: robotsMeta
    });
  }
  
  return issues;
}

/**
 * Scan multiple pages in parallel
 * @param {string[]} urls - Array of URLs to scan
 * @param {number} maxConcurrent - Max concurrent requests (default: 3)
 * @returns {Promise<Object[]>} Array of scan results
 */
async function scanMultiplePages(urls, maxConcurrent = 3) {
  const results = [];
  
  // Process in batches to avoid overwhelming the server
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map(url => scanPageHTML(url))
    );
    results.push(...batchResults);
    
    // Small delay between batches
    if (i + maxConcurrent < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

module.exports = {
  scanPageHTML,
  scanMultiplePages,
  detectH1Issues,
  detectMetaIssues,
  detectImageIssues,
  detectCanonicalIssues,
  detectIndexingIssues
};
