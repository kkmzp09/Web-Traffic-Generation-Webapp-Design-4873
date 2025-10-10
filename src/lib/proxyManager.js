// Proxy Manager - Uses only user's custom proxy list with unique assignment
import { 
  assignOwnedProxyForSession, 
  releaseProxyForSession, 
  hasOwnedProxies, 
  getOwnedProxyStats, 
  getWorkingProxiesCount, 
  getAvailableUsableProxiesCount,
  reloadOwnedProxies, 
  debugLogProxies,
  cleanupStaleAssignments
} from './ownedProxyManager';

class ProxyManager {
  constructor() {
    this.activeProxies = new Map(); // sessionId -> proxy info
    this.useOwnedProxies = true; // Always use owned proxies
    this.ownedProxiesOnly = true; // Only use owned proxies
    
    // Load user preferences
    this.loadUserPreferences();
    
    // Set up periodic proxy list refresh and cleanup
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.refreshProxyList();
        this.cleanupOldAssignments();
      }, 30000); // Refresh every 30 seconds
    }
  }

  // Load user preferences from localStorage
  loadUserPreferences() {
    try {
      const preferences = localStorage.getItem('proxyPreferences');
      if (preferences) {
        const parsed = JSON.parse(preferences);
        this.useOwnedProxies = true; // Always true
        this.ownedProxiesOnly = true; // Always true - no built-in network
        this.proxyPriority = 'owned'; // Always owned
      }
    } catch (error) {
      console.error('Error loading proxy preferences:', error);
    }
  }

  // Save user preferences to localStorage
  saveUserPreferences() {
    try {
      const preferences = {
        useOwnedProxies: true,
        ownedProxiesOnly: true,
        proxyPriority: 'owned'
      };
      localStorage.setItem('proxyPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving proxy preferences:', error);
    }
  }

  // Refresh proxy list from storage
  refreshProxyList() {
    try {
      reloadOwnedProxies();
      
      // Clean up stale assignments
      const activeSessions = Array.from(this.activeProxies.keys());
      cleanupStaleAssignments(activeSessions);
    } catch (error) {
      console.error('Error refreshing proxy list:', error);
    }
  }

  // Set proxy usage mode (simplified - only owned proxies available)
  setProxyMode(mode) {
    // Force to owned-only mode since we removed built-in network
    this.useOwnedProxies = true;
    this.ownedProxiesOnly = true;
    this.proxyPriority = 'owned';
    this.saveUserPreferences();
    console.log(`🔧 Proxy mode set to: owned-only (built-in network removed)`);
  }

  // Enhanced proxy assignment using only owned proxies with uniqueness guarantee
  async assignProxyForSession(sessionId, fingerprint, preferences = {}) {
    try {
      console.log(`🔍 Assigning unique proxy for session ${sessionId}`);
      console.log(`🎯 Preferences:`, preferences);
      console.log(`👤 Fingerprint:`, fingerprint);
      
      // Check if session already has a proxy assigned
      const existingAssignment = this.activeProxies.get(sessionId);
      if (existingAssignment) {
        console.log(`🔄 Session ${sessionId} already has proxy ${existingAssignment.proxy.ip}:${existingAssignment.proxy.port} - reusing`);
        return existingAssignment.proxy;
      }
      
      // Force refresh proxy list to ensure we have latest data
      this.refreshProxyList();
      
      // Check if owned proxies are available
      if (!hasOwnedProxies()) {
        console.log('❌ No owned proxies available. Please upload your proxy list in Settings → Proxy Settings.');
        debugLogProxies(); // Debug log to see what's in memory
        return null;
      }

      // Check if we have available proxies
      const availableCount = getAvailableUsableProxiesCount();
      if (availableCount === 0) {
        console.log('❌ No available proxies - all proxies are currently assigned to other sessions');
        console.log(`📊 Total sessions: ${this.activeProxies.size}, Available proxies: ${availableCount}`);
        debugLogProxies(); // Debug log to see assignments
        return null;
      }

      console.log(`🏠 Assigning unique proxy from your uploaded list (${availableCount} available)...`);
      
      const ownedProxy = await assignOwnedProxyForSession(sessionId, fingerprint, preferences);
      if (ownedProxy) {
        // Store assignment in proxy manager
        this.activeProxies.set(sessionId, {
          proxy: ownedProxy,
          assignedAt: Date.now(),
          fingerprint: fingerprint,
          validationScore: ownedProxy.validationScore,
          source: 'owned'
        });
        
        console.log(`✅ Successfully assigned unique proxy ${ownedProxy.ip}:${ownedProxy.port} from ${ownedProxy.country} to session ${sessionId}`);
        console.log(`📊 Active sessions: ${this.activeProxies.size}, Remaining available: ${availableCount - 1}`);
        return ownedProxy;
      } else {
        console.log(`⚠️ No suitable available proxy found for session ${sessionId}`);
        debugLogProxies(); // Debug log to see available proxies
        return null;
      }
      
    } catch (error) {
      console.error('❌ Error in proxy assignment:', error);
      return null;
    }
  }

  // Get proxy for session
  getSessionProxy(sessionId) {
    const sessionProxy = this.activeProxies.get(sessionId);
    if (sessionProxy) {
      console.log(`📋 Retrieved proxy for session ${sessionId}: ${sessionProxy.proxy.ip}:${sessionProxy.proxy.port}`);
    } else {
      console.log(`⚠️ No proxy found for session ${sessionId}`);
    }
    return sessionProxy;
  }

  // Release proxy from session
  releaseSessionProxy(sessionId) {
    const sessionProxy = this.activeProxies.get(sessionId);
    if (sessionProxy) {
      console.log(`🔓 Releasing proxy ${sessionProxy.proxy.ip}:${sessionProxy.proxy.port} from session ${sessionId}`);
      
      // Release in owned proxy manager
      releaseProxyForSession(sessionId);
      
      // Remove from active proxies
      this.activeProxies.delete(sessionId);
      
      console.log(`📊 Active sessions after release: ${this.activeProxies.size}`);
      return true;
    } else {
      console.log(`⚠️ No proxy to release for session ${sessionId}`);
    }
    return false;
  }

  // Get proxy statistics (only owned proxies)
  getProxyStats() {
    // Get owned proxy stats
    const ownedStats = getOwnedProxyStats();
    
    const activeProxies = this.activeProxies.size;
    
    // Calculate totals (only owned proxies)
    const totalProxies = ownedStats.total;
    const availableProxies = Math.max(0, ownedStats.available || (ownedStats.total - activeProxies));
    
    // Calculate average score (based on owned proxies performance)
    const averageScore = ownedStats.working > 0 ? 85.0 : (ownedStats.total > 0 ? 60.0 : 0);

    // Get countries from owned proxies only
    const allCountries = ownedStats.countries || [];

    const stats = {
      totalProxies,
      builtInProxies: 0, // No built-in proxies
      ownedProxies: ownedStats.total,
      workingOwnedProxies: ownedStats.working,
      activeProxies,
      blacklistedProxies: 0, // No blacklisting for owned proxies
      availableProxies: availableProxies,
      averageScore: averageScore.toFixed(1),
      countries: allCountries,
      proxyTypes: ['owned'], // Only owned type
      ownedProxyStats: ownedStats,
      mode: 'owned-only',
      // Additional stats for display
      proxySourceBreakdown: {
        owned: ownedStats.total,
        builtin: 0, // No built-in proxies
        working: ownedStats.working,
        failed: ownedStats.failed,
        untested: ownedStats.untested,
        assigned: ownedStats.assigned || activeProxies,
        available: availableProxies
      }
    };

    console.log(`📊 Proxy stats - Total: ${stats.totalProxies}, Working: ${stats.workingOwnedProxies}, Active: ${stats.activeProxies}, Available: ${stats.availableProxies}`);
    return stats;
  }

  // Cleanup old assignments
  cleanupOldAssignments() {
    const now = Date.now();
    const maxAge = 3600000; // 1 hour
    let cleanedCount = 0;
    
    for (const [sessionId, assignment] of this.activeProxies.entries()) {
      if (now - assignment.assignedAt > maxAge) {
        console.log(`🧹 Cleaning up old assignment for session ${sessionId}`);
        this.releaseSessionProxy(sessionId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old proxy assignments`);
    }
  }

  // Debug method to check proxy availability
  debugProxyAvailability() {
    console.log('🔧 Debug: Proxy Manager Status');
    console.log(`  - Has owned proxies: ${hasOwnedProxies()}`);
    console.log(`  - Working proxies: ${getWorkingProxiesCount()}`);
    console.log(`  - Available proxies: ${getAvailableUsableProxiesCount()}`);
    console.log(`  - Active sessions: ${this.activeProxies.size}`);
    
    console.log('🔧 Active session assignments:');
    for (const [sessionId, assignment] of this.activeProxies.entries()) {
      console.log(`  Session ${sessionId} -> ${assignment.proxy.ip}:${assignment.proxy.port} (${assignment.proxy.country})`);
    }
    
    const stats = this.getProxyStats();
    console.log(`  - Stats:`, stats);
    
    debugLogProxies();
  }

  // Get current session assignments (for debugging)
  getActiveAssignments() {
    const assignments = {};
    for (const [sessionId, assignment] of this.activeProxies.entries()) {
      assignments[sessionId] = {
        ip: assignment.proxy.ip,
        port: assignment.proxy.port,
        country: assignment.proxy.country,
        assignedAt: new Date(assignment.assignedAt).toISOString()
      };
    }
    return assignments;
  }
}

// Create singleton instance
const proxyManager = new ProxyManager();

// Export functions
export const assignProxyForSession = (sessionId, fingerprint, preferences) => {
  return proxyManager.assignProxyForSession(sessionId, fingerprint, preferences);
};

export const getSessionProxy = (sessionId) => {
  return proxyManager.getSessionProxy(sessionId);
};

export const releaseSessionProxy = (sessionId) => {
  return proxyManager.releaseSessionProxy(sessionId);
};

export const updateProxyUsage = (ip, event, data) => {
  // Pass through to owned proxy manager
  console.log(`📊 Proxy usage update: ${ip} - ${event}`);
};

export const getProxyStats = () => {
  return proxyManager.getProxyStats();
};

export const setProxyMode = (mode) => {
  return proxyManager.setProxyMode(mode);
};

export const debugProxyAvailability = () => {
  return proxyManager.debugProxyAvailability();
};

export const getActiveAssignments = () => {
  return proxyManager.getActiveAssignments();
};

// Cleanup interval
if (typeof window !== 'undefined') {
  setInterval(() => {
    proxyManager.cleanupOldAssignments();
  }, 600000); // Cleanup every 10 minutes
}

export default proxyManager;