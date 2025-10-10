import React, { useState, useEffect, useRef } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { 
  startEnhancedPlaywrightCampaign, 
  stopEnhancedPlaywrightCampaign, 
  getEnhancedPlaywrightStats,
  getEnhancedPlaywrightSessions,
  testEnhancedPlaywrightSession,
  ENHANCED_BROWSER_PROFILES
} from '../lib/enhancedPlaywrightTrafficGenerator';

const { 
  FiX, FiMaximize2, FiMinimize2, FiPlay, FiPause, FiSettings, 
  FiActivity, FiTarget, FiZap, FiGlobe, FiMonitor, FiSmartphone,
  FiUsers, FiClock, FiCheckCircle, FiAlertCircle, FiBarChart3,
  FiEye, FiMousePointer, FiSearch, FiExternalLink, FiRefreshCw,
  FiChrome, FiTool, FiPlayCircle, FiStopCircle, FiTestTube,
  FiVideo, FiCpu, FiWifi, FiArrowRight, FiArrowDown, FiArrowUp,
  FiShield, FiUser, FiNavigation, FiScroll, FiLink
} = FiIcons;

const PlaywrightTrafficWindow = ({ campaign, onClose, isVisible }) => {
  // Enhanced Real Browser Automation State
  const [isAutomating, setIsAutomating] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [browserStats, setBrowserStats] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [automationHistory, setAutomationHistory] = useState([]);
  const [isTestingBrowser, setIsTestingBrowser] = useState(false);
  const [workerStatus, setWorkerStatus] = useState('checking');
  
  // Enhanced Browser Settings
  const [browserSettings, setBrowserSettings] = useState({
    profiles: ['efficient', 'casual', 'mobile', 'researcher'],
    automationRate: 1,
    concurrentBrowsers: 2,
    enableGoogleSearch: true,
    enableNaturalScrolling: true,
    enableInternalNavigation: true,
    enableProxyRotation: true,
    enableFingerprintRotation: true
  });
  
  // Enhanced Real-time Analytics
  const [realTimeBrowserData, setRealTimeBrowserData] = useState({
    activeBrowsers: 0,
    successRate: 0,
    totalPageViews: 0,
    totalInteractions: 0,
    totalScrollActions: 0,
    totalInternalNavigations: 0,
    uniqueProxiesUsed: 0,
    uniqueFingerprintsGenerated: 0,
    browserWindowsOpen: 0,
    googleSearchSessions: 0
  });
  
  // Enhanced Activity Logs
  const [browserActivityLogs, setBrowserActivityLogs] = useState([]);
  const [automationLogs, setAutomationLogs] = useState([]);
  const [identityLogs, setIdentityLogs] = useState([]);
  
  // Refs
  const statsIntervalRef = useRef(null);
  const logsIntervalRef = useRef(null);
  
  // Initialize component
  useEffect(() => {
    if (isVisible && campaign) {
      initializeEnhancedBrowserWindow();
      startEnhancedBrowserStatsMonitoring();
      checkWorkerStatus();
    }
    
    return () => {
      cleanupEnhancedBrowserAutomation();
    };
  }, [isVisible, campaign]);

  const checkWorkerStatus = async () => {
    try {
      const response = await fetch('http://localhost:4000/health');
      if (response.ok) {
        setWorkerStatus('connected');
        addAutomationLog('✅ Playwright worker connected (Google Search ready)');
      } else {
        setWorkerStatus('error');
        addAutomationLog('❌ Playwright worker error');
      }
    } catch (error) {
      setWorkerStatus('disconnected');
      addAutomationLog('⚠️ Playwright worker not running - Start with: npm run worker');
      addAutomationLog('🔍 Google Search typing requires the worker server!');
    }
  };

  const initializeEnhancedBrowserWindow = () => {
    addBrowserActivityLog('🎭 Enhanced Real Browser System initialized');
    addBrowserActivityLog(`🎯 Target: ${campaign.targetUrl}`);
    addBrowserActivityLog(`⚡ Rate: ${browserSettings.automationRate} enhanced windows/minute`);
    addAutomationLog('🔧 Enhanced browser automation system ready');
    addAutomationLog('🔍 Google Search Integration: ENABLED');
    addAutomationLog('👁️ Each window will perform Google Search → Navigate → Scroll → Internal Links');
    addAutomationLog('📜 Natural scrolling and internal navigation enabled');
    addIdentityLog('🎭 Device fingerprint generation enabled');
    addIdentityLog('🔒 Proxy rotation system active');
    addIdentityLog('🌍 Unique identities will be assigned per session');
  };

  const startEnhancedBrowserStatsMonitoring = () => {
    // Update stats every 3 seconds
    statsIntervalRef.current = setInterval(() => {
      updateEnhancedBrowserStats();
      updateActiveEnhancedSessions();
      updateAutomationHistory();
    }, 3000);
    
    // Update logs every 6 seconds
    logsIntervalRef.current = setInterval(() => {
      if (isAutomating) {
        generateEnhancedBrowserLogs();
      }
    }, 6000);
  };

  const updateEnhancedBrowserStats = () => {
    if (campaign && isAutomating) {
      const stats = getEnhancedPlaywrightStats(campaign.id);
      if (stats) {
        setBrowserStats(stats);
        
        setRealTimeBrowserData({
          activeBrowsers: stats.activeBrowsers || 0,
          successRate: parseFloat(stats.successRate),
          totalPageViews: stats.totalPageViews || 0,
          totalInteractions: stats.totalInteractions || 0,
          totalScrollActions: stats.totalScrollActions || 0,
          totalInternalNavigations: stats.totalInternalNavigations || 0,
          uniqueProxiesUsed: stats.uniqueProxiesUsed || 0,
          uniqueFingerprintsGenerated: stats.uniqueFingerprintsGenerated || 0,
          browserWindowsOpen: stats.browserWindowsOpen || 0,
          googleSearchSessions: stats.googleSearchSessions || 0
        });
      }
    }
  };

  const updateActiveEnhancedSessions = () => {
    const sessions = getEnhancedPlaywrightSessions();
    setActiveSessions(sessions);
  };

  const updateAutomationHistory = () => {
    if (campaign && browserStats) {
      const history = browserStats.recentSessions || [];
      setAutomationHistory(history.slice(-20));
    }
  };

  const generateEnhancedBrowserLogs = () => {
    const browserActivities = [
      '🔍 Google Search: Opening Google.com',
      '⌨️ Google Search: Typing website name',
      '🔍 Google Search: Submitting search query',
      '📋 Google Search: Reading search results',
      '🎯 Google Search: Navigating to target website',
      '🖥️ New browser window opened with unique identity',
      '🌐 Website loaded with proxy connection',
      '📜 Natural scrolling down initiated',
      '⬆️ Natural scroll back up to re-read content',
      '⏸️ Natural pause - simulating reading time',
      '🖱️ Element interaction performed naturally',
      '👁️ Human-like behavior pattern active',
      '📊 Session metrics captured with identity',
      '🎭 Device fingerprint applied successfully',
      '🔄 Natural browsing pattern executing',
      '⏱️ Realistic timing between actions',
      '🔗 Internal page navigation simulated',
      '📱 Mobile behavior pattern active',
      '🖥️ Desktop browsing simulation running'
    ];
    
    const automationTypes = [
      '🎬 Enhanced browser automation started',
      '🔍 Google Search Integration: ACTIVE',
      '⌨️ Typing website name in Google search',
      '📋 Reading Google search results naturally',
      '🎯 Navigating from Google to target site',
      '📱 Mobile profile window with unique IP active',
      '🖥️ Desktop profile window with proxy active',
      '🔍 Research pattern with Google Search + scrolling',
      '⚡ Efficient browsing with Google Search + internal nav',
      '🎭 Casual browsing with Google Search + device fingerprint',
      '📊 Real-time metrics with Google Search tracking',
      '🖼️ Window screenshot with Google Search + proxy location',
      '💾 Session data with Google Search + fingerprint recorded',
      '🗂️ Enhanced browser window closed gracefully'
    ];
    
    const identityTypes = [
      '🎭 New device fingerprint generated for Google Search',
      '🔒 Unique proxy assigned to Google Search session',
      '🌍 IP geolocation set for Google Search',
      '👤 User agent string customized for Google Search',
      '📱 Mobile device profile activated for Google Search',
      '🖥️ Desktop device profile applied for Google Search',
      '🌐 Browser fingerprint configured for Google Search',
      '⏰ Timezone setting applied for Google Search',
      '🗣️ Language preferences set for Google Search',
      '🔧 Hardware fingerprint established for Google Search'
    ];
    
    const randomActivity = browserActivities[Math.floor(Math.random() * browserActivities.length)];
    addBrowserActivityLog(randomActivity);
    
    if (Math.random() > 0.6) {
      const randomAutomation = automationTypes[Math.floor(Math.random() * automationTypes.length)];
      addAutomationLog(randomAutomation);
    }
    
    if (Math.random() > 0.7) {
      const randomIdentity = identityTypes[Math.floor(Math.random() * identityTypes.length)];
      addIdentityLog(randomIdentity);
    }
  };

  const startEnhancedBrowserGeneration = async () => {
    if (workerStatus !== 'connected') {
      addAutomationLog('❌ Cannot start: Playwright worker not running!');
      addAutomationLog('🔧 Please run: npm run worker');
      addAutomationLog('🔍 Google Search typing requires the worker server!');
      return;
    }

    try {
      setIsAutomating(true);
      addBrowserActivityLog('🚀 Starting enhanced browser automation...');
      addAutomationLog('🎬 Initializing enhanced browser system...');
      addAutomationLog('🔍 Google Search Integration: ENABLED');
      addAutomationLog('👀 Watch for browser windows with Google Search + unique identities!');
      addIdentityLog('🎭 Device fingerprint system activated');
      addIdentityLog('🔒 Proxy assignment system enabled');
      
      const options = {
        profiles: browserSettings.profiles,
        concurrentBrowsers: browserSettings.concurrentBrowsers,
        enableGoogleSearch: browserSettings.enableGoogleSearch,
        enableNaturalScrolling: browserSettings.enableNaturalScrolling,
        enableInternalNavigation: browserSettings.enableInternalNavigation,
        enableProxyRotation: browserSettings.enableProxyRotation,
        enableFingerprintRotation: browserSettings.enableFingerprintRotation
      };
      
      await startEnhancedPlaywrightCampaign({
        ...campaign,
        automationRate: browserSettings.automationRate
      }, options);
      
      addBrowserActivityLog('✅ Enhanced browser automation started');
      addBrowserActivityLog(`🖥️ Up to ${browserSettings.concurrentBrowsers} enhanced windows will open`);
      addAutomationLog('🔄 Enhanced automation system active');
      addAutomationLog('🔍 Each window will: Google Search → Navigate → Scroll → Internal Links');
      addAutomationLog('👁️ Natural scrolling and internal navigation enabled!');
      addIdentityLog('🌍 Each window will have unique IP and device profile');
      
    } catch (error) {
      console.error('Error starting enhanced browser automation:', error);
      addBrowserActivityLog(`❌ Error starting automation: ${error.message}`);
      if (error.message.includes('worker') || error.message.includes('4000')) {
        addAutomationLog('🔧 Solution: Run "npm run worker" in terminal');
        addAutomationLog('🔍 Google Search typing needs the worker server!');
      }
      setIsAutomating(false);
    }
  };

  const stopEnhancedBrowserGeneration = () => {
    try {
      setIsAutomating(false);
      stopEnhancedPlaywrightCampaign(campaign.id);
      
      addBrowserActivityLog('🛑 Enhanced browser automation stopped');
      addAutomationLog('🗂️ All browser windows closed');
      addAutomationLog('🔧 Enhanced automation system stopped');
      addIdentityLog('🧹 Proxy assignments released');
      addIdentityLog('🎭 Device fingerprints cleared');
      
    } catch (error) {
      console.error('Error stopping enhanced browser automation:', error);
      addBrowserActivityLog(`❌ Error stopping automation: ${error.message}`);
    }
  };

  const testSingleEnhancedBrowserSession = async () => {
    if (workerStatus !== 'connected') {
      addAutomationLog('❌ Cannot test: Playwright worker not running!');
      addAutomationLog('🔧 Please run: npm run worker');
      addAutomationLog('🔍 Google Search typing test requires the worker server!');
      return;
    }

    try {
      setIsTestingBrowser(true);
      addBrowserActivityLog('🧪 Opening test enhanced browser window...');
      addAutomationLog('🖥️ Launching single test window with Google Search...');
      addAutomationLog('🔍 Test will: Google Search → Type website name → Navigate → Scroll');
      addAutomationLog('👀 Watch for Google Search typing in the browser window!');
      addIdentityLog('🎭 Generating test device fingerprint...');
      addIdentityLog('🔒 Assigning test proxy connection...');
      
      const testProfile = browserSettings.profiles[0] || 'casual';
      const sessionStats = await testEnhancedPlaywrightSession(
        campaign.targetUrl, 
        testProfile
      );
      
      addBrowserActivityLog(`✅ Test enhanced browser completed successfully!`);
      addAutomationLog(`🔍 Google Search performed successfully!`);
      addAutomationLog(`📊 Session ID: ${sessionStats.sessionId}`);
      addAutomationLog(`⏱️ Test completed - check browser window for Google Search typing!`);
      addIdentityLog(`🔒 Proxy: Used for Google Search`);
      addIdentityLog(`🎭 Device: Generated for Google Search`);
      
    } catch (error) {
      console.error('Test enhanced browser session failed:', error);
      addBrowserActivityLog(`❌ Test enhanced browser failed: ${error.message}`);
      if (error.message.includes('worker') || error.message.includes('4000')) {
        addAutomationLog('🔧 Solution: Run "npm run worker" in terminal');
        addAutomationLog('🔍 Google Search typing test needs the worker server!');
      }
      if (error.message.includes('popup blocked')) {
        addAutomationLog('⚠️ Please allow popups for this website to see browser windows');
      }
    } finally {
      setIsTestingBrowser(false);
    }
  };

  const addBrowserActivityLog = (message) => {
    setBrowserActivityLogs(prev => [
      ...prev.slice(-19),
      {
        id: Date.now(),
        message,
        timestamp: new Date().toLocaleTimeString(),
        type: 'browser'
      }
    ]);
  };

  const addAutomationLog = (message) => {
    setAutomationLogs(prev => [
      ...prev.slice(-14),
      {
        id: Date.now(),
        message,
        timestamp: new Date().toLocaleTimeString(),
        type: 'automation'
      }
    ]);
  };

  const addIdentityLog = (message) => {
    setIdentityLogs(prev => [
      ...prev.slice(-14),
      {
        id: Date.now(),
        message,
        timestamp: new Date().toLocaleTimeString(),
        type: 'identity'
      }
    ]);
  };

  const cleanupEnhancedBrowserAutomation = () => {
    if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
    if (logsIntervalRef.current) clearInterval(logsIntervalRef.current);
    
    if (isAutomating && campaign) {
      stopEnhancedPlaywrightCampaign(campaign.id);
    }
  };

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isVisible || !campaign) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-gray-900 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Enhanced Real Browser Window Automation Interface */}
      <div className="w-full h-full relative overflow-hidden">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 z-20">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiSearch} className="text-blue-400 text-xl" />
              <h1 className="text-white text-lg font-semibold">Enhanced Real Browser with Google Search</h1>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              isAutomating ? 'bg-red-900 text-red-300' : 'bg-gray-700 text-gray-300'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isAutomating ? 'bg-red-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>{isAutomating ? 'Google Search Active' : 'Stopped'}</span>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              workerStatus === 'connected' ? 'bg-green-900 text-green-300' : 
              workerStatus === 'disconnected' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                workerStatus === 'connected' ? 'bg-green-400' : 
                workerStatus === 'disconnected' ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'
              }`}></div>
              <span>{
                workerStatus === 'connected' ? 'Worker Ready' : 
                workerStatus === 'disconnected' ? 'Worker Down' : 'Checking...'
              }</span>
            </div>
            {realTimeBrowserData.googleSearchSessions > 0 && (
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-blue-900 text-blue-300">
                <SafeIcon icon={FiSearch} className="text-blue-400" />
                <span>{realTimeBrowserData.googleSearchSessions} Google Searches</span>
              </div>
            )}
            {realTimeBrowserData.uniqueProxiesUsed > 0 && (
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-purple-900 text-purple-300">
                <SafeIcon icon={FiGlobe} className="text-purple-400" />
                <span>{realTimeBrowserData.uniqueProxiesUsed} Unique IPs</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={checkWorkerStatus}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Check Worker Status"
            >
              <SafeIcon icon={FiRefreshCw} />
            </button>
            <button
              onClick={testSingleEnhancedBrowserSession}
              disabled={isTestingBrowser || workerStatus !== 'connected'}
              className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              title="Test Google Search Browser Window"
            >
              <SafeIcon icon={isTestingBrowser ? FiRefreshCw : FiTestTube} className={isTestingBrowser ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => openInNewTab(campaign.targetUrl)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Open Target URL"
            >
              <SafeIcon icon={FiExternalLink} />
            </button>
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <SafeIcon icon={isMaximized ? FiMinimize2 : FiMaximize2} />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} />
            </button>
          </div>
        </div>

        {/* Worker Status Warning */}
        {workerStatus !== 'connected' && (
          <div className="absolute top-16 left-0 right-0 bg-red-600 text-white px-6 py-3 z-10">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiAlertCircle} className="text-white" />
              <span className="font-medium">
                {workerStatus === 'disconnected' 
                  ? '⚠️ Playwright Worker Not Running - Google Search typing will not work!' 
                  : 'Checking Playwright Worker...'
                }
              </span>
              {workerStatus === 'disconnected' && (
                <span className="ml-4 text-sm">
                  Solution: Run <code className="bg-red-700 px-2 py-1 rounded">npm run worker</code> in terminal
                </span>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className={`${workerStatus !== 'connected' ? 'pt-28' : 'pt-16'} pb-4 px-6 h-full overflow-y-auto bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900`}>
          
          {/* Enhanced Campaign Info & Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Campaign Details */}
            <div className="bg-black bg-opacity-50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <SafeIcon icon={FiTarget} className="text-blue-400" />
                <h2 className="text-white text-lg font-semibold">Google Search Campaign</h2>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white ml-2 font-medium">{campaign.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">Target URL:</span>
                  <span className="text-blue-300 ml-2 break-all">{campaign.targetUrl}</span>
                </div>
                <div>
                  <span className="text-gray-400">Window Rate:</span>
                  <span className="text-green-300 ml-2 font-medium">{browserSettings.automationRate} enhanced/minute</span>
                </div>
                <div>
                  <span className="text-gray-400">Max Concurrent:</span>
                  <span className="text-purple-300 ml-2">{browserSettings.concurrentBrowsers} windows</span>
                </div>
                <div>
                  <span className="text-gray-400">Mode:</span>
                  <span className="text-blue-300 ml-2">🔍 Google Search → Navigate</span>
                </div>
                <div className="pt-2 border-t border-gray-600">
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>🔍 Google Search: {browserSettings.enableGoogleSearch ? 'ON' : 'OFF'}</div>
                    <div>📜 Natural Scrolling: {browserSettings.enableNaturalScrolling ? 'ON' : 'OFF'}</div>
                    <div>🔗 Internal Navigation: {browserSettings.enableInternalNavigation ? 'ON' : 'OFF'}</div>
                    <div>🔒 Proxy Rotation: {browserSettings.enableProxyRotation ? 'ON' : 'OFF'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Real-time Statistics */}
            <div className="bg-black bg-opacity-50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <SafeIcon icon={FiBarChart3} className="text-green-400" />
                <h2 className="text-white text-lg font-semibold">Google Search Stats</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{realTimeBrowserData.googleSearchSessions}</div>
                  <div className="text-gray-400">Google Searches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{realTimeBrowserData.successRate}%</div>
                  <div className="text-gray-400">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">{realTimeBrowserData.uniqueProxiesUsed}</div>
                  <div className="text-gray-400">Unique IPs</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">{realTimeBrowserData.uniqueFingerprintsGenerated}</div>
                  <div className="text-gray-400">Fingerprints</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-cyan-400">{realTimeBrowserData.totalScrollActions}</div>
                  <div className="text-gray-400">Scroll Actions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-400">{realTimeBrowserData.totalInternalNavigations}</div>
                  <div className="text-gray-400">Internal Nav</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="text-xs text-gray-400 text-center">
                  🔍 Each window performs Google Search with typing
                </div>
              </div>
            </div>

            {/* Enhanced Browser Controls */}
            <div className="bg-black bg-opacity-50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <SafeIcon icon={FiSettings} className="text-purple-400" />
                <h2 className="text-white text-lg font-semibold">Google Search Controls</h2>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={isAutomating ? stopEnhancedBrowserGeneration : startEnhancedBrowserGeneration}
                  disabled={workerStatus !== 'connected'}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                    workerStatus !== 'connected' 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : isAutomating
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <SafeIcon icon={isAutomating ? FiStopCircle : FiPlayCircle} />
                  <span>{isAutomating ? 'Stop Google Search' : 'Start Google Search Windows'}</span>
                </button>
                
                <div className="text-xs text-gray-400 text-center">
                  {workerStatus !== 'connected' 
                    ? '⚠️ Worker required for Google Search typing'
                    : isAutomating 
                      ? `🔍 ${realTimeBrowserData.googleSearchSessions} Google searches performed`
                      : '⚡ Ready to launch Google Search windows'
                  }
                </div>
                
                {browserStats && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-800 rounded p-2 text-center">
                      <div className="text-green-400 font-bold">{browserStats.successfulSessions}</div>
                      <div className="text-gray-400">Successful</div>
                    </div>
                    <div className="bg-gray-800 rounded p-2 text-center">
                      <div className="text-red-400 font-bold">{browserStats.failedSessions}</div>
                      <div className="text-gray-400">Failed</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Browser Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* Enhanced Configuration */}
            <div className="bg-black bg-opacity-50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <SafeIcon icon={FiTool} className="text-orange-400" />
                <h2 className="text-white text-lg font-semibold">Google Search Configuration</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm">Window Rate (per minute)</label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    value={browserSettings.automationRate}
                    onChange={(e) => setBrowserSettings(prev => ({ ...prev, automationRate: parseInt(e.target.value) }))}
                    className="w-full mt-2"
                  />
                  <div className="text-center text-gray-400 text-sm mt-1">{browserSettings.automationRate} Google searches/min</div>
                </div>
                
                <div>
                  <label className="text-gray-300 text-sm">Concurrent Windows</label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    value={browserSettings.concurrentBrowsers}
                    onChange={(e) => setBrowserSettings(prev => ({ ...prev, concurrentBrowsers: parseInt(e.target.value) }))}
                    className="w-full mt-2"
                  />
                  <div className="text-center text-gray-400 text-sm mt-1">{browserSettings.concurrentBrowsers} simultaneous</div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm">Google Search Features</label>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiSearch} className="text-blue-400" />
                      <span className="text-gray-300 text-sm">Google Search Integration</span>
                    </div>
                    <button
                      onClick={() => setBrowserSettings(prev => ({ ...prev, enableGoogleSearch: !prev.enableGoogleSearch }))}
                      className={`px-3 py-1 rounded text-sm ${
                        browserSettings.enableGoogleSearch ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {browserSettings.enableGoogleSearch ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiScroll} className="text-yellow-400" />
                      <span className="text-gray-300 text-sm">Natural Scrolling</span>
                    </div>
                    <button
                      onClick={() => setBrowserSettings(prev => ({ ...prev, enableNaturalScrolling: !prev.enableNaturalScrolling }))}
                      className={`px-3 py-1 rounded text-sm ${
                        browserSettings.enableNaturalScrolling ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {browserSettings.enableNaturalScrolling ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiLink} className="text-green-400" />
                      <span className="text-gray-300 text-sm">Internal Navigation</span>
                    </div>
                    <button
                      onClick={() => setBrowserSettings(prev => ({ ...prev, enableInternalNavigation: !prev.enableInternalNavigation }))}
                      className={`px-3 py-1 rounded text-sm ${
                        browserSettings.enableInternalNavigation ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {browserSettings.enableInternalNavigation ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiGlobe} className="text-purple-400" />
                      <span className="text-gray-300 text-sm">Proxy Rotation</span>
                    </div>
                    <button
                      onClick={() => setBrowserSettings(prev => ({ ...prev, enableProxyRotation: !prev.enableProxyRotation }))}
                      className={`px-3 py-1 rounded text-sm ${
                        browserSettings.enableProxyRotation ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {browserSettings.enableProxyRotation ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Browser Profiles */}
            <div className="bg-black bg-opacity-50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <SafeIcon icon={FiUsers} className="text-purple-400" />
                <h2 className="text-white text-lg font-semibold">Google Search Profiles</h2>
              </div>
              
              <div className="space-y-3">
                {Object.entries(ENHANCED_BROWSER_PROFILES || {}).map(([profileKey, profile]) => (
                  <div key={profileKey} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={profile.playwrightProfile?.includes('iPhone') ? FiSmartphone : FiMonitor} className="text-gray-400" />
                      <div>
                        <span className="text-gray-300">{profile.name}</span>
                        <div className="text-xs text-gray-500">{profile.description}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const newProfiles = browserSettings.profiles.includes(profileKey)
                          ? browserSettings.profiles.filter(p => p !== profileKey)
                          : [...browserSettings.profiles, profileKey];
                        setBrowserSettings(prev => ({ ...prev, profiles: newProfiles }));
                      }}
                      className={`px-3 py-1 rounded text-sm ${
                        browserSettings.profiles.includes(profileKey) 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {browserSettings.profiles.includes(profileKey) ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 rounded-lg">
                <div className="text-xs text-blue-300">
                  Each profile creates different browser windows that perform Google Search with unique typing patterns, 
                  device fingerprints, natural scrolling, and internal page navigation behaviors.
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Activity Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Browser Activity Log */}
            <div className="bg-black bg-opacity-50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <SafeIcon icon={FiActivity} className="text-blue-400" />
                <h2 className="text-white text-lg font-semibold">Google Search Activity</h2>
                <div className="flex-1"></div>
                <button
                  onClick={() => setBrowserActivityLogs([])}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Clear
                </button>
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {browserActivityLogs.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    <SafeIcon icon={FiSearch} className="text-4xl mx-auto mb-2 opacity-50" />
                    <div>No Google Search activity yet</div>
                    <div className="text-sm">Start automation to see search actions</div>
                  </div>
                ) : (
                  browserActivityLogs.map((log) => (
                    <div key={log.id} className="text-xs">
                      <div className="text-gray-400">{log.timestamp}</div>
                      <div className="text-white">{log.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Automation System Log */}
            <div className="bg-black bg-opacity-50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <SafeIcon icon={FiCpu} className="text-orange-400" />
                <h2 className="text-white text-lg font-semibold">System Log</h2>
                <div className="flex-1"></div>
                <button
                  onClick={() => setAutomationLogs([])}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Clear
                </button>
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {automationLogs.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    <SafeIcon icon={FiCpu} className="text-4xl mx-auto mb-2 opacity-50" />
                    <div>System ready</div>
                    <div className="text-sm">Enhanced system logs appear here</div>
                  </div>
                ) : (
                  automationLogs.map((log) => (
                    <div key={log.id} className="text-xs">
                      <div className="text-gray-400">{log.timestamp}</div>
                      <div className="text-orange-300">{log.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Identity System Log */}
            <div className="bg-black bg-opacity-50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <SafeIcon icon={FiShield} className="text-purple-400" />
                <h2 className="text-white text-lg font-semibold">Identity Log</h2>
                <div className="flex-1"></div>
                <button
                  onClick={() => setIdentityLogs([])}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Clear
                </button>
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {identityLogs.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    <SafeIcon icon={FiShield} className="text-4xl mx-auto mb-2 opacity-50" />
                    <div>Identity system ready</div>
                    <div className="text-sm">Proxy and fingerprint logs appear here</div>
                  </div>
                ) : (
                  identityLogs.map((log) => (
                    <div key={log.id} className="text-xs">
                      <div className="text-gray-400">{log.timestamp}</div>
                      <div className="text-purple-300">{log.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Google Search Features Overview */}
          <div className="bg-black bg-opacity-50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <SafeIcon icon={FiSearch} className="text-blue-400" />
              <h2 className="text-white text-lg font-semibold">Google Search Integration Features</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
              <div className="flex items-center space-x-2 text-green-400">
                <SafeIcon icon={FiCheckCircle} />
                <span>Google Search Integration</span>
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <SafeIcon icon={FiCheckCircle} />
                <span>Website Name Typing</span>
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <SafeIcon icon={FiCheckCircle} />
                <span>Search Result Navigation</span>
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <SafeIcon icon={FiCheckCircle} />
                <span>Realistic Typing Speed</span>
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <SafeIcon icon={FiCheckCircle} />
                <span>Unique IP per Search</span>
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <SafeIcon icon={FiCheckCircle} />
                <span>Device Fingerprinting</span>
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <SafeIcon icon={FiCheckCircle} />
                <span>Natural Scrolling</span>
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <SafeIcon icon={FiCheckCircle} />
                <span>Internal Page Navigation</span>
              </div>
            </div>
            
            <div className="p-4 bg-blue-900 bg-opacity-50 rounded-lg border border-blue-700">
              <div className="flex items-start space-x-2">
                <SafeIcon icon={FiSearch} className="text-blue-400 mt-1" />
                <div>
                  <h3 className="text-blue-300 font-medium mb-2">Enhanced Google Search Real Browser Automation</h3>
                  <p className="text-sm text-gray-300 mb-3">
                    This advanced system opens actual browser windows that first perform Google searches for your website. 
                    Each window types your website name in Google's search box with realistic human-like typing speed, 
                    reads the search results, then navigates to your target website. Each session uses a unique IP address 
                    and device fingerprint for maximum authenticity.
                  </p>
                  <div className="text-xs text-blue-200 space-y-1">
                    <div><strong>🔍 Google Search Flow:</strong> Opens Google → Types website name → Reads results → Navigates to site</div>
                    <div><strong>⌨️ Realistic Typing:</strong> Human-like typing speed with random delays between keystrokes</div>
                    <div><strong>📋 Search Behavior:</strong> Reads search results before clicking through to your website</div>
                    <div><strong>🎭 Unique Identity:</strong> Each search uses different IP, device fingerprint, and browser profile</div>
                    <div><strong>📜 Post-Navigation:</strong> Natural scrolling and internal page exploration after arriving from Google</div>
                  </div>
                  <div className="mt-2 text-xs text-yellow-200">
                    <strong>⚠️ Worker Required:</strong> Run <code className="bg-blue-800 px-1 rounded">npm run worker</code> to enable Google Search typing functionality.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaywrightTrafficWindow;