import React, { useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../lib/authContext';
import { useSubscription } from '../lib/subscriptionContext';

const { FiSearch, FiPlay, FiTarget, FiGlobe, FiTrendingUp, FiBarChart, FiRefreshCw, FiCheckCircle, FiAlertCircle } = FiIcons;

const SeoTraffic = () => {
  const { user } = useAuth();
  const { subscription, updateSubscription } = useSubscription();
  
  const [campaignData, setCampaignData] = useState({
    url: '',
    keywords: '',
    trafficAmount: 50,
    duration: 120,
    searchEngine: 'google'
  });

  const [isRunning, setIsRunning] = useState(false);
  const [isSearchingKeywords, setIsSearchingKeywords] = useState(false);
  const [rankedKeywords, setRankedKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [keywordSearchError, setKeywordSearchError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  // Load campaigns from localStorage
  useEffect(() => {
    if (user) {
      loadCampaigns();
    }
  }, [user]);

  const loadCampaigns = () => {
    if (!user) return;
    const allCampaigns = JSON.parse(localStorage.getItem(`campaigns_${user.id}`) || '[]');
    // Filter only SEO campaigns
    const seoCampaigns = allCampaigns.filter(c => c.type === 'seo');
    setCampaigns(seoCampaigns);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCampaignData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear keyword data when URL changes
    if (name === 'url') {
      setRankedKeywords([]);
      setSelectedKeywords([]);
      setKeywordSearchError(null);
    }
  };

  const searchRankedKeywords = async () => {
    if (!campaignData.url) {
      setKeywordSearchError('Please enter a website URL first');
      return;
    }

    setIsSearchingKeywords(true);
    setKeywordSearchError(null);
    setRankedKeywords([]);

    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'https://api.organitrafficboost.com';
      const response = await fetch(`${apiBase}/api/seo/ranked-keywords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: campaignData.url,
          limit: 50,
          location: 'United States'
        })
      });

      const data = await response.json();

      if (data.success && data.keywords) {
        if (data.keywords.length === 0) {
          setKeywordSearchError('No ranked keywords found for this domain. Try a different website or enter keywords manually.');
        } else {
          setRankedKeywords(data.keywords);
        }
      } else {
        setKeywordSearchError(data.error || 'Failed to fetch keyword data');
      }
    } catch (error) {
      setKeywordSearchError('Failed to connect to keyword research service. Please try again.');
      console.error('Keyword search error:', error);
    } finally {
      setIsSearchingKeywords(false);
    }
  };

  const toggleKeywordSelection = (keyword) => {
    setSelectedKeywords(prev => {
      if (prev.includes(keyword)) {
        return prev.filter(k => k !== keyword);
      } else {
        return [...prev, keyword];
      }
    });
  };

  const applySelectedKeywords = () => {
    const keywordsString = selectedKeywords.join(', ');
    setCampaignData(prev => ({
      ...prev,
      keywords: keywordsString
    }));
  };

  const handleRunCampaign = async () => {
    if (!campaignData.url || !campaignData.keywords) return;
    
    setIsRunning(true);
    
    try {
      // Split keywords into array
      const keywordList = campaignData.keywords.split(',').map(k => k.trim()).filter(k => k);
      
      // Prepare SEO traffic payload
      const seoPayload = {
        targetUrl: campaignData.url,
        keywords: keywordList,
        searchEngine: campaignData.searchEngine,
        visitsPerKeyword: Math.ceil(campaignData.trafficAmount / keywordList.length),
        dwellTimeSeconds: campaignData.duration,
        naturalBrowsing: true,
        scrollBehavior: true,
        clickInternalLinks: true
      };

      console.log('Starting SEO campaign:', seoPayload);

      // Call your Playwright API for SEO traffic
      const response = await fetch('https://api.organitrafficboost.com/seo-traffic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(seoPayload)
      });

      const result = await response.json();

      if (result.success || result.jobId) {
        // Save campaign to localStorage
        const newCampaign = {
          id: result.jobId || Date.now().toString(),
          type: 'seo',
          name: `SEO Campaign ${campaigns.length + 1}`,
          url: campaignData.url,
          keywords: campaignData.keywords,
          searchEngine: campaignData.searchEngine,
          status: 'running',
          visitors: campaignData.trafficAmount,
          duration: campaignData.duration,
          timestamp: new Date().toISOString(),
          jobId: result.jobId,
          results: null
        };
        
        // Save to localStorage
        const allCampaigns = JSON.parse(localStorage.getItem(`campaigns_${user.id}`) || '[]');
        allCampaigns.unshift(newCampaign);
        localStorage.setItem(`campaigns_${user.id}`, JSON.stringify(allCampaigns));
        
        // Update local state
        setCampaigns(prev => [newCampaign, ...prev]);
        
        // Update subscription visits
        if (subscription && updateSubscription) {
          const newUsedVisits = (subscription.usedVisits || 0) + campaignData.trafficAmount;
          updateSubscription({
            usedVisits: newUsedVisits
          });
          console.log(`✅ Subscription updated: ${campaignData.trafficAmount} visits allocated, total used: ${newUsedVisits}`);
        }
        
        alert(`SEO Campaign started! Job ID: ${result.jobId}\n\nThe campaign will:\n1. Search for your keywords on ${campaignData.searchEngine}\n2. Find your website in results\n3. Click and visit your site\n4. Browse naturally for ${campaignData.duration} seconds\n5. Navigate to internal pages`);
      } else {
        throw new Error(result.error || 'Failed to start campaign');
      }
    } catch (error) {
      console.error('Campaign error:', error);
      alert('Failed to start SEO campaign: ' + error.message);
    } finally {
      setIsRunning(false);
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
            <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg">
              <SafeIcon icon={FiSearch} className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SEO Traffic</h1>
              <p className="text-gray-600 mt-1">
                Generate organic search engine traffic with keyword-based campaigns
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaign Setup */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <SafeIcon icon={FiTarget} className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Run SEO Campaign</h2>
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
                    placeholder="https://www.yourdomain.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isRunning}
                  />
                  <button
                    type="button"
                    onClick={searchRankedKeywords}
                    disabled={!campaignData.url || isSearchingKeywords || isRunning}
                    className="mt-2 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <SafeIcon icon={isSearchingKeywords ? FiRefreshCw : FiSearch} className={`w-4 h-4 ${isSearchingKeywords ? 'animate-spin' : ''}`} />
                    <span>{isSearchingKeywords ? 'Searching Keywords...' : 'Find Ranked Keywords'}</span>
                  </button>
                </div>

                {/* Keyword Search Error */}
                {keywordSearchError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                    <SafeIcon icon={FiAlertCircle} className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-700">{keywordSearchError}</p>
                  </div>
                )}

                {/* Ranked Keywords Results */}
                {rankedKeywords.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">Ranked Keywords Found</h3>
                      <span className="text-xs text-blue-600">{rankedKeywords.length} keywords</span>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {rankedKeywords.map((kw, index) => (
                        <div
                          key={index}
                          onClick={() => toggleKeywordSelection(kw.keyword)}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            selectedKeywords.includes(kw.keyword)
                              ? 'bg-green-100 border-2 border-green-500'
                              : 'bg-white border border-gray-200 hover:border-blue-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{kw.keyword}</p>
                              <div className="flex items-center space-x-3 mt-1 text-xs text-gray-600">
                                <span>Rank: #{kw.position}</span>
                                <span>Vol: {kw.volume}/mo</span>
                                <span>Diff: {kw.difficulty}%</span>
                              </div>
                            </div>
                            {selectedKeywords.includes(kw.keyword) && (
                              <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedKeywords.length > 0 && (
                      <button
                        onClick={applySelectedKeywords}
                        className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Apply {selectedKeywords.length} Selected Keyword{selectedKeywords.length !== 1 ? 's' : ''}
                      </button>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords (comma separated)
                  </label>
                  <textarea
                    name="keywords"
                    value={campaignData.keywords}
                    onChange={handleInputChange}
                    placeholder="Click 'Find Ranked Keywords' or enter manually"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isRunning}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Engine
                  </label>
                  <select
                    name="searchEngine"
                    value={campaignData.searchEngine}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isRunning}
                  >
                    <option value="google">Google</option>
                    <option value="bing">Bing</option>
                    <option value="yahoo">Yahoo</option>
                    <option value="duckduckgo">DuckDuckGo</option>
                  </select>
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
                    max="5000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isRunning}
                  />
                </div>

                <button
                  onClick={handleRunCampaign}
                  disabled={!campaignData.url || !campaignData.keywords || isRunning}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    isRunning
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <SafeIcon icon={FiPlay} className="w-4 h-4" />
                  <span>{isRunning ? 'SEO Campaign Running...' : 'Start SEO Campaign'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Campaign List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiTrendingUp} className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">SEO Campaign History</h2>
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
                        <SafeIcon icon={FiSearch} className="w-4 h-4 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                          <p className="text-sm text-gray-600">{campaign.url}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-500">Keywords:</p>
                      <p className="text-sm text-gray-900 font-medium">{campaign.keywords}</p>
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
                  <SafeIcon icon={FiTrendingUp} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No SEO campaigns yet</h3>
                  <p className="text-gray-600">Start your first SEO traffic campaign to see results here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeoTraffic;