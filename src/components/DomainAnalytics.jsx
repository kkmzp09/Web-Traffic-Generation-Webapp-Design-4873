import React, { useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../lib/authContext';

const { 
  FiSearch, FiTrendingUp, FiTarget, FiGlobe, FiBarChart2, FiLink, 
  FiUsers, FiLoader, FiAlertCircle, FiCheckCircle, FiClock, FiTrash2, FiRefreshCw 
} = FiIcons;

const DomainAnalytics = () => {
  const { user } = useAuth();
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [stats, setStats] = useState(null);

  // Load history and stats on mount
  useEffect(() => {
    if (user?.userId) {
      loadHistory();
      loadStats();
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user?.userId) return;
    
    setHistoryLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'https://api.organitrafficboost.com';
      const response = await fetch(`${apiBase}/api/seo/analytics-history?userId=${user.userId}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setHistory(data.analyses || []);
      }
    } catch (err) {
      console.error('Load History Error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user?.userId) return;
    
    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'https://api.organitrafficboost.com';
      const response = await fetch(`${apiBase}/api/seo/analytics-stats?userId=${user.userId}`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Load Stats Error:', err);
    }
  };

  const analyzeDomain = async () => {
    if (!domain) {
      setError('Please enter a domain');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalytics(null);

    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'https://api.organitrafficboost.com';
      const response = await fetch(`${apiBase}/api/seo/domain-analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          domain: domain.replace(/^https?:\/\//, '').replace(/\/$/, ''),
          userId: user?.userId,
          saveResult: true
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalytics(data);
        // Reload history to show new analysis
        loadHistory();
        loadStats();
      } else {
        setError(data.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError('Failed to connect to analytics service');
      console.error('Analytics Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedAnalysis = async (analysisId) => {
    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'https://api.organitrafficboost.com';
      const response = await fetch(`${apiBase}/api/seo/analysis/${analysisId}?userId=${user.userId}`);
      const data = await response.json();
      
      if (data.success && data.analysis) {
        // Convert saved analysis to display format
        const savedData = {
          success: true,
          domain: data.analysis.domain,
          totalKeywords: data.analysis.total_keywords,
          topKeywords: data.analysis.top_keywords,
          competitors: data.analysis.competitors,
          backlinks: data.analysis.backlinks,
          overview: {
            organicTraffic: data.analysis.organic_traffic,
            visibility: data.analysis.visibility_score
          },
          analyzedAt: data.analysis.analyzed_at,
          fromHistory: true
        };
        setAnalytics(savedData);
        setDomain(data.analysis.domain);
      }
    } catch (err) {
      console.error('Load Saved Analysis Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (analysisId) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;
    
    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'https://api.organitrafficboost.com';
      const response = await fetch(`${apiBase}/api/seo/analysis/${analysisId}?userId=${user.userId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        loadHistory();
        loadStats();
      }
    } catch (err) {
      console.error('Delete Analysis Error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
            <SafeIcon icon={FiBarChart2} className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Domain Analytics</h1>
            <p className="text-gray-600 mt-1">
              Analyze any domain's SEO performance, keywords, and competitors
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <SafeIcon icon={FiGlobe} className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total_domains || 0}</p>
                <p className="text-sm text-gray-600">Domains Analyzed</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <SafeIcon icon={FiBarChart2} className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total_analyses || 0}</p>
                <p className="text-sm text-gray-600">Total Analyses</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <SafeIcon icon={FiClock} className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {stats.last_analysis ? new Date(stats.last_analysis).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">Last Analysis</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent History */}
      {history.length > 0 && showHistory && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <SafeIcon icon={FiClock} className="w-5 h-5" />
              Recent Analyses
            </h2>
            <button
              onClick={() => setShowHistory(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Hide
            </button>
          </div>
          <div className="space-y-2">
            {history.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => loadSavedAnalysis(item.id)}
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.domain}</p>
                  <p className="text-sm text-gray-500">
                    {item.total_keywords?.toLocaleString()} keywords • 
                    {new Date(item.analyzed_at).toLocaleDateString()} {new Date(item.analyzed_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAnalysis(item.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Box */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeDomain()}
              placeholder="Enter domain (e.g., example.com)"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              disabled={loading}
            />
          </div>
          <button
            onClick={analyzeDomain}
            disabled={loading || !domain}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <SafeIcon icon={FiLoader} className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <SafeIcon icon={FiSearch} className="w-5 h-5" />
                Analyze
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Analytics Results */}
      {analytics && (
        <div className="space-y-6">
          {/* Result Header with Badge */}
          {analytics.fromHistory && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiClock} className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Viewing Saved Analysis</p>
                  <p className="text-sm text-blue-700">
                    Analyzed on {new Date(analytics.analyzedAt).toLocaleDateString()} at {new Date(analytics.analyzedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => analyzeDomain()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
                Re-analyze
              </button>
            </div>
          )}
          
          {analytics.saved && !analytics.fromHistory && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">Analysis saved successfully!</p>
            </div>
          )}

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Keywords"
              value={analytics.totalKeywords?.toLocaleString() || '0'}
              subtitle="Ranking keywords"
              icon={FiTarget}
              color="bg-blue-500"
            />
            <MetricCard
              title="Top Keywords"
              value={analytics.topKeywords?.length || '0'}
              subtitle="Showing top results"
              icon={FiTrendingUp}
              color="bg-green-500"
            />
            <MetricCard
              title="Competitors"
              value={analytics.competitors?.length || '0'}
              subtitle="Top competitors"
              icon={FiUsers}
              color="bg-purple-500"
            />
            <MetricCard
              title="Domain"
              value={analytics.domain || 'N/A'}
              subtitle="Analyzed domain"
              icon={FiGlobe}
              color="bg-orange-500"
            />
          </div>

          {/* Top Keywords */}
          {analytics.topKeywords && analytics.topKeywords.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Top Ranking Keywords</h2>
                <span className="text-sm text-gray-500">{analytics.totalKeywords} total keywords</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Keyword</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Position</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Search Volume</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Traffic</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">CPC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topKeywords.slice(0, 10).map((kw, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{kw.keyword}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            kw.position <= 3 ? 'bg-green-100 text-green-800' :
                            kw.position <= 10 ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            #{kw.position}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-900">{kw.searchVolume?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-sm text-gray-900">{kw.trafficEstimate?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-sm text-gray-900">${kw.cpc?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Competitors */}
          {analytics.competitors && analytics.competitors.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <SafeIcon icon={FiUsers} className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Top Competitors</h2>
              </div>
              <div className="space-y-4">
                {analytics.competitors.slice(0, 5).map((comp, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{comp.domain}</h3>
                      <p className="text-sm text-gray-500">{comp.organicKeywords?.toLocaleString()} keywords</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{comp.organicTraffic?.toLocaleString()} visits/mo</p>
                      <p className="text-xs text-gray-500">{comp.intersections} shared keywords</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Backlink Summary */}
          {analytics.backlinks && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <SafeIcon icon={FiLink} className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Backlink Profile</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{analytics.backlinks.backlinks?.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Backlinks</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{analytics.backlinks.referringDomains?.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-1">Referring Domains</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{analytics.backlinks.referringIps?.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-1">Referring IPs</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{analytics.backlinks.domainRank || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">Domain Rank</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ title, value, subtitle, icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <SafeIcon icon={icon} className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

export default DomainAnalytics;
