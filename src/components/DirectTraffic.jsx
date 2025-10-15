import React, { useState } from 'react';
import { FiTarget, FiPlay, FiGlobe, FiUsers, FiClock, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import api from '../api';           // must export startRun() and health()
import CONFIG from '../config';     // must export { API_BASE, REQUEST_TIMEOUT_MS }

function DirectTraffic() {
  const [targetUrl, setTargetUrl] = useState('https://www.organitrafficboost.com');
  const [visitors, setVisitors]   = useState(10);
  const [durationSec, setDurationSec] = useState(30); // UI input in seconds
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);
  const [campaignInfo, setCampaignInfo] = useState(null);

  const displayUrl = (CONFIG.API_BASE || '').replace(/^(https?:\/\/)/, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setCampaignInfo(null);

    // Normalize inputs
    const trimmed = (targetUrl || '').trim();
    const hasProtocol = /^https?:\/\//i.test(trimmed);
    const finalUrl = hasProtocol ? trimmed : `https://${trimmed}`;

    const count = Math.max(1, Number.isFinite(+visitors) ? parseInt(visitors, 10) : 1);
    const dwellMs = Math.max(1, Number.isFinite(+durationSec) ? parseInt(durationSec, 10) : 1) * 1000;

    // Build payload for the relay (/run) -> playwright
    const urls = Array.from({ length: count }, () => finalUrl);

    try {
      const result = await api.startRun({ urls, dwellMs, scroll: true });
      // Relay returns: { via:'relay', status:'queued', jobId:'...', count:n }
      setCampaignInfo({
        jobId: result?.jobId || 'accepted',
        count: result?.count ?? urls.length,
        status: result?.status || 'queued',
      });
    } catch (err) {
      setError(err?.message || 'Something went wrong starting the campaign.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex items-center mb-4">
        <SafeIcon icon={FiTarget} className="text-2xl text-green-400" />
        <h2 className="ml-3 text-xl font-semibold text-white">Direct Traffic</h2>
      </div>

      <p className="text-gray-400 mb-2">
        API: <code className="text-sm bg-gray-700 px-2 py-1 rounded">{displayUrl || 'api.organitrafficboost.com'}</code>
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-300 mb-1">
            <SafeIcon icon={FiGlobe} className="inline-block mr-2" />
            Target URL
          </label>
          <input
            type="url"
            id="targetUrl"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="https://example.com"
            required
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="visitors" className="block text-sm font-medium text-gray-300 mb-1">
              <SafeIcon icon={FiUsers} className="inline-block mr-2" />
              Visitors
            </label>
            <input
              type="number"
              id="visitors"
              value={visitors}
              onChange={(e) => setVisitors(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              min="1"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">
              <SafeIcon icon={FiClock} className="inline-block mr-2" />
              Duration (sec)
            </label>
            <input
              type="number"
              id="duration"
              value={durationSec}
              onChange={(e) => setDurationSec(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              min="5"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 disabled:bg-gray-500"
          disabled={isLoading}
        >
          <SafeIcon icon={isLoading ? FiClock : FiPlay} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Starting...' : 'Start Campaign'}
        </button>
      </form>

      {campaignInfo && (
        <div className="mt-4 p-3 bg-green-900 border border-green-700 rounded-md text-green-200">
          <p className="flex items-center">
            <SafeIcon icon={FiCheck} className="mr-2 text-green-400" />
            Campaign queued! <strong className="ml-1">jobId:</strong>&nbsp;{campaignInfo.jobId}
            <span className="ml-3">| <strong>visits:</strong> {campaignInfo.count}</span>
            <span className="ml-3">| <strong>status:</strong> {campaignInfo.status}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded-md text-red-200">
          <p className="flex items-center">
            <SafeIcon icon={FiAlertTriangle} className="mr-2 text-red-400" />
            Error: {error}
          </p>
        </div>
      )}
    </div>
  );
}

export default DirectTraffic;