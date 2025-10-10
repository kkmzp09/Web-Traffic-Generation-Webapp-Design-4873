import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../lib/authContext';

const { 
  FiTrendingUp, FiUsers, FiPlay, FiBarChart, FiTarget, FiZap, FiActivity,
  FiSearch, FiSettings, FiArrowRight, FiClock, FiCheckCircle
} = FiIcons;

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalTraffic: 0,
    successRate: 0
  });

  useEffect(() => {
    // Load dashboard stats
    loadDashboardStats();
  }, []);

  const loadDashboardStats = () => {
    // Mock data for now - replace with actual API calls
    setStats({
      totalCampaigns: 24,
      activeCampaigns: 3,
      totalTraffic: 47820,
      successRate: 96.8
    });
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend, className = "" }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <SafeIcon icon={FiTrendingUp} className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <SafeIcon icon={icon} className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon, color, to, buttonText }) => (
    <Link to={to} className="block">
      <div className={`${color} rounded-xl p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]`}>
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <SafeIcon icon={icon} className="w-6 h-6 text-white" />
          </div>
          <SafeIcon icon={FiArrowRight} className="w-5 h-5 text-white/80" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/90 text-sm mb-4">{description}</p>
        <div className="inline-flex items-center text-white text-sm font-medium">
          {buttonText}
          <SafeIcon icon={FiArrowRight} className="w-4 h-4 ml-1" />
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <SafeIcon icon={FiActivity} className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, <span className="font-semibold text-blue-600">{user?.name || 'User'}!</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">System Online</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Campaigns"
            value={stats.totalCampaigns}
            subtitle="Lifetime campaigns created"
            icon={FiTarget}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            trend="+12% this month"
          />
          
          <StatCard
            title="Active Campaigns"
            value={stats.activeCampaigns}
            subtitle="Currently running"
            icon={FiPlay}
            color="bg-gradient-to-r from-green-500 to-green-600"
            trend="3 running now"
          />
          
          <StatCard
            title="Total Traffic"
            value={stats.totalTraffic.toLocaleString()}
            subtitle="Visits generated"
            icon={FiTrendingUp}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            trend="+24% this week"
          />
          
          <StatCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            subtitle="Average completion rate"
            icon={FiBarChart}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
            trend="+2.1% improvement"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickActionCard
              title="Direct Traffic"
              description="Generate immediate website traffic with our direct traffic campaigns"
              icon={FiZap}
              color="bg-gradient-to-r from-blue-600 to-blue-700"
              to="/direct-traffic"
              buttonText="Start Campaign"
            />
            
            <QuickActionCard
              title="SEO Traffic"
              description="Boost your search rankings with targeted SEO traffic campaigns"
              icon={FiSearch}
              color="bg-gradient-to-r from-green-600 to-green-700"
              to="/seo-traffic"
              buttonText="Create SEO Campaign"
            />
            
            <QuickActionCard
              title="Settings"
              description="Manage your profile, preferences, and account settings"
              icon={FiSettings}
              color="bg-gradient-to-r from-purple-600 to-purple-700"
              to="/settings"
              buttonText="Manage Settings"
            />
          </div>
        </div>

        {/* Recent Activity & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <SafeIcon icon={FiActivity} className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Direct traffic campaign started</p>
                  <p className="text-xs text-gray-500 mt-1">Campaign "Website Boost" - 500 visits</p>
                  <p className="text-xs text-blue-600 mt-1">5 minutes ago</p>
                </div>
                <SafeIcon icon={FiPlay} className="w-4 h-4 text-blue-600 mt-1" />
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">SEO campaign completed</p>
                  <p className="text-xs text-gray-500 mt-1">Campaign "Organic Growth" - 100% success rate</p>
                  <p className="text-xs text-green-600 mt-1">2 hours ago</p>
                </div>
                <SafeIcon icon={FiCheckCircle} className="w-4 h-4 text-green-600 mt-1" />
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New campaign scheduled</p>
                  <p className="text-xs text-gray-500 mt-1">Campaign "Daily Traffic" - Starts in 1 hour</p>
                  <p className="text-xs text-purple-600 mt-1">1 hour ago</p>
                </div>
                <SafeIcon icon={FiClock} className="w-4 h-4 text-purple-600 mt-1" />
              </div>
              
              <div className="text-center pt-4">
                <Link 
                  to="/analytics" 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all activity →
                </Link>
              </div>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
              <SafeIcon icon={FiBarChart} className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-6">
              {/* Traffic Growth */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Traffic Growth</span>
                  <span className="text-sm font-semibold text-green-600">+24%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">vs. last month</p>
              </div>
              
              {/* Campaign Success */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Campaign Success</span>
                  <span className="text-sm font-semibold text-blue-600">96.8%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: '97%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Average success rate</p>
              </div>
              
              {/* Server Uptime */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Server Uptime</span>
                  <span className="text-sm font-semibold text-green-600">99.9%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;