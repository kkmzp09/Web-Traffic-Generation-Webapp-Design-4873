import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../lib/authContext';
import { useSubscription } from '../lib/subscriptionContext';
import SubscriptionStatus from './SubscriptionStatus';
import GSCConnect from './GSCConnect';

const { 
  FiTrendingUp, FiUsers, FiPlay, FiBarChart, FiTarget, FiZap, FiActivity,
  FiSearch, FiSettings, FiArrowRight, FiClock, FiCheckCircle
} = FiIcons;

const Dashboard = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalTraffic: 0,
    successRate: 0
  });
  const [invoices, setInvoices] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Load dashboard stats
    loadDashboardStats();
    loadInvoices();
    loadRecentActivity();
    
    // Refresh stats every 5 seconds to show real-time updates
    const interval = setInterval(() => {
      loadDashboardStats();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [user, subscription]);

  const loadDashboardStats = () => {
    if (!user) return;
    
    // Load from localStorage
    const campaigns = JSON.parse(localStorage.getItem(`campaigns_${user.id}`) || '[]');
    
    // Count running campaigns (status can be 'running', 'active', or 'queued')
    const activeCampaigns = campaigns.filter(c => 
      c.status === 'running' || c.status === 'active' || c.status === 'queued'
    );
    
    // Also check if there are any campaigns started in the last 10 minutes that might still be running
    const now = Date.now();
    const recentRunningCampaigns = campaigns.filter(c => {
      if (c.status === 'completed') return false;
      const campaignTime = new Date(c.timestamp).getTime();
      const timeDiff = now - campaignTime;
      return timeDiff < 10 * 60 * 1000; // Within last 10 minutes
    });
    
    const totalTraffic = subscription ? subscription.usedVisits : 0;
    
    setStats({
      totalCampaigns: campaigns.length,
      activeCampaigns: Math.max(activeCampaigns.length, recentRunningCampaigns.length),
      totalTraffic: totalTraffic,
      successRate: campaigns.length > 0 ? 96.8 : 0
    });
  };

  const loadInvoices = () => {
    if (!user) return;
    const stored = localStorage.getItem(`invoices_${user.id}`);
    if (stored) {
      setInvoices(JSON.parse(stored));
    }
  };

  const loadRecentActivity = () => {
    if (!user) return;
    const campaigns = JSON.parse(localStorage.getItem(`campaigns_${user.id}`) || '[]');
    
    // Convert campaigns to activity format with time ago
    const activities = campaigns.slice(0, 5).map(campaign => {
      const timestamp = new Date(campaign.timestamp);
      const now = new Date();
      const diffMs = now - timestamp;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      let timeAgo;
      if (diffMins < 1) timeAgo = 'Just now';
      else if (diffMins < 60) timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      else if (diffHours < 24) timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      else timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return {
        ...campaign,
        timeAgo
      };
    });
    
    setRecentActivity(activities);
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

        {/* Subscription Status */}
        <div className="mb-8">
          <SubscriptionStatus />
        </div>

        {/* Google Search Console Integration */}
        <div className="mb-8">
          <GSCConnect userId={user?.id} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Campaigns"
            value={stats.totalCampaigns}
            subtitle="Lifetime campaigns created"
            icon={FiTarget}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          
          <StatCard
            title="Active Campaigns"
            value={stats.activeCampaigns}
            subtitle="Currently running"
            icon={FiPlay}
            color="bg-gradient-to-r from-green-500 to-green-600"
            trend={stats.activeCampaigns > 0 ? `${stats.activeCampaigns} running now` : null}
          />
          
          <StatCard
            title="Visits Used"
            value={stats.totalTraffic.toLocaleString()}
            subtitle={subscription ? `of ${subscription.totalVisits.toLocaleString()} total` : 'No active subscription'}
            icon={FiTrendingUp}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            trend={subscription ? `${subscription.remainingVisits.toLocaleString()} remaining` : null}
          />
          
          <StatCard
            title="Invoices"
            value={invoices.length}
            subtitle="Total invoices"
            icon={FiBarChart}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
            trend={invoices.length > 0 ? `₹${invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)} paid` : null}
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
              {recentActivity.length > 0 ? (
                <>
                  {recentActivity.slice(0, 3).map((activity, index) => (
                    <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${
                      activity.status === 'completed' ? 'bg-green-50' :
                      activity.status === 'running' ? 'bg-blue-50' : 'bg-purple-50'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'completed' ? 'bg-green-500' :
                        activity.status === 'running' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.type === 'direct' ? 'Direct' : 'SEO'} traffic campaign {activity.status}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.url} - {activity.visitors} visits
                        </p>
                        <p className={`text-xs mt-1 ${
                          activity.status === 'completed' ? 'text-green-600' :
                          activity.status === 'running' ? 'text-blue-600' : 'text-purple-600'
                        }`}>
                          {activity.timeAgo}
                        </p>
                      </div>
                      <SafeIcon icon={
                        activity.status === 'completed' ? FiCheckCircle :
                        activity.status === 'running' ? FiPlay : FiClock
                      } className={`w-4 h-4 mt-1 ${
                        activity.status === 'completed' ? 'text-green-600' :
                        activity.status === 'running' ? 'text-blue-600' : 'text-purple-600'
                      }`} />
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <Link 
                      to="/analytics" 
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View all activity →
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <SafeIcon icon={FiActivity} className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No recent activity</p>
                  <p className="text-xs text-gray-400 mt-1">Start a campaign to see activity here</p>
                </div>
              )}
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