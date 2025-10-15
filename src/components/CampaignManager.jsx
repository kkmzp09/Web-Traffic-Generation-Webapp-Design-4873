// src/pages/RunCampaign.jsx
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

export default function RunCampaign() {
  const { user, isAuthenticated } = useAuth();

  const [serverConfig, setServerConfig] = useState(DEFAULT_SERVER_CONFIG);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [isServerConfigured, setIsServerConfigured] = useState(true);

  const [urlsText, setUrlsText] = useState(
    'https://jobmakers.in\nhttps://jobmakers.in/about\nhttps://jobmakers.in/services'
  );
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

  const [advancedSettings, setAdvancedSettings] = useState(CAMPAIGN_DEFAULTS);

  useEffect(() => {
    const saved = localStorage.getItem('playwrightServerConfig');
    if (saved) {
      try {
        const cfg = JSON.parse(saved);
        setServerConfig(cfg);
        setIsServerConfigured(!!cfg.host);
        addLog(`✅ Loaded saved server config: ${getServerUrl(cfg)}`, 'success');
      } catch {
        addLog('❌ Failed to load saved server config. Using defaults.', 'warning');
        setServerConfig(DEFAULT_SERVER_CONFIG);
        setIsServerConfigured(true);
      }
    } else {
      addLog(`🚀 Using API: ${getServerUrl(DEFAULT_SERVER_CONFIG)}`, 'success');
    }
  }, []);

  useEffect(() => {
    if (!isServerConfigured) {
      setWorkerStatus('not_configured');
      return;
    }
    const check = async () => {
      try {
        await checkServerHealth(serverConfig);
        setWorkerStatus('connected');
        addLog('✅ VPS server connected', 'success');
      } catch (e) {
        setWorkerStatus('disconnected');
        addLog(handleApiError(e, 'VPS health check'), 'error');
      }
    };
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, [isServerConfigured, serverConfig]);

  useEffect(() => {
    if (isAuthenticated && user) addLog(`👤 Logged in as: ${user.email}`, 'success');
    else addLog('👤 Guest mode — full functionality available', 'info');
  }, [isAuthenticated, user]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), { timestamp, message, type }]);
  };

  const saveServerConfig = () => {
    const v = validateServerConfig(serverConfig);
    if (!v.isValid) {
      v.errors.forEach(e => addLog(`❌ ${e}`, 'error'));
      return;
    }
    localStorage.setItem('playwrightServerConfig', JSON.stringify(serverConfig));
    setIsServerConfigured(true);
    setShowServerConfig(false);
    addLog(`✅ Server set to: ${getServerUrl(serverConfig)}`, 'success');
  };

  const resetToDefaults = () => {
    setServerConfig(DEFAULT_SERVER_CONFIG);
    localStorage.removeItem('playwrightServerConfig');
    addLog('🔄 Reset to HTTPS API defaults', 'info');
  };

  const startCampaignHandler = async () => {
    setResults(null);
    setProgress(0);
    setStatus('');

    if (!isServerConfigured) {
      addLog('❌ Configure server first', 'error');
      setShowServerConfig(true);
      return;
    }
    if (workerStatus !== 'connected') {
      addLog('❌ VPS not connected. Check API/health.', 'error');
      return;
    }

    const list = urlsText.split('\n').map(s => s.trim()).filter(Boolean);
    if (!list.length) {
      addLog('❌ Enter at least one URL', 'error');
      return;
    }

    setIsRunning(true);
    setStatus('starting'); // <-- no ellipsis so status color works
    addLog(`🚀 Starting campaign (${list.length} URLs)`, 'info');

    try {
      const payload = buildCampaignRequest({ urls: urlsText, dwellMs, scroll, advancedSettings, user });
      const data = await startCampaign(payload, serverConfig);
      const sessionId = data.id || data.sessionId || `session_${Date.now()}`;
      setJobId(sessionId);
      setStatus(data.status || 'running');
      addLog(`✅ Campaign started (ID: ${sessionId})`, 'success');
      startPolling(sessionId);
    } catch (err) {
      setIsRunning(false);
      setStatus('error');
      addLog(handleApiError(err, 'Campaign start'), 'error');
    }
  };

  const startPolling = (sessionId) => {
    let count = 0;
    const max = 120;
    const tick = async () => {
      if (count++ >= max) {
        setIsRunning(false);
        addLog('⏰ Poll timeout - it may still be running on VPS', 'warning');
        return;
      }
      try {
        const st = await checkCampaignStatus(sessionId, serverConfig);
        setProgress(st.progress || 0);
        setStatus(st.status || 'running');
        if (st.progress) addLog(`📊 Progress: ${st.progress}%`, 'info');

        if (st.status === 'finished' || st.status === 'completed') {
          setIsRunning(false);
          addLog('🎉 Campaign completed', 'success');
          try {
            const r = await getCampaignResults(sessionId, serverConfig);
            setResults(r.results || r);
            const countRes = Array.isArray(r.results) ? r.results.length : 1;
            addLog(`📋 Results fetched: ${countRes}`, 'success');
          } catch (e) {
            addLog(handleApiError(e, 'Results fetch'), 'warning');
          }
          return;
        }

        if (st.status === 'failed' || st.status === 'error') {
          setIsRunning(false);
          addLog('❌ Campaign failed', 'error');
          return;
        }
      } catch (e) {
        addLog(handleApiError(e, 'Status check'), 'warning');
      }
      setTimeout(tick, 2000);
    };
    setTimeout(tick, 2000);
  };

  const stopCampaignHandler = async () => {
    if (jobId) {
      try {
        await stopCampaign(jobId, serverConfig); // UI-only stop
        addLog('🛑 Stop requested (UI)', 'warning');
      } catch (e) {
        addLog(handleApiError(e, 'Stop campaign'), 'error');
      }
    }
    setIsRunning(false);
    setJobId(null);
    setStatus('stopped');
    setProgress(0);
  };

  const testConnection = async () => {
    addLog('🧪 Testing connection…', 'info');
    try {
      await checkServerHealth(serverConfig);
      setWorkerStatus('connected');
      addLog('✅ Health OK', 'success');
    } catch (e) {
      setWorkerStatus('disconnected');
      addLog(handleApiError(e, 'Health check'), 'error');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'finished':
      case 'completed': return 'text-green-600';
      case 'failed':
      case 'connection error':
      case 'error': return 'text-red-600';
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
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>API Online</span>
            <button onClick={() => setShowServerConfig(true)} className="ml-2 p-1 hover:bg-green-200 rounded">
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
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span>API Offline</span>
            <SafeIcon icon={FiEdit3} className="ml-1" />
          </button>
        );
      default:
        return (
          <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-spin" />
            <span>Checking API…</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence>
          {showServerConfig && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <SafeIcon icon={FiServer} /><span>API Configuration</span>
                  </h3>
                  <button onClick={() => setShowServerConfig(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <SafeIcon icon={FiXCircle} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Host *</label>
                    <input type="text" value={serverConfig.host}
                      onChange={e => setServerConfig(p => ({ ...p, host: e.target.value }))}
                      placeholder="api.organitrafficboost.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Port</label>
                      <input type="text" value={serverConfig.port}
                        onChange={e => setServerConfig(p => ({ ...p, port: e.target.value }))}
                        placeholder={serverConfig.useHttps ? '443' : '3000'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div className="flex items-center space-x-2 mt-8">
                      <input id="useHttps" type="checkbox" checked={serverConfig.useHttps}
                        onChange={e => setServerConfig(p => ({ ...p, useHttps: e.target.checked }))}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                      <label htmlFor="useHttps" className="text-sm text-gray-700">Use HTTPS</label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                    <input type="password" value={serverConfig.apiKey}
                      onChange={e => setServerConfig(p => ({ ...p, apiKey: e.target.value }))}
                      placeholder="Your API key"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-green-800 mb-1">🚀 Preconfigured</h4>
                    <p className="text-xs text-green-700">
                      API: <strong>{getServerUrl(DEFAULT_SERVER_CONFIG)}</strong>
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button onClick={resetToDefaults}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                      <SafeIcon icon={FiRefreshCw} /><span>Reset</span>
                    </button>
                    <button onClick={testConnection}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                      <SafeIcon icon={FiZap} /><span>Test</span>
                    </button>
                    <button onClick={saveServerConfig}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                      <SafeIcon icon={FiCheckCircle} /><span>Save</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
                <SafeIcon icon={FiCloud} className="text-red-600" />
                <span>VPS Campaign Runner</span>
                {isAuthenticated && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    <SafeIcon icon={FiUserCheck} /><span>Authenticated</span>
                  </div>
                )}
              </h1>
              <p className="text-gray-600 text-lg">Connected to Playwright on your VPS</p>
              {isServerConfigured && (
                <p className="text-sm text-gray-500 mt-1">
                  API: {getServerUrl(serverConfig)}{user ? ` • User: ${user.email}` : ''}
                </p>
              )}
            </div>
            {getWorkerStatusBadge()}
          </div>

          {(isRunning || status) && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={isRunning ? FiActivity : FiCheckCircle} className={`text-lg ${getStatusColor()}`} />
                  <span className={`font-medium ${getStatusColor()}`}>Status: {status}</span>
                  {jobId && <span className="text-sm text-gray-500">ID: {jobId}</span>}
                </div>
                {isRunning && (
                  <button onClick={stopCampaignHandler}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2">
                    <SafeIcon icon={FiStop} /><span>Stop</span>
                  </button>
                )}
              </div>

              {isRunning && progress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div className="bg-gradient-to-r from-red-600 to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                </div>
              )}
              {progress > 0 && <div className="text-right text-sm text-gray-500 mt-1">{progress}% complete</div>}
            </motion.div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'config', label: 'Configuration', icon: FiSettings },
                    { id: 'advanced', label: 'Advanced', icon: FiCpu },
                    { id: 'logs', label: 'Logs', icon: FiActivity }
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                        activeTab === tab.id ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}>
                      <SafeIcon icon={tab.icon} /><span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'config' && (
                    <motion.div key="config" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                          <SafeIcon icon={FiGlobe} /><span>Target URLs (one per line)</span>
                        </label>
                        <textarea value={urlsText} onChange={e => setUrlsText(e.target.value)} rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                          placeholder={'https://example.com\nhttps://example.com/about\nhttps://example.com/services'} />
                        <p className="text-xs text-gray-500 mt-2">Each URL is opened by a real browser on your VPS</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                            <SafeIcon icon={FiClock} /><span>Dwell Time (ms)</span>
                          </label>
                          <input type="number" value={dwellMs} onChange={e => setDwellMs(Number(e.target.value))}
                            min="1000" max="120000" step="1000"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                          <p className="text-xs text-gray-500 mt-1">Time spent per page (1–120 seconds)</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Page Interactions</label>
                          <label className="flex items-center space-x-3">
                            <input type="checkbox" checked={scroll} onChange={e => setScroll(e.target.checked)}
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                            <span className="text-sm text-gray-700">Natural scrolling</span>
                          </label>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button onClick={startCampaignHandler}
                          disabled={isRunning || !isServerConfigured || workerStatus !== 'connected'}
                          className={`w-full px-6 py-4 rounded-lg font-medium text-lg transition-all duration-200 flex items-center justify-center space-x-3 ${
                            isRunning || !isServerConfigured || workerStatus !== 'connected'
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                          }`}>
                          <SafeIcon icon={isRunning ? FiRefreshCw : FiPlay} className={isRunning ? 'animate-spin' : ''} />
                          <span>{isRunning ? 'Campaign Running…' : 'Start Campaign'}</span>
                        </button>

                        {!isServerConfigured && (
                          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-sm text-orange-800">⚠️ Configure your API first</p>
                          </div>
                        )}
                        {isServerConfigured && workerStatus !== 'connected' && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">❌ Cannot reach {getServerUrl(serverConfig)}</p>
                          </div>
                        )}
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <SafeIcon icon={FiServer} className="text-blue-600" />
                            <p className="text-sm text-blue-800">
                              API: <strong>{getServerUrl(DEFAULT_SERVER_CONFIG)}</strong>
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <SafeIcon icon={isAuthenticated ? FiUserCheck : FiUsers} className="text-blue-600" />
                            <p className="text-sm text-blue-800">
                              {isAuthenticated ? `✅ ${user.email}` : '👤 Guest mode'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'advanced' && (
                    <motion.div key="advanced" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }} className="space-y-6">
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
                            <input type="checkbox" checked={advancedSettings[key]}
                              onChange={e => setAdvancedSettings(p => ({ ...p, [key]: e.target.checked }))}
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                            <span className="text-sm text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Browser Profile</label>
                          <select value={advancedSettings.profile}
                            onChange={e => setAdvancedSettings(p => ({ ...p, profile: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option>Desktop Chrome</option>
                            <option>Desktop Firefox</option>
                            <option>Desktop Safari</option>
                            <option>iPhone 12</option>
                            <option>iPad Pro</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Max Internal Clicks</label>
                          <input type="number" value={advancedSettings.maxClicks}
                            onChange={e => setAdvancedSettings(p => ({ ...p, maxClicks: Number(e.target.value) }))} min="1" max="10"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'logs' && (
                    <motion.div key="logs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">VPS Campaign Logs</h3>
                        <button onClick={() => setLogs([])}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50">
                          Clear
                        </button>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
                        {logs.length === 0 ? (
                          <div className="text-gray-500 text-center py-8">No logs yet. Start a campaign.</div>
                        ) : (
                          logs.map((log, i) => (
                            <div key={i} className={`mb-1 ${
                              log.type === 'error' ? 'text-red-400' :
                              log.type === 'success' ? 'text-green-400' :
                              log.type === 'warning' ? 'text-yellow-400' : 'text-gray-300'
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

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <SafeIcon icon={FiServer} /><span>API Info</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    workerStatus === 'connected' ? 'text-green-600' :
                    workerStatus === 'not_configured' ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {workerStatus === 'connected' ? 'Connected' :
                     workerStatus === 'not_configured' ? 'Not Configured' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API:</span>
                  <span className="font-medium text-gray-900">{getServerUrl(serverConfig)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">User:</span>
                  <span className={`font-medium ${isAuthenticated ? 'text-green-600' : 'text-blue-600'}`}>
                    {isAuthenticated ? user.email : 'Guest Mode'}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button onClick={testConnection}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <SafeIcon icon={FiZap} /><span>Test Connection</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <SafeIcon icon={FiTrendingUp} /><span>Quick Stats</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">URLs:</span>
                  <span className="font-medium">{urlsText.split('\n').map(s=>s.trim()).filter(Boolean).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dwell:</span>
                  <span className="font-medium">{Math.round(dwellMs / 1000)}s</span>
                </div>