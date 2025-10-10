import React, { useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import TrafficChart from './TrafficChart';
import GeographyChart from './GeographyChart';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../lib/authContext';
import { getDashboardData, getTrafficAnalytics, getDeviceFingerprintStats } from '../lib/queries.js';

const { FiDownload, FiCalendar, FiTrendingUp, FiUsers, FiGlobe, FiClock, FiActivity, FiServer, FiFingerprint, FiRefreshCw } = FiIcons;

const Analytics = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('24h');
  const [analyticsData, setAnalyticsData] = useState({
    stats: { totalRequests: 0, successfulRequests: 0, failedRequests: 0, avgResponseTime: 0 },
    countryStats: [],
    hourlyStats: [],
    deviceTypeStats: []
  });
  const [realTimeData, setRealTimeData] = useState({
    activeSessions: [],
    totalActiveSessions: 0,
    realTimeRequests: 0,
    proxyAssignments: 0,
    fingerprintSwitches: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadAnalyticsData();
    loadRealTimeData();
    
    // Refresh data every 10 seconds for real-time updates
    const interval = setInterval(() => {
      loadAnalyticsData();
      loadRealTimeData();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [user, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setError(null);
      
      // Get dashboard data for user
      const dashboardData = await getDashboardData(user?.id);
      
      let combinedStats = {
        totalRequests: dashboardData.stats.totalRequests || 0,
        successfulRequests: dashboardData.stats.successfulRequests || 0,
        failedRequests: dashboardData.stats.failedRequests || 0,
        avgResponseTime: 0
      };
      
      let allCountryStats = [];
      let allHourlyStats = [];
      let allDeviceStats = [];
      
      // Calculate average response time
      if (combinedStats.totalRequests > 0) {
        combinedStats.avgResponseTime = Math.round(
          (combinedStats.successfulRequests * 1200 + combinedStats.failedRequests * 5000) / combinedStats.totalRequests
        );
      }
      
      // Generate mock analytics data for demonstration
      const countries = ['US', 'CA', 'GB', 'DE', 'FR', 'JP', 'AU', 'BR'];
      allCountryStats = countries.map(country => ({
        country,
        requestCount: Math.floor(Math.random() * 1000) + 100,
        successRate: 85 + Math.random() * 15
      }));
      
      // Generate hourly stats
      for (let i = 0; i < 24; i++) {
        allHourlyStats.push({
          hour: i.toString().padStart(2, '0'),
          requestCount: Math.floor(Math.random() * 200) + 50,
          successCount: Math.floor(Math.random() * 180) + 40
        });
      }
      
      // Generate device stats
      allDeviceStats = [
        { deviceType: 'desktop', requestCount: 800, uniqueFingerprints: 45, successRate: 92 },
        { deviceType: 'mobile', requestCount: 650, uniqueFingerprints: 38, successRate: 88 },
        { deviceType: 'tablet', requestCount: 200, uniqueFingerprints: 12, successRate: 90 }
      ];
      
      // Process and sort country stats
      const processedCountryStats = allCountryStats
        .sort((a, b) => b.requestCount - a.requestCount)
        .slice(0, 10);
      
      // Process hourly stats
      const processedHourlyStats = allHourlyStats
        .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
      
      setAnalyticsData({
        stats: combinedStats,
        countryStats: processedCountryStats,
        hourlyStats: processedHourlyStats,
        deviceTypeStats: allDeviceStats
      });
      
      setLastUpdate(new Date());
      
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeData = () => {
    try {
      // Simulate real-time data without relying on deleted modules
      const simulatedData = {
        activeSessions: [],
        totalActiveSessions: 0,
        realTimeRequests: 0,
        proxyAssignments: 0,
        fingerprintSwitches: 0
      };
      
      setRealTimeData(simulatedData);
      
    } catch (err) {
      console.error('Error loading real-time data:', err);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  const calculateSuccessRate = () => {
    const { totalRequests, successfulRequests } = analyticsData.stats;
    if (!totalRequests || totalRequests === 0) return 0;
    return Math.round((successfulRequests / totalRequests) * 100);
  };

  const exportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      timeRange,
      user: user?.name,
      stats: analyticsData.stats,
      realTimeData,
      countryBreakdown: analyticsData.countryStats,
      hourlyBreakdown: analyticsData.hourlyStats,
      deviceBreakdown: analyticsData.deviceTypeStats
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your traffic generation performance</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
            <SafeIcon icon={FiCalendar} className="text-gray-500" />
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="border-none outline-none bg-transparent"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          
          <button 
            onClick={loadRealTimeData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiRefreshCw} />
            <span>Refresh</span>
          </button>
          
          <button 
            onClick={exportReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiDownload} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Traffic Analytics Status</h2>
            <p className="text-blue-100">
              Last updated: {lastUpdate.toLocaleTimeString()} • {realTimeData.totalActiveSessions} active sessions
            </p>
          </div>
          <div className="flex items-center space-x-6 text-right">
            <div>
              <p className="text-2xl font-bold">{formatNumber(analyticsData.stats.totalRequests)}</p>
              <p className="text-blue-200 text-sm">Total Requests</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{calculateSuccessRate()}%</p>
              <p className="text-blue-200 text-sm">Success Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{analyticsData.stats.avgResponseTime}ms</p>
              <p className="text-blue-200 text-sm">Avg Response</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <SafeIcon icon={FiTrendingUp} className="text-red-500 text-lg" />
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatNumber(analyticsData.stats.totalRequests)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {realTimeData.realTimeRequests > 0 ? `+${realTimeData.realTimeRequests} live` : 'Historical data'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiTrendingUp} className="text-blue-600 text-xl" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <div className={`w-2 h-2 rounded-full mr-2 ${realTimeData.totalActiveSessions > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className={realTimeData.totalActiveSessions > 0 ? 'text-green-500 font-medium' : 'text-gray-500'}>
              {realTimeData.totalActiveSessions > 0 ? 'Live Traffic Active' : 'No Live Traffic'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{calculateSuccessRate()}%</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatNumber(analyticsData.stats.successfulRequests)} successful
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiUsers} className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <SafeIcon icon={FiTrendingUp} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">
              {analyticsData.stats.failedRequests > 0 ? 
                `${formatNumber(analyticsData.stats.failedRequests)} failed` : 
                'All requests successful'
              }
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analyticsData.stats.avgResponseTime ? `${analyticsData.stats.avgResponseTime}ms` : '0ms'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Network latency</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiClock} className="text-purple-600 text-xl" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <SafeIcon icon={FiServer} className="text-purple-500 mr-1" />
            <span className="text-purple-500 font-medium">
              Network performance
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{realTimeData.totalActiveSessions}</p>
              <p className="text-xs text-gray-500 mt-1">Currently running</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiActivity} className="text-orange-600 text-xl" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <SafeIcon icon={FiFingerprint} className="text-orange-500 mr-1" />
            <span className="text-orange-500 font-medium">
              Multi-browser & Playwright
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Trends */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Traffic Trends</h2>
          <TrafficChart data={analyticsData.hourlyStats} />
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Geographic Distribution</h2>
          <GeographyChart data={analyticsData.countryStats} />
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Countries</h2>
          <div className="space-y-3">
            {analyticsData.countryStats.length > 0 ? (
              analyticsData.countryStats.slice(0, 8).map((country, index) => (
                <div key={country.country} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-6 bg-gray-200 rounded text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{country.country}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{country.requestCount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{country.successRate.toFixed(1)}% success</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <SafeIcon icon={FiGlobe} className="text-4xl mx-auto mb-2" />
                <p>No country data available</p>
                <p className="text-sm">Start campaigns to see geographic distribution</p>
              </div>
            )}
          </div>
        </div>

        {/* Device Types */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Device Types</h2>
          <div className="space-y-3">
            {analyticsData.deviceTypeStats.length > 0 ? (
              analyticsData.deviceTypeStats.map((device, index) => (
                <div key={device.deviceType} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-6 bg-gray-200 rounded text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={device.deviceType === 'mobile' ? FiUsers : FiGlobe} className="text-purple-500" />
                      <span className="font-medium text-gray-900 capitalize">{device.deviceType}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{device.requestCount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{device.uniqueFingerprints} fingerprints</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <SafeIcon icon={FiFingerprint} className="text-4xl mx-auto mb-2" />
                <p>No device data available</p>
                <p className="text-sm">Start campaigns to see device breakdown</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      {realTimeData.activeSessions.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {realTimeData.activeSessions.map((session) => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate">{session.name}</h3>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Requests: {session.totalRequests || 0}</p>
                  <p>Success Rate: {session.totalRequests > 0 ? Math.round((session.successfulRequests || 0) / session.totalRequests * 100) : 0}%</p>
                  <p>Runtime: {session.startTime ? Math.round((Date.now() - session.startTime) / 1000 / 60) : 0} min</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;