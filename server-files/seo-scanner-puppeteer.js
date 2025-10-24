// server-files/seo-scanner-puppeteer.js
// SEO Page Scanner with Puppeteer - Scans JavaScript-rendered pages

const puppeteer = require('puppeteer');

class SEOScannerPuppeteer {
  constructor() {
    this.browser = null;
  }

  /**
   * Initialize browser
   */
  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
    }
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Main scan function - analyzes a URL for SEO issues (with JavaScript rendering)
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

    let page = null;

    try {
      await this.init();
      
      page = await this.browser.newPage();
      
      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (compatible; OrganiTrafficBot/1.0; +https://organitrafficboost.com)');
      
      // Navigate and wait for network idle (JavaScript rendered)
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait a bit more for any dynamic content
      await page.waitForTimeout(2000);

      // Extract page content after JavaScript execution
      const pageData = await page.evaluate(() => {
        return {
          title: document.title,
          metaDescription: document.querySelector('meta[name="description"]')?.content || null,
          h1: document.querySelector('h1')?.textContent?.trim() || null,
          h1Count: document.querySelectorAll('h1').length,
          h2Count: document.querySelectorAll('h2').length,
          canonical: document.querySelector('link[rel="canonical"]')?.href || null,
          ogTitle: document.querySelector('meta[property="og:title"]')?.content || null,
          ogDescription: document.querySelector('meta[property="og:description"]')?.content || null,
          ogImage: document.querySelector('meta[property="og:image"]')?.content || null,
          viewport: document.querySelector('meta[name="viewport"]')?.content || null,
          robots: document.querySelector('meta[name="robots"]')?.content || null,
          imagesWithoutAlt: Array.from(document.querySelectorAll('img:not([alt])')).length,
          totalImages: document.querySelectorAll('img').length,
          internalLinks: Array.from(document.querySelectorAll('a[href^="/"], a[href^="' + window.location.origin + '"]')).length,
          externalLinks: Array.from(document.querySelectorAll('a[href^="http"]')).filter(a => !a.href.startsWith(window.location.origin)).length,
          brokenLinks: 0, // Would need additional checks
          textContent: document.body?.textContent?.trim() || '',
          wordCount: (document.body?.textContent?.trim() || '').split(/\s+/).length,
          schema: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => s.textContent)
        };
      });

      // Run all checks with the extracted data
      this.checkTitleTag(pageData, results);
      this.checkMetaDescription(pageData, results);
      this.checkHeadings(pageData, results);
      this.checkImages(pageData, results);
      this.checkLinks(pageData, results);
      this.checkSchema(pageData, results);
      this.checkCanonical(pageData, results, url);
      this.checkOpenGraph(pageData, results);
      this.checkRobots(pageData, results);
      this.checkMobileViewport(pageData, results);
      this.checkContentQuality(pageData, results);

      // Calculate overall SEO score
      results.seoScore = this.calculateScore(results);
      results.scanDuration = Date.now() - startTime;

      return results;

    } catch (error) {
      console.error('Puppeteer scan error:', error.message);
      throw new Error(`Failed to scan page: ${error.message}`);
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Check title tag
   */
  checkTitleTag(data, results) {
    const title = data.title?.trim();
    
    if (!title) {
      results.issues.push({
        category: 'title',
        severity: 'critical',
        title: 'Missing Title Tag',
        description: 'Your page is missing a title tag, which is crucial for SEO.',
        currentValue: null,
        elementSelector: 'title'
      });
    } else if (title.length < 30) {
      results.issues.push({
        category: 'title',
        severity: 'warning',
        title: 'Title Too Short',
        description: 'Your title tag is too short. Aim for 50-60 characters.',
        currentValue: title,
        elementSelector: 'title'
      });
    } else if (title.length > 60) {
      results.issues.push({
        category: 'title',
        severity: 'warning',
        title: 'Title Too Long',
        description: 'Your title tag may be truncated in search results.',
        currentValue: title,
        elementSelector: 'title'
      });
    } else {
      results.passed.push({
        category: 'title',
        title: 'Title Tag Optimized',
        value: title
      });
    }
  }

  /**
   * Check meta description
   */
  checkMetaDescription(data, results) {
    const description = data.metaDescription?.trim();
    
    if (!description) {
      results.issues.push({
        category: 'meta',
        severity: 'critical',
        title: 'Missing Meta Description',
        description: 'Your page is missing a meta description, which affects click-through rates.',
        currentValue: null,
        elementSelector: 'meta[name="description"]'
      });
    } else if (description.length < 120) {
      results.issues.push({
        category: 'meta',
        severity: 'warning',
        title: 'Meta Description Too Short',
        description: 'Your meta description is too short. Aim for 150-160 characters.',
        currentValue: description,
        elementSelector: 'meta[name="description"]'
      });
    } else if (description.length > 160) {
      results.issues.push({
        category: 'meta',
        severity: 'warning',
        title: 'Meta Description Too Long',
        description: 'Your meta description may be truncated in search results.',
        currentValue: description,
        elementSelector: 'meta[name="description"]'
      });
    } else {
      results.passed.push({
        category: 'meta',
        title: 'Meta Description Optimized',
        value: description
      });
    }
  }

  /**
   * Check headings
   */
  checkHeadings(data, results) {
    if (!data.h1) {
      results.issues.push({
        category: 'headings',
        severity: 'critical',
        title: 'Missing H1 Heading',
        description: 'Your page is missing an H1 heading, which is important for SEO structure.',
        currentValue: null,
        elementSelector: 'h1'
      });
    } else if (data.h1Count > 1) {
      results.issues.push({
        category: 'headings',
        severity: 'warning',
        title: 'Multiple H1 Tags',
        description: 'Your page has multiple H1 tags. Use only one H1 per page.',
        currentValue: `${data.h1Count} H1 tags found`,
        elementSelector: 'h1'
      });
    } else {
      results.passed.push({
        category: 'headings',
        title: 'H1 Tag Present',
        value: data.h1
      });
    }

    if (data.h2Count === 0) {
      results.issues.push({
        category: 'headings',
        severity: 'warning',
        title: 'No H2 Headings',
        description: 'Consider adding H2 headings to improve content structure.',
        currentValue: null,
        elementSelector: 'h2'
      });
    }
  }

  /**
   * Check images
   */
  checkImages(data, results) {
    if (data.imagesWithoutAlt > 0) {
      results.issues.push({
        category: 'images',
        severity: 'warning',
        title: 'Images Missing Alt Text',
        description: `${data.imagesWithoutAlt} image(s) are missing alt text for accessibility and SEO.`,
        currentValue: `${data.imagesWithoutAlt} of ${data.totalImages} images`,
        elementSelector: 'img:not([alt])'
      });
    } else if (data.totalImages > 0) {
      results.passed.push({
        category: 'images',
        title: 'All Images Have Alt Text',
        value: `${data.totalImages} images`
      });
    }
  }

  /**
   * Check links
   */
  checkLinks(data, results) {
    if (data.internalLinks === 0) {
      results.issues.push({
        category: 'links',
        severity: 'warning',
        title: 'No Internal Links',
        description: 'Add internal links to improve site navigation and SEO.',
        currentValue: null,
        elementSelector: 'a'
      });
    } else {
      results.passed.push({
        category: 'links',
        title: 'Internal Links Present',
        value: `${data.internalLinks} internal links`
      });
    }
  }

  /**
   * Check schema markup
   */
  checkSchema(data, results) {
    if (!data.schema || data.schema.length === 0) {
      results.issues.push({
        category: 'schema',
        severity: 'warning',
        title: 'No Schema Markup',
        description: 'Add structured data (Schema.org) to enhance search appearance.',
        currentValue: null,
        elementSelector: 'script[type="application/ld+json"]'
      });
    } else {
      results.passed.push({
        category: 'schema',
        title: 'Schema Markup Present',
        value: `${data.schema.length} schema(s)`
      });
    }
  }

  /**
   * Check canonical tag
   */
  checkCanonical(data, results, url) {
    if (!data.canonical) {
      results.issues.push({
        category: 'technical',
        severity: 'warning',
        title: 'Missing Canonical Tag',
        description: 'Canonical tags help prevent duplicate content issues.',
        currentValue: null,
        elementSelector: 'link[rel="canonical"]'
      });
    } else {
      results.passed.push({
        category: 'technical',
        title: 'Canonical Tag Present',
        value: data.canonical
      });
    }
  }

  /**
   * Check Open Graph tags
   */
  checkOpenGraph(data, results) {
    if (!data.ogTitle || !data.ogDescription) {
      results.issues.push({
        category: 'social',
        severity: 'warning',
        title: 'Incomplete Open Graph Tags',
        description: 'Add Open Graph tags for better social media sharing.',
        currentValue: null,
        elementSelector: 'meta[property^="og:"]'
      });
    } else {
      results.passed.push({
        category: 'social',
        title: 'Open Graph Tags Present',
        value: 'OG tags configured'
      });
    }
  }

  /**
   * Check robots meta tag
   */
  checkRobots(data, results) {
    if (data.robots && (data.robots.includes('noindex') || data.robots.includes('nofollow'))) {
      results.issues.push({
        category: 'technical',
        severity: 'critical',
        title: 'Page Blocked from Indexing',
        description: 'Your page has robots meta tag that prevents search engine indexing.',
        currentValue: data.robots,
        elementSelector: 'meta[name="robots"]'
      });
    }
  }

  /**
   * Check mobile viewport
   */
  checkMobileViewport(data, results) {
    if (!data.viewport) {
      results.issues.push({
        category: 'mobile',
        severity: 'critical',
        title: 'Missing Viewport Meta Tag',
        description: 'Add a viewport meta tag for mobile responsiveness.',
        currentValue: null,
        elementSelector: 'meta[name="viewport"]'
      });
    } else {
      results.passed.push({
        category: 'mobile',
        title: 'Viewport Meta Tag Present',
        value: data.viewport
      });
    }
  }

  /**
   * Check content quality
   */
  checkContentQuality(data, results) {
    if (data.wordCount < 300) {
      results.issues.push({
        category: 'content',
        severity: 'warning',
        title: 'Thin Content',
        description: 'Your page has less than 300 words. Add more quality content.',
        currentValue: `${data.wordCount} words`,
        elementSelector: 'body'
      });
    } else {
      results.passed.push({
        category: 'content',
        title: 'Adequate Content Length',
        value: `${data.wordCount} words`
      });
    }
  }

  /**
   * Calculate overall SEO score
   */
  calculateScore(results) {
    const totalChecks = results.issues.length + results.passed.length;
    if (totalChecks === 0) return 0;

    const criticalIssues = results.issues.filter(i => i.severity === 'critical').length;
    const warnings = results.issues.filter(i => i.severity === 'warning').length;
    const passed = results.passed.length;

    // Scoring: Critical issues -15 points, warnings -5 points, passed +10 points
    let score = 50; // Base score
    score -= criticalIssues * 15;
    score -= warnings * 5;
    score += passed * 5;

    return Math.max(0, Math.min(100, score));
  }
}

module.exports = new SEOScannerPuppeteer();
