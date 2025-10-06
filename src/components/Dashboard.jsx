import React, { useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import TrafficChart from './TrafficChart';
import * as FiIcons from 'react-icons/fi';

const { FiTrendingUp, FiUsers, FiGlobe, FiActivity, FiPlay, FiPause, FiEye } = FiIcons;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVisits: 45678,
    activeVisitors: 234,
    activeCampaigns: 12,
    successRate: 98.5
  });

  const [activeCampaigns, setActiveCampaigns] = useState([
    {
      id: 1,
      name: 'E-commerce Boost',
      url: 'https://example-store.com',
      status: 'active',
      visitors: 1234,
      duration: '2h 15m',
      rate: '45/min'
    },
    {
      id: 2,
      name: 'Blog Traffic',
      url: 'https://myblog.com',
      status: 'active',
      visitors: 856,
      duration: '1h 45m',
      rate: '32/min'
    },
    {
      id: 3,
      name: 'Landing Page Test',
      url: 'https://landing.example.com',
      status: 'paused',
      visitors: 445,
      duration: '45m',
      rate: '0/min'
    }
  ]);

  const toggleCampaign = (id) => {
    setActiveCampaigns(prev => prev.map(campaign => 
      campaign.id === id 
        ? { ...campaign, status: campaign.status === 'active' ? 'paused' : 'active' }
        : campaign
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your traffic generation campaigns</p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all">
          New Campaign
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Visits</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalVisits.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiEye} className="text-blue-600 text-xl" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <SafeIcon icon={FiTrendingUp} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+12.5%</span>
            <span className="text-gray-500 ml-1">from last week</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Visitors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeVisitors}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiUsers} className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <SafeIcon icon={FiActivity} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">Live</span>
            <span className="text-gray-500 ml-1">real-time</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeCampaigns}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiGlobe} className="text-purple-600 text-xl" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-purple-500 font-medium">8 running</span>
            <span className="text-gray-500 ml-1">4 paused</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.successRate}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiTrendingUp} className="text-orange-600 text-xl" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <SafeIcon icon={FiTrendingUp} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+2.1%</span>
            <span className="text-gray-500 ml-1">from yesterday</span>
          </div>
        </div>
      </div>

      {/* Traffic Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Traffic Overview</h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg">24h</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">7d</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">30d</button>
          </div>
        </div>
        <TrafficChart />
      </div>

      {/* Active Campaigns */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Active Campaigns</h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium">View All</button>
        </div>
        
        <div className="space-y-4">
          {activeCampaigns.map((campaign) => (
            <div key={campaign.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${campaign.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div>
                  <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                  <p className="text-sm text-gray-500">{campaign.url}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{campaign.visitors}</p>
                  <p className="text-xs text-gray-500">visitors</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{campaign.duration}</p>
                  <p className="text-xs text-gray-500">duration</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{campaign.rate}</p>
                  <p className="text-xs text-gray-500">rate</p>
                </div>
                <button
                  onClick={() => toggleCampaign(campaign.id)}
                  className={`p-2 rounded-lg ${campaign.status === 'active' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                >
                  <SafeIcon icon={campaign.status === 'active' ? FiPause : FiPlay} className="text-lg" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;