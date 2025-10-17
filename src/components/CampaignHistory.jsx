import React, { useState, useEffect } from 'react';
import { FiClock, FiGlobe, FiUsers, FiCheckCircle, FiXCircle, FiActivity } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import api from '../api';

function CampaignHistory() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const data = await api.list();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      setError(err.message || 'Failed to load campaign history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-900/30';
      case 'running': return 'text-yellow-400 bg-yellow-900/30';
      case 'failed': return 'text-red-400 bg-red-900/30';
      case 'stopped': return 'text-orange-400 bg-orange-900/30';
      default: return 'text-gray-400 bg-gray-700/30';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-center py-8">
          <SafeIcon icon={FiActivity} className="animate-spin text-3xl text-blue-400 mr-3" />
          <span className="text-gray-300">Loading campaign history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center text-red-400">
          <SafeIcon icon={FiXCircle} className="mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <SafeIcon icon={FiClock} className="text-2xl text-blue-400" />
          <h2 className="ml-3 text-xl font-semibold text-white">Campaign History</h2>
        </div>
        <span className="text-sm text-gray-400">Last 7 days</span>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No campaigns found. Start your first campaign above!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <SafeIcon icon={FiGlobe} className="text-blue-400 mr-2" />
                    <a
                      href={campaign.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-blue-400 font-medium truncate"
                    >
                      {campaign.targetUrl}
                    </a>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Visitors</p>
                      <p className="text-white font-semibold flex items-center">
                        <SafeIcon icon={FiUsers} className="mr-1" />
                        {campaign.visitors}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Completed</p>
                      <p className="text-green-400 font-semibold flex items-center">
                        <SafeIcon icon={FiCheckCircle} className="mr-1" />
                        {campaign.completed || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Failed</p>
                      <p className="text-red-400 font-semibold flex items-center">
                        <SafeIcon icon={FiXCircle} className="mr-1" />
                        {campaign.failed || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Pages Visited</p>
                      <p className="text-blue-400 font-semibold">
                        {campaign.pagesVisited || campaign.visitors}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="ml-4 text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDate(campaign.createdAt)}
                  </p>
                </div>
              </div>

              {/* Progress bar for running campaigns */}
              {campaign.status === 'running' && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(((campaign.completed || 0) / campaign.visitors) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${((campaign.completed || 0) / campaign.visitors) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CampaignHistory;
