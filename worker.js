// Enhanced Playwright Worker with Google Search and Real Mouse Events
import { chromium, devices } from 'playwright';
import express from 'express';
import EventEmitter from 'events';
import cors from 'cors';

const bus = new EventEmitter();
const app = express();

// Enable CORS for cross-origin requests
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Playwright worker is running' });
});

// Enhanced browser automation with Google Search
app.post('/run', async (req, res) => {
  const { 
    targetUrl, 
    profile = 'Desktop Chrome', 
    maxClicks = 5,
    enableGoogleSearch = true,
    enableNaturalScrolling = true,
    enableInternalNavigation = true,
    sessionId 
  } = req.body;
  
  console.log(`🎬 Starting enhanced Playwright session: ${sessionId}`);
  console.log(`🌐 Target URL: ${targetUrl}`);
  console.log(`🎭 Profile: ${profile}`);
  console.log(`🔍 Google Search: ${enableGoogleSearch ? 'ENABLED' : 'DISABLED'}`);
  console.log(`📜 Natural Scrolling: ${enableNaturalScrolling ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🔗 Internal Navigation: ${enableInternalNavigation ? 'ENABLED' : 'DISABLED'}`);

  // Start automation in background
  (async () => {
    const browser = await chromium.launch({ 
      headless: false, // Keep visible for real browser experience
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--no-default-browser-check'
      ]
    });
    
    try {
      const context = await browser.newContext({ 
        ...devices[profile],
        viewport: devices[profile]?.viewport || { width: 1366, height: 768 },
        userAgent: devices[profile]?.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      const page = await context.newPage();
      
      // Step 1: Google Search (if enabled)
      if (enableGoogleSearch) {
        await performGoogleSearch(page, targetUrl);
      } else {
        // Direct navigation
        bus.emit('log', 'navigating-direct');
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
        bus.emit('log', 'page-loaded');
      }

      // Step 2: Natural scrolling behavior
      if (enableNaturalScrolling) {
        await performNaturalScrolling(page);
      }

      // Step 3: Internal link navigation
      if (enableInternalNavigation) {
        await performInternalNavigation(page, maxClicks);
      }

      bus.emit('done', { 
        ok: true, 
        message: 'Enhanced automation completed successfully',
        features: {
          googleSearch: enableGoogleSearch,
          naturalScrolling: enableNaturalScrolling,
          internalNavigation: enableInternalNavigation
        }
      });
      
    } catch (e) {
      console.error('Enhanced automation error:', e);
      bus.emit('done', { 
        ok: false, 
        error: e.message,
        message: 'Enhanced automation failed'
      });
    } finally {
      await browser.close();
    }
  })();

  res.json({ accepted: true, sessionId });
});

// Perform Google Search before navigating to target
async function performGoogleSearch(page, targetUrl) {
  try {
    bus.emit('log', 'opening-google');
    console.log('🔍 Opening Google...');
    
    // Navigate to Google
    await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Generate search query from target URL
    const searchQuery = generateSearchQuery(targetUrl);
    bus.emit('log', `google-search-query: ${searchQuery}`);
    console.log(`🎯 Search query: "${searchQuery}"`);
    
    // Multiple selectors to try for the search input
    const searchSelectors = [
      'input[name="q"]',
      'input[title="Search"]',
      'textarea[name="q"]',
      '#APjFqb',
      '.gLFyf',
      'input[type="text"]'
    ];
    
    let searchInput = null;
    
    // Try each selector to find the search input
    for (const selector of searchSelectors) {
      try {
        console.log(`🔍 Trying selector: ${selector}`);
        await page.waitForSelector(selector, { timeout: 5000 });
        searchInput = await page.$(selector);
        if (searchInput) {
          console.log(`✅ Found search input with selector: ${selector}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Selector ${selector} not found, trying next...`);
        continue;
      }
    }
    
    if (!searchInput) {
      throw new Error('Could not find Google search input field');
    }
    
    // Clear any existing text and focus
    await searchInput.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    
    bus.emit('log', 'focused-search-input');
    console.log('✅ Focused on search input');
    
    // Type search query with realistic human-like typing
    console.log(`⌨️ Typing: "${searchQuery}"`);
    for (let i = 0; i < searchQuery.length; i++) {
      const char = searchQuery[i];
      await page.keyboard.type(char);
      
      // Random delay between keystrokes (50-200ms)
      const delay = 50 + Math.random() * 150;
      await page.waitForTimeout(delay);
      
      // Emit progress
      if (i % 3 === 0) {
        bus.emit('log', `typing-progress: ${i + 1}/${searchQuery.length}`);
      }
    }
    
    bus.emit('log', 'typed-search-query');
    console.log('✅ Finished typing search query');
    
    // Wait a moment before pressing Enter (simulate reading what was typed)
    await page.waitForTimeout(500 + Math.random() * 1000);
    
    // Submit search with Enter key
    console.log('🔍 Pressing Enter to search...');
    await page.keyboard.press('Enter');
    
    bus.emit('log', 'search-submitted');
    
    // Wait for search results to load
    console.log('⏳ Waiting for search results...');
    
    // Multiple selectors for search results
    const resultSelectors = [
      'div#search',
      '.g',
      '[data-ved]',
      '#rso',
      '.tF2Cxc'
    ];
    
    let resultsLoaded = false;
    for (const selector of resultSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 10000 });
        resultsLoaded = true;
        console.log(`✅ Search results loaded (found: ${selector})`);
        break;
      } catch (error) {
        console.log(`❌ Results selector ${selector} not found, trying next...`);
        continue;
      }
    }
    
    if (!resultsLoaded) {
      console.log('⚠️ Could not confirm search results loaded, continuing anyway...');
    }
    
    bus.emit('log', 'google-search-results-loaded');
    
    // Wait before navigating (simulate reading results)
    const readingTime = 2000 + Math.random() * 3000;
    console.log(`📖 Reading search results for ${Math.round(readingTime/1000)}s...`);
    await page.waitForTimeout(readingTime);
    
    // Navigate to target URL (simulating click on search result)
    bus.emit('log', 'navigating-to-target-from-search');
    console.log(`🎯 Navigating to target: ${targetUrl}`);
    
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    bus.emit('log', 'target-page-loaded-from-search');
    console.log('✅ Target page loaded from search');
    
  } catch (error) {
    console.error('❌ Google search failed, falling back to direct navigation:', error);
    bus.emit('log', `google-search-failed: ${error.message}`);
    bus.emit('log', 'fallback-to-direct-navigation');
    
    try {
      // Fallback to direct navigation
      console.log('🔄 Falling back to direct navigation...');
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
      bus.emit('log', 'page-loaded-direct-fallback');
      console.log('✅ Direct navigation fallback successful');
    } catch (fallbackError) {
      console.error('❌ Direct navigation fallback also failed:', fallbackError);
      throw fallbackError;
    }
  }
}

// Generate realistic search query from target URL
function generateSearchQuery(targetUrl) {
  try {
    const url = new URL(targetUrl);
    const domain = url.hostname.replace('www.', '');
    const siteName = domain.split('.')[0];
    
    const searchPatterns = [
      siteName,
      `${siteName} website`,
      `${siteName} official site`,
      `${siteName}.com`,
      `visit ${siteName}`,
      `${siteName} homepage`,
      `${siteName} official website`,
      `go to ${siteName}`,
      `${siteName} site`
    ];
    
    const selectedQuery = searchPatterns[Math.floor(Math.random() * searchPatterns.length)];
    console.log(`🎯 Generated search query: "${selectedQuery}" for URL: ${targetUrl}`);
    return selectedQuery;
  } catch (error) {
    console.error('Error generating search query:', error);
    return 'website';
  }
}

// Perform natural scrolling with realistic patterns
async function performNaturalScrolling(page) {
  bus.emit('log', 'starting-natural-scrolling');
  console.log('📜 Starting natural scrolling...');
  
  try {
    // Get page height for intelligent scrolling
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    
    console.log(`📏 Page height: ${pageHeight}px, Viewport: ${viewportHeight}px`);
    
    // Scroll down in natural chunks
    const scrollSteps = Math.min(8, Math.ceil(pageHeight / viewportHeight) + 2);
    console.log(`📜 Will perform ${scrollSteps} scroll steps`);
    
    for (let i = 0; i < scrollSteps; i++) {
      // Variable scroll amounts for realism
      const scrollAmount = 200 + Math.random() * 400;
      
      await page.evaluate((amount) => {
        window.scrollBy({ 
          top: amount, 
          behavior: 'smooth' 
        });
      }, scrollAmount);
      
      bus.emit('log', `scrolled-down-step-${i + 1}`);
      console.log(`📜 Scroll step ${i + 1}/${scrollSteps} (${Math.round(scrollAmount)}px)`);
      
      // Natural pause for "reading"
      const readingTime = 800 + Math.random() * 1500;
      await page.waitForTimeout(readingTime);
    }
    
    // Scroll back up partway (natural behavior)
    bus.emit('log', 'scrolling-back-up-naturally');
    console.log('📜 Scrolling back up naturally...');
    
    for (let i = 0; i < Math.ceil(scrollSteps / 3); i++) {
      const scrollUpAmount = 150 + Math.random() * 250;
      
      await page.evaluate((amount) => {
        window.scrollBy({ 
          top: -amount, 
          behavior: 'smooth' 
        });
      }, scrollUpAmount);
      
      await page.waitForTimeout(600 + Math.random() * 1000);
    }
    
    // Final scroll to top
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    bus.emit('log', 'natural-scrolling-completed');
    console.log('✅ Natural scrolling completed');
    
  } catch (error) {
    console.error('❌ Natural scrolling error:', error);
    bus.emit('log', 'natural-scrolling-error');
  }
}

// Perform internal navigation with realistic behavior
async function performInternalNavigation(page, maxClicks) {
  bus.emit('log', 'starting-internal-navigation');
  console.log('🔗 Starting internal navigation...');
  
  try {
    // Find internal links (same-origin only)
    const internalLinks = await page.$$eval('a[href]', (anchors) =>
      anchors
        .map(a => a.getAttribute('href'))
        .filter(href => 
          href && 
          !href.startsWith('http') && 
          !href.startsWith('#') && 
          !href.startsWith('mailto:') &&
          !href.startsWith('tel:') &&
          href !== '/' &&
          href.length > 1
        )
        .slice(0, 10) // Limit to first 10 links
    );
    
    if (internalLinks.length === 0) {
      bus.emit('log', 'no-internal-links-found');
      console.log('ℹ️ No internal links found');
      return;
    }
    
    bus.emit('log', `found-${internalLinks.length}-internal-links`);
    console.log(`🔗 Found ${internalLinks.length} internal links`);
    
    // Visit up to maxClicks internal pages
    const linksToVisit = internalLinks.slice(0, Math.min(maxClicks, internalLinks.length));
    console.log(`🔗 Will visit ${linksToVisit.length} internal pages`);
    
    for (let i = 0; i < linksToVisit.length; i++) {
      const href = linksToVisit[i];
      
      try {
        console.log(`🔗 Visiting internal link ${i + 1}/${linksToVisit.length}: ${href}`);
        
        // Scroll to find the link (realistic behavior)
        await page.evaluate(() => {
          window.scrollBy({ top: Math.random() * 300, behavior: 'smooth' });
        });
        
        await page.waitForTimeout(500 + Math.random() * 1000);
        
        // Click the internal link with realistic delay
        await page.click(`a[href="${href}"]`, { timeout: 10000 });
        
        // Wait for navigation
        await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
        
        bus.emit('log', `clicked-internal-link: ${href}`);
        console.log(`✅ Clicked internal link: ${href}`);
        
        // Brief reading simulation on new page
        const readingTime = 1000 + Math.random() * 2000;
        console.log(`📖 Reading page for ${Math.round(readingTime/1000)}s...`);
        await page.waitForTimeout(readingTime);
        
        // Quick scroll on internal page
        await page.evaluate(() => {
          window.scrollBy({ top: 200 + Math.random() * 300, behavior: 'smooth' });
        });
        
        await page.waitForTimeout(800 + Math.random() * 1200);
        
        // Scroll back up
        await page.evaluate(() => {
          window.scrollBy({ top: -(100 + Math.random() * 200), behavior: 'smooth' });
        });
        
        await page.waitForTimeout(600 + Math.random() * 800);
        
      } catch (error) {
        console.error(`❌ Error clicking internal link ${href}:`, error);
        bus.emit('log', `internal-link-error: ${href}`);
      }
    }
    
    bus.emit('log', `internal-navigation-completed-${linksToVisit.length}-pages`);
    console.log(`✅ Internal navigation completed (${linksToVisit.length} pages visited)`);
    
  } catch (error) {
    console.error('❌ Internal navigation error:', error);
    bus.emit('log', 'internal-navigation-error');
  }
}

// Server-sent events endpoint for real-time updates
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
  
  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${data}\n\n`);
  };
  
  const onLog = (message) => sendEvent('log', message);
  const onDone = (data) => sendEvent('done', JSON.stringify(data));
  
  bus.on('log', onLog);
  bus.on('done', onDone);
  
  // Cleanup on client disconnect
  req.on('close', () => {
    bus.off('log', onLog);
    bus.off('done', onDone);
  });
  
  // Send initial connection confirmation
  sendEvent('connected', 'Playwright worker connected');
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`
🎭 ENHANCED PLAYWRIGHT WORKER RUNNING ON PORT ${PORT}!
═══════════════════════════════════════════════════════

🚀 Features:
   🔍 Google Search Integration (FIXED TYPING)
   📜 Natural Scrolling Patterns  
   🔗 Internal Page Navigation
   🖱️ Real Mouse Events
   👁️ Visible Browser Windows
   ⏱️ Human-like Timing
   ⌨️ Realistic Typing Simulation

📡 Endpoints:
   GET  /health  - Health check
   POST /run     - Start automation
   GET  /events  - Server-sent events

🎯 Ready to receive automation requests!
🔧 Google Search typing issues have been FIXED!
  `);
});