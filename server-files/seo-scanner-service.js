// server-files/seo-scanner-service.js
// SEO Page Scanner - Crawls and analyzes pages for SEO issues

const axios = require('axios');
const cheerio = require('cheerio');

class SEOScanner {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (compatible; OrganiTrafficBot/1.0; +https://organitrafficboost.com)';
  }

  /**
   * Main scan function - analyzes a URL for SEO issues
   */
  async scanPage(url) {
    const startTime = Date.now();
    const results = {
      url,
      domain: new URL(url).hostname,
      seoScore: 0,
      issues: [],
      passed: [],
      metadata: {}
    };

    try {
      // Fetch the page
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 30000,
        maxRedirects: 5
      });

      const html = response.data;
      const $ = cheerio.load(html);
      const headers = response.headers;

      // Run all checks
      await Promise.all([
        this.checkTitleTag($, results),
        this.checkMetaDescription($, results),
        this.checkHeadings($, results),
        this.checkImages($, results),
        this.checkLinks($, results, url),
        this.checkSchema($, results),
        this.checkCanonical($, results, url),
        this.checkOpenGraph($, results),
        this.checkRobots($, results),
        this.checkStructuredData($, results),
        this.checkPageSpeed(html, results),
        this.checkMobileViewport($, results),
        this.checkContentQuality($, results)
      ]);

      // Calculate overall SEO score
      results.seoScore = this.calculateScore(results);
      results.scanDuration = Date.now() - startTime;

      return results;

    } catch (error) {
      console.error('Scan error:', error.message);
      throw new Error(`Failed to scan page: ${error.message}`);
    }
  }

  /**
   * Check title tag
   */
  checkTitleTag($, results) {
    const title = $('title').text().trim();
    
    if (!title) {
      results.issues.push({
        category: 'title',
        severity: 'critical',
        title: 'Missing Title Tag',
        description: 'Your page is missing a title tag, which is crucial for SEO.',
        currentValue: null,
        fix: 'Add a descriptive title tag between 50-60 characters that includes your target keyword.'
      });
    } else if (title.length < 30) {
      results.issues.push({
        category: 'title',
        severity: 'warning',
        title: 'Title Tag Too Short',
        description: `Your title is only ${title.length} characters. Aim for 50-60 characters.`,
        currentValue: title,
        fix: 'Expand your title to include more descriptive keywords while staying under 60 characters.'
      });
    } else if (title.length > 60) {
      results.issues.push({
        category: 'title',
        severity: 'warning',
        title: 'Title Tag Too Long',
        description: `Your title is ${title.length} characters. Google typically displays 50-60 characters.`,
        currentValue: title,
        fix: 'Shorten your title to 50-60 characters to avoid truncation in search results.'
      });
    } else {
      results.passed.push({
        category: 'title',
        title: 'Title Tag Optimized',
        currentValue: title
      });
    }

    results.metadata.title = title;
  }

  /**
   * Check meta description
   */
  checkMetaDescription($, results) {
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    
    if (!metaDesc) {
      results.issues.push({
        category: 'meta',
        severity: 'critical',
        title: 'Missing Meta Description',
        description: 'Your page is missing a meta description, which affects click-through rates.',
        currentValue: null,
        fix: 'Add a compelling meta description between 150-160 characters that summarizes your page content.'
      });
    } else if (metaDesc.length < 120) {
      results.issues.push({
        category: 'meta',
        severity: 'warning',
        title: 'Meta Description Too Short',
        description: `Your meta description is only ${metaDesc.length} characters. Aim for 150-160 characters.`,
        currentValue: metaDesc,
        fix: 'Expand your meta description to provide more context and include relevant keywords.'
      });
    } else if (metaDesc.length > 160) {
      results.issues.push({
        category: 'meta',
        severity: 'warning',
        title: 'Meta Description Too Long',
        description: `Your meta description is ${metaDesc.length} characters and may be truncated.`,
        currentValue: metaDesc,
        fix: 'Shorten your meta description to 150-160 characters.'
      });
    } else {
      results.passed.push({
        category: 'meta',
        title: 'Meta Description Optimized',
        currentValue: metaDesc
      });
    }

    results.metadata.metaDescription = metaDesc;
  }

  /**
   * Check heading structure
   */
  checkHeadings($, results) {
    const h1s = $('h1');
    const h2s = $('h2');
    
    if (h1s.length === 0) {
      results.issues.push({
        category: 'headings',
        severity: 'critical',
        title: 'Missing H1 Heading',
        description: 'Your page is missing an H1 heading, which is important for SEO structure.',
        fix: 'Add a single H1 heading that describes the main topic of your page.'
      });
    } else if (h1s.length > 1) {
      results.issues.push({
        category: 'content',
        severity: 'warning',
        title: 'Multiple H1 Headings',
        description: `Found ${h1s.length} H1 headings. Best practice is to have only one H1 per page.`,
        currentValue: h1s.map((i, el) => $(el).text()).get().join(', '),
        fix: 'Use only one H1 heading for the main topic, and use H2-H6 for subheadings.'
      });
    } else {
      results.passed.push({
        category: 'content',
        title: 'H1 Heading Present',
        currentValue: h1s.text()
      });
    }

    if (h2s.length === 0) {
      results.issues.push({
        category: 'content',
        severity: 'info',
        title: 'No H2 Headings',
        description: 'Consider adding H2 headings to structure your content better.',
        fix: 'Break your content into sections with descriptive H2 headings.'
      });
    }

    results.metadata.h1Count = h1s.length;
    results.metadata.h2Count = h2s.length;
  }

  /**
   * Check images for alt text
   */
  checkImages($, results) {
    const images = $('img');
    const imagesWithoutAlt = [];
    const imagesWithEmptyAlt = [];

    images.each((i, img) => {
      const alt = $(img).attr('alt');
      const src = $(img).attr('src');
      
      if (!alt) {
        imagesWithoutAlt.push(src);
      } else if (alt.trim() === '') {
        imagesWithEmptyAlt.push(src);
      }
    });

    if (imagesWithoutAlt.length > 0) {
      results.issues.push({
        category: 'images',
        severity: 'warning',
        title: `${imagesWithoutAlt.length} Images Missing Alt Text`,
        description: 'Alt text is important for accessibility and SEO.',
        currentValue: imagesWithoutAlt.slice(0, 5).join(', '),
        fix: 'Add descriptive alt text to all images that describes what the image shows.'
      });
    }

    if (imagesWithEmptyAlt.length > 0) {
      results.issues.push({
        category: 'images',
        severity: 'info',
        title: `${imagesWithEmptyAlt.length} Images With Empty Alt Text`,
        description: 'Some images have empty alt attributes.',
        fix: 'Add meaningful alt text or use alt="" only for decorative images.'
      });
    }

    if (imagesWithoutAlt.length === 0 && imagesWithEmptyAlt.length === 0 && images.length > 0) {
      results.passed.push({
        category: 'images',
        title: 'All Images Have Alt Text'
      });
    }

    results.metadata.totalImages = images.length;
    results.metadata.imagesWithoutAlt = imagesWithoutAlt.length;
  }

  /**
   * Check internal and external links
   */
  checkLinks($, results, baseUrl) {
    const links = $('a[href]');
    const internalLinks = [];
    const externalLinks = [];
    const brokenLinks = [];

    links.each((i, link) => {
      const href = $(link).attr('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

      try {
        const url = new URL(href, baseUrl);
        if (url.hostname === new URL(baseUrl).hostname) {
          internalLinks.push(href);
        } else {
          externalLinks.push(href);
        }
      } catch (e) {
        brokenLinks.push(href);
      }
    });

    if (internalLinks.length < 3) {
      results.issues.push({
        category: 'links',
        severity: 'warning',
        title: 'Few Internal Links',
        description: `Only ${internalLinks.length} internal links found. Internal linking helps SEO.`,
        fix: 'Add more internal links to related pages on your website.'
      });
    } else {
      results.passed.push({
        category: 'links',
        title: `${internalLinks.length} Internal Links Found`
      });
    }

    results.metadata.internalLinks = internalLinks.length;
    results.metadata.externalLinks = externalLinks.length;
  }

  /**
   * Check for schema markup
   */
  checkSchema($, results) {
    const schemaScripts = $('script[type="application/ld+json"]');
    
    if (schemaScripts.length === 0) {
      results.issues.push({
        category: 'schema',
        severity: 'warning',
        title: 'No Schema Markup Found',
        description: 'Schema markup helps search engines understand your content better.',
        fix: 'Add JSON-LD structured data relevant to your page type (Article, Product, etc.).'
      });
    } else {
      results.passed.push({
        category: 'schema',
        title: `${schemaScripts.length} Schema Markup(s) Found`
      });
    }

    results.metadata.schemaCount = schemaScripts.length;
  }

  /**
   * Check canonical tag
   */
  checkCanonical($, results, url) {
    const canonical = $('link[rel="canonical"]').attr('href');
    
    if (!canonical) {
      results.issues.push({
        category: 'technical',
        severity: 'warning',
        title: 'Missing Canonical Tag',
        description: 'Canonical tags help prevent duplicate content issues.',
        fix: `Add a canonical tag pointing to the preferred version of this page.`
      });
    } else {
      results.passed.push({
        category: 'technical',
        title: 'Canonical Tag Present',
        currentValue: canonical
      });
    }
  }

  /**
   * Check Open Graph tags
   */
  checkOpenGraph($, results) {
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogDescription = $('meta[property="og:description"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');

    if (!ogTitle || !ogDescription || !ogImage) {
      results.issues.push({
        category: 'social',
        severity: 'info',
        title: 'Incomplete Open Graph Tags',
        description: 'Open Graph tags improve how your page appears when shared on social media.',
        fix: 'Add og:title, og:description, and og:image meta tags.'
      });
    } else {
      results.passed.push({
        category: 'social',
        title: 'Open Graph Tags Complete'
      });
    }
  }

  /**
   * Check robots meta tag
   */
  checkRobots($, results) {
    const robots = $('meta[name="robots"]').attr('content');
    
    if (robots && (robots.includes('noindex') || robots.includes('nofollow'))) {
      results.issues.push({
        category: 'technical',
        severity: 'critical',
        title: 'Page Blocked from Indexing',
        description: `Robots meta tag contains: ${robots}`,
        currentValue: robots,
        fix: 'Remove noindex/nofollow if you want this page to be indexed by search engines.'
      });
    }
  }

  /**
   * Check structured data
   */
  checkStructuredData($, results) {
    // This is a simplified check - in production, validate against schema.org
    const scripts = $('script[type="application/ld+json"]');
    let hasValidSchema = false;

    scripts.each((i, script) => {
      try {
        const data = JSON.parse($(script).html());
        if (data['@type']) {
          hasValidSchema = true;
        }
      } catch (e) {
        // Invalid JSON
      }
    });

    results.metadata.hasStructuredData = hasValidSchema;
  }

  /**
   * Check page speed factors
   */
  checkPageSpeed(html, results) {
    const htmlSize = Buffer.byteLength(html, 'utf8');
    const sizeKB = htmlSize / 1024;

    if (sizeKB > 500) {
      results.issues.push({
        category: 'performance',
        severity: 'warning',
        title: 'Large HTML Size',
        description: `HTML size is ${sizeKB.toFixed(2)}KB. Large pages load slower.`,
        fix: 'Minify HTML, remove unnecessary code, and optimize resources.'
      });
    }

    results.metadata.htmlSizeKB = sizeKB.toFixed(2);
  }

  /**
   * Check mobile viewport
   */
  checkMobileViewport($, results) {
    const viewport = $('meta[name="viewport"]').attr('content');
    
    if (!viewport) {
      results.issues.push({
        category: 'mobile',
        severity: 'critical',
        title: 'Missing Viewport Meta Tag',
        description: 'Viewport tag is essential for mobile responsiveness.',
        fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">'
      });
    } else {
      results.passed.push({
        category: 'mobile',
        title: 'Viewport Meta Tag Present'
      });
    }
  }

  /**
   * Check content quality
   */
  checkContentQuality($, results) {
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = bodyText.split(' ').length;

    if (wordCount < 300) {
      results.issues.push({
        category: 'content',
        severity: 'warning',
        title: 'Thin Content',
        description: `Page has only ${wordCount} words. Aim for at least 300 words.`,
        fix: 'Add more comprehensive, valuable content to your page.'
      });
    } else {
      results.passed.push({
        category: 'content',
        title: `Good Content Length (${wordCount} words)`
      });
    }

    results.metadata.wordCount = wordCount;
  }

  /**
   * Calculate overall SEO score
   */
  calculateScore(results) {
    const totalChecks = results.issues.length + results.passed.length;
    if (totalChecks === 0) return 0;

    let score = 100;

    // Deduct points based on severity
    results.issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 15;
          break;
        case 'warning':
          score -= 8;
          break;
        case 'info':
          score -= 3;
          break;
      }
    });

    return Math.max(0, Math.min(100, score));
  }
}

module.exports = new SEOScanner();
