import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/authContext';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiGlobe, FiCheck, FiX, FiRefreshCw, FiTrash2, FiAlertCircle } = FiIcons;

export default function WebsiteManager() {
  const { user } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [websiteLimit, setWebsiteLimit] = useState(3);
  const [canAddMore, setCanAddMore] = useState(true);

  useEffect(() => {
    if (user) {
      loadWebsites();
    }
  }, [user]);

  const loadWebsites = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.organitrafficboost.com/api/websites?userId=${user.id}`
      );
      const data = await response.json();

      if (data.success) {
        setWebsites(data.websites);
        setWebsiteLimit(data.limit);
        setCanAddMore(data.canAddMore);
      }
    } catch (error) {
      console.error('Error loading websites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWebsite = async () => {
    if (!newWebsiteUrl.trim()) {
      alert('Please enter a website URL');
      return;
    }

    try {
      setAdding(true);
      const response = await fetch('https://api.organitrafficboost.com/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          url: newWebsiteUrl
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowAddModal(false);
        setNewWebsiteUrl('');
        loadWebsites();
      } else {
        alert(data.message || data.error || 'Failed to add website');
      }
    } catch (error) {
      console.error('Error adding website:', error);
      alert('Failed to add website');
    } finally {
      setAdding(false);
    }
  };

  const removeWebsite = async (websiteId) => {
    if (!confirm('Are you sure you want to remove this website?')) {
      return;
    }

    try {
      const response = await fetch(
        `https://api.organitrafficboost.com/api/websites/${websiteId}?userId=${user.id}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (data.success) {
        loadWebsites();
      }
    } catch (error) {
      console.error('Error removing website:', error);
    }
  };

  const checkWidget = async (websiteId) => {
    try {
      await fetch(
        `https://api.organitrafficboost.com/api/websites/${websiteId}/check-widget`,
        { method: 'POST' }
      );

      // Reload after a short delay
      setTimeout(loadWebsites, 2000);
    } catch (error) {
      console.error('Error checking widget:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'connected':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <FiCheck className="w-4 h-4" />
            Connected
          </span>
        );
      case 'not_connected':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <FiX className="w-4 h-4" />
            Not Connected
          </span>
        );
      case 'checking':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <FiRefreshCw className="w-4 h-4 animate-spin" />
            Checking...
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-40"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">My Websites</h2>
            <p className="text-sm text-gray-600">
              {websites.length} of {websiteLimit} websites added
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={!canAddMore}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              canAddMore
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FiPlus className="w-5 h-5" />
            Add Website
          </button>
        </div>

        {websites.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <FiGlobe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No websites added yet</h3>
            <p className="text-gray-600 mb-4">Add your first website to start monitoring</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all"
            >
              <FiPlus className="w-5 h-5" />
              Add Your First Website
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {websites.map((website) => (
              <div
                key={website.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{website.domain}</h3>
                    <p className="text-sm text-gray-500 truncate">{website.url}</p>
                  </div>
                  <button
                    onClick={() => removeWebsite(website.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  {getStatusBadge(website.widget_status)}
                  {website.widget_status !== 'checking' && (
                    <button
                      onClick={() => checkWidget(website.id)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Recheck
                    </button>
                  )}
                </div>

                {website.widget_status === 'not_connected' && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    <FiAlertCircle className="w-3 h-3 inline mr-1" />
                    Widget not detected. Install widget code to enable auto-fix.
                  </div>
                )}

                {website.last_scan_date && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Last scan:</span>
                      <span>{new Date(website.last_scan_date).toLocaleDateString()}</span>
                    </div>
                    {website.avg_seo_score > 0 && (
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span>SEO Score:</span>
                        <span className={`font-semibold ${
                          website.avg_seo_score >= 80 ? 'text-green-600' :
                          website.avg_seo_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {website.avg_seo_score}/100
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!canAddMore && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">Website Limit Reached</h4>
                <p className="text-sm text-yellow-800 mb-2">
                  You've reached the maximum of {websiteLimit} websites for your current plan.
                </p>
                <button className="text-sm font-medium text-yellow-900 underline hover:text-yellow-700">
                  Upgrade Plan →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Website Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Website</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={newWebsiteUrl}
                onChange={(e) => setNewWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onKeyPress={(e) => e.key === 'Enter' && addWebsite()}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the full URL including https://
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewWebsiteUrl('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={addWebsite}
                disabled={adding}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? 'Adding...' : 'Add Website'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
