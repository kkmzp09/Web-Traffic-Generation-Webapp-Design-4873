import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../lib/authContext';
import { DEFAULT_SERVER_CONFIG, CAMPAIGN_DEFAULTS } from '../config';
import {
  startCampaign,
  checkCampaignStatus,
  getCampaignResults,
  stopCampaign,
  checkServerHealth,
  buildCampaignRequest,
  handleApiError,
  validateServerConfig,
  getServerUrl
} from '../api';

const { 
  FiPlay, FiPause, FiStop, FiRefreshCw, FiMonitor, FiGlobe, 
  FiClock, FiActivity, FiCheckCircle, FiXCircle, FiAlertCircle,
  FiSettings, FiEye, FiDownload, FiVideo, FiChrome, FiTarget,
  FiTrendingUp, FiUsers, FiZap, FiCpu, FiWifi, FiServer,
  FiCloud, FiDatabase, FiTerminal, FiEdit3, FiUserCheck
} = FiIcons;

const Campaign = () => {
  // Authentication context (optional - works with or without login)
  const { user, isAuthenticated } = useAuth();

  // Server Configuration State - Pre-configured with your VPS
  const [serverConfig, setServerConfig] = useState(DEFAULT_SERVER_CONFIG);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [isServerConfigured, setIsServerConfigured] = useState(true); // Auto-configured

  // Campaign State
  const [urlsText, setUrlsText] = useState('https://jobmakers.in\nhttps://jobmakers.in/about\nhttps://jobmakers.in/services');
  const [dwellMs, setDwellMs] = useState(CAMPAIGN_DEFAULTS.dwellMs);
  const [scroll, setScroll] = useState(CAMPAIGN_DEFAULTS.scroll);
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('config');
  const [workerStatus, setWorkerStatus] = useState('checking');

  // Advanced settings - Pre-configured with defaults
  const [advancedSettings, setAdvancedSettings] = useState(CAMPAIGN_DEFAULTS);

  // Load server config from localStorage or use defaults
  useEffect(() => {
    const savedConfig = localStorage.getItem('playwrightServerConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setServerConfig(config);
        setIsServerConfigured(!!config.host);
        addLog(`✅ Custom server config loaded: ${config.host}:${config.port}`, 'success');
      } catch (error) {
        console.error('Error loading server config:', error);
        addLog(`❌ Error loading server config, using defaults`, 'warning');
        setServerConfig(DEFAULT_SERVER_CONFIG);
        setIsServerConfigured(true);
      }
    } else {
      // Use pre-configured VPS settings
      addLog(`🚀 Using pre-configured VPS server: ${DEFAULT_SERVER_CONFIG.host}:${DEFAULT_SERVER_CONFIG.port}`, 'success');
      setServerConfig(DEFAULT_SERVER_CONFIG);
      setIsServerConfigured(true);
    }
  }, []);

  // Check worker status when server config changes
  useEffect(() => {
    if (isServerConfigured) {
      addLog('🔄 Checking VPS server status...', 'info');
      checkWorkerStatus();
      const interval = setInterval(checkWorkerStatus, 30000);
      return () => clearInterval(interval);
    } else {
      setWorkerStatus('not_configured');
    }
  }, [isServerConfigured, serverConfig]);

  // Log authentication status
  useEffect(() => {
    if (isAuthenticated && user) {
      addLog(`👤 Logged in as: ${user.email}`, 'success');
    } else {
      addLog('👤 Running in guest mode - full functionality available', 'info');
    }
  }, [isAuthenticated, user]);

  const saveServerConfig = () => {
    const validation = validateServerConfig(serverConfig);
    
    if (!validation.isValid) {
      validation.errors.forEach(error => addLog(`❌ ${error}`, 'error'));
      return;
    }

    try {
      localStorage.setItem('playwrightServerConfig', JSON.stringify(serverConfig));
      setIsServerConfigured(true);
      setShowServerConfig(false);
      addLog(`✅ Server configured: ${getServerUrl(serverConfig)}`, 'success');
      addLog('🔄 Testing connection...', 'info');
      checkWorkerStatus();
    } catch (error) {
      addLog(`❌ Error saving server config: ${error.message}`, 'error');
    }
  };

  const resetToDefaults = () => {
    setServerConfig(DEFAULT_SERVER_CONFIG);
    addLog('🔄 Reset to VPS defaults', 'info');
  };

  const checkWorkerStatus = async () => {
    if (!isServerConfigured) {
      setWorkerStatus('not_configured');
      return;
    }

    try {
      addLog(`🔍 Checking VPS server: ${getServerUrl(serverConfig)}/health`, 'info');
      
      const data = await checkServerHealth(serverConfig);
      setWorkerStatus('connected');
      addLog(`✅ VPS server connected: ${data.message || 'OK'}`, 'success');
      addLog(`🎭 Playwright ready on VPS!`, 'success');
    } catch (error) {
      const errorMessage = handleApiError(error, 'VPS health check');
      setWorkerStatus('disconnected');
      addLog(`❌ ${errorMessage}`, 'error');
    }
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), { timestamp, message, type }]);
  };

  const startCampaignHandler = async () => {
    // Clear any previous results
    setResults(null);
    setProgress(0);
    setStatus('');

    // Check server configuration
    if (!isServerConfigured) {
      addLog('❌ Please configure your server connection first', 'error');
      setShowServerConfig(true);
      return;
    }

    // Check server connection
    if (workerStatus !== 'connected') {
      addLog('❌ VPS Playwright server not connected! Please check your server.', 'error');
      addLog('💡 Make sure your VPS is running Playwright worker on port 3000', 'warning');
      return;
    }

    // Validate URLs
    const urls = urlsText.split('\n').map(s => s.trim()).filter(Boolean);
    if (urls.length === 0) {
      addLog('❌ Please enter at least one URL to visit', 'error');
      return;
    }

    // Start campaign
    setIsRunning(true);
    setStatus('starting...');
    addLog('🚀 Starting campaign on VPS server...', 'info');
    addLog(`📋 URLs to visit: ${urls.length}`, 'info');
    addLog(`⏱️ Dwell time: ${dwellMs / 1000}s per page`, 'info');
    addLog(`🖱️ Scrolling: ${scroll ? 'Enabled' : 'Disabled'}`, 'info');

    try {
      const campaignData = buildCampaignRequest({
        urls: urlsText,
        dwellMs,
        scroll,
        advancedSettings,
        user
      });

      addLog(`📡 Sending request to VPS: ${getServerUrl(serverConfig)}/run`, 'info');
      
      const data = await startCampaign(campaignData, serverConfig);
      
      if (data.id || data.accepted || data.sessionId) {
        const sessionId = data.id || data.sessionId || `session_${Date.now()}`;
        setJobId(sessionId);
        setStatus(data.status || 'running');
        addLog(`✅ Campaign started on VPS with ID: ${sessionId}`, 'success');
        addLog(`🎬 Browser automation running on VPS!`, 'success');
        
        // Start polling for updates if supported
        startPolling(sessionId);
      } else {
        throw new Error(data.message || data.error || 'VPS server rejected the campaign');
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Campaign start');
      setStatus('connection error');
      setIsRunning(false);
      addLog(`❌ ${errorMessage}`, 'error');
    }
  };

  const startPolling = (sessionId) => {
    let pollCount = 0;
    const maxPolls = 120; // 4 minutes max polling

    const poll = async () => {
      if (pollCount >= maxPolls) {
        addLog('⏰ Polling timeout - campaign may still be running on VPS', 'warning');
        setIsRunning(false);
        return;
      }

      try {
        const statusData = await checkCampaignStatus(sessionId, serverConfig);
        setProgress(statusData.progress || 0);
        setStatus(statusData.status || 'running');
        
        if (statusData.progress > 0) {
          addLog(`📊 Progress: ${statusData.progress}%`, 'info');
        }
        
        if (statusData.status === 'finished' || statusData.status === 'completed') {
          setIsRunning(false);
          addLog('🎉 Campaign completed successfully on VPS!', 'success');
          
          // Try to fetch results
          try {
            const resultsData = await getCampaignResults(sessionId, serverConfig);
            setResults(resultsData.results || resultsData);
            addLog(`📋 Results retrieved from VPS: ${Array.isArray(resultsData.results) ? resultsData.results.length : 1} items`, 'success');
          } catch (error) {
            const errorMessage = handleApiError(error, 'Results fetch');
            addLog(`⚠️ ${errorMessage}`, 'warning');
          }
          return;
        }
        
        if (statusData.status === 'failed' || statusData.status === 'error') {
          setIsRunning(false);
          addLog('❌ Campaign failed on VPS', 'error');
          return;
        }
      } catch (error) {
        const errorMessage = handleApiError(error, 'Status check');
        addLog(`⚠️ ${errorMessage}`, 'warning');
      }

      pollCount++;
      setTimeout(poll, 2000);
    };

    setTimeout(poll, 2000);
  };

  const stopCampaignHandler = async () => {
    if (jobId) {
      try {
        await stopCampaign(jobId, serverConfig);
        addLog('🛑 Stop signal sent to VPS', 'warning');
      } catch (error) {
        const errorMessage = handleApiError(error, 'Stop campaign');
        addLog(`❌ ${errorMessage}`, 'error');
      }
    }
    setIsRunning(false);
    setJobId(null);
    setStatus('stopped');
    setProgress(0);
    addLog('⏹️ Campaign stopped', 'warning');
  };

  const testConnection = async () => {
    addLog('🧪 Testing VPS connection...', 'info');
    await checkWorkerStatus();
  };

  const getStatusColor = () => {
    switch (status) {
      case 'finished': case 'completed': return 'text-green-600';
      case 'failed': case 'connection error': case 'error': return 'text-red-600';
      case 'running': return 'text-blue-600';
      case 'starting': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getWorkerStatusBadge = () => {
    if (!isServerConfigured) {
      return (
        <button
          onClick={() => setShowServerConfig(true)}
          className="flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm hover:bg-orange-200 transition-colors"
        >
          <SafeIcon icon={FiSettings} />
          <span>Configure Server</span>
        </button>
      );
    }

    switch (workerStatus) {
      case 'connected':
        return (
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>VPS Connected</span>
            <button
              onClick={() => setShowServerConfig(true)}
              className="ml-2 p-1 hover:bg-green-200 rounded"
            >
              <SafeIcon icon={FiEdit3} className="text-xs" />
            </button>
          </div>
        );
      case 'disconnected':
      case 'error':
        return (
          <button
            onClick={() => setShowServerConfig(true)}
            className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200 transition-colors"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>VPS Disconnected</span>
            <SafeIcon icon={FiEdit3} className="ml-1" />
          </button>
        );
      default:
        return (
          <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-spin"></div>
            <span>Checking VPS...</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Server Configuration Modal */}
        <AnimatePresence>
          {showServerConfig && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <SafeIcon icon={FiServer} />
                    <span>VPS Server Configuration</span>
                  </h3>
                  <button
                    onClick={() => setShowServerConfig(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <SafeIcon icon={FiXCircle} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VPS IP Address *
                    </label>
                    <input
                      type="text"
                      value={serverConfig.host}
                      onChange={(e) => setServerConfig(prev => ({ ...prev, host: e.target.value }))}
                      placeholder="67.217.60.57"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Port
                    </label>
                    <input
                      type="text"
                      value={serverConfig.port}
                      onChange={(e) => setServerConfig(prev => ({ ...prev, port: e.target.value }))}
                      placeholder="3000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={serverConfig.apiKey}
                      onChange={(e) => setServerConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Your VPS API key"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useHttps"
                      checked={serverConfig.useHttps}
                      onChange={(e) => setServerConfig(prev => ({ ...prev, useHttps: e.target.checked }))}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="useHttps" className="text-sm text-gray-700">
                      Use HTTPS
                    </label>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-green-800 mb-1">🚀 VPS Pre-configured</h4>
                    <p className="text-xs text-green-700">
                      Your VPS server is pre-configured at <strong>67.217.60.57:3000</strong>
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={resetToDefaults}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <SafeIcon icon={FiRefreshCw} />
                      <span>Reset</span>
                    </button>
                    <button
                      onClick={testConnection}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <SafeIcon icon={FiZap} />
                      <span>Test</span>
                    </button>
                    <button
                      onClick={saveServerConfig}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <SafeIcon icon={FiCheckCircle} />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
                <SafeIcon icon={FiCloud} className="text-red-600" />
                <span>VPS Campaign Runner</span>
                {isAuthenticated && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    <SafeIcon icon={FiUserCheck} />
                    <span>Authenticated</span>
                  </div>
                )}
              </h1>
              <p className="text-gray-600 text-lg">Connected to your VPS running Playwright</p>
              {isServerConfigured && (
                <p className="text-sm text-gray-500 mt-1">
                  VPS Server: {getServerUrl(serverConfig)}
                  {user && <span className="ml-2">• User: {user.email}</span>}
                </p>
              )}
            </div>
            {getWorkerStatusBadge()}
          </div>
          
          {/* Status Bar */}
          {(isRunning || status) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-4 shadow-lg border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={isRunning ? FiActivity : FiCheckCircle} className={`text-lg ${getStatusColor()}`} />
                  <span className={`font-medium ${getStatusColor()}`}>
                    Status: {status}
                  </span>
                  {jobId && (
                    <span className="text-sm text-gray-500">ID: {jobId}</span>
                  )}
                </div>
                
                {isRunning && (
                  <button
                    onClick={stopCampaignHandler}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiStop} />
                    <span>Stop</span>
                  </button>
                )}
              </div>
              
              {/* Progress Bar */}
              {isRunning && progress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-gradient-to-r from-red-600 to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
              {progress > 0 && (
                <div className="text-right text-sm text-gray-500 mt-1">
                  {progress}% complete
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'config', label: 'Configuration', icon: FiSettings },
                    { id: 'advanced', label: 'Advanced', icon: FiCpu },
                    { id: 'logs', label: 'Logs', icon: FiActivity }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-red-500 text-red-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <SafeIcon icon={tab.icon} />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'config' && (
                    <motion.div
                      key="config"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      {/* URLs Configuration */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                          <SafeIcon icon={FiGlobe} />
                          <span>Target URLs (one per line)</span>
                        </label>
                        <textarea
                          value={urlsText}
                          onChange={(e) => setUrlsText(e.target.value)}
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                          placeholder="https://example.com&#10;https://example.com/about&#10;https://example.com/services"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Each URL will be visited by a real browser on your VPS
                        </p>
                      </div>

                      {/* Basic Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                            <SafeIcon icon={FiClock} />
                            <span>Dwell Time (ms)</span>
                          </label>
                          <input
                            type="number"
                            value={dwellMs}
                            onChange={(e) => setDwellMs(Number(e.target.value))}
                            min="1000"
                            max="60000"
                            step="1000"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Time spent on each page (1-60 seconds)
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Page Interactions
                          </label>
                          <div className="space-y-3">
                            <label className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={scroll}
                                onChange={(e) => setScroll(e.target.checked)}
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">Natural scrolling</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Start Button */}
                      <div className="pt-4">
                        <button
                          onClick={startCampaignHandler}
                          disabled={isRunning || !isServerConfigured || workerStatus !== 'connected'}
                          className={`w-full px-6 py-4 rounded-lg font-medium text-lg transition-all duration-200 flex items-center justify-center space-x-3 ${
                            isRunning || !isServerConfigured || workerStatus !== 'connected'
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                          }`}
                        >
                          <SafeIcon icon={isRunning ? FiRefreshCw : FiPlay} className={isRunning ? 'animate-spin' : ''} />
                          <span>{isRunning ? 'Campaign Running on VPS...' : 'Start VPS Campaign'}</span>
                        </button>
                        
                        {!isServerConfigured && (
                          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-sm text-orange-800">
                              ⚠️ Please configure your VPS server connection first
                            </p>
                          </div>
                        )}
                        
                        {isServerConfigured && workerStatus !== 'connected' && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              ❌ Cannot connect to VPS at {getServerUrl(serverConfig)}
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              Make sure your VPS is running Playwright on port 3000
                            </p>
                          </div>
                        )}

                        {/* VPS Status Info */}
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <SafeIcon icon={FiServer} className="text-blue-600" />
                            <p className="text-sm text-blue-800">
                              🚀 VPS Server: <strong>{DEFAULT_SERVER_CONFIG.host}:{DEFAULT_SERVER_CONFIG.port}</strong>
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <SafeIcon icon={isAuthenticated ? FiUserCheck : FiUsers} className="text-blue-600" />
                            <p className="text-sm text-blue-800">
                              {isAuthenticated 
                                ? `✅ Running as: ${user.email}`
                                : '👤 Guest mode - full functionality available'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'advanced' && (
                    <motion.div
                      key="advanced"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Browser Settings</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries({
                          naturalScrolling: 'Natural scrolling patterns',
                          randomDelay: 'Random delays between actions',
                          mouseMovements: 'Random mouse movements',
                          screenshots: 'Take screenshots',
                          videoRecording: 'Record videos',
                          incognito: 'Use incognito mode',
                          enableGoogleSearch: 'Google Search integration',
                          enableInternalNavigation: 'Internal page navigation'
                        }).map(([key, label]) => (
                          <label key={key} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={advancedSettings[key]}
                              onChange={(e) => setAdvancedSettings(prev => ({ 
                                ...prev, 
                                [key]: e.target.checked 
                              }))}
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Browser Profile
                          </label>
                          <select
                            value={advancedSettings.profile}
                            onChange={(e) => setAdvancedSettings(prev => ({ 
                              ...prev, 
                              profile: e.target.value 
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <option value="Desktop Chrome">Desktop Chrome</option>
                            <option value="Desktop Firefox">Desktop Firefox</option>
                            <option value="Desktop Safari">Desktop Safari</option>
                            <option value="iPhone 12">iPhone 12</option>
                            <option value="iPad Pro">iPad Pro</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Internal Clicks
                          </label>
                          <input
                            type="number"
                            value={advancedSettings.maxClicks}
                            onChange={(e) => setAdvancedSettings(prev => ({ 
                              ...prev, 
                              maxClicks: Number(e.target.value) 
                            }))}
                            min="1"
                            max="10"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'logs' && (
                    <motion.div
                      key="logs"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">VPS Campaign Logs</h3>
                        <button
                          onClick={() => setLogs([])}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Clear
                        </button>
                      </div>
                      
                      <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
                        {logs.length === 0 ? (
                          <div className="text-gray-500 text-center py-8">
                            No logs yet. Start a campaign to see VPS activity.
                          </div>
                        ) : (
                          logs.map((log, index) => (
                            <div key={index} className={`mb-1 ${
                              log.type === 'error' ? 'text-red-400' :
                              log.type === 'success' ? 'text-green-400' :
                              log.type === 'warning' ? 'text-yellow-400' :
                              'text-gray-300'
                            }`}>
                              <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Results Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* VPS Info */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <SafeIcon icon={FiServer} />
                <span>VPS Info</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    workerStatus === 'connected' ? 'text-green-600' : 
                    workerStatus === 'not_configured' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {workerStatus === 'connected' ? 'Connected' : 
                     workerStatus === 'not_configured' ? 'Not Configured' :
                     'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">User:</span>
                  <span className={`font-medium ${isAuthenticated ? 'text-green-600' : 'text-blue-600'}`}>
                    {isAuthenticated ? user.email : 'Guest Mode'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">VPS IP:</span>
                  <span className="font-medium text-gray-900">{serverConfig.host}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Port:</span>
                  <span className="font-medium text-gray-900">{serverConfig.port}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Protocol:</span>
                  <span className="font-medium text-gray-900">
                    {serverConfig.useHttps ? 'HTTPS' : 'HTTP'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={testConnection}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <SafeIcon icon={FiZap} />
                  <span>Test VPS Connection</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <SafeIcon icon={FiTrendingUp} />
                <span>Quick Stats</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">URLs to visit:</span>
                  <span className="font-medium">{urlsText.split('\n').filter(Boolean).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dwell time:</span>
                  <span className="font-medium">{dwellMs / 1000}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Google Search:</span>
                  <span className={`font-medium ${advancedSettings.enableGoogleSearch ? 'text-green-600' : 'text-gray-400'}`}>
                    {advancedSettings.enableGoogleSearch ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Scrolling:</span>
                  <span className={`font-medium ${scroll ? 'text-green-600' : 'text-gray-400'}`}>
                    {scroll ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Results */}
            {results && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                  <SafeIcon icon={FiCheckCircle} className="text-green-600" />
                  <span>VPS Campaign Results</span>
                </h3>
                
                <div className="space-y-3">
                  {Array.isArray(results) ? results.map((result, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <SafeIcon 
                        icon={result.ok ? FiCheckCircle : FiXCircle} 
                        className={result.ok ? 'text-green-600' : 'text-red-600'} 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {result.url ? new URL(result.url).hostname : `Result ${index + 1}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.title || result.error || result.status || 'Completed'}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(results, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📁 Screenshots and videos saved on your VPS in the <code>runs/</code> folder.
                  </p>
                </div>
              </motion.div>
            )}

            {/* VPS Features */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <SafeIcon icon={FiVideo} />
                <span>VPS Features</span>
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiChrome} className="text-blue-600" />
                  <span>Real browsers on VPS</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiTarget} className="text-purple-600" />
                  <span>Google Search integration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiActivity} className="text-green-600" />
                  <span>Natural scrolling patterns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiDatabase} className="text-orange-600" />
                  <span>Internal page navigation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiWifi} className="text-indigo-600" />
                  <span>VPS server execution</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={isAuthenticated ? FiUserCheck : FiUsers} className="text-red-600" />
                  <span>{isAuthenticated ? 'Authenticated mode' : 'Guest mode available'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiServer} className="text-gray-600" />
                  <span>Pre-configured VPS: {DEFAULT_SERVER_CONFIG.host}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Campaign;