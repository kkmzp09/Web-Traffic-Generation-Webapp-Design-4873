import React, { useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiPlay, FiPause, FiEdit3, FiTrash2, FiGlobe, FiClock, FiUsers, FiSettings } = FiIcons;

const CampaignManager = () => {
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'E-commerce Boost',
      url: 'https://example-store.com',
      status: 'active',
      visitors: 1234,
      duration: '2h 15m',
      rate: 45,
      maxRate: 60,
      countries: ['US', 'UK', 'CA'],
      created: '2024-01-15',
      totalVisits: 15678
    },
    {
      id: 2,
      name: 'Blog Traffic',
      url: 'https://myblog.com',
      status: 'active',
      visitors: 856,
      duration: '1h 45m',
      rate: 32,
      maxRate: 50,
      countries: ['US', 'DE', 'FR'],
      created: '2024-01-14',
      totalVisits: 8923
    },
    {
      id: 3,
      name: 'Landing Page Test',
      url: 'https://landing.example.com',
      status: 'paused',
      visitors: 445,
      duration: '45m',
      rate: 0,
      maxRate: 40,
      countries: ['US'],
      created: '2024-01-13',
      totalVisits: 3456
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    url: '',
    rate: 30,
    countries: ['US'],
    duration: 60
  });

  const toggleCampaign = (id) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === id 
        ? { ...campaign, status: campaign.status === 'active' ? 'paused' : 'active' }
        : campaign
    ));
  };

  const deleteCampaign = (id) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
  };

  const createCampaign = () => {
    const campaign = {
      id: Date.now(),
      ...newCampaign,
      status: 'active',
      visitors: 0,
      duration: '0m',
      created: new Date().toISOString().split('T')[0],
      totalVisits: 0
    };
    setCampaigns(prev => [campaign, ...prev]);
    setNewCampaign({ name: '', url: '', rate: 30, countries: ['US'], duration: 60 });
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Manager</h1>
          <p className="text-gray-600 mt-1">Create and manage your traffic generation campaigns</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Campaign Cards */}
      <div className="grid gap-6">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full ${campaign.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{campaign.name}</h3>
                  <p className="text-gray-600 flex items-center space-x-2 mt-1">
                    <SafeIcon icon={FiGlobe} className="text-sm" />
                    <span>{campaign.url}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleCampaign(campaign.id)}
                  className={`p-2 rounded-lg ${campaign.status === 'active' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                >
                  <SafeIcon icon={campaign.status === 'active' ? FiPause : FiPlay} className="text-lg" />
                </button>
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <SafeIcon icon={FiEdit3} className="text-lg" />
                </button>
                <button 
                  onClick={() => deleteCampaign(campaign.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <SafeIcon icon={FiTrash2} className="text-lg" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <SafeIcon icon={FiUsers} className="text-blue-600 text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{campaign.visitors}</p>
                <p className="text-sm text-gray-600">Current Visitors</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <SafeIcon icon={FiClock} className="text-green-600 text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{campaign.duration}</p>
                <p className="text-sm text-gray-600">Running Time</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <SafeIcon icon={FiSettings} className="text-purple-600 text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{campaign.rate}/min</p>
                <p className="text-sm text-gray-600">Current Rate</p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <SafeIcon icon={FiGlobe} className="text-orange-600 text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{campaign.totalVisits}</p>
                <p className="text-sm text-gray-600">Total Visits</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>Countries: {campaign.countries.join(', ')}</span>
                <span>Max Rate: {campaign.maxRate}/min</span>
              </div>
              <span>Created: {campaign.created}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Campaign</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="My Campaign"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
                <input
                  type="url"
                  value={newCampaign.url}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visitors per Minute</label>
                <input
                  type="number"
                  value={newCampaign.rate}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, rate: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={newCampaign.duration}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createCampaign}
                disabled={!newCampaign.name || !newCampaign.url}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManager;