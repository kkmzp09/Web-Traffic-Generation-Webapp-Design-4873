import React, { useState, useEffect } from 'react';
import { FiTarget, FiPlay, FiGlobe, FiUsers, FiClock, FiCheck, FiAlertTriangle, FiStopCircle, FiInfo, FiActivity, FiTrendingUp } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import api from '../api';           // must export startRun() and health()
import CONFIG from '../config';     // must export { API_BASE, REQUEST_TIMEOUT_MS }
import CampaignHistory from './CampaignHistory';
import { useAuth } from '../lib/authContext';
import { useSubscription } from '../lib/subscriptionContext';

function DirectTraffic() {
  const { user } = useAuth();
  const { subscription, updateSubscription } = useSubscription();
  const [targetUrl, setTargetUrl] = useState('https://www.yourdomain.com');
  const [visitors, setVisitors]   = useState(10);
  const [durationMin, setDurationMin] = useState(0.5); // UI input in minutes (default 30 sec = 0.5 min)
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError]         = useState(null);
  const [campaignInfo, setCampaignInfo] = useState(null);
  const [campaignResults, setCampaignResults] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  const displayUrl = (CONFIG.API_BASE || '').replace(/^(https?:\/\/)/, '');

  // Save campaign data when complete
  const saveCampaignData = (results) => {
    if (!user) return;

    const completedVisits = results.completed || results.total || visitors;
    
    // Save campaign to localStorage
    const campaignData = {
      id: campaignInfo.jobId,
      type: 'direct',
      url: targetUrl,
      visitors: completedVisits,
      duration: durationMin,
      status: 'completed',
      timestamp: new Date().toISOString(),
      results: results
    };

    // Get existing campaigns
    const existingCampaigns = JSON.parse(localStorage.getItem(`campaigns_${user.id}`) || '[]');
    existingCampaigns.unshift(campaignData);
    localStorage.setItem(`campaigns_${user.id}`, JSON.stringify(existingCampaigns));

    // Update subscription usage
    if (subscription && updateSubscription) {
      const newUsedVisits = (subscription.usedVisits || 0) + completedVisits;
      updateSubscription({
        usedVisits: newUsedVisits
      });
      console.log(`✅ Updated subscription: ${completedVisits} visits used, total: ${newUsedVisits}`);
    }

    console.log('Campaign saved:', campaignData);
  };

  // Poll for campaign results
  useEffect(() => {
    if (campaignInfo?.jobId && isRunning) {
      const interval = setInterval(async () => {
        try {
          const results = await api.getResults(campaignInfo.jobId);
          if (results) {
            setCampaignResults(results);
            // Stop polling if campaign is complete
            if (results.completed >= results.total || results.status === 'completed') {
              setIsRunning(false);
              clearInterval(interval);
              // Save campaign data
              saveCampaignData(results);
            }
          }
        } catch (err) {
          console.error('Failed to fetch results:', err);
        }
      }, 5000); // Poll every 5 seconds
      
      setPollingInterval(interval);
      return () => clearInterval(interval);
    }
  }, [campaignInfo?.jobId, isRunning, user, subscription]);

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
    // Convert minutes to milliseconds
    const dwellMs = Math.max(5000, Math.round(Number(durationMin) * 60 * 1000));

    // Build payload for the relay (/run) -> playwright
    const urls = Array.from({ length: count }, () => finalUrl);

    try {
      const result = await api.startRun({ urls, dwellMs, scroll: true });
      // Relay returns: { via:'relay', status:'queued', jobId:'...', count:n }
      const jobInfo = {
        jobId: result?.jobId || 'accepted',
        count: result?.count ?? urls.length,
        status: result?.status || 'queued',
      };
      setCampaignInfo(jobInfo);
      setIsRunning(true);
      
      // Save campaign as running immediately
      if (user) {
        const campaignData = {
          id: jobInfo.jobId,
          type: 'direct',
          url: finalUrl,
          visitors: count,
          duration: durationMin,
          status: 'running',
          timestamp: new Date().toISOString(),
          results: null
        };
        
        const existingCampaigns = JSON.parse(localStorage.getItem(`campaigns_${user.id}`) || '[]');
        existingCampaigns.unshift(campaignData);
        localStorage.setItem(`campaigns_${user.id}`, JSON.stringify(existingCampaigns));
        console.log('Campaign started and saved:', campaignData);
        
        // Update subscription immediately with requested visits
        if (subscription && updateSubscription) {
          const newUsedVisits = (subscription.usedVisits || 0) + count;
          updateSubscription({
            usedVisits: newUsedVisits
          });
          console.log(`✅ Subscription updated: ${count} visits allocated, total used: ${newUsedVisits}`);
        }
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong starting the campaign.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    if (!campaignInfo?.jobId) return;
    
    try {
      setIsLoading(true);
      // Call stop API if available
      if (api.stop) {
        await api.stop(campaignInfo.jobId);
      }
      setIsRunning(false);
      setCampaignInfo(prev => prev ? { ...prev, status: 'stopped' } : null);
    } catch (err) {
      setError('Failed to stop campaign: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <SafeIcon icon={FiTarget} className="text-2xl text-green-400" />
          <h2 className="ml-3 text-xl font-semibold text-white">Direct Traffic</h2>
        </div>

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

        <div className="grid grid-cols-2 gap-4 mb-4">
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
              max="10000"
              required
              disabled={isLoading || isRunning}
            />
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">
              <SafeIcon icon={FiClock} className="inline-block mr-2" />
              Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              min="0.1"
              max="60"
              step="0.1"
              required
              disabled={isLoading || isRunning}
            />
          </div>
        </div>

        <div className="mb-6 p-3 bg-blue-900/30 border border-blue-700/50 rounded-md">
          <p className="text-xs text-blue-300 flex items-start">
            <SafeIcon icon={FiInfo} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Duration:</strong> Time each visitor spends on the page. 
              <span className="block mt-1">Recommended: 0.5-5 minutes for natural traffic patterns.</span>
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={isLoading || isRunning}
          >
            <SafeIcon icon={isLoading ? FiClock : FiPlay} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Starting...' : 'Start Campaign'}
          </button>

          <button
            type="button"
            onClick={handleStop}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={!isRunning || isLoading}
          >
            <SafeIcon icon={FiStopCircle} className="mr-2" />
            Stop Campaign
          </button>
        </div>
      </form>

      {campaignInfo && (
        <div className={`mt-4 p-4 border rounded-md ${
          campaignInfo.status === 'stopped' 
            ? 'bg-orange-900/50 border-orange-700 text-orange-200' 
            : 'bg-green-900/50 border-green-700 text-green-200'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="flex items-center font-semibold mb-2">
                <SafeIcon icon={campaignInfo.status === 'stopped' ? FiStopCircle : FiCheck} className="mr-2" />
                {campaignInfo.status === 'stopped' ? 'Campaign Stopped' : 'Campaign Running'}
              </p>
              <div className="text-sm space-y-1">
                <p><strong>Job ID:</strong> {campaignInfo.jobId}</p>
                <p><strong>Visitors:</strong> {campaignInfo.count}</p>
                <p><strong>Status:</strong> <span className="capitalize">{campaignInfo.status}</span></p>
                <p><strong>Duration per visit:</strong> {durationMin} {durationMin === 1 ? 'minute' : 'minutes'}</p>
              </div>
            </div>
          </div>
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

      {campaignResults && (
        <div className="mt-4 p-4 bg-blue-900/50 border border-blue-700 rounded-md">
          <div className="flex items-center mb-3">
            <SafeIcon icon={FiActivity} className="text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold text-blue-200">Campaign Progress</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-700/50 p-3 rounded">
              <p className="text-xs text-gray-400 mb-1">Total Visits</p>
              <p className="text-2xl font-bold text-white">{campaignResults.total || visitors}</p>
            </div>
            <div className="bg-green-900/30 p-3 rounded">
              <p className="text-xs text-gray-400 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-400">{campaignResults.completed || 0}</p>
            </div>
            <div className="bg-yellow-900/30 p-3 rounded">
              <p className="text-xs text-gray-400 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-yellow-400">{campaignResults.inProgress || 0}</p>
            </div>
            <div className="bg-red-900/30 p-3 rounded">
              <p className="text-xs text-gray-400 mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-400">{campaignResults.failed || 0}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(((campaignResults.completed || 0) / (campaignResults.total || 1)) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((campaignResults.completed || 0) / (campaignResults.total || 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Additional Stats */}
          {campaignResults.pagesVisited && (
            <div className="mt-3 pt-3 border-t border-blue-800">
              <div className="flex items-center text-sm text-blue-300">
                <SafeIcon icon={FiTrendingUp} className="mr-2" />
                <span><strong>{campaignResults.pagesVisited}</strong> total pages visited (including internal links)</span>
              </div>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Campaign History */}
      <CampaignHistory />
    </div>
  );
}

export default DirectTraffic;