// src/components/GSCAnalytics.jsx
// GSC Analytics Dashboard with Historical Trends

import { useState, useEffect } from 'react';
import { useAuth } from '../lib/authContext';
import { 
  TrendingUp, TrendingDown, Minus, Search, Eye, MousePointer, 
  Calendar, ArrowUp, ArrowDown, RefreshCw, Filter 
} from 'lucide-react';

const GSCAnalytics = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30); // days
  const [sortBy, setSortBy] = useState('clicks'); // clicks, impressions, position
  const [filterQuery, setFilterQuery] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'https://api.organitrafficboost.com';

  // Fetch GSC connections
  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  // Fetch keyword history when site is selected
  useEffect(() => {
    if (selectedSite) {
      fetchKeywordHistory();
    }
  }, [selectedSite, dateRange]);

  const fetchConnections = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/seo/gsc/connections?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success && data.connections.length > 0) {
        setConnections(data.connections);
        setSelectedSite(data.connections[0].site_url);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchKeywordHistory = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Fetching keyword history for ${selectedSite}, ${dateRange} days`);
      const response = await fetch(
        `${API_BASE}/api/seo/gsc/keyword-history?userId=${user.id}&siteUrl=${encodeURIComponent(selectedSite)}&days=${dateRange}`
      );
      const data = await response.json();
      console.log('📊 Keyword history response:', data);

      if (data.success) {
        console.log(`✅ Found ${data.history?.length || 0} keyword history records`);
        // Group keywords by keyword name and calculate trends
        const keywordMap = {};
        
        data.history.forEach(row => {
          if (!keywordMap[row.keyword]) {
            keywordMap[row.keyword] = {
              keyword: row.keyword,
              history: []
            };
          }
          keywordMap[row.keyword].history.push({
            date: row.date,
            clicks: row.clicks,
            impressions: row.impressions,
            ctr: parseFloat(row.ctr),
            position: parseFloat(row.position)
          });
        });

        // Calculate trends and current metrics
        const keywordsWithTrends = Object.values(keywordMap).map(kw => {
          const sorted = kw.history.sort((a, b) => new Date(b.date) - new Date(a.date));
          const latest = sorted[0];
          const previous = sorted[1];

          return {
            keyword: kw.keyword,
            clicks: latest.clicks,
            impressions: latest.impressions,
            ctr: latest.ctr,
            position: latest.position,
            clicksTrend: previous ? latest.clicks - previous.clicks : 0,
            positionTrend: previous ? previous.position - latest.position : 0, // Positive = improved
            history: sorted
          };
        });

        setKeywords(keywordsWithTrends);
      }
    } catch (error) {
      console.error('Error fetching keyword history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort keywords
  const filteredKeywords = keywords
    .filter(kw => kw.keyword.toLowerCase().includes(filterQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'clicks') return b.clicks - a.clicks;
      if (sortBy === 'impressions') return b.impressions - a.impressions;
      if (sortBy === 'position') return a.position - b.position;
      return 0;
    });

  // Calculate summary stats
  const totalClicks = keywords.reduce((sum, kw) => sum + kw.clicks, 0);
  const totalImpressions = keywords.reduce((sum, kw) => sum + kw.impressions, 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0;
  const avgPosition = keywords.length > 0 
    ? (keywords.reduce((sum, kw) => sum + kw.position, 0) / keywords.length).toFixed(1) 
    : 0;

  const getTrendIcon = (trend) => {
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getPositionTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />; // Position improved
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-600" />; // Position worsened
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  if (!user) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please sign in to view GSC analytics.</p>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">No GSC connections found. Please connect Google Search Console first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GSC Analytics</h1>
          <p className="text-gray-600 mt-1">Track keyword performance over time</p>
        </div>
        <button
          onClick={fetchKeywordHistory}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Site Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Site
            </label>
            <select
              value={selectedSite || ''}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {connections.map(conn => (
                <option key={conn.id} value={conn.site_url}>
                  {conn.site_url}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>

          {/* Search Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Keywords
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter keywords..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <MousePointer className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-600">Total Clicks</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalClicks}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-medium text-gray-600">Total Impressions</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalImpressions}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-medium text-gray-600">Avg CTR</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{avgCTR}%</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Search className="w-5 h-5 text-orange-600" />
            <h3 className="text-sm font-medium text-gray-600">Avg Position</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{avgPosition}</p>
        </div>
      </div>

      {/* Keywords Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Keywords ({filteredKeywords.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('clicks')}
                className={`px-3 py-1 text-sm rounded ${sortBy === 'clicks' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Sort by Clicks
              </button>
              <button
                onClick={() => setSortBy('impressions')}
                className={`px-3 py-1 text-sm rounded ${sortBy === 'impressions' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Sort by Impressions
              </button>
              <button
                onClick={() => setSortBy('position')}
                className={`px-3 py-1 text-sm rounded ${sortBy === 'position' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Sort by Position
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        ) : filteredKeywords.length === 0 ? (
          <div className="p-12 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No keywords found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keyword
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impressions
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CTR
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKeywords.slice(0, 50).map((kw, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Search className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{kw.keyword}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-gray-900">{kw.clicks}</span>
                        {getTrendIcon(kw.clicksTrend)}
                        {kw.clicksTrend !== 0 && (
                          <span className={`text-xs ${kw.clicksTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {kw.clicksTrend > 0 ? '+' : ''}{kw.clicksTrend}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {kw.impressions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {(kw.ctr * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-gray-900">{kw.position.toFixed(1)}</span>
                        {getPositionTrendIcon(kw.positionTrend)}
                        {kw.positionTrend !== 0 && (
                          <span className={`text-xs ${kw.positionTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {kw.positionTrend > 0 ? '+' : ''}{kw.positionTrend.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {kw.history.length > 1 ? (
                        <span className="text-xs text-gray-500">{kw.history.length} days</span>
                      ) : (
                        <span className="text-xs text-gray-400">New</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GSCAnalytics;
