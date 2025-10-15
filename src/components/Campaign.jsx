// src/pages/RunCampaign.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../lib/authContext';

import {
  DEFAULT_SERVER_CONFIG,
  CAMPAIGN_DEFAULTS,
  getServerUrl,
} from '../config';

import {
  startCampaign,
  checkCampaignStatus,
  getCampaignResults,
  stopCampaign,
  checkServerHealth,
  buildCampaignRequest,
  handleApiError,
  validateServerConfig,
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

  // --- server config / health ---
  const [serverConfig, setServerConfig] = useState(DEFAULT_SERVER_CONFIG);
  const [isServerConfigured, setIsServerConfigured] = useState(true);
  const [workerStatus, setWorkerStatus] = useState('checking'); // checking | healthy | error

  // --- campaign form state ---
  const [urlsText, setUrlsText] = useState(
    'https://jobmakers.in\nhttps://jobmakers.in/about\nhttps://jobmakers.in/services'
  );
  const [dwellMs, setDwellMs] = useState(CAMPAIGN_DEFAULTS.dwellMs);
  const [scroll, setScroll] = useState(CAMPAIGN_DEFAULTS.scroll);

  // --- run state ---
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('config'); // config | status | results | logs
  const [logs, setLogs] = useState([]);

  const pollTimerRef = useRef(null);

  // ------------------ effects ------------------
  useEffect(() => {
    // try to restore last values from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('runCampaignState') || '{}');
      if (saved.urlsText) setUrlsText(saved.urlsText);
      if (typeof saved.dwellMs === 'number') setDwellMs(saved.dwellMs);
      if (typeof saved.scroll === 'boolean') setScroll(saved.scroll);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    // persist minimal form state
    localStorage.setItem('runCampaignState', JSON.stringify({ urlsText, dwellMs, scroll }));
  }, [urlsText, dwellMs, scroll]);

  useEffect(() => {
    // validate server config + health
    (async () => {
      try {
        const valid = await validateServerConfig(serverConfig);
        setIsServerConfigured(Boolean(valid));
      } catch {
        setIsServerConfigured(false);
      }

      try {
        const health = await checkServerHealth(serverConfig);
        if (health && (health.ok || health.relay)) {
          setWorkerStatus('healthy');
        } else {
          setWorkerStatus('error');
        }
      } catch {
        setWorkerStatus('error');
      }
    })();

    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, [serverConfig]);

  // ------------------ helpers ------------------
  const addLog = (line) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${line}`, ...prev]);

  const parseUrls = () =>
    urlsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

  const beginPolling = (id) => {
    const pollOnce = async () => {
      try {
        const s = await checkCampaignStatus(id, serverConfig);
        setStatus(s.status || s.state || 'running');
        setProgress(Number(s.progress || 0));

        if (['finished', 'completed', 'done', 'success'].includes(String(s.status || '').toLowerCase())) {
          addLog(`Job ${id} completed`);
          setIsRunning(false);
          const r = await getCampaignResults(id, serverConfig);
          setResults(r);
          setActiveTab('results');
          return;
        }

        if (['failed', 'error', 'stopped', 'cancelled'].includes(String(s.status || '').toLowerCase())) {
          addLog(`Job ${id} ended with status: ${s.status}`);
          setIsRunning(false);
          try { setResults(await getCampaignResults(id, serverConfig)); } catch {}
          setActiveTab('status');
          return;
        }

        pollTimerRef.current = setTimeout(pollOnce, 1500);
      } catch (e) {
        addLog(`Polling error: ${e.message || e}`);
        pollTimerRef.current = setTimeout(pollOnce, 2500);
      }
    };

    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    pollTimerRef.current = setTimeout(pollOnce, 1000);
  };

  // ------------------ actions ------------------
  const onRun = async () => {
    const urls = parseUrls();
    if (!urls.length) {
      alert('Please enter at least one URL.');
      return;
    }

    try {
      setActiveTab('status');
      setIsRunning(true);
      setStatus('starting');
      setProgress(0);
      setResults(null);

      const payload = buildCampaignRequest({
        urls,
        dwellMs: Math.max(6000, Number(dwellMs) || CAMPAIGN_DEFAULTS.dwellMs),
        scroll: Boolean(scroll),
      });

      addLog(`Submitting campaign with ${urls.length} URL(s) to ${getServerUrl(serverConfig)}`);
      const res = await startCampaign(payload, serverConfig); // expected { id, status } or similar
      const id = res.id || res.sessionId || res.jobId;
      if (!id) throw new Error('No job id returned from API');

      setJobId(id);
      addLog(`Job started: ${id}`);
      beginPolling(id);
    } catch (err) {
      setIsRunning(false);
      setStatus('error');
      const msg = handleApiError(err, 'Start campaign');
      addLog(msg);
      alert(msg);
    }
  };

  const onStop = async () => {
    if (!jobId) return;
    try {
      await stopCampaign(jobId, serverConfig);
      addLog(`Stop requested for job ${jobId}`);
      setIsRunning(false);
      setStatus('stopped');
    } catch (err) {
      const msg = handleApiError(err, 'Stop campaign');
      addLog(msg);
      alert(msg);
    }
  };

  // ------------------ UI ------------------
  const baseUrl = getServerUrl(serverConfig);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow">
              <SafeIcon icon={FiZap} className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Run Campaign</h1>
              <p className="text-gray-600">
                API: <code className="text-gray-800">{baseUrl}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 text-sm rounded-full ${
              workerStatus === 'healthy'
                ? 'bg-green-100 text-green-700'
                : workerStatus === 'checking'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {workerStatus === 'healthy' ? 'Server: Healthy' : workerStatus === 'checking' ? 'Server: Checking…' : 'Server: Error'}
            </span>
            <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
              {isAuthenticated ? 'Signed in' : 'Guest'}
            </span>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Config */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center space-x-2 mb-4">
                <SafeIcon icon={FiSettings} className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">Campaign Config</h2>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target URLs (one per line)
              </label>
              <textarea
                rows={6}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={urlsText}
                onChange={(e) => setUrlsText(e.target.value)}
                placeholder="https://example.com"
                disabled={isRunning}
              />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dwell (ms)
                  </label>
                  <input
                    type="number"
                    min={6000}
                    step={1000}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={dwellMs}
                    onChange={(e) => setDwellMs(Number(e.target.value))}
                    disabled={isRunning}
                  />
                  <p className="text-xs text-gray-500 mt-1">Min 6000ms, GA-friendly ≥15000ms.</p>
                </div>

                <div className="flex items-end">
                  <label className="inline-flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={scroll}
                      onChange={(e) => setScroll(e.target.checked)}
                      className="h-4 w-4 text-blue-600"
                      disabled={isRunning}
                    />
                    <span className="text-sm text-gray-700">Scroll page</span>
                  </label>
                </div>
              </div>

              <div className="mt-5 flex items-center space-x-3">
                <button
                  onClick={onRun}
                  disabled={isRunning || !isServerConfigured}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium ${
                    isRunning || !isServerConfigured
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <SafeIcon icon={FiPlay} className="w-4 h-4" />
                  <span>{isRunning ? 'Running…' : 'Start Campaign'}</span>
                </button>

                <button
                  onClick={onStop}
                  disabled={!isRunning || !jobId}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                    !isRunning || !jobId
                      ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  <SafeIcon icon={FiStop} className="w-4 h-4" />
                  <span>Stop</span>
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p>* Relay mode: browser calls <code>/run</code> on <code>{baseUrl}</code>, relay adds API key.</p>
              </div>
            </div>
          </div>

          {/* Right: Status & Results */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  {['config', 'status', 'results', 'logs'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        activeTab === tab
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="text-sm">
                  Job: {jobId ? <code className="text-gray-800">{jobId}</code> : '—'}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'status' && (
                  <motion.div
                    key="status"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiActivity} className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-800">Status:</span>
                      <span className={`px-2 py-0.5 text-sm rounded-full ${
                        status === 'running' ? 'bg-green-100 text-green-700'
                        : status === 'starting' ? 'bg-yellow-100 text-yellow-700'
                        : status === 'completed' ? 'bg-blue-100 text-blue-700'
                        : status === 'stopped' ? 'bg-gray-100 text-gray-700'
                        : status === 'error' ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                        {status || '—'}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 bg-blue-600 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                      />
                    </div>
                  </motion.div>
                )}

                {activeTab === 'results' && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="space-y-3"
                  >
                    {!results && <p className="text-gray-600">No results yet.</p>}
                    {results && (
                      <>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {Array.isArray(results.results) ? results.results.length : (results.total || 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Success</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {Array.isArray(results.results)
                                ? results.results.filter(r => r && r.ok).length
                                : (results.ok || 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Failed</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {Array.isArray(results.results)
                                ? results.results.filter(r => r && r.ok === false).length
                                : (results.failed || 0)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto max-h-64">
                            {JSON.stringify(results, null, 2)}
                          </pre>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {activeTab === 'logs' && (
                  <motion.div
                    key="logs"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                  >
                    <div className="space-y-1">
                      {logs.length === 0 && (
                        <p className="text-gray-600">No logs yet.</p>
                      )}
                      {logs.map((l, i) => (
                        <div key={i} className="text-xs font-mono bg-gray-50 border border-gray-200 rounded p-2">
                          {l}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'config' && (
                  <motion.div
                    key="config"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-sm text-gray-700 space-y-2"
                  >
                    <p>Server URL: <code className="text-gray-800">{baseUrl}</code></p>
                    <p>Configured: <strong>{isServerConfigured ? 'Yes' : 'No'}</strong></p>
                    <p>Health: <strong>{workerStatus}</strong></p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>
            * Each visit enforces dwell time and optional scroll to improve GA visibility.
          </p>
        </div>
      </div>
    </div>
  );
}