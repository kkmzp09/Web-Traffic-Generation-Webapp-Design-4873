// server-files/comprehensive-seo-audit.js
// Comprehensive SEO audit with real page scanning

const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * POST /api/seo/comprehensive-audit
 * Comprehensive SEO audit with real page analysis
 */
router.post('/comprehensive-audit', async (req, res) => {
  try {
    const { url, userId } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    // Validate URL
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    const hostname = parsedUrl.hostname;
    const protocol = parsedUrl.protocol;

    console.log(`🔍 Starting comprehensive audit for: ${url}`);

    // Fetch the page HTML
    let html = '';
    let pageLoadTime = 0;
    try {
      const startTime = Date.now();
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      pageLoadTime = Date.now() - startTime;
      html = response.data;
    } catch (error) {
      console.error('Error fetching page:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch page content'
      });
    }

    // Parse HTML with cheerio
    const $ = cheerio.load(html);

    // Initialize issues array
    const issues = [];

    // 1. META TAGS CHECK
    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content');
    const metaKeywords = $('meta[name="keywords"]').attr('content');

    if (!title || title.length === 0) {
      issues.push({
        category: 'meta',
        severity: 'critical',
        title: 'Missing Page Title',
        description: 'Your page doesn\'t have a title tag. This is critical for SEO.',
        impact: 'CRITICAL',
        autoFixAvailable: true
      });
    } else if (title.length < 30) {
      issues.push({
        category: 'meta',
        severity: 'high',
        title: 'Title Too Short',
        description: `Your title is only ${title.length} characters. Recommended: 50-60 characters.`,
        impact: 'HIGH',
        autoFixAvailable: true
      });
    } else if (title.length > 60) {
      issues.push({
        category: 'meta',
        severity: 'medium',
        title: 'Title Too Long',
        description: `Your title is ${title.length} characters. It may be truncated in search results.`,
        impact: 'MEDIUM',
        autoFixAvailable: true
      });
    }

    if (!metaDescription) {
      issues.push({
        category: 'meta',
        severity: 'critical',
        title: 'Missing Meta Description',
        description: 'No meta description found. This affects click-through rates from search results.',
        impact: 'CRITICAL',
        autoFixAvailable: true
      });
    } else if (metaDescription.length < 120) {
      issues.push({
        category: 'meta',
        severity: 'medium',
        title: 'Meta Description Too Short',
        description: `Meta description is ${metaDescription.length} characters. Recommended: 150-160.`,
        impact: 'MEDIUM',
        autoFixAvailable: true
      });
    }

    // 2. HEADINGS CHECK
    const h1Tags = $('h1');
    const h2Tags = $('h2');

    if (h1Tags.length === 0) {
      issues.push({
        category: 'headings',
        severity: 'critical',
        title: 'Missing H1 Tag',
        description: 'No H1 heading found. Every page should have exactly one H1.',
        impact: 'CRITICAL',
        autoFixAvailable: false
      });
    } else if (h1Tags.length > 1) {
      issues.push({
        category: 'headings',
        severity: 'high',
        title: 'Multiple H1 Tags',
        description: `Found ${h1Tags.length} H1 tags. Use only one H1 per page.`,
        impact: 'HIGH',
        autoFixAvailable: false
      });
    }

    if (h2Tags.length === 0) {
      issues.push({
        category: 'headings',
        severity: 'medium',
        title: 'No H2 Headings',
        description: 'No H2 headings found. Use H2-H6 to structure your content.',
        impact: 'MEDIUM',
        autoFixAvailable: false
      });
    }

    // 3. IMAGES CHECK
    const images = $('img');
    let imagesWithoutAlt = 0;
    let imagesWithEmptyAlt = 0;

    images.each((i, img) => {
      const alt = $(img).attr('alt');
      if (!alt) {
        imagesWithoutAlt++;
      } else if (alt.trim() === '') {
        imagesWithEmptyAlt++;
      }
    });

    if (imagesWithoutAlt > 0) {
      issues.push({
        category: 'images',
        severity: 'high',
        title: `${imagesWithoutAlt} Images Missing Alt Text`,
        description: 'Images without alt text hurt accessibility and SEO.',
        impact: 'HIGH',
        autoFixAvailable: true,
        count: imagesWithoutAlt
      });
    }

    if (imagesWithEmptyAlt > 0) {
      issues.push({
        category: 'images',
        severity: 'medium',
        title: `${imagesWithEmptyAlt} Images with Empty Alt Text`,
        description: 'Alt text should describe the image content.',
        impact: 'MEDIUM',
        autoFixAvailable: true,
        count: imagesWithEmptyAlt
      });
    }

    // 4. SCHEMA MARKUP CHECK
    const jsonLdScripts = $('script[type="application/ld+json"]');
    
    if (jsonLdScripts.length === 0) {
      issues.push({
        category: 'schema',
        severity: 'high',
        title: 'No Schema Markup Found',
        description: 'Add structured data to help search engines understand your content.',
        impact: 'HIGH',
        autoFixAvailable: true
      });
    }

    // 5. SSL CHECK
    if (protocol !== 'https:') {
      issues.push({
        category: 'technical',
        severity: 'critical',
        title: 'Not Using HTTPS',
        description: 'Your site should use HTTPS for security and SEO.',
        impact: 'CRITICAL',
        autoFixAvailable: false
      });
    }

    // 6. MOBILE VIEWPORT CHECK
    const viewport = $('meta[name="viewport"]').attr('content');
    if (!viewport) {
      issues.push({
        category: 'mobile',
        severity: 'high',
        title: 'Missing Viewport Meta Tag',
        description: 'Add viewport meta tag for mobile responsiveness.',
        impact: 'HIGH',
        autoFixAvailable: true
      });
    }

    // 7. CANONICAL URL CHECK
    const canonical = $('link[rel="canonical"]').attr('href');
    if (!canonical) {
      issues.push({
        category: 'technical',
        severity: 'medium',
        title: 'Missing Canonical URL',
        description: 'Add canonical URL to avoid duplicate content issues.',
        impact: 'MEDIUM',
        autoFixAvailable: true
      });
    }

    // 8. INTERNAL LINKS CHECK
    const internalLinks = $('a[href^="/"], a[href^="' + url + '"]');
    if (internalLinks.length < 3) {
      issues.push({
        category: 'content',
        severity: 'medium',
        title: 'Few Internal Links',
        description: 'Add more internal links to improve site structure and SEO.',
        impact: 'MEDIUM',
        autoFixAvailable: false
      });
    }

    // 9. PAGE SPEED CHECK (basic)
    if (pageLoadTime > 3000) {
      issues.push({
        category: 'performance',
        severity: 'high',
        title: 'Slow Page Load Time',
        description: `Page loaded in ${(pageLoadTime / 1000).toFixed(2)}s. Aim for under 3 seconds.`,
        impact: 'HIGH',
        autoFixAvailable: false
      });
    }

    // Calculate overall score
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;

    let score = 100;
    score -= (criticalIssues * 15);
    score -= (highIssues * 10);
    score -= (mediumIssues * 5);
    score = Math.max(0, score);

    // Prepare response
    const auditResults = {
      success: true,
      url: url,
      hostname: hostname,
      scannedAt: new Date().toISOString(),
      analysis: {
        score: score,
        issues: issues,
        summary: {
          total: issues.length,
          critical: criticalIssues,
          high: highIssues,
          medium: mediumIssues
        },
        pageData: {
          title: title || 'No title',
          description: metaDescription || 'No description',
          h1Count: h1Tags.length,
          h2Count: h2Tags.length,
          imageCount: images.length,
          imagesWithoutAlt: imagesWithoutAlt,
          hasSchema: jsonLdScripts.length > 0,
          hasSSL: protocol === 'https:',
          pageLoadTime: pageLoadTime
        }
      }
    };

    console.log(`✅ Audit complete: ${score}/100 score, ${issues.length} issues found`);

    res.json(auditResults);

  } catch (error) {
    console.error('Comprehensive audit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform comprehensive audit'
    });
  }
});

module.exports = router;
