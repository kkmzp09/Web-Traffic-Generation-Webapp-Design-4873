import React, { useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiZap, FiPlay, FiSettings, FiTarget, FiGlobe, FiClock, FiBarChart } = FiIcons;

const DirectTraffic = () => {
  const [campaignData, setCampaignData] = useState({
    url: '',
    trafficAmount: 100,
    duration: 60,
    concurrent: 5
  });

  const [isRunning, setIsRunning] = useState(false);
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Website Homepage',
      url: 'https://example.com',
      status: 'completed',
      traffic: 500,
      success: 94.2,
      created: '2024-01-15'
    },
    {
      id: 2,
      name: 'Product Page',
      url: 'https://example.com/product',
      status: 'running',
      traffic: 150,
      success: 96.8,
      created: '2024-01-16'
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCampaignData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRunCampaign = () => {
    if (!campaignData.url) return;
    
    setIsRunning(true);
    // Simulate campaign running
    setTimeout(() => {
      setIsRunning(false);
      // Add new campaign to list
      const newCampaign = {
        id: campaigns.length + 1,
        name: `Campaign ${campaigns.length + 1}`,
        url: campaignData.url,
        status: 'completed',
        traffic: campaignData.trafficAmount,
        success: Math.random() * 10 + 90, // Random success rate 90-100%
        created: new Date().toISOString().split('T')[0]
      };
      setCampaigns(prev => [newCampaign, ...prev]);
    }, 5000);
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
              <p className="text-gray-600 mt-1">
                Generate direct website traffic with customizable campaigns
              </p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target URL
                  </label>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Traffic Amount
                  </label>
                  <input
                    type="number"
                    name="trafficAmount"
                    value={campaignData.trafficAmount}
                    onChange={handleInputChange}
                    min="1"
                    max="10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isRunning}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concurrent Sessions
                  </label>
                  <input
                    type="number"
                    name="concurrent"
                    value={campaignData.concurrent}
                    onChange={handleInputChange}
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isRunning}
                  />
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
                  <span>{isRunning ? 'Campaign Running...' : 'Start Campaign'}</span>
                </button>
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
                <div className="text-sm text-gray-500">
                  {campaigns.length} campaigns
                </div>
              </div>

              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiGlobe} className="w-4 h-4 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                          <p className="text-sm text-gray-600">{campaign.url}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Traffic</p>
                        <p className="font-medium text-gray-900">{campaign.traffic}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Success Rate</p>
                        <p className="font-medium text-gray-900">{campaign.success.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-medium text-gray-900">{campaign.created}</p>
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
      </div>
    </div>
  );
};

export default DirectTraffic;