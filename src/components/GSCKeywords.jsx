// src/components/GSCKeywords.jsx
// Display Google Search Console Keywords

import { useState, useEffect } from 'react';
import { TrendingUp, Search, Eye, MousePointer, RefreshCw, AlertCircle } from 'lucide-react';

const GSCKeywords = ({ pageUrl, siteUrl, userId }) => {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connection, setConnection] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'https://api.organitrafficboost.com';

  // Get connection for the site
  const getConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/seo/gsc/connections?userId=${userId}`);
      const data = await response.json();

      if (data.success && data.connections.length > 0) {
        // Find connection matching the site URL
        const conn = data.connections.find(c => 
          c.site_url === siteUrl || 
          siteUrl.includes(c.site_url.replace('sc-domain:', '')) ||
          c.site_url.includes(new URL(siteUrl).hostname)
        );
        
        if (conn) {
          setConnection(conn);
          return conn;
        }
      }
      return null;
    } catch (err) {
      console.error('Error getting connection:', err);
      return null;
    }
  };

  // Fetch keywords for the page
  const fetchKeywords = async () => {
    try {
      setLoading(true);
      setError(null);

      let conn = connection;
      if (!conn) {
        conn = await getConnection();
        if (!conn) {
          setError('No GSC connection found for this site');
          setLoading(false);
          return;
        }
      }

      // Use the actual GSC site URL from the connection
      const gscSiteUrl = conn.site_url;
      
      const response = await fetch(
        `${API_BASE}/api/seo/gsc/keywords/${conn.id}?siteUrl=${encodeURIComponent(gscSiteUrl)}&days=30`
      );
      const data = await response.json();

      if (data.success) {
        setKeywords(data.keywords.slice(0, 10)); // Top 10 keywords
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load keywords');
      console.error('GSC keywords error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pageUrl && siteUrl && userId) {
      fetchKeywords();
    }
  }, [pageUrl, siteUrl, userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600">Loading keywords...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900">No GSC Data</p>
            <p className="text-sm text-yellow-700 mt-1">{error}</p>
            <p className="text-xs text-yellow-600 mt-2">
              Connect Google Search Console to see real search performance data
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (keywords.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No keyword data available</p>
          <p className="text-sm text-gray-500 mt-1">
            This site may not have enough search traffic yet
          </p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalClicks = keywords.reduce((sum, kw) => sum + (kw.clicks || 0), 0);
  const totalImpressions = keywords.reduce((sum, kw) => sum + (kw.impressions || 0), 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgPosition = keywords.reduce((sum, kw) => sum + (kw.position || 0), 0) / keywords.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Top Search Keywords
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Real data from Google Search Console (Last 30 days)
            </p>
          </div>
          <button
            onClick={fetchKeywords}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh keywords"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <MousePointer className="w-4 h-4" />
              <span className="text-xs font-medium">Clicks</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{totalClicks.toLocaleString()}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-xs font-medium">Impressions</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{totalImpressions.toLocaleString()}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Avg CTR</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{avgCTR.toFixed(1)}%</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <Search className="w-4 h-4" />
              <span className="text-xs font-medium">Avg Position</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">{avgPosition.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* Keywords Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keyword
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clicks
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Impressions
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                CTR
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keywords.map((keyword, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-900">{keyword.keyword}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-semibold text-blue-600">
                    {keyword.clicks?.toLocaleString() || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm text-gray-600">
                    {keyword.impressions?.toLocaleString() || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm text-gray-600">
                    {((keyword.ctr || 0) * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-sm font-medium ${
                    keyword.position <= 3 ? 'text-green-600' :
                    keyword.position <= 10 ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    {keyword.position?.toFixed(1) || '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Showing top {keywords.length} keywords • Data refreshed from Google Search Console
        </p>
      </div>
    </div>
  );
};

export default GSCKeywords;
