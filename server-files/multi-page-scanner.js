// Multi-Page SEO Scanner
// Crawls website and scans multiple pages based on subscription

const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

class MultiPageScanner {
  constructor(maxPages = 100, progressCallback = null) {
    this.maxPages = maxPages;
    this.visitedUrls = new Set();
    this.urlsToVisit = [];
    this.scannedPages = [];
    this.progressCallback = progressCallback;
  }

  /**
   * Crawl website and discover pages
   */
  async crawlWebsite(startUrl) {
    console.log(`🔍 Starting crawl from: ${startUrl}`);
    
    const baseUrl = new URL(startUrl);
    const baseDomain = baseUrl.hostname;
    
    this.urlsToVisit.push(startUrl);
    
    while (this.urlsToVisit.length > 0 && this.visitedUrls.size < this.maxPages) {
      const currentUrl = this.urlsToVisit.shift();
      
      if (this.visitedUrls.has(currentUrl)) continue;
      
      try {
        console.log(`📄 Crawling: ${currentUrl} (${this.visitedUrls.size + 1}/${this.maxPages})`);
        
        const response = await axios.get(currentUrl, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SEOBot/1.0)'
          }
        });
        
        this.visitedUrls.add(currentUrl);
        
        // Report crawling progress
        if (this.progressCallback) {
          this.progressCallback('crawling', this.visitedUrls.size, this.maxPages);
        }
        
        // Parse HTML and find links
        const $ = cheerio.load(response.data);
        const links = this.extractLinks($, currentUrl, baseDomain);
        
        // Add new links to queue
        links.forEach(link => {
          if (!this.visitedUrls.has(link) && !this.urlsToVisit.includes(link)) {
            this.urlsToVisit.push(link);
          }
        });
        
      } catch (error) {
        console.error(`❌ Error crawling ${currentUrl}:`, error.message);
      }
      
      // Small delay to avoid overwhelming the server
      await this.sleep(100);
    }
    
    console.log(`✅ Crawl complete! Found ${this.visitedUrls.size} pages`);
    return Array.from(this.visitedUrls);
  }

  /**
   * Extract links from page
   */
  extractLinks($, currentUrl, baseDomain) {
    const links = [];
    const currentUrlObj = new URL(currentUrl);
    
    $('a[href]').each((i, elem) => {
      try {
        const href = $(elem).attr('href');
        if (!href) return;
        
        // Resolve relative URLs
        const absoluteUrl = new URL(href, currentUrl);
        
        // Only include same domain, http/https, no fragments
        if (
          absoluteUrl.hostname === baseDomain &&
          (absoluteUrl.protocol === 'http:' || absoluteUrl.protocol === 'https:') &&
          !absoluteUrl.hash
        ) {
          // Remove query params for cleaner URLs (optional)
          const cleanUrl = `${absoluteUrl.origin}${absoluteUrl.pathname}`;
          links.push(cleanUrl);
        }
      } catch (error) {
        // Invalid URL, skip
      }
    });
    
    return [...new Set(links)]; // Remove duplicates
  }

  /**
   * Scan multiple pages
   */
  async scanPages(urls, seoScanner) {
    console.log(`\n🔬 Starting SEO scan of ${urls.length} pages...`);
    
    const results = {
      totalPages: urls.length,
      scannedPages: 0,
      failedPages: 0,
      aggregatedIssues: {},
      pageResults: []
    };
    
    for (const url of urls) {
      try {
        console.log(`📊 Scanning: ${url}`);
        
        const scanResult = await seoScanner.scanPage(url);
        
        results.scannedPages++;
        results.pageResults.push({
          url,
          score: scanResult.seoScore,
          issues: scanResult.issues.length,
          passed: scanResult.passed.length
        });
        
        // Aggregate issues by category
        scanResult.issues.forEach(issue => {
          if (!results.aggregatedIssues[issue.category]) {
            results.aggregatedIssues[issue.category] = {
              count: 0,
              severity: issue.severity,
              pages: []
            };
          }
          results.aggregatedIssues[issue.category].count++;
          results.aggregatedIssues[issue.category].pages.push(url);
        });
        
      } catch (error) {
        console.error(`❌ Failed to scan ${url}:`, error.message);
        results.failedPages++;
      }
      
      // Small delay between scans
      await this.sleep(500);
    }
    
    // Calculate overall statistics
    results.averageScore = results.pageResults.reduce((sum, p) => sum + p.score, 0) / results.scannedPages;
    results.totalIssues = Object.values(results.aggregatedIssues).reduce((sum, cat) => sum + cat.count, 0);
    
    console.log(`\n✅ Scan complete!`);
    console.log(`   Pages scanned: ${results.scannedPages}`);
    console.log(`   Average score: ${results.averageScore.toFixed(1)}/100`);
    console.log(`   Total issues: ${results.totalIssues}`);
    
    return results;
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = MultiPageScanner;
