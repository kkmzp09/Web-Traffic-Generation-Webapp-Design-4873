// src/components/KeywordTracker.jsx
// Track keyword rankings over time with DataForSEO API

import React, { useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../lib/authContext';
import { useSubscription } from '../lib/subscriptionContext';
import { useNavigate } from 'react-router-dom';

const { 
  FiTarget, FiPlus, FiTrash2, FiTrendingUp, FiTrendingDown, FiMinus,
  FiLoader, FiAlertCircle, FiRefreshCw, FiDownload, FiSearch, FiLock
} = FiIcons;

const KeywordTracker = () => {
  const { user } = useAuth();
  const { subscription, canTrackKeyword, useKeywordTracking, removeKeywordTracking } = useSubscription();
  const navigate = useNavigate();
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [location, setLocation] = useState('United States');
  const [refreshing, setRefreshing] = useState(false);
  const [limitError, setLimitError] = useState(null);

  // Load tracked keywords on mount
  useEffect(() => {
    if (user?.id || user?.userId) {
      loadTrackedKeywords();
    }
  }, [user]);

  const loadTrackedKeywords = async () => {
    const userId = user?.id || user?.userId;
    if (!userId) return;

    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'https://api.organitrafficboost.com';
      const response = await fetch(`${apiBase}/api/seo/tracked-keywords?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setKeywords(data.keywords || []);
      }
    } catch (err) {
      console.error('Load Keywords Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = async () => {
    if (!newKeyword.trim() || !newDomain.trim()) return;

    const userId = user?.id || user?.userId;
    if (!userId) return;

    // Check subscription limit
    if (!canTrackKeyword()) {
      const limit = subscription?.limits?.trackedKeywords || 0;
      const used = subscription?.usage?.trackedKeywords || 0;
      setLimitError(`You've reached your limit of ${limit} tracked keywords. Upgrade your plan to track more keywords.`);
      return;
    }

    setLoading(true);
    setLimitError(null);
    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'https://api.organitrafficboost.com';
      const response = await fetch(`${apiBase}/api/seo/track-keyword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          keyword: newKeyword.trim(),
          domain: newDomain.trim(),
          location
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update subscription usage
        useKeywordTracking();
        
        setNewKeyword('');
        setNewDomain('');
        loadTrackedKeywords();
      }
    } catch (err) {
      console.error('Add Keyword Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshKeyword = async (keywordId) => {
    setRefreshing(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'https://api.organitrafficboost.com';
      const response = await fetch(`${apiBase}/api/seo/refresh-keyword/${keywordId}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        loadTrackedKeywords();
      }
    } catch (err) {
      console.error('Refresh Keyword Error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const deleteKeyword = async (keywordId) => {
    if (!confirm('Are you sure you want to stop tracking this keyword?')) return;

    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'https://api.organitrafficboost.com';
      const response = await fetch(`${apiBase}/api/seo/tracked-keyword/${keywordId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update subscription usage (decrement)
        removeKeywordTracking();
        
        loadTrackedKeywords();
      }
    } catch (err) {
      console.error('Delete Keyword Error:', err);
    }
  };

  const getRankChange = (current, previous) => {
    if (!previous) return null;
    return previous - current; // Positive = improved (moved up)
  };

  const getRankChangeIcon = (change) => {
    if (!change || change === 0) return FiMinus;
    return change > 0 ? FiTrendingUp : FiTrendingDown;
  };

  const getRankChangeColor = (change) => {
    if (!change || change === 0) return 'text-gray-500';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg">
              <SafeIcon icon={FiTarget} className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Keyword Tracker</h1>
              <p className="text-gray-600 mt-1">
                Monitor your keyword rankings and track progress over time
              </p>
            </div>
          </div>
          
          {/* Usage Stats */}
          {subscription && subscription.limits && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600 mb-1">Tracked Keywords</div>
              <div className="text-2xl font-bold text-gray-900">
                {subscription.usage?.trackedKeywords || 0} / {subscription.limits.trackedKeywords}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {subscription.limits.trackedKeywords - (subscription.usage?.trackedKeywords || 0)} remaining
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Limit Error */}
      {limitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <SafeIcon icon={FiLock} className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">{limitError}</p>
            <button
              onClick={() => navigate('/pricing')}
              className="mt-2 text-sm text-red-700 underline hover:text-red-800"
            >
              View Pricing Plans
            </button>
          </div>
        </div>
      )}

      {/* Add New Keyword */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Track New Keyword</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Enter keyword (e.g., 'best seo tools')"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Your domain (e.g., example.com)"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>United States</option>
            <option>United Kingdom</option>
            <option>Canada</option>
            <option>Australia</option>
            <option>India</option>
          </select>
          <button
            onClick={addKeyword}
            disabled={loading || !newKeyword.trim() || !newDomain.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-5 h-5" />
            Add Keyword
          </button>
        </div>
      </div>

      {/* Tracked Keywords List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Tracked Keywords ({keywords.length})</h2>
          <button
            onClick={loadTrackedKeywords}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiRefreshCw} className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh All
          </button>
        </div>

        {loading && keywords.length === 0 ? (
          <div className="text-center py-12">
            <SafeIcon icon={FiLoader} className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading tracked keywords...</p>
          </div>
        ) : keywords.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <SafeIcon icon={FiTarget} className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Keywords Tracked Yet</h3>
            <p className="text-gray-600">Start tracking keywords to monitor your SEO progress</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Keyword</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Domain</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Current Rank</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Change</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Search Volume</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Last Updated</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw) => {
                  const change = getRankChange(kw.current_rank, kw.previous_rank);
                  return (
                    <tr key={kw.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{kw.keyword}</div>
                        <div className="text-sm text-gray-500">{kw.location}</div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">{kw.domain}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          #{kw.current_rank || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {change !== null && change !== 0 ? (
                          <div className={`flex items-center justify-center gap-1 ${getRankChangeColor(change)}`}>
                            <SafeIcon icon={getRankChangeIcon(change)} className="w-4 h-4" />
                            <span className="font-medium">{Math.abs(change)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-700">
                        {kw.search_volume?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-gray-500">
                        {kw.last_checked ? new Date(kw.last_checked).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => refreshKeyword(kw.id)}
                            disabled={refreshing}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Refresh ranking"
                          >
                            <SafeIcon icon={FiRefreshCw} className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            onClick={() => deleteKeyword(kw.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Stop tracking"
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordTracker;
