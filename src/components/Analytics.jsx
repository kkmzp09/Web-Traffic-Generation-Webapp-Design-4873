import React, { useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import TrafficChart from './TrafficChart';
import GeographyChart from './GeographyChart';
import * as FiIcons from 'react-icons/fi';

const { FiDownload, FiCalendar, FiTrendingUp, FiUsers, FiGlobe, FiClock } = FiIcons;

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  
  const analyticsData = {
    summary: {
      totalVisits: 125678,
      uniqueVisitors: 89432,
      avgSessionDuration: '2m 34s',
      bounceRate: '23.5%',
      topCountries: ['United States', 'United Kingdom', 'Germany', 'France', 'Canada'],
      topPages: [
        { url: '/landing', visits: 15234 },
        { url: '/products', visits: 12456 },
        { url: '/about', visits: 8765 },
        { url: '/contact', visits: 6543 },
        { url: '/blog', visits: 4321 }
      ]
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Detailed insights into your traffic generation performance</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
            <SafeIcon icon={FiCalendar} className="text-gray-500" />
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="border-none outline-none bg-transparent"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <SafeIcon icon={FiDownload} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Visits</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analyticsData.summary.totalVisits.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiTrendingUp} className="text-blue-600 text-xl" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <SafeIcon icon={FiTrendingUp} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+18.2%</span>
            <span className="text-gray-500 ml-1">vs previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analyticsData.summary.uniqueVisitors.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiUsers} className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <SafeIcon icon={FiTrendingUp} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+12.8%</span>
            <span className="text-gray-500 ml-1">vs previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Session Duration</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analyticsData.summary.avgSessionDuration}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiClock} className="text-purple-600 text-xl" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <SafeIcon icon={FiTrendingUp} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+5.3%</span>
            <span className="text-gray-500 ml-1">vs previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analyticsData.summary.bounceRate}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiGlobe} className="text-orange-600 text-xl" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <SafeIcon icon={FiTrendingUp} className="text-red-500 mr-1 rotate-180" />
            <span className="text-green-500 font-medium">-2.1%</span>
            <span className="text-gray-500 ml-1">vs previous period</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Trends */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Traffic Trends</h2>
          <TrafficChart />
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Geographic Distribution</h2>
          <GeographyChart />
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Countries</h2>
          <div className="space-y-3">
            {analyticsData.summary.topCountries.map((country, index) => (
              <div key={country} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-6 bg-gray-200 rounded text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{country}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{Math.floor(Math.random() * 10000) + 5000}</p>
                  <p className="text-sm text-gray-500">{(Math.random() * 30 + 10).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Landing Pages</h2>
          <div className="space-y-3">
            {analyticsData.summary.topPages.map((page, index) => (
              <div key={page.url} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-6 bg-gray-200 rounded text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{page.url}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{page.visits.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{((page.visits / analyticsData.summary.totalVisits) * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;