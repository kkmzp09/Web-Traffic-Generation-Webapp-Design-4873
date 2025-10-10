// Standalone Playwright Traffic Simulator (Node.js only)
// This file is separate from the browser build and only runs in Node.js

import { chromium } from 'playwright';

const DEFAULT_URL = 'https://jobmakers.in/';

// User profiles for realistic behavior simulation
const USER_PROFILES = {
  efficient: {
    name: 'Efficient User',
    scrollSpeed: 1500,
    readingTime: 2000,
    pageStayTime: 8000,
    clickProbability: 0.3,
    viewport: { width: 1920, height: 1080 }
  },
  casual: {
    name: 'Casual Browser',
    scrollSpeed: 800,
    readingTime: 5000,
    pageStayTime: 15000,
    clickProbability: 0.6,
    viewport: { width: 1366, height: 768 }
  },
  mobile: {
    name: 'Mobile User',
    scrollSpeed: 600,
    readingTime: 3000,
    pageStayTime: 12000,
    clickProbability: 0.4,
    viewport: { width: 375, height: 812 },
    isMobile: true
  },
  researcher: {
    name: 'Research User',
    scrollSpeed: 400,
    readingTime: 8000,
    pageStayTime: 25000,
    clickProbability: 0.8,
    viewport: { width: 1440, height: 900 }
  }
};

class StandalonePlaywrightSimulator {
  constructor() {
    this.activeSessions = new Map();
    this.sessionStats = new Map();
  }

  // Simulate a realistic user visit
  async simulateVisit(profileName, url = DEFAULT_URL, options = {}) {
    const profile = USER_PROFILES[profileName];
    if (!profile) {
      throw new Error(`Unknown profile: ${profileName}`);
    }

    const sessionId = `${profileName}_${Date.now()}`;
    console.log(`🚀 Starting ${profile.name} session: ${sessionId}`);

    let browser = null;
    let context = null;
    let page = null;

    try {
      // Launch browser with realistic settings
      browser = await chromium.launch({
        headless: options.headless !== false,
        args: [
          '--no-first-run',
          '--disable-blink-features=AutomationControlled',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });

      // Create context with realistic settings
      const contextOptions = {
        viewport: profile.viewport,
        locale: options.locale || 'en-US',
        timezoneId: options.timezone || 'America/New_York',
        userAgent: this.generateRealisticUserAgent(profile),
        extraHTTPHeaders: {
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1'
        }
      };

      if (profile.isMobile) {
        contextOptions.isMobile = true;
        contextOptions.hasTouch = true;
      }

      context = await browser.newContext(contextOptions);
      page = await context.newPage();

      // Set up session tracking
      const sessionStats = {
        sessionId,
        profile: profileName,
        startTime: Date.now(),
        url,
        pageViews: 0,
        scrollActions: 0,
        clickActions: 0,
        timeOnSite: 0,
        errors: []
      };

      this.sessionStats.set(sessionId, sessionStats);
      this.activeSessions.set(sessionId, { browser, context, page, profile });

      // Execute the browsing simulation
      await this.executeBrowsingSession(page, profile, url, sessionStats, options);

      // Calculate final stats
      sessionStats.timeOnSite = Date.now() - sessionStats.startTime;
      
      console.log(`✅ Completed ${profile.name} session:`);
      console.log(`   📊 Pages viewed: ${sessionStats.pageViews}`);
      console.log(`   📜 Scroll actions: ${sessionStats.scrollActions}`);
      console.log(`   🖱️ Click actions: ${sessionStats.clickActions}`);
      console.log(`   ⏱️ Time on site: ${Math.round(sessionStats.timeOnSite / 1000)}s`);

      return sessionStats;

    } catch (error) {
      console.error(`❌ Error in ${profile.name} session:`, error.message);
      if (this.sessionStats.has(sessionId)) {
        this.sessionStats.get(sessionId).errors.push(error.message);
      }
      throw error;
    } finally {
      // Cleanup
      try {
        if (page) await page.close();
        if (context) await context.close();
        if (browser) await browser.close();
      } catch (closeError) {
        console.warn('Error during cleanup:', closeError.message);
      }
      
      this.activeSessions.delete(sessionId);
    }
  }

  // Execute comprehensive browsing session
  async executeBrowsingSession(page, profile, url, sessionStats, options) {
    // Phase 1: Initial page load
    console.log(`📱 Loading initial page: ${url}`);
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    sessionStats.pageViews++;
    
    // Wait for page to fully render
    await this.randomDelay(1000, 3000);

    // Phase 2: Realistic scrolling behavior
    await this.simulateRealisticScrolling(page, profile, sessionStats);
    
    // Phase 3: Content interaction
    await this.simulateContentInteraction(page, profile, sessionStats);
    
    // Phase 4: Navigation simulation
    if (options.multiPage !== false) {
      await this.simulateNavigation(page, profile, sessionStats, options);
    }
    
    // Phase 5: Final page interaction
    await this.simulateFinalInteraction(page, profile, sessionStats);
  }

  // Simulate realistic scrolling patterns
  async simulateRealisticScrolling(page, profile, sessionStats) {
    console.log(`📜 Simulating ${profile.name} scrolling behavior`);
    
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    
    if (pageHeight <= viewportHeight) {
      console.log('   Page is too short for scrolling');
      return;
    }

    const scrollSessions = Math.floor(Math.random() * 3) + 2; // 2-4 scroll sessions
    
    for (let session = 0; session < scrollSessions; session++) {
      const scrollDistance = Math.random() * 800 + 200; // 200-1000px
      const scrollDuration = profile.scrollSpeed + (Math.random() * 500);
      
      // Smooth scroll
      await page.evaluate(async (distance, duration) => {
        const start = window.pageYOffset;
        const startTime = performance.now();
        
        const animateScroll = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function for natural scroll
          const easeOutCubic = 1 - Math.pow(1 - progress, 3);
          const currentPosition = start + (distance * easeOutCubic);
          
          window.scrollTo(0, currentPosition);
          
          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          }
        };
        
        requestAnimationFrame(animateScroll);
        
        // Wait for animation to complete
        await new Promise(resolve => setTimeout(resolve, duration));
      }, scrollDistance, scrollDuration);
      
      sessionStats.scrollActions++;
      
      // Reading time after scroll
      await this.randomDelay(profile.readingTime * 0.5, profile.readingTime * 1.5);
      
      console.log(`   📜 Scroll action ${session + 1}/${scrollSessions} completed`);
    }
  }

  // Simulate content interaction
  async simulateContentInteraction(page, profile, sessionStats) {
    console.log(`🖱️ Simulating ${profile.name} content interaction`);
    
    try {
      // Find interactive elements
      const interactiveElements = await page.evaluate(() => {
        const elements = [];
        
        // Find links
        document.querySelectorAll('a[href]').forEach((el, index) => {
          if (el.offsetParent !== null && index < 10) { // Visible elements only, limit to 10
            elements.push({
              type: 'link',
              selector: `a:nth-of-type(${index + 1})`,
              text: el.textContent.trim().substring(0, 50)
            });
          }
        });
        
        // Find buttons
        document.querySelectorAll('button, input[type="button"], input[type="submit"]').forEach((el, index) => {
          if (el.offsetParent !== null && index < 5) { // Visible elements only, limit to 5
            elements.push({
              type: 'button',
              selector: `button:nth-of-type(${index + 1})`,
              text: el.textContent.trim().substring(0, 50)
            });
          }
        });
        
        return elements;
      });
      
      // Interact with some elements based on profile
      const interactionCount = Math.floor(interactiveElements.length * profile.clickProbability);
      const selectedElements = this.shuffleArray(interactiveElements).slice(0, interactionCount);
      
      for (const element of selectedElements) {
        try {
          console.log(`   🖱️ Clicking ${element.type}: "${element.text}"`);
          
          // Scroll element into view first
          await page.evaluate((selector) => {
            const el = document.querySelector(selector);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, element.selector);
          
          await this.randomDelay(500, 1500);
          
          // Hover before click (more realistic)
          await page.hover(element.selector);
          await this.randomDelay(200, 800);
          
          // Click with realistic timing
          await page.click(element.selector, { delay: Math.random() * 100 + 50 });
          
          sessionStats.clickActions++;
          
          // Wait for potential navigation or modal
          await this.randomDelay(1000, 3000);
          
        } catch (clickError) {
          console.warn(`   ⚠️ Could not click element: ${clickError.message}`);
        }
      }
      
    } catch (error) {
      console.warn(`⚠️ Error during content interaction: ${error.message}`);
    }
  }

  // Simulate navigation to other pages
  async simulateNavigation(page, profile, sessionStats, options) {
    if (Math.random() > 0.6) { // 60% chance to navigate
      console.log(`🔗 Simulating ${profile.name} navigation`);
      
      try {
        const currentUrl = page.url();
        const baseUrl = new URL(currentUrl).origin;
        
        // Find internal links
        const internalLinks = await page.evaluate((base) => {
          const links = [];
          document.querySelectorAll('a[href]').forEach((el, index) => {
            const href = el.getAttribute('href');
            if (href && (href.startsWith('/') || href.startsWith(base)) && index < 10) {
              links.push({
                href: href.startsWith('/') ? base + href : href,
                text: el.textContent.trim().substring(0, 50)
              });
            }
          });
          return links;
        }, baseUrl);
        
        if (internalLinks.length > 0) {
          const randomLink = internalLinks[Math.floor(Math.random() * internalLinks.length)];
          console.log(`   🔗 Navigating to: "${randomLink.text}"`);
          
          await page.goto(randomLink.href, { 
            waitUntil: 'networkidle',
            timeout: 20000 
          });
          
          sessionStats.pageViews++;
          
          // Spend time on the new page
          await this.randomDelay(profile.pageStayTime * 0.5, profile.pageStayTime);
          
          // Quick scroll on new page
          await this.simulateQuickScroll(page, profile, sessionStats);
        }
        
      } catch (navError) {
        console.warn(`⚠️ Navigation error: ${navError.message}`);
      }
    }
  }

  // Quick scroll simulation for secondary pages
  async simulateQuickScroll(page, profile, sessionStats) {
    try {
      const scrollDistance = Math.random() * 500 + 300;
      await page.evaluate((distance) => {
        window.scrollBy(0, distance);
      }, scrollDistance);
      
      sessionStats.scrollActions++;
      await this.randomDelay(1000, 3000);
      
    } catch (error) {
      console.warn(`⚠️ Quick scroll error: ${error.message}`);
    }
  }

  // Final interaction before leaving
  async simulateFinalInteraction(page, profile, sessionStats) {
    console.log(`⏱️ Final interaction phase for ${profile.name}`);
    
    // Final scroll to top or bottom
    if (Math.random() > 0.5) {
      await page.evaluate(() => window.scrollTo(0, 0)); // Scroll to top
    } else {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); // Scroll to bottom
    }
    
    sessionStats.scrollActions++;
    
    // Final wait time
    await this.randomDelay(profile.pageStayTime * 0.3, profile.pageStayTime * 0.7);
  }

  // Generate realistic user agent
  generateRealisticUserAgent(profile) {
    const userAgents = {
      desktop: [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ],
      mobile: [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
      ]
    };
    
    const agentType = profile.isMobile ? 'mobile' : 'desktop';
    const agents = userAgents[agentType];
    return agents[Math.floor(Math.random() * agents.length)];
  }

  // Utility functions
  async randomDelay(min, max) {
    const delay = Math.random() * (max - min) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Get session statistics
  getSessionStats(sessionId) {
    return this.sessionStats.get(sessionId);
  }

  // Get all session statistics
  getAllSessionStats() {
    return Array.from(this.sessionStats.values());
  }
}

// Command line interface
async function main() {
  const simulator = new StandalonePlaywrightSimulator();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const url = args.find(arg => arg.startsWith('--url='))?.split('=')[1] || DEFAULT_URL;
  const profiles = args.find(arg => arg.startsWith('--profiles='))?.split('=')[1]?.split(',') || ['efficient', 'casual', 'mobile', 'researcher'];
  const concurrent = args.includes('--concurrent');
  const headless = !args.includes('--headed');
  const multiPage = !args.includes('--single-page');
  
  console.log(`🎯 Target URL: ${url}`);
  console.log(`👥 User Profiles: ${profiles.join(', ')}`);
  console.log(`🔄 Mode: ${concurrent ? 'Concurrent' : 'Sequential'}`);
  console.log(`👁️ Browser: ${headless ? 'Headless' : 'Headed'}`);
  console.log(`📄 Pages: ${multiPage ? 'Multi-page' : 'Single-page'}`);
  console.log('');

  const startTime = Date.now();
  
  try {
    if (concurrent) {
      // Run all profiles concurrently
      const promises = profiles.map(profile => 
        simulator.simulateVisit(profile, url, { headless, multiPage })
      );
      
      await Promise.all(promises);
    } else {
      // Run profiles sequentially
      for (const profile of profiles) {
        await simulator.simulateVisit(profile, url, { headless, multiPage });
        await simulator.randomDelay(2000, 5000); // Delay between sessions
      }
    }
    
    const totalTime = Date.now() - startTime;
    const allStats = simulator.getAllSessionStats();
    
    console.log('\n📊 SIMULATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`⏱️ Total execution time: ${Math.round(totalTime / 1000)}s`);
    console.log(`📱 Sessions completed: ${allStats.length}`);
    console.log(`📊 Total page views: ${allStats.reduce((sum, stat) => sum + stat.pageViews, 0)}`);
    console.log(`🖱️ Total click actions: ${allStats.reduce((sum, stat) => sum + stat.clickActions, 0)}`);
    console.log(`📜 Total scroll actions: ${allStats.reduce((sum, stat) => sum + stat.scrollActions, 0)}`);
    console.log(`⏱️ Average session time: ${Math.round(allStats.reduce((sum, stat) => sum + stat.timeOnSite, 0) / allStats.length / 1000)}s`);
    
    console.log('\n✅ Traffic simulation completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Simulation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { StandalonePlaywrightSimulator, USER_PROFILES };