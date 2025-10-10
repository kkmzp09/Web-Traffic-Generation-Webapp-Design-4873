// Playwright Server Client - Connects to remote Linux server running Playwright
// Replaces local worker client with remote server communication

class PlaywrightServerClient {
  constructor() {
    this.serverConfig = this.loadServerConfig();
    this.activeSessions = new Map();
    this.eventListeners = new Map();
    this.isServerAvailable = false;
  }

  // Load server configuration from localStorage
  loadServerConfig() {
    try {
      const savedConfig = localStorage.getItem('playwrightServerConfig');
      if (savedConfig) {
        return JSON.parse(savedConfig);
      }
    } catch (error) {
      console.error('Error loading server config:', error);
    }
    
    return {
      host: '',
      port: '4000',
      apiKey: '',
      useHttps: false
    };
  }

  // Get API URL based on configuration
  getApiUrl() {
    if (!this.serverConfig.host) return null;
    const protocol = this.serverConfig.useHttps ? 'https' : 'http';
    return `${protocol}://${this.serverConfig.host}:${this.serverConfig.port}`;
  }

  // Get API headers with authentication
  getApiHeaders() {
    const headers = { 
      'Content-Type': 'application/json'
    };
    
    if (this.serverConfig.apiKey) {
      headers['x-api-key'] = this.serverConfig.apiKey;
      headers['Authorization'] = `Bearer ${this.serverConfig.apiKey}`;
    }
    
    return headers;
  }

  // Update server configuration
  updateServerConfig(config) {
    this.serverConfig = { ...this.serverConfig, ...config };
    try {
      localStorage.setItem('playwrightServerConfig', JSON.stringify(this.serverConfig));
    } catch (error) {
      console.error('Error saving server config:', error);
    }
  }

  // Check if remote Playwright server is available
  async checkServerAvailability() {
    const apiUrl = this.getApiUrl();
    if (!apiUrl) {
      this.isServerAvailable = false;
      console.log('🎭 Playwright Server: Not configured');
      return false;
    }

    try {
      console.log(`🔍 Checking Playwright server: ${apiUrl}/health`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: this.getApiHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        this.isServerAvailable = true;
        console.log(`✅ Playwright Server Connected: ${data.message || 'OK'}`);
        return true;
      } else {
        this.isServerAvailable = false;
        console.log(`❌ Playwright Server Error: ${response.status} ${response.statusText}`);
        return false;
      }
    } catch (error) {
      this.isServerAvailable = false;
      if (error.name === 'AbortError') {
        console.log(`⏰ Playwright Server Timeout: ${apiUrl}`);
      } else {
        console.log(`❌ Playwright Server Connection Failed: ${error.message}`);
      }
      return false;
    }
  }

  // Start remote browser automation session
  async startRemoteBrowserSession(targetUrl, profile = 'Desktop Chrome', options = {}) {
    const sessionId = `remote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🌐 Starting REMOTE Playwright session: ${sessionId}`);
    console.log(`🎯 Target URL: ${targetUrl}`);
    console.log(`🎭 Profile: ${profile}`);
    console.log(`🖥️ Server: ${this.getApiUrl()}`);
    
    if (!this.isServerAvailable) {
      throw new Error('Playwright server is not available. Please check your server configuration.');
    }

    const apiUrl = this.getApiUrl();
    if (!apiUrl) {
      throw new Error('Server not configured. Please set up your Playwright server connection.');
    }

    try {
      const requestBody = {
        targetUrl,
        profile,
        maxClicks: options.maxClicks || 5,
        enableGoogleSearch: options.enableGoogleSearch !== false,
        enableNaturalScrolling: options.enableNaturalScrolling !== false,
        enableInternalNavigation: options.enableInternalNavigation !== false,
        sessionId,
        dwellMs: options.dwellMs || 8000,
        scroll: options.scroll !== false,
        ...options
      };

      console.log(`📡 Sending request to: ${apiUrl}/run`);
      console.log(`📋 Request body:`, requestBody);

      const response = await fetch(`${apiUrl}/run`, {
        method: 'POST',
        headers: this.getApiHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server request failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.accepted || result.id || result.sessionId) {
        const finalSessionId = result.id || result.sessionId || sessionId;
        
        // Store session info
        this.activeSessions.set(finalSessionId, {
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
          remoteServer: true,
          serverUrl: apiUrl
        });
        
        console.log(`✅ Remote Playwright session started: ${finalSessionId}`);
        console.log(`🎬 Browser automation running on server: ${apiUrl}`);
        
        return { 
          sessionId: finalSessionId, 
          accepted: true, 
          serverUrl: apiUrl,
          remote: true 
        };
      } else {
        throw new Error(result.message || result.error || 'Server rejected the session');
      }
    } catch (error) {
      console.error(`❌ Failed to start remote Playwright session:`, error);
      throw error;
    }
  }

  // Check session status on remote server
  async checkSessionStatus(sessionId) {
    const apiUrl = this.getApiUrl();
    if (!apiUrl || !sessionId) return null;

    try {
      const response = await fetch(`${apiUrl}/status/${sessionId}`, {
        headers: this.getApiHeaders()
      });

      if (response.ok) {
        const statusData = await response.json();
        
        // Update local session data
        const session = this.activeSessions.get(sessionId);
        if (session) {
          session.status = statusData.status || 'running';
          session.progress = statusData.progress || 0;
          
          // Update stats if provided
          if (statusData.stats) {
            session.stats = { ...session.stats, ...statusData.stats };
          }
        }
        
        return statusData;
      } else {
        console.log(`⚠️ Status check failed: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error checking session status:`, error);
      return null;
    }
  }

  // Get session results from remote server
  async getSessionResults(sessionId) {
    const apiUrl = this.getApiUrl();
    if (!apiUrl || !sessionId) return null;

    try {
      const response = await fetch(`${apiUrl}/results/${sessionId}`, {
        headers: this.getApiHeaders()
      });

      if (response.ok) {
        const resultsData = await response.json();
        return resultsData.results || resultsData;
      } else {
        console.log(`⚠️ Results fetch failed: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error fetching results:`, error);
      return null;
    }
  }

  // Stop session on remote server
  async stopRemoteSession(sessionId) {
    const apiUrl = this.getApiUrl();
    if (!apiUrl || !sessionId) return false;

    try {
      const response = await fetch(`${apiUrl}/stop/${sessionId}`, {
        method: 'POST',
        headers: this.getApiHeaders()
      });

      const session = this.activeSessions.get(sessionId);
      if (session) {
        session.status = 'stopped';
        session.endTime = Date.now();
        session.duration = session.endTime - session.startTime;
      }

      console.log(`🛑 Stop signal sent to remote server for session: ${sessionId}`);
      return response.ok;
    } catch (error) {
      console.error(`❌ Error stopping remote session:`, error);
      return false;
    }
  }

  // Stop all sessions
  async stopAllRemoteSessions() {
    const sessionIds = Array.from(this.activeSessions.keys());
    const results = await Promise.all(
      sessionIds.map(id => this.stopRemoteSession(id))
    );
    
    console.log(`🛑 Stopped ${sessionIds.length} remote sessions`);
    return results;
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
      remotePlaywright: true,
      serverUrl: session.serverUrl || this.getApiUrl()
    }));
  }

  // Get overall statistics
  getOverallStats() {
    const sessions = Array.from(this.activeSessions.values());
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'finished').length;
    const successfulSessions = sessions.filter(s => (s.status === 'completed' || s.status === 'finished') && s.result?.ok !== false).length;
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
      
      serverAvailable: this.isServerAvailable,
      serverUrl: this.getApiUrl(),
      remotePlaywright: true,
      enhancedFeatures: true
    };
  }

  // Test remote server connection
  async testRemoteConnection() {
    console.log(`🧪 Testing remote Playwright server connection...`);
    console.log(`🌐 Server: ${this.getApiUrl()}`);
    
    const isAvailable = await this.checkServerAvailability();
    
    if (isAvailable) {
      console.log(`✅ Remote Playwright server test successful!`);
      return { success: true, message: 'Server connection successful' };
    } else {
      console.log(`❌ Remote Playwright server test failed!`);
      return { success: false, message: 'Could not connect to server' };
    }
  }

  // Add event listener (for compatibility)
  addEventListener(sessionId, callback) {
    if (!this.eventListeners.has(sessionId)) {
      this.eventListeners.set(sessionId, []);
    }
    this.eventListeners.get(sessionId).push(callback);
  }

  // Remove event listener (for compatibility)
  removeEventListener(sessionId) {
    this.eventListeners.delete(sessionId);
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
}

// Create singleton instance
const playwrightServerClient = new PlaywrightServerClient();

export default playwrightServerClient;

// Export convenience functions for remote Playwright automation
export const startRemotePlaywrightSession = (targetUrl, profile, options) => {
  return playwrightServerClient.startRemoteBrowserSession(targetUrl, profile, options);
};

export const getRemotePlaywrightSessions = () => {
  return playwrightServerClient.getActiveSessions();
};

export const getRemotePlaywrightStats = () => {
  return playwrightServerClient.getOverallStats();
};

export const stopRemotePlaywrightSession = (sessionId) => {
  return playwrightServerClient.stopRemoteSession(sessionId);
};

export const stopAllRemotePlaywrightSessions = () => {
  return playwrightServerClient.stopAllRemoteSessions();
};

export const testRemotePlaywrightConnection = () => {
  return playwrightServerClient.testRemoteConnection();
};

export const checkRemotePlaywrightServer = () => {
  return playwrightServerClient.checkServerAvailability();
};

export const updateRemoteServerConfig = (config) => {
  return playwrightServerClient.updateServerConfig(config);
};

// Enhanced remote browser automation functions
export async function startRemoteBrowserAutomation(campaign, options = {}) {
  console.log(`🚀 Starting Remote Browser Automation`);
  console.log(`🎯 Target: ${campaign.targetUrl}`);
  console.log(`🖥️ Server: ${playwrightServerClient.getApiUrl()}`);
  console.log(`🔍 Google Search: ENABLED`);
  console.log(`📜 Natural Scrolling: ENABLED`);
  console.log(`🔗 Internal Navigation: ENABLED`);
  
  try {
    const profile = options.profile || 'Desktop Chrome';
    const result = await playwrightServerClient.startRemoteBrowserSession(
      campaign.targetUrl, 
      profile,
      {
        maxClicks: options.maxClicks || 5,
        enableGoogleSearch: true,
        enableNaturalScrolling: true,
        enableInternalNavigation: true,
        ...options
      }
    );
    
    console.log(`✅ Remote browser automation started: ${result.sessionId}`);
    return result;
  } catch (error) {
    console.error('❌ Failed to start remote browser automation:', error);
    throw error;
  }
}

export function testRemoteBrowserSession(url, profile = 'Desktop Chrome', options = {}) {
  console.log(`🧪 Testing remote browser session`);
  console.log(`🌐 URL: ${url}`);
  console.log(`🎭 Profile: ${profile}`);
  console.log(`🖥️ Server: ${playwrightServerClient.getApiUrl()}`);
  
  return startRemoteBrowserAutomation({ targetUrl: url }, { profile, ...options });
}