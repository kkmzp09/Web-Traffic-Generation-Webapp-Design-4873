// Owned Proxy Manager - Handles user's custom proxy list with unique assignment
class OwnedProxyManager {
  constructor() {
    this.ownedProxies = new Map();
    this.proxyStats = new Map();
    this.assignedProxies = new Map(); // Track which proxies are assigned to which sessions
    this.loadOwnedProxies();
    
    // Set up storage listener to reload when proxies are updated
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'ownedProxies') {
          console.log('🔄 Proxy list updated, reloading...');
          this.loadOwnedProxies();
        }
      });
      
      // Also listen for custom events when proxies are updated
      window.addEventListener('proxiesUpdated', () => {
        console.log('🔄 Custom proxy update event received, reloading...');
        this.loadOwnedProxies();
      });
    }
  }

  // Load owned proxies from localStorage
  loadOwnedProxies() {
    try {
      const saved = localStorage.getItem('ownedProxies');
      console.log('🔍 Loading owned proxies from localStorage:', saved ? 'Found data' : 'No data');
      
      // Clear existing proxies
      this.ownedProxies.clear();
      this.proxyStats.clear();
      
      if (saved) {
        const proxies = JSON.parse(saved);
        console.log(`📥 Parsing ${proxies.length} proxies from storage`);
        
        proxies.forEach(proxy => {
          const key = `${proxy.ip}:${proxy.port}`;
          this.ownedProxies.set(key, proxy);
          this.proxyStats.set(key, {
            lastUsed: proxy.lastUsed || null,
            useCount: proxy.useCount || 0,
            successRate: proxy.status === 'working' ? 95 : (proxy.status === 'failed' ? 10 : 60),
            avgResponseTime: proxy.responseTime || 0,
            detectionEvents: 0
          });
        });
        
        console.log(`✅ Loaded ${proxies.length} owned proxies successfully`);
        console.log(`📊 Working proxies: ${proxies.filter(p => p.status === 'working').length}`);
        console.log(`📊 Untested proxies: ${proxies.filter(p => p.status === 'untested').length}`);
        console.log(`🌍 Countries: ${[...new Set(proxies.map(p => p.country).filter(Boolean))].join(', ')}`);
        
        // Log first few proxies for debugging
        console.log('🔧 First 3 proxies loaded:');
        Array.from(this.ownedProxies.values()).slice(0, 3).forEach((proxy, index) => {
          console.log(`  ${index + 1}. ${proxy.ip}:${proxy.port} (${proxy.status}) - ${proxy.country}`);
        });
      } else {
        console.log('⚠️ No owned proxies found in localStorage');
      }
    } catch (error) {
      console.error('❌ Error loading owned proxies:', error);
      this.ownedProxies.clear();
      this.proxyStats.clear();
    }
  }

  // Force reload proxies (for manual refresh)
  reloadProxies() {
    console.log('🔄 Force reloading proxy list...');
    this.loadOwnedProxies();
  }

  // Check if a proxy is already assigned to another session
  isProxyAssigned(proxyKey, excludeSessionId = null) {
    for (const [sessionId, assignedProxyKey] of this.assignedProxies.entries()) {
      if (assignedProxyKey === proxyKey && sessionId !== excludeSessionId) {
        return true;
      }
    }
    return false;
  }

  // Get available (unassigned) proxies by filter
  getAvailableProxiesByFilter(filters = {}) {
    const { country, type, status } = filters;
    
    console.log(`🔍 Filtering ${this.ownedProxies.size} proxies with filters:`, filters);
    console.log(`🔒 Currently assigned proxies: ${this.assignedProxies.size}`);
    
    const availableProxies = Array.from(this.ownedProxies.values()).filter(proxy => {
      const proxyKey = `${proxy.ip}:${proxy.port}`;
      
      // Skip if proxy is already assigned to another session
      if (this.isProxyAssigned(proxyKey)) {
        return false;
      }
      
      // If status filter is specified, use it; otherwise allow all statuses
      if (status) {
        if (status === 'working' && proxy.status !== 'working') return false;
        if (status === 'untested' && proxy.status !== 'untested') return false;
        if (status === 'failed' && proxy.status !== 'failed') return false;
      }
      
      // Filter by country if specified
      if (country && proxy.country && proxy.country !== country) return false;
      
      // Filter by type if specified
      if (type && proxy.type && proxy.type !== type) return false;
      
      return true;
    });

    console.log(`🔍 Available (unassigned) proxies: ${availableProxies.length} matches`);
    return availableProxies;
  }

  // Get owned proxies by country/type (for compatibility)
  getOwnedProxiesByFilter(filters = {}) {
    return this.getAvailableProxiesByFilter(filters);
  }

  // Get best available proxy for session (ensures uniqueness)
  getBestAvailableProxy(sessionId, preferences = {}) {
    console.log(`🎯 Looking for best available proxy for session ${sessionId} with preferences:`, preferences);
    console.log(`📋 Total proxies available: ${this.ownedProxies.size}`);
    console.log(`🔒 Already assigned: ${this.assignedProxies.size}`);
    
    if (this.ownedProxies.size === 0) {
      console.log('❌ No proxies in memory at all');
      return null;
    }
    
    // Check if this session already has a proxy assigned
    const currentAssignment = this.assignedProxies.get(sessionId);
    if (currentAssignment) {
      const currentProxy = this.ownedProxies.get(currentAssignment);
      if (currentProxy) {
        console.log(`🔄 Session ${sessionId} already has proxy ${currentProxy.ip}:${currentProxy.port} - reusing`);
        return currentProxy;
      } else {
        // Clean up invalid assignment
        this.assignedProxies.delete(sessionId);
      }
    }
    
    // Try different strategies in order of preference - but only available proxies
    const strategies = [
      { ...preferences, status: 'working' },     // First: working proxies with preferences
      { status: 'working' },                     // Second: any working proxies
      { ...preferences, status: 'untested' },   // Third: untested proxies with preferences
      { status: 'untested' },                   // Fourth: any untested proxies
      { ...preferences },                        // Fifth: any proxies with preferences
      {}                                         // Last: any proxies at all
    ];
    
    for (let i = 0; i < strategies.length; i++) {
      const strategy = strategies[i];
      console.log(`🎯 Trying strategy ${i + 1} for session ${sessionId}:`, strategy);
      
      const availableProxies = this.getAvailableProxiesByFilter(strategy);
      
      if (availableProxies.length > 0) {
        console.log(`✅ Found ${availableProxies.length} available proxies with strategy ${i + 1}`);
        
        // Sort by preference (working status first, then response time)
        const sortedProxies = availableProxies.sort((a, b) => {
          // Primary: Prefer working status
          if (a.status === 'working' && b.status !== 'working') return -1;
          if (b.status === 'working' && a.status !== 'working') return 1;
          
          // Secondary: Prefer untested over failed
          if (a.status === 'untested' && b.status === 'failed') return -1;
          if (b.status === 'untested' && a.status === 'failed') return 1;
          
          // Tertiary: Response time (lower is better, 0/null means untested)
          const responseTimeA = a.responseTime || 999;
          const responseTimeB = b.responseTime || 999;
          return responseTimeA - responseTimeB;
        });

        // Select proxy based on session ID to ensure different sessions get different proxies
        const sessionIndex = parseInt(sessionId.replace(/\D/g, '')) || 0;
        const selectedIndex = sessionIndex % sortedProxies.length;
        const selectedProxy = sortedProxies[selectedIndex];
        
        console.log(`✅ Selected proxy for session ${sessionId}: ${selectedProxy.ip}:${selectedProxy.port} (${selectedProxy.status}, ${selectedProxy.country})`);
        
        // Mark this proxy as assigned to this session
        const proxyKey = `${selectedProxy.ip}:${selectedProxy.port}`;
        this.assignedProxies.set(sessionId, proxyKey);
        
        console.log(`🔒 Proxy ${proxyKey} is now assigned to session ${sessionId}`);
        console.log(`📊 Total assigned proxies: ${this.assignedProxies.size}`);
        
        return selectedProxy;
      }
    }
    
    console.log(`❌ No available proxies found for session ${sessionId} with any strategy`);
    console.log(`🔧 Assignment status:`, Array.from(this.assignedProxies.entries()));
    return null;
  }

  // Get best owned proxy for session (for compatibility)
  getBestOwnedProxy(preferences = {}) {
    // Use a generic session ID for compatibility
    return this.getBestAvailableProxy('generic', preferences);
  }

  // Release proxy assignment for a session
  releaseProxyForSession(sessionId) {
    const assignedProxyKey = this.assignedProxies.get(sessionId);
    if (assignedProxyKey) {
      this.assignedProxies.delete(sessionId);
      console.log(`🔓 Released proxy ${assignedProxyKey} from session ${sessionId}`);
      console.log(`📊 Remaining assigned proxies: ${this.assignedProxies.size}`);
      return true;
    }
    return false;
  }

  // Assign owned proxy for session with uniqueness guarantee
  async assignOwnedProxyForSession(sessionId, fingerprint, preferences = {}) {
    try {
      console.log(`🔍 Assigning unique proxy for session ${sessionId}`);
      console.log(`📋 Available proxies in memory: ${this.ownedProxies.size}`);
      console.log(`🔒 Currently assigned: ${this.assignedProxies.size}`);
      console.log(`🎯 Preferences:`, preferences);
      console.log(`👤 Fingerprint:`, fingerprint);
      
      // Force reload to ensure we have latest data
      this.reloadProxies();
      
      if (this.ownedProxies.size === 0) {
        console.log('❌ No owned proxies available in memory after reload');
        return null;
      }
      
      const proxy = this.getBestAvailableProxy(sessionId, preferences);
      if (!proxy) {
        console.log(`❌ No suitable available proxy found for session ${sessionId}`);
        console.log('🔧 Available proxies for debugging:');
        this.debugLogProxies();
        console.log('🔧 Current assignments:');
        for (const [sessId, proxyKey] of this.assignedProxies.entries()) {
          console.log(`  Session ${sessId} -> ${proxyKey}`);
        }
        return null;
      }

      // Create proxy info object with enhanced details
      const proxyInfo = {
        ip: proxy.ip,
        port: proxy.port,
        type: proxy.type || 'owned',
        country: proxy.country || 'Unknown',
        countryCode: proxy.countryCode || '',
        geoRegion: proxy.geoRegion || 'Unknown',
        provider: 'Owned',
        protocol: proxy.protocol || 'socks5',
        authentication: {
          username: proxy.username || '',
          password: proxy.password || '',
          authType: proxy.username ? 'user-pass' : 'ip-whitelist'
        },
        location: {
          city: proxy.geoRegion || 'Custom',
          country: proxy.country || 'Unknown',
          countryCode: proxy.countryCode || '',
          isp: 'Private'
        },
        score: this.calculateProxyScore(proxy),
        validationScore: proxy.status === 'working' ? 95 : (proxy.status === 'untested' ? 75 : 30),
        isOwned: true,
        status: proxy.status,
        responseTime: proxy.responseTime,
        lastChecked: proxy.lastChecked,
        sessionId: sessionId // Track which session this proxy is assigned to
      };

      // Update usage stats
      this.updateOwnedProxyUsage(`${proxy.ip}:${proxy.port}`, 'assigned');

      console.log(`✅ Successfully assigned unique proxy ${proxy.ip}:${proxy.port} to session ${sessionId}`);
      console.log(`🌍 Proxy location: ${proxy.country} (${proxy.countryCode}), Region: ${proxy.geoRegion}`);
      return proxyInfo;

    } catch (error) {
      console.error('❌ Error assigning owned proxy:', error);
      return null;
    }
  }

  // Calculate proxy score based on performance
  calculateProxyScore(proxy) {
    const stats = this.proxyStats.get(`${proxy.ip}:${proxy.port}`);
    if (!stats) {
      // Base score for untested proxies, higher if has geo info
      return proxy.countryCode && proxy.geoRegion !== 'Unknown' ? 85 : 75;
    }

    let score = 100;
    
    // Adjust based on success rate
    score *= (stats.successRate / 100);
    
    // Adjust based on response time
    if (proxy.responseTime) {
      if (proxy.responseTime < 100) score += 5;
      else if (proxy.responseTime > 500) score -= 10;
    }
    
    // Bonus for geographic information
    if (proxy.countryCode && proxy.geoRegion !== 'Unknown') {
      score += 10;
    }
    
    // Adjust based on detection events
    if (stats.detectionEvents > 0) {
      score -= (stats.detectionEvents * 5);
    }
    
    return Math.max(0, Math.min(100, score));
  }

  // Update owned proxy usage statistics
  updateOwnedProxyUsage(proxyKey, event, data = {}) {
    const stats = this.proxyStats.get(proxyKey);
    if (!stats) {
      console.log(`⚠️ No stats found for proxy ${proxyKey}, creating new stats`);
      this.proxyStats.set(proxyKey, {
        lastUsed: null,
        useCount: 0,
        successRate: 60,
        avgResponseTime: 0,
        detectionEvents: 0
      });
      return this.updateOwnedProxyUsage(proxyKey, event, data);
    }

    const now = Date.now();

    switch (event) {
      case 'assigned':
        stats.lastUsed = now;
        stats.useCount++;
        console.log(`📊 Proxy ${proxyKey} assigned, use count: ${stats.useCount}`);
        break;
        
      case 'success':
        stats.successRate = Math.min(100, (stats.successRate * 0.9) + (100 * 0.1));
        if (data.responseTime) {
          stats.avgResponseTime = (stats.avgResponseTime * 0.8) + (data.responseTime * 0.2);
        }
        console.log(`✅ Proxy ${proxyKey} success, rate: ${stats.successRate.toFixed(1)}%`);
        break;
        
      case 'failure':
        stats.successRate = Math.max(0, (stats.successRate * 0.9) + (0 * 0.1));
        console.log(`❌ Proxy ${proxyKey} failure, rate: ${stats.successRate.toFixed(1)}%`);
        break;
        
      case 'detected':
        stats.detectionEvents++;
        stats.successRate *= 0.8;
        console.log(`🚨 Proxy ${proxyKey} detected, events: ${stats.detectionEvents}`);
        break;
    }

    // Update localStorage stats
    this.saveStatsToStorage();
  }

  // Save stats back to localStorage
  saveStatsToStorage() {
    try {
      const proxies = Array.from(this.ownedProxies.values()).map(proxy => {
        const stats = this.proxyStats.get(`${proxy.ip}:${proxy.port}`);
        return {
          ...proxy,
          lastUsed: stats?.lastUsed,
          useCount: stats?.useCount || 0,
          successRate: stats?.successRate || 0
        };
      });
      
      localStorage.setItem('ownedProxies', JSON.stringify(proxies));
      console.log(`💾 Saved ${proxies.length} proxy stats to storage`);
    } catch (error) {
      console.error('❌ Error saving proxy stats:', error);
    }
  }

  // Get owned proxy statistics
  getOwnedProxyStats() {
    const proxies = Array.from(this.ownedProxies.values());
    
    const stats = {
      total: proxies.length,
      working: proxies.filter(p => p.status === 'working').length,
      failed: proxies.filter(p => p.status === 'failed').length,
      untested: proxies.filter(p => p.status === 'untested').length,
      assigned: this.assignedProxies.size,
      available: proxies.length - this.assignedProxies.size,
      countries: [...new Set(proxies.map(p => p.country).filter(Boolean))],
      averageResponseTime: 0
    };

    // Calculate average response time for working proxies
    const workingProxies = proxies.filter(p => p.status === 'working' && p.responseTime);
    if (workingProxies.length > 0) {
      stats.averageResponseTime = Math.round(
        workingProxies.reduce((sum, p) => sum + p.responseTime, 0) / workingProxies.length
      );
    }

    console.log(`📊 Proxy stats: ${stats.total} total, ${stats.working} working, ${stats.assigned} assigned, ${stats.available} available`);
    return stats;
  }

  // Check if owned proxies are available
  hasOwnedProxies() {
    const hasProxies = this.ownedProxies.size > 0;
    console.log(`🔍 Has owned proxies: ${hasProxies} (${this.ownedProxies.size} total)`);
    return hasProxies;
  }

  // Get working owned proxies count
  getWorkingProxiesCount() {
    const workingCount = Array.from(this.ownedProxies.values()).filter(p => p.status === 'working').length;
    console.log(`✅ Working proxies count: ${workingCount}`);
    return workingCount;
  }

  // Get usable proxies count (working + untested)
  getUsableProxiesCount() {
    const usableCount = Array.from(this.ownedProxies.values()).filter(p => 
      p.status === 'working' || p.status === 'untested'
    ).length;
    console.log(`🎯 Usable proxies count: ${usableCount}`);
    return usableCount;
  }

  // Get available (unassigned) usable proxies count
  getAvailableUsableProxiesCount() {
    const availableCount = Array.from(this.ownedProxies.values()).filter(proxy => {
      const proxyKey = `${proxy.ip}:${proxy.port}`;
      const isUsable = proxy.status === 'working' || proxy.status === 'untested';
      const isAvailable = !this.isProxyAssigned(proxyKey);
      return isUsable && isAvailable;
    }).length;
    console.log(`🎯 Available usable proxies count: ${availableCount}`);
    return availableCount;
  }

  // Debug method to log all proxies
  debugLogProxies() {
    console.log('🔧 Debug: All owned proxies:');
    if (this.ownedProxies.size === 0) {
      console.log('  No proxies loaded');
      return;
    }
    
    Array.from(this.ownedProxies.values()).forEach((proxy, index) => {
      const proxyKey = `${proxy.ip}:${proxy.port}`;
      const isAssigned = this.isProxyAssigned(proxyKey);
      const assignedTo = Array.from(this.assignedProxies.entries()).find(([, key]) => key === proxyKey)?.[0] || 'none';
      
      console.log(`  ${index + 1}. ${proxy.ip}:${proxy.port} (${proxy.status}) - ${proxy.country} (${proxy.countryCode}) ${isAssigned ? `[ASSIGNED to ${assignedTo}]` : '[AVAILABLE]'}`);
    });
    
    console.log('🔧 Current assignments:');
    for (const [sessionId, proxyKey] of this.assignedProxies.entries()) {
      console.log(`  Session ${sessionId} -> ${proxyKey}`);
    }
  }

  // Get proxy by IP:Port
  getProxyByKey(key) {
    return this.ownedProxies.get(key);
  }

  // Trigger custom event when proxies are updated
  triggerProxiesUpdated() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('proxiesUpdated'));
    }
  }

  // Clean up assignments for sessions that no longer exist
  cleanupStaleAssignments(activeSessions = []) {
    let cleanedCount = 0;
    for (const sessionId of this.assignedProxies.keys()) {
      if (!activeSessions.includes(sessionId)) {
        this.assignedProxies.delete(sessionId);
        cleanedCount++;
      }
    }
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} stale proxy assignments`);
    }
  }
}

// Create singleton instance
const ownedProxyManager = new OwnedProxyManager();

// Export functions
export const assignOwnedProxyForSession = (sessionId, fingerprint, preferences) => {
  return ownedProxyManager.assignOwnedProxyForSession(sessionId, fingerprint, preferences);
};

export const releaseProxyForSession = (sessionId) => {
  return ownedProxyManager.releaseProxyForSession(sessionId);
};

export const updateOwnedProxyUsage = (proxyKey, event, data) => {
  return ownedProxyManager.updateOwnedProxyUsage(proxyKey, event, data);
};

export const getOwnedProxyStats = () => {
  return ownedProxyManager.getOwnedProxyStats();
};

export const hasOwnedProxies = () => {
  return ownedProxyManager.hasOwnedProxies();
};

export const getWorkingProxiesCount = () => {
  return ownedProxyManager.getWorkingProxiesCount();
};

export const getUsableProxiesCount = () => {
  return ownedProxyManager.getUsableProxiesCount();
};

export const getAvailableUsableProxiesCount = () => {
  return ownedProxyManager.getAvailableUsableProxiesCount();
};

export const reloadOwnedProxies = () => {
  return ownedProxyManager.reloadProxies();
};

export const debugLogProxies = () => {
  return ownedProxyManager.debugLogProxies();
};

export const triggerProxiesUpdated = () => {
  return ownedProxyManager.triggerProxiesUpdated();
};

export const cleanupStaleAssignments = (activeSessions) => {
  return ownedProxyManager.cleanupStaleAssignments(activeSessions);
};

export default ownedProxyManager;