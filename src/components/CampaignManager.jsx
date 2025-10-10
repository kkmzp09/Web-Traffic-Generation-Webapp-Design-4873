import React, { useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../lib/authContext';
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign } from '../lib/queries.js';
import PlaywrightTrafficWindow from './PlaywrightTrafficWindow';

const { 
  FiPlus, FiEdit, FiTrash2, FiPlay, FiPause, FiEye, FiGlobe, 
  FiCalendar, FiClock, FiTrendingUp, FiUsers, FiTarget, FiSettings,
  FiMonitor, FiSmartphone, FiActivity, FiZap, FiChrome, FiTestTube,
  FiVideo, FiCpu, FiPlayCircle, FiStopCircle
} = FiIcons;

const CampaignManager = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [activeSimulationWindow, setActiveSimulationWindow] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    targetUrl: '',
    trafficRate: 2, // Lower default for real browsers
    countries: '["US", "UK", "CA", "DE", "FR"]',
    description: '',
    isActive: true
  });

  useEffect(() => {
    if (user) {
      loadCampaigns();
    }
  }, [user]);

  const loadCampaigns = async () => {
    try {
      setError(null);
      const data = await getCampaigns(user.id);
      setCampaigns(data || []);
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      const campaignData = {
        ...formData,
        userId: user.id,
        createdAt: editingCampaign ? editingCampaign.createdAt : new Date().toISOString()
      };

      if (editingCampaign) {
        await updateCampaign(editingCampaign.id, campaignData);
      } else {
        await createCampaign(campaignData);
      }

      await loadCampaigns();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving campaign:', err);
      setError('Failed to save campaign');
    }
  };

  const handleDelete = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      setError(null);
      await deleteCampaign(campaignId);
      await loadCampaigns();
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setError('Failed to delete campaign');
    }
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      targetUrl: campaign.targetUrl,
      trafficRate: campaign.trafficRate,
      countries: campaign.countries,
      description: campaign.description || '',
      isActive: campaign.isActive
    });
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingCampaign(null);
    setFormData({
      name: '',
      targetUrl: '',
      trafficRate: 2, // Lower default for real browsers
      countries: '["US", "UK", "CA", "DE", "FR"]',
      description: '',
      isActive: true
    });
  };

  const openPlaywrightWindow = (campaign) => {
    setSelectedCampaign(campaign);
    setActiveSimulationWindow('playwright');
  };

  const closeSimulationWindow = () => {
    setSelectedCampaign(null);
    setActiveSimulationWindow(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Manager</h1>
          <p className="text-gray-600">Create and manage your real browser automation campaigns</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 lg:mt-0 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
            {/* Card Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{campaign.name}</h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  campaign.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {campaign.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <SafeIcon icon={FiGlobe} className="mr-2" />
                <span className="truncate">{new URL(campaign.targetUrl).hostname}</span>
              </div>
              
              <div className="flex items-center text-gray-600 text-sm">
                <SafeIcon icon={FiTrendingUp} className="mr-2" />
                <span>{campaign.trafficRate} browsers/min</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
              {campaign.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {campaign.description}
                </p>
              )}
              
              <div className="flex items-center text-gray-500 text-xs mb-4">
                <SafeIcon icon={FiCalendar} className="mr-1" />
                <span>Created {formatDate(campaign.createdAt)}</span>
              </div>

              {/* Countries */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-1">Target Countries:</div>
                <div className="flex flex-wrap gap-1">
                  {JSON.parse(campaign.countries || '[]').slice(0, 3).map((country) => (
                    <span key={country} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                      {country}
                    </span>
                  ))}
                  {JSON.parse(campaign.countries || '[]').length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{JSON.parse(campaign.countries || '[]').length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(campaign)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Campaign"
                  >
                    <SafeIcon icon={FiEdit} />
                  </button>
                  <button
                    onClick={() => handleDelete(campaign.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Campaign"
                  >
                    <SafeIcon icon={FiTrash2} />
                  </button>
                </div>
                
                <div className="text-xs text-gray-500 flex items-center space-x-1">
                  <SafeIcon icon={FiVideo} className="w-3 h-3" />
                  <span>Real Browser Automation</span>
                </div>
              </div>

              {/* Primary Playwright Action Button */}
              <button
                onClick={() => openPlaywrightWindow(campaign)}
                className="w-full px-4 py-4 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                title="Launch Real Browser Automation"
              >
                <SafeIcon icon={FiVideo} className="text-lg" />
                <span className="text-base">Launch Playwright</span>
                <SafeIcon icon={FiPlayCircle} className="text-lg" />
              </button>
              
              {/* Feature indicators */}
              <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <SafeIcon icon={FiChrome} className="w-3 h-3" />
                  <span>Real Browsers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <SafeIcon icon={FiVideo} className="w-3 h-3" />
                  <span>Video Recording</span>
                </div>
                <div className="flex items-center space-x-1">
                  <SafeIcon icon={FiActivity} className="w-3 h-3" />
                  <span>Natural Behavior</span>
                </div>
              </div>
              
              {/* Real Browser Automation Badge */}
              <div className="mt-3 flex items-center justify-center">
                <div className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full border border-red-200">
                  🎭 Real Browser Automation System
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {campaigns.length === 0 && (
          <div className="col-span-full text-center py-12">
            <SafeIcon icon={FiVideo} className="text-6xl text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-6">Create your first campaign to start real browser automation</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
            >
              <SafeIcon icon={FiVideo} />
              <span>Create Your First Campaign</span>
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <SafeIcon icon={FiVideo} className="text-red-600" />
                <span>{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">Configure your real browser automation campaign</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="My Website Traffic Campaign"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target URL
                </label>
                <input
                  type="url"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="https://example.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL that real browsers will visit and interact with
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Browser Rate (browsers per minute)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.trafficRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, trafficRate: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  🎭 Real browsers: 1-2 browsers/min recommended (uses more system resources)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Countries (JSON array)
                </label>
                <textarea
                  value={formData.countries}
                  onChange={(e) => setFormData(prev => ({ ...prev, countries: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="2"
                  placeholder='["US", "UK", "CA", "DE", "FR"]'
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                  placeholder="Describe your real browser automation campaign..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Campaign is active
                </label>
              </div>

              {/* Real Browser Automation Info */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <SafeIcon icon={FiVideo} className="text-red-600 mt-1" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Real Browser Automation</h4>
                    <p className="text-xs text-red-700 mt-1">
                      This campaign will launch actual browser windows (Chromium, Firefox, Safari) that perform real website interactions. 
                      You can watch the browsers in action, record videos, and generate authentic traffic.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <SafeIcon icon={FiVideo} />
                  <span>{editingCampaign ? 'Update Campaign' : 'Create Campaign'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Playwright Window - Now the primary and only option */}
      {selectedCampaign && activeSimulationWindow === 'playwright' && (
        <PlaywrightTrafficWindow
          campaign={selectedCampaign}
          onClose={closeSimulationWindow}
          isVisible={true}
        />
      )}
    </div>
  );
};

export default CampaignManager;