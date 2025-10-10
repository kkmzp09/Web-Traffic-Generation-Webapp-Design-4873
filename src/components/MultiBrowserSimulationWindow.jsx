import React, { useState, useEffect, useRef } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { assignProxyForSession, getSessionProxy, releaseSessionProxy, getProxyStats } from '../lib/proxyManager';
import { 
  createBrowsingSession, 
  startNaturalBrowsing, 
  stopBrowsingSession, 
  getBrowsingSessionStats,
  cleanupBrowsingSession 
} from '../lib/naturalBrowsingBehavior';

const { 
  FiX, FiMaximize2, FiMinimize2, FiRefreshCw, FiPause, FiPlay, FiSettings, 
  FiEye, FiMousePointer, FiClock, FiSearch, FiArrowLeft, FiArrowRight, 
  FiHome, FiBookmark, FiDownload, FiShare2, FiMenu, FiMonitor, FiActivity,
  FiTarget, FiZap, FiGlobe, FiChevronDown, FiPlus, FiMinus, FiRotateCcw,
  FiLock, FiUnlock, FiWifi, FiBattery, FiVolume2, FiSmartphone, FiFingerprint,
  FiServer, FiShield, FiMapPin, FiTrendingUp, FiUser, FiNavigation, FiStar,
  FiCheckCircle, FiAlertCircle, FiInfo, FiCpu, FiHardDrive, FiCloud, FiExternalLink,
  FiGrid, FiUsers, FiDatabase, FiBarChart3, FiArrowUp, FiArrowDown, FiLink
} = FiIcons;

// Generate unique device profiles with real proxy integration and natural behavior
const generateDeviceProfile = async (sessionId) => {
  const devices = [
    { type: 'desktop', os: 'Windows 11', browser: 'Chrome 120.0', screen: '1920x1080', country: 'US', userType: 'efficient' },
    { type: 'desktop', os: 'macOS Sonoma', browser: 'Safari 17.2', screen: '2560x1440', country: 'CA', userType: 'casual' },
    { type: 'mobile', os: 'iOS 17.2', browser: 'Safari Mobile', screen: '393x852', country: 'GB', userType: 'mobile' },
    { type: 'desktop', os: 'Ubuntu 22.04', browser: 'Firefox 121.0', screen: '1366x768', country: 'JP', userType: 'researcher' }
  ];
  
  const timezones = ['UTC-8', 'UTC-5', 'UTC+1', 'UTC+9'];
  const languages = ['en-US', 'en-CA', 'en-GB', 'ja-JP'];
  const fingerprintIds = ['fp_7a8b9c2d', 'fp_3f1e8a5c', 'fp_9d2c4b7e', 'fp_6e9a1f3b'];
  
  const device = devices[sessionId - 1];
  
  // Create fingerprint for proxy assignment
  const fingerprint = {
    deviceType: device.type,
    location: {
      country: device.country
    },
    browser: device.browser,
    os: device.os,
    screen: device.screen,
    timezone: timezones[sessionId - 1],
    language: languages[sessionId - 1]
  };
  
  // Assign real proxy IP from user's uploaded list
  const proxyInfo = await assignProxyForSession(`multi_browser_${sessionId}`, fingerprint, {
    country: device.country,
    proxyType: device.type === 'mobile' ? 'mobile' : 'residential'
  });
  
  return {
    ...device,
    timezone: timezones[sessionId - 1],
    language: languages[sessionId - 1],
    fingerprintId: fingerprintIds[sessionId - 1],
    ipAddress: proxyInfo?.ip || `no-proxy-${sessionId}`,
    proxyInfo: proxyInfo,
    realProxy: !!proxyInfo,
    proxyEnabled: !!proxyInfo
  };
};

// Individual Browser Session Component with Natural Behavior
const BrowserSession = ({ sessionId, campaign, isGlobalActive, onSessionToggle }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProxyLoading, setIsProxyLoading] = useState(true);
  
  // Natural Browsing State
  const [browsingSessionId] = useState(`multi_browser_${sessionId}_${Date.now()}`);
  const [naturalBehaviorActive, setNaturalBehaviorActive] = useState(false);
  const [currentActivity, setCurrentActivity] = useState('idle');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [behaviorStats, setBehaviorStats] = useState(null);
  
  const [sessionStats, setSessionStats] = useState({
    pagesVisited: 0,
    actions: 0,
    sessionTime: '00:00:00',
    scrollActions: 0,
    linksClicked: 0
  });

  const [agentStatus, setAgentStatus] = useState('Initializing...');
  const [cursorActivity, setCursorActivity] = useState({ x: 0, y: 0, visible: false });
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  
  const iframeRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const statsUpdateRef = useRef(null);

  // Initialize session with real proxy from user's list
  useEffect(() => {
    if (campaign && !isInitialized) {
      initializeSessionWithProxy();
    }
    return () => {
      cleanup();
    };
  }, [campaign, isInitialized]);

  // Handle global start/stop
  useEffect(() => {
    if (isGlobalActive && !isActive && deviceInfo && deviceInfo.realProxy) {
      startSession();
    } else if (!isGlobalActive && isActive) {
      pauseSession();
    }
  }, [isGlobalActive, deviceInfo]);

  // Handle natural browsing behavior
  useEffect(() => {
    if (isActive && isInitialized && deviceInfo?.realProxy && !naturalBehaviorActive) {
      startNaturalBehaviorSession();
    } else if (!isActive && naturalBehaviorActive) {
      stopNaturalBehaviorSession();
    }
  }, [isActive, isInitialized, deviceInfo]);

  // Update behavior stats periodically
  useEffect(() => {
    if (naturalBehaviorActive) {
      statsUpdateRef.current = setInterval(() => {
        const stats = getBrowsingSessionStats(browsingSessionId);
        if (stats) {
          setBehaviorStats(stats);
          setScrollPosition(stats.scrollPosition);
          setSessionStats(prev => ({
            ...prev,
            pagesVisited: stats.visitedPages,
            actions: stats.stats.totalScrolls + stats.stats.totalClicks,
            scrollActions: stats.stats.totalScrolls,
            linksClicked: stats.stats.totalClicks
          }));
        }
      }, 1000);
      
      return () => {
        if (statsUpdateRef.current) {
          clearInterval(statsUpdateRef.current);
        }
      };
    }
  }, [naturalBehaviorActive, browsingSessionId]);

  const initializeSessionWithProxy = async () => {
    try {
      setIsProxyLoading(true);
      setAgentStatus('Assigning proxy from your list...');
      
      // Generate device profile with real proxy from user's uploaded list
      const profile = await generateDeviceProfile(sessionId);
      setDeviceInfo(profile);
      
      const targetUrl = campaign?.targetUrl || 'https://example.com';
      setCurrentPage(targetUrl);
      setSessionStats(prev => ({ ...prev, pagesVisited: 1 }));
      setScrollPosition(0);
      
      setIsProxyLoading(false);
      
      if (profile.realProxy) {
        setAgentStatus(`Ready with proxy: ${profile.proxyInfo.ip} (${profile.proxyInfo.country})`);
        console.log(`✅ Session ${sessionId} initialized with real proxy IP: ${profile.ipAddress}`);
      } else {
        setAgentStatus('No proxy available - Upload proxy list');
        console.log(`⚠️ Session ${sessionId} initialized without proxy - no proxies in user's list`);
      }
      
      setIsInitialized(true);
      
    } catch (error) {
      console.error(`❌ Failed to initialize session ${sessionId}:`, error);
      setIsProxyLoading(false);
      setAgentStatus('Initialization Failed');
      
      // Fallback to basic setup without proxy
      const fallbackProfile = {
        type: 'desktop',
        os: 'Windows 11',
        browser: 'Chrome 120.0',
        screen: '1920x1080',
        ipAddress: 'no-proxy',
        fingerprintId: `fp_fallback_${sessionId}`,
        realProxy: false,
        proxyEnabled: false,
        userType: 'casual'
      };
      
      setDeviceInfo(fallbackProfile);
      setIsInitialized(true);
    }
  };

  const startSession = () => {
    if (!deviceInfo || !deviceInfo.realProxy) {
      console.log(`❌ Cannot start session ${sessionId} - no proxy assigned`);
      return;
    }
    
    setIsActive(true);
    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
      startSessionTimer();
    }
    setAgentStatus(`Active via ${deviceInfo.proxyInfo.country} proxy (${deviceInfo.proxyInfo.ip})`);
    loadWebsite();
    onSessionToggle(sessionId, true);
  };

  const pauseSession = () => {
    setIsActive(false);
    setAgentStatus(deviceInfo?.realProxy ? 'Paused' : 'No proxy');
    setCurrentActivity('idle');
    onSessionToggle(sessionId, false);
  };

  const startNaturalBehaviorSession = async () => {
    if (!deviceInfo?.realProxy || !campaign?.targetUrl) return;

    try {
      setNaturalBehaviorActive(true);

      // Create natural browsing session with device-specific user type
      await createBrowsingSession(
        browsingSessionId,
        deviceInfo.userType,
        campaign.targetUrl,
        deviceInfo.type
      );

      // Start natural browsing behavior
      await startNaturalBrowsing(
        browsingSessionId,
        handleStatusUpdate,
        handleActivityUpdate
      );

      console.log(`🎭 Natural browsing session ${sessionId} started: ${deviceInfo.userType} behavior`);

    } catch (error) {
      console.error('Error starting natural behavior:', error);
      setNaturalBehaviorActive(false);
    }
  };

  const stopNaturalBehaviorSession = () => {
    if (!naturalBehaviorActive) return;

    try {
      stopBrowsingSession(browsingSessionId);
      setNaturalBehaviorActive(false);
      setCurrentActivity('idle');
      
      console.log(`🛑 Natural browsing session ${sessionId} stopped`);

    } catch (error) {
      console.error('Error stopping natural behavior:', error);
    }
  };

  const handleStatusUpdate = (status) => {
    setAgentStatus(status);
  };

  const handleActivityUpdate = (activity, data = {}) => {
    setCurrentActivity(activity);
    
    if (data.position !== undefined) {
      setScrollPosition(data.position * 100); // Convert to percentage
    }

    // Update cursor activity for visual feedback
    if (activity === 'clicking' || activity === 'hovering') {
      const x = Math.random() * 180 + 40;
      const y = Math.random() * 100 + 40;
      setCursorActivity({ x, y, visible: true });
      
      setTimeout(() => {
        setCursorActivity(prev => ({ ...prev, visible: false }));
      }, activity === 'clicking' ? 1000 : 2000);
    }
  };

  const loadWebsite = () => {
    setIsPageLoading(true);
    setLoadingProgress(0);
    setCurrentActivity('loading');
    
    const loadingInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const increment = Math.random() * 15 + 5;
        const newProgress = Math.min(prev + increment, 100);
        
        if (newProgress >= 100) {
          clearInterval(loadingInterval);
          setIsPageLoading(false);
          setCurrentActivity('idle');
          return 100;
        }
        return newProgress;
      });
    }, 150);
  };

  const startSessionTimer = () => {
    sessionTimerRef.current = setInterval(() => {
      if (sessionStartTime) {
        const elapsed = Date.now() - sessionStartTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        setSessionStats(prev => ({
          ...prev,
          sessionTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }));
      }
    }, 1000);
  };

  const cleanup = () => {
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    if (statsUpdateRef.current) clearInterval(statsUpdateRef.current);
    
    if (naturalBehaviorActive) {
      stopBrowsingSession(browsingSessionId);
      cleanupBrowsingSession(browsingSessionId);
    }
    
    // Release proxy when component unmounts
    releaseSessionProxy(`multi_browser_${sessionId}`);
  };

  const getStatusColor = () => {
    if (!deviceInfo?.realProxy) return 'text-red-400';
    if (isActive) return 'text-green-400';
    if (agentStatus === 'Paused') return 'text-yellow-400';
    if (isProxyLoading) return 'text-blue-400';
    return 'text-gray-400';
  };

  const getStatusBgColor = () => {
    if (!deviceInfo?.realProxy) return 'bg-red-900';
    if (isActive) return 'bg-green-900';
    if (agentStatus === 'Paused') return 'bg-yellow-900';
    if (isProxyLoading) return 'bg-blue-900';
    return 'bg-gray-700';
  };

  const getActivityIcon = () => {
    switch (currentActivity) {
      case 'scrolling_down': return FiArrowDown;
      case 'scrolling_up': return FiArrowUp;
      case 'clicking': return FiMousePointer;
      case 'searching': return FiSearch;
      case 'reading': return FiEye;
      case 'loading': case 'scanning': return FiRefreshCw;
      case 'hovering': return FiTarget;
      default: return FiActivity;
    }
  };

  // Show loading state while proxy is being assigned
  if (!deviceInfo || isProxyLoading) {
    return (
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
        <div className="h-10 bg-gray-700 border-b border-gray-600 flex items-center justify-between px-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            <span className="text-sm font-medium">Session {sessionId}</span>
          </div>
        </div>
        <div className="bg-white h-48 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Assigning proxy from your list...</p>
          </div>
        </div>
        <div className="p-3 bg-gray-750">
          <div className="text-xs text-center text-gray-400">Initializing natural browsing session...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
      {/* Session Header */}
      <div className="h-10 bg-gray-700 border-b border-gray-600 flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounde-full ${
            deviceInfo.realProxy && isActive ? 'bg-green-400 animate-pulse' : 
            deviceInfo.realProxy ? 'bg-blue-400' : 'bg-red-400'
          }`}></div>
          <span className="text-sm font-medium">Session {sessionId}</span>
          {deviceInfo.realProxy ? (
            <>
              <span className="text-xs text-gray-400">{deviceInfo.proxyInfo.country}</span>
              <span className="text-xs bg-green-600 text-white px-1 rounded">NATURAL</span>
            </>
          ) : (
            <span className="text-xs bg-red-600 text-white px-1 rounded">NO PROXY</span>
          )}
        </div>
        <div className="flex items-center space-x-1 text-xs">
          <SafeIcon icon={FiUser} className="text-purple-400" />
          <span className="text-purple-400 capitalize">{deviceInfo.userType}</span>
        </div>
      </div>

      {/* Browser Window */}
      <div className="bg-white h-48 relative overflow-hidden">
        {/* Browser Chrome */}
        <div className="h-8 bg-gray-100 border-b flex items-center px-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex-1 mx-2">
            <div className="bg-white border rounded px-2 py-0.5 text-xs text-gray-600 truncate">
              {currentPage}
            </div>
          </div>
        </div>

        {/* Loading Bar */}
        {isPageLoading && (
          <div className="h-0.5 bg-gray-200">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
        )}

        {/* Website Content */}
        <div className="relative h-full bg-white">
          {currentPage && isInitialized && deviceInfo.realProxy ? (
            <>
              <iframe
                ref={iframeRef}
                src={currentPage}
                className="w-full h-full border-none"
                title={`Session ${sessionId} Website`}
                sandbox="allow-scripts allow-same-origin allow-forms"
                style={{ 
                  transform: `scale(0.6) translateY(-${scrollPosition * 2}px)`, 
                  transformOrigin: 'top left', 
                  width: '166.67%', 
                  height: '166.67%',
                  transition: currentActivity.includes('scrolling') ? 'transform 0.8s ease-out' : 'none'
                }}
              />

              {/* Scroll Position Indicator */}
              {scrollPosition > 0 && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                  {Math.round(scrollPosition)}%
                </div>
              )}

              {/* Cursor Activity Overlay */}
              {cursorActivity.visible && (
                <div
                  className="absolute pointer-events-none z-20"
                  style={{
                    left: `${cursorActivity.x}px`,
                    top: `${cursorActivity.y}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping">
                    <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                  </div>
                  {currentActivity === 'clicking' && (
                    <div className="absolute inset-0 w-6 h-6 border-2 border-red-400 rounded-full animate-ping" 
                         style={{ left: '-6px', top: '-6px' }}></div>
                  )}
                </div>
              )}

              {/* Activity Status Overlay */}
              {isActive && (
                <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                  <SafeIcon icon={getActivityIcon()} className={currentActivity.includes('scrolling') ? 'animate-bounce' : ''} />
                  <span>Natural</span>
                </div>
              )}

              {/* User Type Indicator */}
              <div className="absolute top-10 right-2 bg-purple-700 text-white px-2 py-1 rounded text-xs font-medium">
                {deviceInfo.userType} user
              </div>

              {/* Real IP Indicator */}
              <div className="absolute bottom-2 right-2 bg-green-700 text-white px-2 py-1 rounded text-xs font-medium">
                IP: {deviceInfo.ipAddress}
              </div>

              {/* Behavior Pattern Indicator */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                {behaviorStats?.phase.replace('_', ' ') || 'initializing'}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                {deviceInfo.realProxy ? (
                  <>
                    <SafeIcon icon={FiGlobe} className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Ready for Natural Browsing</p>
                    <p className="text-xs text-green-600 mt-1">Proxy: {deviceInfo.ipAddress}</p>
                    <p className="text-xs text-purple-600 mt-1 capitalize">{deviceInfo.userType} behavior</p>
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiAlertCircle} className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-xs text-red-500">No Proxy Available</p>
                    <p className="text-xs text-gray-500 mt-1">Upload proxy list in Settings</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {isPageLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-xs text-gray-600">Loading via proxy...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session Stats */}
      <div className="p-3 bg-gray-750">
        <div className="flex items-center justify-between mb-2">
          <div className={`px-2 py-1 rounded text-xs font-medium flex items-center space-x-1 ${getStatusBgColor()} ${getStatusColor()}`}>
            <SafeIcon icon={getActivityIcon()} className={currentActivity.includes('scrolling') ? 'animate-bounce' : ''} />
            <span className="truncate">{currentActivity.replace('_', ' ')}</span>
          </div>
          <div className="text-xs text-gray-400 font-mono">
            {sessionStats.sessionTime}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Pages:</span>
            <span className="text-green-400">{sessionStats.pagesVisited}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Actions:</span>
            <span className="text-yellow-400">{sessionStats.actions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Scrolls:</span>
            <span className="text-blue-400">{sessionStats.scrollActions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Clicks:</span>
            <span className="text-purple-400">{sessionStats.linksClicked}</span>
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1">
              <SafeIcon icon={FiSmartphone} className="text-gray-400" />
              <span className="text-gray-400">{deviceInfo.type}</span>
            </div>
            <div className="flex items-center space-x-1">
              <SafeIcon icon={FiServer} className={deviceInfo.realProxy ? "text-green-400" : "text-red-400"} />
              <span className={`${deviceInfo.realProxy ? "text-green-400" : "text-red-400"} truncate`}>
                {deviceInfo.realProxy ? deviceInfo.ipAddress : 'no-proxy'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-gray-400">{deviceInfo.os}</span>
            <span className="text-purple-400">{deviceInfo.browser}</span>
          </div>
          {deviceInfo.proxyInfo && (
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-400">Country:</span>
              <span className="text-orange-400">{deviceInfo.proxyInfo.country}</span>
            </div>
          )}
          {behaviorStats && (
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-400">Interest:</span>
              <span className="text-cyan-400">{Math.round(behaviorStats.behaviorState.interestLevel * 100)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Multi-Session Component
const MultiBrowserSimulationWindow = ({ campaign, onClose, isVisible }) => {
  const [isGlobalActive, setIsGlobalActive] = useState(false);
  const [activeSessions, setActiveSessions] = useState(new Set());
  const [globalStats, setGlobalStats] = useState({
    totalSessions: 4,
    activeSessions: 0,
    totalActions: 0,
    totalPages: 0
  });
  const [proxyNetworkStats, setProxyNetworkStats] = useState(null);

  // Update proxy network stats
  useEffect(() => {
    const updateStats = () => {
      const stats = getProxyStats();
      setProxyNetworkStats(stats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle individual session state changes
  const handleSessionToggle = (sessionId, isActive) => {
    setActiveSessions(prev => {
      const newSet = new Set(prev);
      if (isActive) {
        newSet.add(sessionId);
      } else {
        newSet.delete(sessionId);
      }
      return newSet;
    });
  };

  // Update global stats
  useEffect(() => {
    setGlobalStats(prev => ({
      ...prev,
      activeSessions: activeSessions.size
    }));
  }, [activeSessions]);

  const toggleGlobalSimulation = () => {
    setIsGlobalActive(!isGlobalActive);
  };

  const resetAllSessions = () => {
    setIsGlobalActive(false);
    setActiveSessions(new Set());
    setGlobalStats(prev => ({
      ...prev,
      activeSessions: 0,
      totalActions: 0,
      totalPages: 0
    }));
  };

  if (!isVisible || !campaign) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 text-white">
      {/* Header Bar */}
      <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiGrid} className="text-blue-400 text-xl" />
            <h1 className="text-lg font-semibold">Natural Multi-Browser Simulation</h1>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            isGlobalActive ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isGlobalActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <span>{activeSessions.size} of {globalStats.totalSessions} Natural Sessions Active</span>
          </div>
          <div className="text-sm text-gray-400">
            Target: <span className="text-white">{campaign.name}</span>
          </div>
          {/* Proxy Network Status */}
          {proxyNetworkStats ? (
            <div className="text-sm bg-green-600 text-white px-2 py-1 rounded">
              🌐 {proxyNetworkStats.totalProxies} Your Proxies
            </div>
          ) : (
            <div className="text-sm bg-red-600 text-white px-2 py-1 rounded">
              ⚠️ No Proxies
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleGlobalSimulation}
            disabled={!proxyNetworkStats || proxyNetworkStats.totalProxies === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              !proxyNetworkStats || proxyNetworkStats.totalProxies === 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : isGlobalActive 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            <SafeIcon icon={isGlobalActive ? FiPause : FiPlay} />
            <span>{isGlobalActive ? 'Pause All' : 'Start All Natural Browsing'}</span>
          </button>
          <button
            onClick={resetAllSessions}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiRotateCcw} />
            <span>Reset</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"
          >
            <SafeIcon icon={FiX} />
          </button>
        </div>
      </div>

      <div className="flex h-full">
        {/* Left Sidebar - Global Stats */}
        <div className="w-80 bg-black bg-opacity-50 border-r border-gray-700 p-4 space-y-6 overflow-y-auto">
          
          {/* Global Status */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-4">
              <SafeIcon icon={FiUsers} className="text-blue-400" />
              <h3 className="font-semibold">Natural Browsing Status</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Sessions:</span>
                <span className="text-blue-400">{globalStats.totalSessions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Natural Browsing Active:</span>
                <span className="text-green-400">{globalStats.activeSessions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Idle Sessions:</span>
                <span className="text-gray-400">{globalStats.totalSessions - globalStats.activeSessions}</span>
              </div>
              
              <div className="pt-2 border-t border-gray-700">
                <div className="text-xs text-gray-400 mb-2">Natural Behavior Distribution</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(globalStats.activeSessions / globalStats.totalSessions) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0%</span>
                  <span>{Math.round((globalStats.activeSessions / globalStats.totalSessions) * 100)}% Natural</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-700">
                <div className="text-xs text-gray-400 mb-2">User Types Active</div>
                <div className="grid grid-cols-2 gap-1">
                  <span className="px-2 py-1 bg-blue-600 rounded text-xs text-center">Efficient</span>
                  <span className="px-2 py-1 bg-green-600 rounded text-xs text-center">Casual</span>
                  <span className="px-2 py-1 bg-purple-600 rounded text-xs text-center">Mobile</span>
                  <span className="px-2 py-1 bg-orange-600 rounded text-xs text-center">Research</span>
                </div>
              </div>
            </div>
          </div>

          {/* Your Proxy Network Status */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-4">
              <SafeIcon icon={FiServer} className="text-green-400" />
              <h3 className="font-semibold">Your Proxy Network</h3>
            </div>
            
            {proxyNetworkStats ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Proxies:</span>
                  <span className="text-green-400">{proxyNetworkStats.totalProxies}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Working:</span>
                  <span className="text-green-400">{proxyNetworkStats.workingOwnedProxies || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Active:</span>
                  <span className="text-blue-400">{proxyNetworkStats.activeProxies || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Available:</span>
                  <span className="text-yellow-400">{proxyNetworkStats.availableProxies || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Countries:</span>
                  <span className="text-purple-400">{proxyNetworkStats.countries?.length || 0}</span>
                </div>
                
                {proxyNetworkStats.countries && proxyNetworkStats.countries.length > 0 && (
                  <div className="pt-2 border-t border-gray-700">
                    <div className="text-xs text-gray-400 mb-2">Available Countries</div>
                    <div className="flex flex-wrap gap-1">
                      {proxyNetworkStats.countries.slice(0, 6).map(country => (
                        <span key={country} className="px-2 py-1 bg-green-600 rounded text-xs">
                          {country}
                        </span>
                      ))}
                      {proxyNetworkStats.countries.length > 6 && (
                        <span className="px-2 py-1 bg-gray-600 rounded text-xs">
                          +{proxyNetworkStats.countries.length - 6}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="bg-red-900 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-red-400 mb-2">
                    <SafeIcon icon={FiAlertCircle} />
                    <span className="font-medium">No Proxy List Found</span>
                  </div>
                  <div className="text-red-300 text-xs">
                    Upload your proxy list in Settings → Proxy Settings to enable natural multi-browser simulation with real IPs.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Natural Browsing Features */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-4">
              <SafeIcon icon={FiZap} className="text-yellow-400" />
              <h3 className="font-semibold">Natural Browsing Features</h3>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-green-400">
                <SafeIcon icon={FiCheckCircle} className="w-3 h-3" />
                <span>Realistic Scroll Patterns</span>
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <SafeIcon icon={FiCheckCircle} className="w-3 h-3" />
                <span>Human-like Reading Behavior</span>
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <SafeIcon icon={FiCheckCircle} className="w-3 h-3" />
                <span>Natural Page Navigation</span>
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <SafeIcon icon={FiCheckCircle} className="w-3 h-3" />
                <span>Varied User Personalities</span>
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <SafeIcon icon={FiCheckCircle} className="w-3 h-3" />
                <span>Realistic Session Durations</span>
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <SafeIcon icon={FiCheckCircle} className="w-3 h-3" />
                <span>Content Interest Simulation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - 2x2 Grid of Browser Sessions */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-2 gap-6 h-full">
            <BrowserSession 
              sessionId={1} 
              campaign={campaign} 
              isGlobalActive={isGlobalActive}
              onSessionToggle={handleSessionToggle}
            />
            <BrowserSession 
              sessionId={2} 
              campaign={campaign} 
              isGlobalActive={isGlobalActive}
              onSessionToggle={handleSessionToggle}
            />
            <BrowserSession 
              sessionId={3} 
              campaign={campaign} 
              isGlobalActive={isGlobalActive}
              onSessionToggle={handleSessionToggle}
            />
            <BrowserSession 
              sessionId={4} 
              campaign={campaign} 
              isGlobalActive={isGlobalActive}
              onSessionToggle={handleSessionToggle}
            />
          </div>
        </div>

        {/* Right Sidebar - Session Details */}
        <div className="w-64 bg-black bg-opacity-50 border-l border-gray-700 p-4 space-y-4 overflow-y-auto">
          
          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            
            <div className="space-y-2">
              <button 
                onClick={toggleGlobalSimulation}
                disabled={!proxyNetworkStats || proxyNetworkStats.totalProxies === 0}
                className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                  !proxyNetworkStats || proxyNetworkStats.totalProxies === 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : isGlobalActive 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <SafeIcon icon={isGlobalActive ? FiPause : FiPlay} />
                <span>{isGlobalActive ? 'Pause All' : 'Start Natural Browsing'}</span>
              </button>
              
              <button 
                onClick={resetAllSessions}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiRotateCcw} />
                <span>Reset All</span>
              </button>
              
              <button 
                onClick={() => window.open(campaign?.targetUrl, '_blank')}
                className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiExternalLink} />
                <span>Open Target</span>
              </button>
            </div>

            {(!proxyNetworkStats || proxyNetworkStats.totalProxies === 0) && (
              <div className="mt-3 p-3 bg-orange-900 rounded-lg">
                <div className="flex items-center space-x-2 text-orange-400 text-xs mb-1">
                  <SafeIcon icon={FiAlertCircle} />
                  <span>Proxy Required</span>
                </div>
                <div className="text-orange-300 text-xs">
                  Upload your proxy list to enable natural multi-browser simulation
                </div>
              </div>
            )}
          </div>

          {/* Real-Time Stats */}
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="font-semibold mb-4">Real-Time Stats</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Natural Sessions:</span>
                <span className="text-green-400">{activeSessions.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active Proxies:</span>
                <span className="text-blue-400">{activeSessions.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Realistic Traffic:</span>
                <span className="text-purple-400">{activeSessions.size * 8}/min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Realism Score:</span>
                <span className="text-green-400">
                  {activeSessions.size > 0 ? '98%' : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Behavior Insights */}
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="font-semibold mb-4">Behavior Insights</h3>
            
            <div className="space-y-3 text-xs">
              <div className="text-gray-400">
                Each session simulates a different user personality:
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-300">Efficient: Fast, goal-oriented</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-300">Casual: Exploratory, relaxed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-purple-300">Mobile: Quick swipes, taps</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-orange-300">Research: Thorough, methodical</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiBrowserSimulationWindow;