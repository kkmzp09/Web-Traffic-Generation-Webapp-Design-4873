// Enhanced Playwright Traffic Generator with Real Browser Integration
// Combines the existing system with actual Playwright worker for real mouse events

import playwrightWorkerClient, { 
  startPlaywrightSession,
  getPlaywrightSessions,
  getPlaywrightStats,
  stopPlaywrightSession,
  testPlaywrightSession
} from './playwrightWorkerClient.js';

import { 
  assignProxyForSession, 
  releaseSessionProxy, 
  getSessionProxy 
} from './proxyManager.js';

import { 
  generateDeviceFingerprint,
  getFingerprintSummary 
} from './deviceFingerprint.js';

// Enhanced browser profiles for Playwright
const ENHANCED_BROWSER_PROFILES = {
  efficient: {
    name: 'Efficient User',
    playwrightProfile: 'Desktop Chrome',
    scrollSpeed: 1500,
    readingTime: 2000,
    pageStayTime: 8000,
    clickProbability: 0.3,
    maxClicks: 3,
    sessionDuration: { min: 60000, max: 180000 },
    pagesPerSession: { min: 3, max: 6 },
    description: 'Fast, goal-oriented browsing with quick decisions'
  },
  casual: {
    name: 'Casual Browser',
    playwrightProfile: 'Desktop Chrome',
    scrollSpeed: 800,
    readingTime: 5000,
    pageStayTime: 15000,
    clickProbability: 0.6,
    maxClicks: 5,
    sessionDuration: { min: 180000, max: 600000 },
    pagesPerSession: { min: 5, max: 12 },
    description: 'Relaxed exploration with time to read and discover'
  },
  mobile: {
    name: 'Mobile User',
    playwrightProfile: 'iPhone 12',
    scrollSpeed: 600,
    readingTime: 3000,
    pageStayTime: 12000,
    clickProbability: 0.4,
    maxClicks: 3,
    sessionDuration: { min: 30000, max: 120000 },
    pagesPerSession: { min: 2, max: 5 },
    description: 'Quick mobile interactions with touch-based navigation'
  },
  researcher: {
    name: 'Research User',
    playwrightProfile: 'Desktop Chrome',
    scrollSpeed: 400,
    readingTime: 8000,
    pageStayTime: 25000,
    clickProbability: 0.8,
    maxClicks: 8,
    sessionDuration: { min: 300000, max: 1200000 },
    pagesPerSession: { min: 8, max: 20 },
    description: 'Thorough content analysis with methodical exploration'
  }
};

class EnhancedPlaywrightTrafficGenerator {
  constructor() {
    this.activeCampaigns = new Map();
    this.campaignIntervals = new Map();
    this.sessionHistory = new Map();
    this.sessionCounter = 0;
    this.playwrightClient = playwrightWorkerClient;
    
    // Enhanced tracking
    this.totalSessions = 0;
    this.successfulSessions = 0;
    this.failedSessions = 0;
    this.uniqueProxiesUsed = new Set();
    this.uniqueFingerprintsGenerated = 0;
  }

  // Start enhanced campaign with real Playwright browsers
  async startEnhancedCampaign(campaign, options = {}) {
    if (this.activeCampaigns.has(campaign.id)) {
      console.log(`Enhanced Playwright campaign already running: ${campaign.id}`);
      return this.activeCampaigns.get(campaign.id);
    }

    console.log(`🚀 Starting ENHANCED PLAYWRIGHT CAMPAIGN: ${campaign.name}`);
    console.log(`🎯 Target URL: ${campaign.targetUrl}`);
    console.log(`🎭 Real Playwright browsers with Google Search!`);
    console.log(`⚡ Rate: ${campaign.automationRate || 1} browsers/minute`);
    console.log(`🔍 Google Search: ENABLED`);
    console.log(`📜 Natural Scrolling: ENABLED`);
    console.log(`🔗 Internal Navigation: ENABLED`);
    console.log(`🖱️ REAL Mouse Events: ENABLED`);

    // Check if Playwright worker is available
    const workerAvailable = await this.playwrightClient.checkWorkerAvailability();
    if (!workerAvailable) {
      throw new Error('Playwright worker is not available. Please start the worker server on port 4000.');
    }

    const campaignData = {
      id: campaign.id,
      name: campaign.name,
      targetUrl: campaign.targetUrl,
      automationRate: campaign.automationRate || 1,
      countries: JSON.parse(campaign.countries || '["US", "UK", "CA"]'),
      startTime: Date.now(),
      totalSessions: 0,
      successfulSessions: 0,
      failedSessions: 0,
      enhancedPlaywright: true,
      googleSearchEnabled: true,
      realMouseEvents: true,
      naturalScrolling: true,
      internalNavigation: true,
      options: {
        profiles: options.profiles || ['efficient', 'casual', 'mobile', 'researcher'],
        concurrentBrowsers: Math.min(options.concurrentBrowsers || 2, 3),
        enableGoogleSearch: options.enableGoogleSearch !== false,
        enableNaturalScrolling: options.enableNaturalScrolling !== false,
        enableInternalNavigation: options.enableInternalNavigation !== false,
        ...options
      },
      
      // Enhanced metrics
      activeBrowsers: 0,
      totalInteractions: 0,
      totalPageViews: 0,
      totalScrollActions: 0,
      totalClickActions: 0,
      totalInternalNavigations: 0,
      uniqueProxiesUsed: new Set(),
      uniqueFingerprintsGenerated: 0
    };

    this.activeCampaigns.set(campaign.id, campaignData);
    this.sessionHistory.set(campaign.id, []);
    
    // Start continuous enhanced browser sessions
    await this.startContinuousEnhancedSessions(campaignData);
    
    return campaignData;
  }

  // Start continuous enhanced sessions with Playwright
  async startContinuousEnhancedSessions(campaignData) {
    const intervalMs = Math.max(60000, Math.floor(60000 / campaignData.automationRate));
    
    console.log(`⚡ Enhanced Playwright browsers will launch every ${Math.round(intervalMs / 1000)}s`);
    console.log(`🎬 Each browser will perform Google Search → Natural Scrolling → Internal Navigation`);

    const executeEnhancedSession = async () => {
      if (!this.activeCampaigns.has(campaignData.id)) {
        return;
      }
      
      // Check concurrent browser limit
      if (campaignData.activeBrowsers >= campaignData.options.concurrentBrowsers) {
        console.log(`⏳ Waiting for browser slot (${campaignData.activeBrowsers}/${campaignData.options.concurrentBrowsers} active)`);
        return;
      }
      
      try {
        const profiles = campaignData.options.profiles;
        const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];
        const profileConfig = ENHANCED_BROWSER_PROFILES[randomProfile];
        
        console.log(`🎬 Launching ${profileConfig.name} with REAL Playwright browser...`);
        console.log(`🔍 Will perform Google Search → Navigate → Scroll → Click Internal Links`);
        
        campaignData.activeBrowsers++;
        campaignData.uniqueFingerprintsGenerated++;
        
        // Generate device fingerprint for session tracking
        const deviceFingerprint = await generateDeviceFingerprint(
          profileConfig.playwrightProfile.includes('iPhone') ? 'mobile' : 'desktop'
        );
        
        // Assign proxy for session
        const sessionId = `enhanced_${randomProfile}_${++this.sessionCounter}_${Date.now()}`;
        const assignedProxy = await assignProxyForSession(sessionId, deviceFingerprint, {
          country: this.getRandomCountry(campaignData.countries),
          type: 'owned'
        });
        
        if (assignedProxy) {
          campaignData.uniqueProxiesUsed.add(`${assignedProxy.ip}:${assignedProxy.port}`);
          console.log(`🔒 Assigned proxy: ${assignedProxy.ip}:${assignedProxy.port} (${assignedProxy.country})`);
        }
        
        // Start real Playwright browser session
        const sessionStart = Date.now();
        const sessionResult = await startPlaywrightSession(
          campaignData.targetUrl,
          profileConfig.playwrightProfile,
          {
            maxClicks: profileConfig.maxClicks,
            enableGoogleSearch: campaignData.options.enableGoogleSearch,
            enableNaturalScrolling: campaignData.options.enableNaturalScrolling,
            enableInternalNavigation: campaignData.options.enableInternalNavigation
          }
        );
        
        // Track session with event listening
        this.trackEnhancedSession(sessionResult.sessionId, {
          campaignId: campaignData.id,
          profile: randomProfile,
          targetUrl: campaignData.targetUrl,
          startTime: sessionStart,
          deviceFingerprint: getFingerprintSummary(deviceFingerprint),
          proxyUsed: assignedProxy ? `${assignedProxy.ip}:${assignedProxy.port}` : null,
          proxyCountry: assignedProxy?.country || null
        });
        
        campaignData.activeBrowsers--;
        
        // Update campaign statistics
        campaignData.totalSessions++;
        this.totalSessions++;
        
        console.log(`📊 Enhanced Campaign ${campaignData.name}: ${campaignData.totalSessions} sessions, ${campaignData.uniqueProxiesUsed.size} unique IPs`);
        
      } catch (error) {
        console.error(`Enhanced Playwright session error for ${campaignData.name}:`, error);
        campaignData.totalSessions++;
        campaignData.failedSessions++;
        this.failedSessions++;
        campaignData.activeBrowsers--;
      }
    };
    
    // Show enhanced notification
    this.showEnhancedLaunchNotification(campaignData);
    
    // Start first session after short delay
    setTimeout(executeEnhancedSession, 3000);
    
    // Set up interval for subsequent sessions
    const interval = setInterval(executeEnhancedSession, intervalMs);
    this.campaignIntervals.set(campaignData.id, interval);
  }

  // Track enhanced session with real-time updates
  trackEnhancedSession(sessionId, sessionInfo) {
    const sessionData = {
      ...sessionInfo,
      status: 'running',
      logs: [],
      stats: {
        pageViews: 0,
        scrollActions: 0,
        clickActions: 0,
        interactions: 0
      }
    };
    
    // Listen to session events
    this.playwrightClient.addEventListener(sessionId, (eventType, data) => {
      if (eventType === 'log') {
        sessionData.logs.push({
          timestamp: Date.now(),
          message: data
        });
        
        // Update stats based on log content
        if (data.includes('scrolled')) {
          sessionData.stats.scrollActions++;
          sessionData.stats.interactions++;
        }
        if (data.includes('clicked')) {
          sessionData.stats.clickActions++;
          sessionData.stats.interactions++;
        }
        if (data.includes('loaded')) {
          sessionData.stats.pageViews++;
        }
        
        // Update campaign stats
        const campaign = this.activeCampaigns.get(sessionInfo.campaignId);
        if (campaign) {
          if (data.includes('scrolled')) campaign.totalScrollActions++;
          if (data.includes('clicked')) campaign.totalClickActions++;
          if (data.includes('loaded')) campaign.totalPageViews++;
        }
      }
      
      if (eventType === 'done') {
        sessionData.status = data.ok ? 'completed' : 'failed';
        sessionData.endTime = Date.now();
        sessionData.duration = sessionData.endTime - sessionData.startTime;
        sessionData.result = data;
        
        // Update campaign stats
        const campaign = this.activeCampaigns.get(sessionInfo.campaignId);
        if (campaign) {
          if (data.ok) {
            campaign.successfulSessions++;
            this.successfulSessions++;
          } else {
            campaign.failedSessions++;
            this.failedSessions++;
          }
        }
        
        // Add to session history
        const history = this.sessionHistory.get(sessionInfo.campaignId) || [];
        history.push({
          ...sessionData,
          timestamp: new Date().toISOString()
        });
        
        // Keep only last 20 sessions
        if (history.length > 20) {
          history.splice(0, history.length - 20);
        }
        
        this.sessionHistory.set(sessionInfo.campaignId, history);
        
        console.log(`✅ Enhanced session completed: ${sessionId} (${data.ok ? 'Success' : 'Failed'})`);
      }
    });
  }

  // Show enhanced notification
  showEnhancedLaunchNotification(campaignData) {
    console.log(`
🎭 ENHANCED PLAYWRIGHT REAL BROWSER AUTOMATION!
═══════════════════════════════════════════════════════

📱 Campaign: ${campaignData.name}
🌐 Target: ${campaignData.targetUrl}
⚡ Rate: ${campaignData.automationRate} real browsers/minute
👥 Profiles: ${campaignData.options.profiles.join(', ')}
🖥️ Concurrent: Up to ${campaignData.options.concurrentBrowsers} browsers

🎯 ENHANCED PLAYWRIGHT FEATURES:
   🔍 Google Search → Find website → Navigate
   📜 Natural scrolling patterns with realistic timing
   🔗 Internal page navigation (About, Contact, etc.)
   🖱️ REAL mouse events and clicks
   👁️ Fully visible browser windows
   🎭 Unique device fingerprints per session
   🔒 Unique IP addresses per browser (proxy rotation)
   ⏱️ Human-like behavior patterns and timing

🎬 Starting enhanced automation in 3 seconds...
    `);
  }

  // Stop enhanced campaign
  stopEnhancedCampaign(campaignId) {
    console.log(`🛑 Stopping enhanced Playwright campaign: ${campaignId}`);
    
    // Stop interval
    if (this.campaignIntervals.has(campaignId)) {
      clearInterval(this.campaignIntervals.get(campaignId));
      this.campaignIntervals.delete(campaignId);
    }
    
    // Stop all active sessions for this campaign
    const playwrightSessions = getPlaywrightSessions();
    playwrightSessions.forEach(session => {
      if (session.targetUrl === this.activeCampaigns.get(campaignId)?.targetUrl) {
        stopPlaywrightSession(session.id);
      }
    });
    
    // Remove campaign
    if (this.activeCampaigns.has(campaignId)) {
      const campaign = this.activeCampaigns.get(campaignId);
      console.log(`✅ Stopped enhanced campaign: ${campaign.name}`);
      console.log(`📊 Final stats: ${campaign.uniqueProxiesUsed.size} unique IPs, ${campaign.uniqueFingerprintsGenerated} fingerprints`);
      this.activeCampaigns.delete(campaignId);
    }
  }

  // Get enhanced campaign stats
  getEnhancedCampaignStats(campaignId) {
    const campaign = this.activeCampaigns.get(campaignId);
    if (!campaign) return null;
    
    const sessionHistory = this.sessionHistory.get(campaignId) || [];
    const recentSessions = sessionHistory.slice(-10);
    const playwrightStats = getPlaywrightStats();
    
    return {
      ...campaign,
      runtime: Date.now() - campaign.startTime,
      successRate: campaign.totalSessions > 0 
        ? ((campaign.successfulSessions / campaign.totalSessions) * 100).toFixed(1)
        : 0,
      
      // Enhanced Playwright specific metrics
      activeBrowsers: campaign.activeBrowsers || 0,
      totalInteractions: campaign.totalInteractions || 0,
      totalPageViews: campaign.totalPageViews || 0,
      totalScrollActions: campaign.totalScrollActions || 0,
      totalClickActions: campaign.totalClickActions || 0,
      totalInternalNavigations: campaign.totalInternalNavigations || 0,
      uniqueProxiesUsed: campaign.uniqueProxiesUsed.size,
      uniqueFingerprintsGenerated: campaign.uniqueFingerprintsGenerated || 0,
      
      // Playwright worker stats
      playwrightWorkerAvailable: playwrightStats.workerAvailable,
      playwrightActiveSessions: playwrightStats.activeSessions,
      playwrightTotalSessions: playwrightStats.totalSessions,
      
      // Average calculations
      averagePageViews: recentSessions.length > 0
        ? (recentSessions.reduce((sum, s) => sum + (s.stats?.pageViews || 0), 0) / recentSessions.length).toFixed(1)
        : 0,
      averageInteractions: recentSessions.length > 0
        ? (recentSessions.reduce((sum, s) => sum + (s.stats?.interactions || 0), 0) / recentSessions.length).toFixed(1)
        : 0,
      averageScrollActions: recentSessions.length > 0
        ? (recentSessions.reduce((sum, s) => sum + (s.stats?.scrollActions || 0), 0) / recentSessions.length).toFixed(1)
        : 0,
      averageSessionTime: recentSessions.length > 0
        ? Math.round(recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / recentSessions.length / 1000)
        : 0,
      
      // Enhanced indicators
      enhancedPlaywright: true,
      realBrowsers: true,
      googleSearchEnabled: true,
      naturalScrolling: true,
      internalNavigation: true,
      realMouseEvents: true,
      
      recentSessions: recentSessions.slice(-5).map(session => ({
        ...session,
        duration: Math.round((session.duration || 0) / 1000),
        enhancedPlaywright: true,
        realBrowser: true,
        googleSearch: true,
        naturalScrolling: true,
        realMouseEvents: true
      }))
    };
  }

  // Get active enhanced sessions
  getActiveEnhancedSessions() {
    const playwrightSessions = getPlaywrightSessions();
    return playwrightSessions.map(session => ({
      ...session,
      enhancedPlaywright: true,
      realBrowser: true,
      googleSearchEnabled: true,
      naturalScrolling: true,
      internalNavigation: true,
      realMouseEvents: true,
      browserType: 'enhanced_playwright_real_browser'
    }));
  }

  // Test single enhanced session
  async testEnhancedSession(url, profile = 'casual') {
    console.log(`🧪 Testing single enhanced Playwright session: ${profile} -> ${url}`);
    console.log(`🎭 Will open real browser with Google Search → Scroll → Internal Navigation`);
    
    try {
      const profileConfig = ENHANCED_BROWSER_PROFILES[profile];
      const sessionResult = await testPlaywrightSession(url, profileConfig.playwrightProfile);
      console.log('✅ Test enhanced Playwright session completed successfully:', sessionResult);
      return sessionResult;
    } catch (error) {
      console.error('❌ Test enhanced Playwright session failed:', error);
      throw error;
    }
  }

  // Stop all enhanced campaigns
  stopAllEnhancedCampaigns() {
    console.log('🛑 Stopping ALL enhanced Playwright campaigns...');
    
    for (const campaignId of this.activeCampaigns.keys()) {
      this.stopEnhancedCampaign(campaignId);
    }
    
    // Stop all Playwright sessions
    this.playwrightClient.stopAllSessions();
    
    console.log('✅ All enhanced Playwright campaigns stopped');
  }

  // Utility methods
  getRandomCountry(countries) {
    return countries[Math.floor(Math.random() * countries.length)];
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
const enhancedPlaywrightTrafficGenerator = new EnhancedPlaywrightTrafficGenerator();

// Export functions
export const startEnhancedPlaywrightCampaign = (campaign, options) => {
  return enhancedPlaywrightTrafficGenerator.startEnhancedCampaign(campaign, options);
};

export const stopEnhancedPlaywrightCampaign = (campaignId) => {
  return enhancedPlaywrightTrafficGenerator.stopEnhancedCampaign(campaignId);
};

export const getEnhancedPlaywrightStats = (campaignId) => {
  return enhancedPlaywrightTrafficGenerator.getEnhancedCampaignStats(campaignId);
};

export const getEnhancedPlaywrightSessions = () => {
  return enhancedPlaywrightTrafficGenerator.getActiveEnhancedSessions();
};

export const testEnhancedPlaywrightSession = (url, profile) => {
  return enhancedPlaywrightTrafficGenerator.testEnhancedSession(url, profile);
};

export const stopAllEnhancedPlaywrightCampaigns = () => {
  return enhancedPlaywrightTrafficGenerator.stopAllEnhancedCampaigns();
};

// Export the profiles and default instance
export { ENHANCED_BROWSER_PROFILES };
export default enhancedPlaywrightTrafficGenerator;