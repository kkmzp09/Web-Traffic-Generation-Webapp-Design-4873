import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../lib/authContext.jsx';
import { 
  startCampaign, 
  checkCampaignStatus, 
  getCampaignResults, 
  stopCampaign,
  buildCampaignRequest,
  handleApiError 
} from '../api';
import { DEFAULT_SERVER_CONFIG } from '../config';

const { 
  FiPlay, FiStop, FiRefreshCw, FiGlobe, FiClock, FiActivity,
  FiCheckCircle, FiXCircle, FiAlertTriangle, FiZap, FiEye,
  FiTarget, FiServer, FiUsers
} = FiIcons;

export default function RunCampaign({ campaign }) {
  // Authentication context
  const { user, isAuthenticated } = useAuth();

  // Form state
  const [urls, setUrls] = useState("https://jobmakers.in\nhttps://jobmakers.in/about\nhttps://jobmakers.in/services");
  const [dwellMs, setDwellMs] = useState(6000);
  const [scroll, setScroll] = useState(true);
  
  // Campaign state
  const [status, setStatus] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (campaign) {
      setUrls(campaign.targetUrl || '');
      // You can also set other campaign-specific settings here
      addLog(`Selected campaign: ${campaign.name}`, 'info');
    }
  }, [campaign]);

  // Add log helper
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-19), { timestamp, message, type }]);
  };

  // Initialize component
  useEffect(() => {
    if (isAuthenticated && user) {
      addLog(`👤 Logged in as: ${user.email}`, 'success');
    } else {
      addLog('👤 Running in guest mode', 'info');
    }
    addLog(`🚀 VPS Server: ${DEFAULT_SERVER_CONFIG.host}:${DEFAULT_SERVER_CONFIG.port}`, 'info');
  }, [isAuthenticated, user]);

  const handleRun = async () => {
    if (!isAuthenticated) {
      addLog('❌ Please log in to run a campaign.', 'error');
      setStatus("Error: Please log in to run a campaign.");
      return;
    }
    // Reset state
    setResults(null);
    setProgress(0);
    setStatus("");

    // Validate URLs
    const urlList = urls.split('\n').map(u => u.trim()).filter(Boolean);
    if (urlList.length === 0) {
      addLog('❌ Please enter at least one URL', 'error');
      setStatus("Error: No URLs provided");
      return;
    }

    setIsRunning(true);
    setStatus("Starting campaign...");
    addLog('🚀 Starting VPS campaign...', 'info');
    addLog(`📋 URLs: ${urlList.length} targets`, 'info');
    addLog(`⏱️ Dwell time: ${dwellMs / 1000}s per page`, 'info');

    try {
      // Build campaign request
      const campaignData = buildCampaignRequest({
        urls,
        dwellMs,
        scroll,
        advancedSettings: {
          naturalScrolling: true,
          randomDelay: true,
          screenshots: true
        },
        user
      });

      addLog(`📡 Sending to VPS: ${DEFAULT_SERVER_CONFIG.host}`, 'info');
      const response = await startCampaign(campaignData);
      
      if (response.id || response.sessionId || response.accepted) {
        const sessionId = response.id || response.sessionId || `session_${Date.now()}`;
        setJobId(sessionId);
        setStatus(`Campaign started! ID: ${sessionId}`);
        addLog(`✅ Campaign started with ID: ${sessionId}`, 'success');
        
        // Start polling for status
        startPolling(sessionId);
      } else {
        throw new Error(response.message || response.error || 'Campaign start failed');
      }
    } catch (err) {
      const errorMessage = handleApiError(err, 'Campaign start');
      setStatus(`Error: ${errorMessage}`);
      setIsRunning(false);
      addLog(`❌ ${errorMessage}`, 'error');
    }
  };

  const startPolling = (sessionId) => {
    let pollCount = 0;
    const maxPolls = 60; // 2 minutes max polling

    const poll = async () => {
      if (pollCount >= maxPolls) {
        addLog('⏰ Polling timeout - check VPS manually', 'warning');
        setIsRunning(false);
        return;
      }

      try {
        const statusData = await checkCampaignStatus(sessionId);
        setProgress(statusData.progress || 0);
        
        if (statusData.progress > 0) {
          addLog(`📊 Progress: ${statusData.progress}%`, 'info');
        }
        
        if (statusData.status === 'finished' || statusData.status === 'completed') {
          setIsRunning(false);
          setStatus('Campaign completed successfully!');
          addLog('🎉 Campaign completed!', 'success');
          
          // Fetch results
          try {
            const resultsData = await getCampaignResults(sessionId);
            setResults(resultsData.results || resultsData);
            addLog(`📋 Results: ${Array.isArray(resultsData.results) ? resultsData.results.length : 1} items`, 'success');
          } catch (error) {
            addLog('⚠️ Could not fetch results', 'warning');
          }
          return;
        }
        
        if (statusData.status === 'failed' || statusData.status === 'error') {
          setIsRunning(false);
          setStatus('Campaign failed');
          addLog('❌ Campaign failed on VPS', 'error');
          return;
        }
      } catch (error) {
        addLog('⚠️ Status check failed', 'warning');
      }

      pollCount++;
      setTimeout(poll, 2000);
    };

    setTimeout(poll, 2000);
  };

  const handleStop = async () => {
    if (jobId) {
      try {
        await stopCampaign(jobId);
        addLog('🛑 Stop signal sent to VPS', 'warning');
      } catch (error) {
        addLog('❌ Stop failed', 'error');
      }
    }
    setIsRunning(false);
    setJobId(null);
    setStatus('Campaign stopped');
    setProgress(0);
  };

  const getStatusColor = () => {
    if (status.toLowerCase().includes('error') || status.toLowerCase().includes('failed')) return 'text-red-600';
    if (status.includes('completed') || status.includes('started')) return 'text-green-600';
    if (status.includes('Starting') || isRunning) return 'text-blue-600';
    return 'text-gray-600';
  };
  
  if (!campaign) {
    return (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg p-8">
            <div className="text-center">
                <SafeIcon icon={FiTarget} className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No Campaign Selected</h3>
                <p className="mt-1 text-sm text-gray-500">Please select a campaign from the 'Manage' tab to run it.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
            <SafeIcon icon={FiTarget} className="text-red-600" />
            <span>Run Campaign: {campaign.name}</span>
            {isAuthenticated && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <SafeIcon icon={FiUsers} />
                <span>Authenticated</span>
              </div>
            )}
          </h1>
          <p className="text-gray-600">
            Simple interface to run traffic campaigns on your VPS
          </p>
          <p className="text-sm text-gray-500 mt-1">
            VPS Server: {DEFAULT_SERVER_CONFIG.host}:{DEFAULT_SERVER_CONFIG.port}
            {user && <span className="ml-2">• User: {user.email}</span>}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaign Configuration */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center space-x-2">
                <SafeIcon icon={FiGlobe} />
                <span>Campaign Configuration</span>
              </h2>

              <div className="space-y-6">
                {/* URLs Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target URLs (one per line)
                  </label>
                  <textarea
                    value={urls}
                    onChange={(e) => setUrls(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                    placeholder={"https://example.com\nhttps://example.com/about"}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {urls.split('\n').filter(Boolean).length} URLs configured
                  </p>
                </div>

                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                      <SafeIcon icon={FiClock} />
                      <span>Dwell Time (ms)</span>
                    </label>
                    <input
                      type="number"
                      value={dwellMs}
                      onChange={(e) => setDwellMs(Number(e.target.value))}
                      min="1000"
                      max="30000"
                      step="1000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Interactions
                    </label>
                    <div className="flex items-center space-x-3 pt-3">
                      <input
                        type="checkbox"
                        id="scroll"
                        checked={scroll}
                        onChange={(e) => setScroll(e.target.checked)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label htmlFor="scroll" className="text-sm text-gray-700">
                        Enable natural scrolling
                      </label>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleRun}
                    disabled={isRunning}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                      isRunning
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <SafeIcon icon={isRunning ? FiRefreshCw : FiPlay} className={isRunning ? 'animate-spin' : ''} />
                    <span>{isRunning ? 'Running...' : 'Start Campaign'}</span>
                  </button>

                  {isRunning && (
                    <button
                      onClick={handleStop}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <SafeIcon icon={FiStop} />
                      <span>Stop</span>
                    </button>
                  )}
                </div>

                {/* Status Display */}
                {status && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-2">
                      <SafeIcon 
                        icon={
                          status.toLowerCase().includes('error') || status.toLowerCase().includes('failed') ? FiXCircle :
                          status.includes('completed') ? FiCheckCircle :
                          isRunning ? FiActivity : FiAlertTriangle
                        } 
                        className={getStatusColor()} 
                      />
                      <span className={`font-medium ${getStatusColor()}`}>
                        {status}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    {isRunning && progress > 0 && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div 
                            className="bg-gradient-to-r from-red-600 to-purple-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <div className="text-right text-sm text-gray-500 mt-1">
                          {progress}% complete
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Status Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
           
            {/* Activity Logs */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <SafeIcon icon={FiActivity} />
                  <span>Activity</span>
                </h3>
                <button
                  onClick={() => setLogs([])}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-3 h-96 overflow-y-auto font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    No activity yet
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className={`mb-1 ${
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'warning' ? 'text-yellow-400' :
                      'text-gray-300'
                    }`}>\
                      <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                    </div>
                  ))
                )}
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
                  <span>Results</span>
                </h3>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {Array.isArray(results) ? results.map((result, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                      <SafeIcon 
                        icon={result.ok ? FiCheckCircle : FiXCircle} 
                        className={result.ok ? 'text-green-600' : 'text-red-600'} 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {result.url ? new URL(result.url).hostname : `Result ${index + 1}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.title || result.error || 'Completed'}
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
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}