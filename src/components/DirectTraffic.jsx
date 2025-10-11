// src/components/DirectTraffic.jsx
import React, { useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../lib/authContext';
import { createCampaign, getDirectCampaigns } from '../lib/queries';

import {
  startCampaign,
  checkCampaignStatus,
  getCampaignResults,
  handleApiError,
} from '../api';
import { DEFAULT_SERVER_CONFIG, getServerUrl } from '../config';

const { FiZap, FiPlay, FiTarget, FiGlobe, FiBarChart } = FiIcons;

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export default function DirectTraffic() {
  const { user } = useAuth();
  const [serverConfig] = useState(DEFAULT_SERVER_CONFIG);

  const [campaignData, setCampaignData] = useState({
    url: '',
    trafficAmount: 10,   // keep small while validating GA
    duration: 15,        // minutes; we enforce ≥15s/visit (GA-friendly)
  });

  const [isRunning, setIsRunning] = useState(false);
  const [activeJobId, setActiveJobId] = useState(null);
  const [statusText, setStatusText] = useState('');
  const [progress, setProgress] = useState(0);
  const [campaigns, setCampaigns] = useState([]);

  // GA helpers
  const [gaMode, setGaMode] = useState(true);
  const [clickConsent, setClickConsent] = useState(true);
  const [internalClick, setInternalClick] = useState(true);
  const [useRealisticUA, setUseRealisticUA] = useState(true);

  // Load campaigns from database on initial render
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!user) return;
      try {
        const history = await getDirectCampaigns(user.id);
        const formattedHistory = history.map(c => ({
            id: c.id,
            name: c.name,
            url: c.targetUrl,
            status: c.status,
            traffic: c.totalRequests,
            success: c.totalRequests > 0 ? (c.successfulRequests / c.totalRequests) * 100 : 0,
            created: new Date(c.createdAt).toISOString().split('T')[0],
        }));
        setCampaigns(formattedHistory);
      } catch (error) {
        console.error('Failed to load campaign history:', error);
      }
    };
    fetchCampaigns();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCampaignData(prev => ({ ...prev, [name]: name === 'url' ? value : Number(value) }));
  };

  // Build payload to match backend schema { urls[], dwellMs, scroll, actions?, userAgent? }
  const buildPayload = () => {
    const { url, trafficAmount, duration } = campaignData;
    if (!url) throw new Error('Please provide a URL');

    const totalMs = duration * 60 * 1000;
    const perVisit = Math.round(totalMs / Math.max(trafficAmount, 1));
    const minDwell = gaMode ? 15000 : 6000;             // 15s if GA mode
    const dwellMs = clamp(perVisit, minDwell, 120000);

    const count = clamp(trafficAmount, 1, 100);
    const urls = Array.from({ length: count }, () => url.trim());

    const payload = { urls, dwellMs, scroll: true };

    const actions = [];
    if (gaMode && clickConsent) {
      actions.push(
        { type: 'waitForSelector', selector: '#onetrust-accept-btn-handler' },
        { type: 'click',           selector: '#onetrust-accept-btn-handler' },

        { type: 'waitForSelector', selector: 'button[aria-label="Accept all"]' },
        { type: 'click',           selector: 'button[aria-label="Accept all"]' },

        { type: 'waitForSelector', selector: 'button:has-text("Accept")' },
        { type: 'click',           selector: 'button:has-text("Accept")' },

        { type: 'waitForSelector', selector: '.cookie-accept,.cc-allow' },
        { type: 'click',           selector: '.cookie-accept,.cc-allow' },
      );
    }

    if (gaMode && internalClick) {
      const host = (() => {
        try { return new URL(url).hostname; } catch { return ''; }
      })();

      actions.push(
        { type: 'waitForSelector', selector: `a[href^="/"], a[href^="#"], a[href*="${host}"]` },
        { type: 'click',           selector: `a[href^="/"], a[href^="#"], a[href*="${host}"]` },
        { type: 'waitForSelector', selector: 'body' }
      );
    }

    if (gaMode && useRealisticUA) {
      payload.userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';
    }

    if (actions.length) payload.actions = actions;
    return payload;
  };

  const pollStatus = async (id) => {
    try {
      const s = await checkCampaignStatus(id, serverConfig);
      setProgress(s.progress || 0);
      setStatusText(s.status || 'running');

      if (s.status === 'finished' || s.status === 'completed') {
        setIsRunning(false);
        setActiveJobId(null);

        const r = await getCampaignResults(id, serverConfig);
        const okCount = Array.isArray(r.results) ? r.results.filter(x => x.ok).length : 0;
        const total = Array.isArray(r.results) ? r.results.length : 0;
        
        const created = new Date();
        const newCampaignForDb = {
          userId: user.id,
          name: `Direct: ${(() => { try { return new URL(campaignData.url).hostname; } catch { return campaignData.url; } })()}`,
          targetUrl: campaignData.url,
          status: 'completed',
          type: 'direct',
          duration: campaignData.duration,
          totalRequests: total,
          successfulRequests: okCount,
          failedRequests: total - okCount,
          createdAt: created,
          completedAt: created,
        };

        try {
            const savedCampaign = await createCampaign(newCampaignForDb);
            const newCampaignForUi = {
                id: savedCampaign.id,
                name: savedCampaign.name,
                url: savedCampaign.targetUrl,
                status: savedCampaign.status,
                traffic: savedCampaign.totalRequests,
                success: savedCampaign.totalRequests > 0 ? (savedCampaign.successfulRequests / savedCampaign.totalRequests) * 100 : 0,
                created: new Date(savedCampaign.createdAt).toISOString().split('T')[0],
            };
            setCampaigns(prev => [newCampaignForUi, ...prev]);
        } catch (error) {
            console.error('Failed to save campaign history:', error);
        }

        return;
      }

      if (s.status === 'failed' || s.status === 'error') {
        setIsRunning(false);
        setActiveJobId(null);
        setStatusText('failed');
        return;
      }

      setTimeout(() => pollStatus(id), 2000);
    } catch {
      setStatusText('checking…');
      setTimeout(() => pollStatus(id), 3000);
    }
  };

  const handleRunCampaign = async () => {
    if (!campaignData.url) return;
    if (!user) {
        alert("Please log in to run a campaign.");
        return;
    }

    try {
      const payload = buildPayload();
      setIsRunning(true);
      setStatusText('starting…');
      setProgress(0);

      const res = await startCampaign(payload, serverConfig); // { id, status }
      const id = res.id || res.sessionId;
      if (!id) throw new Error('No job id returned from API');

      setActiveJobId(id);
      setStatusText(res.status || 'running');

      setTimeout(() => pollStatus(id), 1500);
    } catch (err) {
      setIsRunning(false);
      setActiveJobId(null);
      setStatusText('error');
      alert(handleApiError(err, 'Start campaign'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <SafeIcon icon={FiZap} className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Direct Traffic</h1>
              <p className="text-gray-600 mt-1">Generate direct website traffic with GA-friendly visits</p>
              <p className="text-xs text-gray-500 mt-1">API: <strong>{getServerUrl(serverConfig)}</strong></p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaign Setup */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <SafeIcon icon={FiTarget} className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Run Campaign</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
                  <input
                    type="url"
                    name="url"
                    value={campaignData.url}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isRunning}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visits</label>
                    <input
                      type="number"
                      name="trafficAmount"
                      value={campaignData.trafficAmount}
                      onChange={handleInputChange}
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isRunning}
                    />
                    <p className="text-xs text-gray-500 mt-1">Max 100 per run.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min)</label>
                    <input
                      type="number"
                      name="duration"
                      value={campaignData.duration}
                      onChange={handleInputChange}
                      min="1"
                      max="1440"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isRunning}
                    />
                    <p className="text-xs text-gray-500 mt-1">We compute dwell/visit.</p>
                  </div>
                </div>

                {/* GA Mode & helpers */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={gaMode}
                      onChange={e => setGaMode(e.target.checked)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-800 font-medium">GA Compatibility Mode</span>
                  </label>

                  <div className="grid grid-cols-2 gap-3 pl-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={clickConsent}
                        onChange={e => setClickConsent(e.target.checked)}
                        className="h-4 w-4 text-blue-600"
                        disabled={!gaMode}
                      />
                      <span className="text-sm text-gray-700">Click cookie consent</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={internalClick}
                        onChange={e => setInternalClick(e.target.checked)}
                        className="h-4 w-4 text-blue-600"
                        disabled={!gaMode}
                      />
                      <span className="text-sm text-gray-700">Click one internal link</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={useRealisticUA}
                        onChange={e => setUseRealisticUA(e.target.checked)}
                        className="h-4 w-4 text-blue-600"
                        disabled={!gaMode}
                      />
                      <span className="text-sm text-gray-700">Realistic User-Agent</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleRunCampaign}
                  disabled={!campaignData.url || isRunning}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    isRunning
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <SafeIcon icon={FiPlay} className="w-4 h-4" />
                  <span>{isRunning ? 'Campaign Running…' : 'Start Campaign'}</span>
                </button>

                {activeJobId && (
                  <div className="mt-3 text-sm text-gray-600">
                    <div>Job ID: <code className="text-gray-800">{activeJobId}</code></div>
                    <div>Status: {statusText || 'running'}</div>
                    {progress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Campaign List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiBarChart} className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Campaign History</h2>
                </div>
                <div className="text-sm text-gray-500">{campaigns.length} campaigns</div>
              </div>

              <div className="space-y-4">
                {campaigns.map((c) => (
                  <div key={c.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiGlobe} className="w-4 h-4 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-gray-900">{c.name}</h3>
                          <p className="text-sm text-gray-600">{c.url}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Traffic</p>
                        <p className="font-medium text-gray-900">{c.traffic}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Success Rate</p>
                        <p className="font-medium text-gray-900">
                          {typeof c.success === 'number' ? c.success.toFixed(1) : c.success}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-medium text-gray-900">{c.created}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {campaigns.length === 0 && (
                <div className="text-center py-8">
                  <SafeIcon icon={FiBarChart} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                  <p className="text-gray-600">Start your first direct traffic campaign to see results here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tiny legend */}
        <div className="mt-6 text-xs text-gray-500">
          <p>
            * GA Mode enforces ≥15s dwell, scrolls the page, tries common cookie-consent buttons, and clicks one internal link.
            This increases the chance that GA4 records <code>page_view</code> and <code>user_engagement</code>.
          </p>
        </div>
      </div>
    </div>
  );
}