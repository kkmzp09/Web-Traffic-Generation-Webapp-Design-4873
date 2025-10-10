// Playwright Worker Client - Manages real browser automation with Google Search integration
// Connects to the worker.js server running on port 4000

class PlaywrightWorkerClient {
  constructor() {
    this.workerUrl = 'http://localhost:4000';
    this.activeSessions = new Map();
    this.eventListeners = new Map();
    this.sessionEventSources = new Map();
    this.isWorkerAvailable = false;
    
    // Check worker availability on initialization
    this.checkWorkerAvailability();
  }

  // Check if Playwright worker is available
  async checkWorkerAvailability() {
    try {
      const response = await fetch(`${this.workerUrl}/health`, { method: 'GET' });
      this.isWorkerAvailable = response.ok;
      console.log(`🎭 Playwright Worker: ${this.isWorkerAvailable ? 'Available' : 'Not Available'}`);
      return this.isWorkerAvailable;
    } catch (error) {
      this.isWorkerAvailable = false;
      console.log('🎭 Playwright Worker: Not Available (worker not running on port 4000)');
      return false;
    }
  }

  // Start real browser automation session with Google Search
  async startRealBrowserSession(targetUrl, profile = 'Desktop Chrome', options = {}) {
    const sessionId = `playwright_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🎬 Starting REAL Playwright browser session: ${sessionId}`);
    console.log(`🌐 Target URL: ${targetUrl}`);
    console.log(`🎭 Profile: ${profile}`);
    console.log(`🔍 Google Search Integration: ENABLED`);
    console.log(`📜 Natural Scrolling: ENABLED`);
    console.log(`🔗 Internal Navigation: ENABLED`);
    console.log(`🖱️ Real Mouse Events: ENABLED`);
    
    if (!this.isWorkerAvailable) {
      throw new Error('Playwright worker is not available. Please start the worker server: npm run worker');
    }

    try {
      // Start the automation session
      const response = await fetch(`${this.workerUrl}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUrl,
          profile,
          maxClicks: options.maxClicks || 5,
          enableGoogleSearch: options.enableGoogleSearch !== false,
          enableNaturalScrolling: options.enableNaturalScrolling !== false,
          enableInternalNavigation: options.enableInternalNavigation !== false,
          sessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`Worker request failed: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.accepted) {
        // Start listening to events
        this.startEventListening(sessionId);
        
        // Store session info
        this.activeSessions.set(sessionId, {
          targetUrl,
          profile,
          startTime: Date.now(),
          status: 'running',
          logs: [],
          stats: {
            pageViews: 0,
            scrollActions: 0,
            clickActions: 0,
            interactions: 0,
            googleSearchPerformed: false,
            naturalScrollingPerformed: false,
            internalNavigationPerformed: false
          },
          realBrowser: true,
          googleSearch: true,
          naturalScrolling: true,
          internalNavigation: true,
          realMouseEvents: true
        });
        
        console.log(`✅ Real Playwright browser session started: ${sessionId}`);
        console.log(`👀 Watch for the browser window to open with Google Search!`);
        return { sessionId, accepted: true };
      } else {
        throw new Error('Worker rejected the session');
      }
    } catch (error) {
      console.error(`❌ Failed to start Playwright session:`, error);
      throw error;
    }
  }

  // Start listening to server-sent events from worker
  startEventListening(sessionId) {
    console.log(`📡 Starting event listening for session: ${sessionId}`);
    
    const eventSource = new EventSource(`${this.workerUrl}/events`);
    this.sessionEventSources.set(sessionId, eventSource);
    
    eventSource.onopen = () => {
      console.log(`📡 EventSource connected for session: ${sessionId}`);
    };

    eventSource.onmessage = (event) => {
      console.log(`📡 Playwright Event: ${event.data}`);
    };

    eventSource.addEventListener('connected', (event) => {
      console.log(`🔗 Playwright worker connected: ${event.data}`);
    });

    eventSource.addEventListener('log', (event) => {
      const logData = event.data;
      console.log(`📜 Playwright Log: ${logData}`);
      
      // Update session logs
      const session = this.activeSessions.get(sessionId);
      if (session) {
        session.logs.push({
          timestamp: Date.now(),
          message: logData,
          type: 'log'
        });
        
        // Update stats based on log content
        if (logData.includes('google-search')) {
          session.stats.googleSearchPerformed = true;
        }
        if (logData.includes('scrolled') || logData.includes('scrolling')) {
          session.stats.scrollActions++;
          session.stats.interactions++;
          session.stats.naturalScrollingPerformed = true;
        }
        if (logData.includes('clicked') || logData.includes('internal-link')) {
          session.stats.clickActions++;
          session.stats.interactions++;
          session.stats.internalNavigationPerformed = true;
        }
        if (logData.includes('page-loaded') || logData.includes('loaded')) {
          session.stats.pageViews++;
        }
      }
      
      // Notify listeners
      this.notifyEventListeners(sessionId, 'log', logData);
    });

    eventSource.addEventListener('done', (event) => {
      const result = JSON.parse(event.data);
      console.log(`✅ Playwright Session Complete:`, result);
      
      // Update session status
      const session = this.activeSessions.get(sessionId);
      if (session) {
        session.status = result.ok ? 'completed' : 'failed';
        session.endTime = Date.now();
        session.duration = session.endTime - session.startTime;
        session.result = result;
        
        // Log completion details
        console.log(`📊 Session ${sessionId} completed:`);
        console.log(`   🔍 Google Search: ${session.stats.googleSearchPerformed ? '✅' : '❌'}`);
        console.log(`   📜 Natural Scrolling: ${session.stats.naturalScrollingPerformed ? '✅' : '❌'}`);
        console.log(`   🔗 Internal Navigation: ${session.stats.internalNavigationPerformed ? '✅' : '❌'}`);
        console.log(`   📊 Pages: ${session.stats.pageViews}, Interactions: ${session.stats.interactions}`);
        console.log(`   ⏱️ Duration: ${Math.round((session.duration || 0) / 1000)}s`);
      }
      
      // Notify listeners
      this.notifyEventListeners(sessionId, 'done', result);
      
      // Cleanup
      this.cleanupSession(sessionId);
    });

    eventSource.onerror = (error) => {
      console.error(`❌ Playwright EventSource error for ${sessionId}:`, error);
      
      // Update session status
      const session = this.activeSessions.get(sessionId);
      if (session) {
        session.status = 'error';
        session.error = 'EventSource connection failed';
        session.endTime = Date.now();
        session.duration = session.endTime - session.startTime;
      }
      
      // Cleanup
      this.cleanupSession(sessionId);
    };
  }

  // Cleanup session resources
  cleanupSession(sessionId) {
    const eventSource = this.sessionEventSources.get(sessionId);
    if (eventSource) {
      eventSource.close();
      this.sessionEventSources.delete(sessionId);
    }
    
    // Remove from event listeners map if it exists
    this.eventListeners.delete(sessionId);
  }

  // Add event listener for session updates
  addEventListener(sessionId, callback) {
    if (!this.eventListeners.has(sessionId)) {
      this.eventListeners.set(sessionId, []);
    }
    this.eventListeners.get(sessionId).push(callback);
  }

  // Notify event listeners
  notifyEventListeners(sessionId, eventType, data) {
    const listeners = this.eventListeners.get(sessionId);
    if (listeners && Array.isArray(listeners)) {
      listeners.forEach(callback => {
        try {
          callback(eventType, data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Get session information
  getSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  // Get all active sessions
  getActiveSessions() {
    return Array.from(this.activeSessions.entries()).map(([id, session]) => ({
      id,
      ...session,
      enhancedPlaywright: true,
      realBrowser: true,
      googleSearchEnabled: true,
      naturalScrolling: true,
      internalNavigation: true,
      realMouseEvents: true
    }));
  }

  // Stop a specific session
  async stopSession(sessionId) {
    try {
      this.cleanupSession(sessionId);
      
      const session = this.activeSessions.get(sessionId);
      if (session && session.status === 'running') {
        session.status = 'stopped';
        session.endTime = Date.now();
        session.duration = session.endTime - session.startTime;
      }
      
      console.log(`🛑 Stopped Playwright session: ${sessionId}`);
      return true;
    } catch (error) {
      console.error(`❌ Error stopping session ${sessionId}:`, error);
      return false;
    }
  }

  // Stop all active sessions
  async stopAllSessions() {
    const sessionIds = Array.from(this.activeSessions.keys());
    for (const sessionId of sessionIds) {
      await this.stopSession(sessionId);
    }
    console.log(`🛑 Stopped all Playwright sessions (${sessionIds.length} sessions)`);
  }

  // Get session statistics
  getSessionStats(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;
    
    return {
      sessionId,
      targetUrl: session.targetUrl,
      profile: session.profile,
      status: session.status,
      duration: session.duration || (Date.now() - session.startTime),
      pageViews: session.stats.pageViews,
      scrollActions: session.stats.scrollActions,
      clickActions: session.stats.clickActions,
      interactions: session.stats.interactions,
      logs: session.logs.length,
      success: session.status === 'completed' && session.result?.ok,
      
      // Enhanced Playwright features
      realBrowser: true,
      googleSearchPerformed: session.stats.googleSearchPerformed,
      naturalScrollingPerformed: session.stats.naturalScrollingPerformed,
      internalNavigationPerformed: session.stats.internalNavigationPerformed,
      realMouseEvents: true,
      enhancedPlaywright: true
    };
  }

  // Get overall statistics
  getOverallStats() {
    const sessions = Array.from(this.activeSessions.values());
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const successfulSessions = sessions.filter(s => s.status === 'completed' && s.result?.ok).length;
    const runningSessions = sessions.filter(s => s.status === 'running').length;
    
    return {
      totalSessions,
      completedSessions,
      successfulSessions,
      activeSessions: runningSessions,
      successRate: totalSessions > 0 ? ((successfulSessions / totalSessions) * 100).toFixed(1) : 0,
      totalPageViews: sessions.reduce((sum, s) => sum + s.stats.pageViews, 0),
      totalScrollActions: sessions.reduce((sum, s) => sum + s.stats.scrollActions, 0),
      totalClickActions: sessions.reduce((sum, s) => sum + s.stats.clickActions, 0),
      totalInteractions: sessions.reduce((sum, s) => sum + s.stats.interactions, 0),
      
      // Enhanced features stats
      googleSearchSessions: sessions.filter(s => s.stats.googleSearchPerformed).length,
      naturalScrollingSessions: sessions.filter(s => s.stats.naturalScrollingPerformed).length,
      internalNavigationSessions: sessions.filter(s => s.stats.internalNavigationPerformed).length,
      
      workerAvailable: this.isWorkerAvailable,
      enhancedPlaywright: true,
      realBrowsers: true,
      googleSearchEnabled: true,
      naturalScrolling: true,
      internalNavigation: true,
      realMouseEvents: true
    };
  }

  // Test single browser session
  async testSingleSession(targetUrl, profile = 'Desktop Chrome') {
    console.log(`🧪 Testing single Playwright browser session`);
    console.log(`🌐 URL: ${targetUrl}`);
    console.log(`🎭 Profile: ${profile}`);
    console.log(`🔍 Will perform: Google Search → Natural Scrolling → Internal Navigation`);
    
    try {
      const result = await this.startRealBrowserSession(targetUrl, profile, {
        maxClicks: 3,
        enableGoogleSearch: true,
        enableNaturalScrolling: true,
        enableInternalNavigation: true
      });
      
      console.log(`✅ Test session started successfully:`, result);
      console.log(`👀 Watch for browser window to open and perform Google search!`);
      return result;
    } catch (error) {
      console.error(`❌ Test session failed:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const playwrightWorkerClient = new PlaywrightWorkerClient();

export default playwrightWorkerClient;

// Export convenience functions for enhanced Playwright automation
export const startPlaywrightSession = (targetUrl, profile, options) => {
  return playwrightWorkerClient.startRealBrowserSession(targetUrl, profile, options);
};

export const getPlaywrightSessions = () => {
  return playwrightWorkerClient.getActiveSessions();
};

export const getPlaywrightStats = () => {
  return playwrightWorkerClient.getOverallStats();
};

export const stopPlaywrightSession = (sessionId) => {
  return playwrightWorkerClient.stopSession(sessionId);
};

export const stopAllPlaywrightSessions = () => {
  return playwrightWorkerClient.stopAllSessions();
};

export const testPlaywrightSession = (targetUrl, profile) => {
  return playwrightWorkerClient.testSingleSession(targetUrl, profile);
};

// Enhanced real browser automation functions (replaces the user's functions)
export async function startRealBrowserAutomation(campaign, options = {}) {
  console.log(`🚀 Starting Real Browser Automation with Google Search Integration`);
  console.log(`🎯 Target: ${campaign.targetUrl}`);
  console.log(`🔍 Google Search: ENABLED`);
  console.log(`📜 Natural Scrolling: ENABLED`);
  console.log(`🔗 Internal Navigation: ENABLED`);
  
  try {
    const profile = options.profile || 'Desktop Chrome';
    const result = await playwrightWorkerClient.startRealBrowserSession(
      campaign.targetUrl, 
      profile,
      {
        maxClicks: options.maxClicks || 5,
        enableGoogleSearch: true,
        enableNaturalScrolling: true,
        enableInternalNavigation: true
      }
    );
    
    console.log(`✅ Real browser automation started: ${result.sessionId}`);
    return result;
  } catch (error) {
    console.error('❌ Failed to start real browser automation:', error);
    throw error;
  }
}

export function testRealBrowserSession(url, profile = 'Desktop Chrome', options = {}) {
  console.log(`🧪 Testing real browser session with Google Search`);
  console.log(`🌐 URL: ${url}`);
  console.log(`🎭 Profile: ${profile}`);
  
  return startRealBrowserAutomation({ targetUrl: url }, { profile, ...options });
}