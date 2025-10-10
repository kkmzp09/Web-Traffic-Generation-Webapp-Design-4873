// Natural Browsing Behavior System
// Simulates realistic user interactions with smooth scrolling, natural timing, and human-like patterns

class NaturalBrowsingBehavior {
  constructor() {
    this.behaviorProfiles = new Map();
    this.activeAnimations = new Map();
    this.behaviorPatterns = this.initializeBehaviorPatterns();
  }

  // Initialize different user behavior patterns
  initializeBehaviorPatterns() {
    return {
      // Fast, efficient user - knows what they want
      efficient: {
        scrollSpeed: { min: 800, max: 1200 },
        pauseDuration: { min: 1500, max: 3000 },
        readingTime: { min: 2000, max: 5000 },
        actionInterval: { min: 2000, max: 4000 },
        scrollDirection: 'top-to-bottom',
        linkClickChance: 0.8,
        backTrackChance: 0.2,
        searchBehavior: 'focused',
        sessionDuration: { min: 60000, max: 180000 }, // 1-3 minutes
        pagesPerSession: { min: 3, max: 6 }
      },

      // Casual browser - takes time to explore
      casual: {
        scrollSpeed: { min: 300, max: 600 },
        pauseDuration: { min: 3000, max: 8000 },
        readingTime: { min: 5000, max: 12000 },
        actionInterval: { min: 5000, max: 10000 },
        scrollDirection: 'mixed',
        linkClickChance: 0.6,
        backTrackChance: 0.4,
        searchBehavior: 'exploratory',
        sessionDuration: { min: 180000, max: 600000 }, // 3-10 minutes
        pagesPerSession: { min: 5, max: 12 }
      },

      // Mobile user - quick swipes and taps
      mobile: {
        scrollSpeed: { min: 400, max: 800 },
        pauseDuration: { min: 1000, max: 3000 },
        readingTime: { min: 1500, max: 4000 },
        actionInterval: { min: 1500, max: 3000 },
        scrollDirection: 'top-to-bottom',
        linkClickChance: 0.7,
        backTrackChance: 0.3,
        searchBehavior: 'quick',
        sessionDuration: { min: 30000, max: 120000 }, // 30s-2min
        pagesPerSession: { min: 2, max: 5 }
      },

      // Research mode - thorough and methodical
      researcher: {
        scrollSpeed: { min: 200, max: 400 },
        pauseDuration: { min: 5000, max: 15000 },
        readingTime: { min: 8000, max: 20000 },
        actionInterval: { min: 8000, max: 15000 },
        scrollDirection: 'mixed',
        linkClickChance: 0.9,
        backTrackChance: 0.6,
        searchBehavior: 'thorough',
        sessionDuration: { min: 300000, max: 1200000 }, // 5-20 minutes
        pagesPerSession: { min: 8, max: 20 }
      }
    };
  }

  // Create a natural browsing session for a specific user type
  async createBrowsingSession(sessionId, userType = 'casual', targetUrl, deviceType = 'desktop') {
    const pattern = this.behaviorPatterns[userType] || this.behaviorPatterns.casual;
    const session = {
      id: sessionId,
      userType,
      deviceType,
      targetUrl,
      pattern,
      startTime: Date.now(),
      currentPage: targetUrl,
      visitedPages: [targetUrl],
      currentScrollPosition: 0,
      isActive: false,
      phase: 'initial_load',
      stats: {
        totalScrolls: 0,
        totalClicks: 0,
        totalReads: 0,
        totalNavigations: 0,
        timeOnPages: []
      },
      behaviorState: {
        hasReadMainContent: false,
        hasScrolledToBottom: false,
        hasScrolledToTop: true,
        interestLevel: Math.random(), // 0-1, affects engagement
        attentionSpan: this.randomInRange(pattern.sessionDuration),
        currentFocus: 'page-top'
      }
    };

    this.behaviorProfiles.set(sessionId, session);
    console.log(`🎭 Created ${userType} browsing session for ${deviceType}`);
    return session;
  }

  // Start natural browsing behavior
  async startNaturalBrowsing(sessionId, onStatusUpdate, onActivityUpdate) {
    const session = this.behaviorProfiles.get(sessionId);
    if (!session) {
      console.error(`Session ${sessionId} not found`);
      return;
    }

    session.isActive = true;
    session.onStatusUpdate = onStatusUpdate;
    session.onActivityUpdate = onActivityUpdate;

    console.log(`🚀 Starting natural browsing for session ${sessionId}`);
    await this.executeNaturalBehaviorCycle(session);
  }

  // Execute the main behavior cycle
  async executeNaturalBehaviorCycle(session) {
    if (!session.isActive) return;

    try {
      switch (session.phase) {
        case 'initial_load':
          await this.handleInitialPageLoad(session);
          break;
        
        case 'scan_content':
          await this.handleContentScanning(session);
          break;
        
        case 'read_content':
          await this.handleContentReading(session);
          break;
        
        case 'scroll_explore':
          await this.handleScrollExploration(session);
          break;
        
        case 'find_interest':
          await this.handleInterestDiscovery(session);
          break;
        
        case 'navigate_page':
          await this.handlePageNavigation(session);
          break;
        
        case 'session_end':
          await this.handleSessionEnd(session);
          return;
        
        default:
          session.phase = 'scan_content';
      }

      // Schedule next behavior cycle
      const nextDelay = this.calculateNextActionDelay(session);
      setTimeout(() => this.executeNaturalBehaviorCycle(session), nextDelay);

    } catch (error) {
      console.error('Error in behavior cycle:', error);
      session.phase = 'session_end';
    }
  }

  // Handle initial page load behavior
  async handleInitialPageLoad(session) {
    session.onStatusUpdate?.(`Loading page...`);
    session.onActivityUpdate?.('loading');

    // Simulate page load time
    const loadTime = this.randomInRange({ min: 1000, max: 3000 });
    await this.delay(loadTime);

    // Initial scan of the page
    session.onStatusUpdate?.(`Scanning page content...`);
    session.onActivityUpdate?.('scanning');

    // Quick initial scroll to see page length
    await this.smoothScrollTo(session, 0.1, 800); // Scroll to 10% quickly
    await this.delay(500);
    await this.smoothScrollTo(session, 0, 600); // Scroll back to top

    session.phase = 'scan_content';
    session.behaviorState.currentFocus = 'page-top';
  }

  // Handle content scanning behavior
  async handleContentScanning(session) {
    session.onStatusUpdate?.(`Scanning page content...`);
    session.onActivityUpdate?.('scanning');

    // Perform scanning scrolls - quick movements to gauge content
    const scanScrolls = 3 + Math.floor(Math.random() * 3); // 3-5 scan scrolls
    
    for (let i = 0; i < scanScrolls; i++) {
      const targetPosition = (i + 1) * (0.8 / scanScrolls); // Scan to 80% of page
      await this.smoothScrollTo(session, targetPosition, 600);
      await this.delay(this.randomInRange({ min: 800, max: 1500 }));
    }

    // Decide if content is interesting
    const contentInterest = Math.random();
    session.behaviorState.interestLevel = contentInterest;

    if (contentInterest > 0.3) {
      // Content seems interesting, scroll back to top to read properly
      await this.smoothScrollTo(session, 0, 800);
      session.phase = 'read_content';
    } else {
      // Not very interesting, might leave or try to find something better
      if (Math.random() > 0.6) {
        session.phase = 'find_interest';
      } else {
        session.phase = 'navigate_page';
      }
    }
  }

  // Handle content reading behavior
  async handleContentReading(session) {
    session.onStatusUpdate?.(`Reading content...`);
    session.onActivityUpdate?.('reading');

    const readingTime = this.randomInRange(session.pattern.readingTime);
    const scrollSegments = 5 + Math.floor(Math.random() * 5); // 5-9 reading segments
    
    // Read in segments, scrolling slowly and pausing
    for (let i = 0; i < scrollSegments; i++) {
      // Scroll to next reading position
      const targetPosition = (i + 1) * (0.7 / scrollSegments);
      await this.smoothScrollTo(session, targetPosition, this.randomInRange({ min: 300, max: 500 }));
      
      // Pause to read
      const readPause = readingTime / scrollSegments;
      await this.delay(readPause);
      
      // Occasionally scroll back up to re-read something
      if (Math.random() > 0.8) {
        const backScrollPos = Math.max(0, targetPosition - 0.1);
        await this.smoothScrollTo(session, backScrollPos, 400);
        await this.delay(this.randomInRange({ min: 1000, max: 2000 }));
        await this.smoothScrollTo(session, targetPosition, 400);
      }
    }

    session.behaviorState.hasReadMainContent = true;
    session.stats.totalReads++;
    session.phase = 'scroll_explore';
  }

  // Handle scroll exploration behavior
  async handleScrollExploration(session) {
    session.onStatusUpdate?.(`Exploring page content...`);
    session.onActivityUpdate?.('scrolling_down');

    // Continue scrolling to see more content
    const explorationScrolls = 3 + Math.floor(Math.random() * 4); // 3-6 exploration scrolls
    
    for (let i = 0; i < explorationScrolls; i++) {
      const currentPos = session.currentScrollPosition;
      const scrollDistance = 0.15 + Math.random() * 0.2; // 15-35% scroll increments
      const targetPosition = Math.min(1.0, currentPos + scrollDistance);
      
      await this.smoothScrollTo(session, targetPosition, this.randomInRange(session.pattern.scrollSpeed));
      
      // Pause to look at content
      const pauseTime = this.randomInRange(session.pattern.pauseDuration);
      await this.delay(pauseTime);
      
      // Sometimes scroll back up to see something again
      if (Math.random() > 0.7) {
        const backPos = Math.max(0, targetPosition - 0.1);
        await this.smoothScrollTo(session, backPos, 500);
        await this.delay(1000);
        await this.smoothScrollTo(session, targetPosition, 500);
      }
    }

    if (session.currentScrollPosition >= 0.9) {
      session.behaviorState.hasScrolledToBottom = true;
    }

    session.stats.totalScrolls += explorationScrolls;
    
    // Decide next action based on interest and scroll position
    if (session.behaviorState.hasScrolledToBottom && Math.random() > 0.4) {
      session.phase = 'find_interest';
    } else if (Math.random() > 0.6) {
      session.phase = 'navigate_page';
    } else {
      session.phase = 'find_interest';
    }
  }

  // Handle interest discovery behavior
  async handleInterestDiscovery(session) {
    session.onStatusUpdate?.(`Looking for interesting content...`);
    session.onActivityUpdate?.('searching');

    // Simulate looking for links, buttons, or interesting sections
    const searchActions = 2 + Math.floor(Math.random() * 3); // 2-4 search actions
    
    for (let i = 0; i < searchActions; i++) {
      // Scroll to random positions looking for interesting content
      const searchPosition = Math.random() * 0.8; // Search in top 80% of page
      await this.smoothScrollTo(session, searchPosition, 700);
      
      // Pause as if evaluating content
      await this.delay(this.randomInRange({ min: 1500, max: 3000 }));
      
      // Simulate mouse movement over interesting elements
      await this.simulateElementHover(session);
    }

    // Decide if something interesting was found
    if (Math.random() > 0.5) {
      session.phase = 'navigate_page';
    } else {
      // Nothing interesting, might leave or continue exploring
      if (Math.random() > 0.7) {
        session.phase = 'session_end';
      } else {
        session.phase = 'scroll_explore';
      }
    }
  }

  // Handle page navigation behavior
  async handlePageNavigation(session) {
    session.onStatusUpdate?.(`Navigating to new content...`);
    session.onActivityUpdate?.('clicking');

    // Simulate clicking on a link or button
    await this.simulateElementClick(session);
    
    // Decide whether to navigate to a new page or stay
    const shouldNavigate = Math.random() < session.pattern.linkClickChance;
    
    if (shouldNavigate && session.visitedPages.length < session.pattern.pagesPerSession.max) {
      // Navigate to new page
      const newPage = this.generateNextPageUrl(session.targetUrl);
      session.currentPage = newPage;
      session.visitedPages.push(newPage);
      session.currentScrollPosition = 0;
      session.behaviorState = {
        ...session.behaviorState,
        hasReadMainContent: false,
        hasScrolledToBottom: false,
        hasScrolledToTop: true,
        currentFocus: 'page-top'
      };
      
      session.stats.totalNavigations++;
      session.phase = 'initial_load';
      
      console.log(`📄 Navigated to: ${newPage}`);
    } else {
      // Stay on current page, continue exploring
      session.phase = 'scroll_explore';
    }
  }

  // Handle session end
  async handleSessionEnd(session) {
    session.onStatusUpdate?.(`Session completed`);
    session.onActivityUpdate?.('idle');
    session.isActive = false;
    
    const sessionDuration = Date.now() - session.startTime;
    console.log(`✅ Natural browsing session completed:
      - Duration: ${Math.floor(sessionDuration / 1000)}s
      - Pages visited: ${session.visitedPages.length}
      - Total scrolls: ${session.stats.totalScrolls}
      - Total clicks: ${session.stats.totalClicks}
      - Total reads: ${session.stats.totalReads}`);
  }

  // Smooth scrolling animation
  async smoothScrollTo(session, targetPosition, duration = 500) {
    return new Promise((resolve) => {
      const startPosition = session.currentScrollPosition;
      const distance = targetPosition - startPosition;
      const startTime = Date.now();
      
      const animationId = `scroll_${session.id}_${Date.now()}`;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for natural movement
        const easeProgress = this.easeInOutCubic(progress);
        const currentPosition = startPosition + (distance * easeProgress);
        
        session.currentScrollPosition = currentPosition;
        
        // Notify about scroll position change
        session.onActivityUpdate?.('scrolling', {
          position: currentPosition,
          direction: distance > 0 ? 'down' : 'up'
        });
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }

  // Simulate hovering over elements
  async simulateElementHover(session) {
    session.onActivityUpdate?.('hovering');
    
    // Simulate mouse movement over interesting elements
    const hoverDuration = this.randomInRange({ min: 1000, max: 2500 });
    await this.delay(hoverDuration);
  }

  // Simulate clicking on elements
  async simulateElementClick(session) {
    session.onActivityUpdate?.('clicking');
    
    // Brief pause before click (reaction time)
    await this.delay(this.randomInRange({ min: 200, max: 500 }));
    
    // Click duration
    await this.delay(this.randomInRange({ min: 100, max: 300 }));
    
    session.stats.totalClicks++;
  }

  // Generate next page URL for navigation
  generateNextPageUrl(baseUrl) {
    try {
      const base = baseUrl.replace(/\/$/, '');
      const pages = [
        '/about', '/services', '/products', '/portfolio', '/contact',
        '/blog', '/news', '/team', '/careers', '/pricing', '/features',
        '/gallery', '/testimonials', '/faq', '/support', '/case-studies',
        '/solutions', '/resources', '/privacy', '/terms'
      ];
      
      const randomPage = pages[Math.floor(Math.random() * pages.length)];
      return `${base}${randomPage}`;
    } catch (error) {
      return baseUrl;
    }
  }

  // Calculate delay between actions based on user pattern
  calculateNextActionDelay(session) {
    const baseDelay = this.randomInRange(session.pattern.actionInterval);
    
    // Adjust delay based on interest level
    const interestMultiplier = 1.5 - session.behaviorState.interestLevel; // Less interested = faster actions
    
    // Adjust delay based on device type
    const deviceMultiplier = session.deviceType === 'mobile' ? 0.7 : 1.0;
    
    return Math.floor(baseDelay * interestMultiplier * deviceMultiplier);
  }

  // Easing function for smooth animations
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Generate random number in range
  randomInRange(range) {
    return range.min + Math.random() * (range.max - range.min);
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Stop browsing session
  stopBrowsingSession(sessionId) {
    const session = this.behaviorProfiles.get(sessionId);
    if (session) {
      session.isActive = false;
      session.phase = 'session_end';
      console.log(`🛑 Stopped browsing session: ${sessionId}`);
    }
  }

  // Get session stats
  getSessionStats(sessionId) {
    const session = this.behaviorProfiles.get(sessionId);
    if (!session) return null;
    
    return {
      id: session.id,
      userType: session.userType,
      deviceType: session.deviceType,
      isActive: session.isActive,
      phase: session.phase,
      currentPage: session.currentPage,
      visitedPages: session.visitedPages.length,
      scrollPosition: Math.round(session.currentScrollPosition * 100),
      sessionDuration: Date.now() - session.startTime,
      stats: { ...session.stats },
      behaviorState: { ...session.behaviorState }
    };
  }

  // Clean up session
  cleanupSession(sessionId) {
    this.behaviorProfiles.delete(sessionId);
    this.activeAnimations.delete(sessionId);
  }
}

// Create singleton instance
const naturalBrowsingBehavior = new NaturalBrowsingBehavior();

// Export functions
export const createBrowsingSession = (sessionId, userType, targetUrl, deviceType) => {
  return naturalBrowsingBehavior.createBrowsingSession(sessionId, userType, targetUrl, deviceType);
};

export const startNaturalBrowsing = (sessionId, onStatusUpdate, onActivityUpdate) => {
  return naturalBrowsingBehavior.startNaturalBrowsing(sessionId, onStatusUpdate, onActivityUpdate);
};

export const stopBrowsingSession = (sessionId) => {
  return naturalBrowsingBehavior.stopBrowsingSession(sessionId);
};

export const getBrowsingSessionStats = (sessionId) => {
  return naturalBrowsingBehavior.getSessionStats(sessionId);
};

export const cleanupBrowsingSession = (sessionId) => {
  return naturalBrowsingBehavior.cleanupSession(sessionId);
};

export default naturalBrowsingBehavior;