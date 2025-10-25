// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../lib/authContext';

const {
  FiHome, FiTrendingUp, FiSettings, FiFileText, FiZap, FiSearch, FiUser, FiLogOut, FiBarChart2,
  FiTarget, FiCheckCircle, FiLink, FiActivity, FiCode
} = FiIcons;

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome, description: 'Overview & analytics' },
    { name: 'Direct Traffic', href: '/direct-traffic', icon: FiZap, description: 'Run direct campaigns' },
    { name: 'SEO Traffic', href: '/seo-traffic', icon: FiSearch, description: 'Run SEO campaigns' },
    { name: 'Domain Analytics', href: '/domain-analytics', icon: FiBarChart2, description: 'SEO insights & data' },
    { name: 'GSC Analytics', href: '/gsc-analytics', icon: FiTrendingUp, description: 'Keyword trends & history' },
    { name: 'SEO Automation', href: '/seo-dashboard', icon: FiActivity, description: 'AI-powered SEO fixes' },
    { name: 'Widget Setup', href: '/widget-installation', icon: FiCode, description: 'Install auto-fix widget' },
    { name: 'Keyword Tracker', href: '/keyword-tracker', icon: FiTarget, description: 'Track keyword rankings' },
    { name: 'On-Page SEO', href: '/onpage-seo', icon: FiCheckCircle, description: 'Analyze & optimize pages' },
    { name: 'Settings', href: '/settings', icon: FiSettings, description: 'Profile management' },
    { name: 'Invoice', href: '/invoice', icon: FiFileText, description: 'Billing & invoices' },
  ];

  const isActive = (href) => {
    if (href === '/dashboard' && location.pathname === '/dashboard') return true;
    return location.pathname === href;
  };

  const getNavItemClass = (item) => {
    const base = 'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative';
    return isActive(item.href)
      ? `${base} bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg`
      : `${base} text-gray-700 hover:bg-gray-100 hover:text-gray-900`;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  return (
    <div className="w-64 bg-white shadow-xl border-r border-gray-200 flex flex-col h-full">
      <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <SafeIcon icon={FiTrendingUp} className="text-white text-lg" />
          </div>
          <span className="text-xl font-bold text-gray-900">TrafficGen</span>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
            <SafeIcon icon={FiUser} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'User'}
            </div>
            <div className="text-xs text-blue-600">Premium Account</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigationItems.map((item) => (
          <Link key={item.name} to={item.href} className={getNavItemClass(item)}>
            <SafeIcon icon={item.icon} className="mr-3 h-5 w-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="truncate">{item.name}</div>
              <div className="text-xs opacity-75 truncate">{item.description}</div>
            </div>
            {isActive(item.href) && <div className="absolute right-2 w-2 h-2 bg-white rounded-full" />}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
        >
          <SafeIcon icon={FiLogOut} className="mr-3 h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-3">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-900">System Online</span>
          </div>
          <div className="text-xs text-gray-600">All services operational</div>
        </div>
      </div>
    </div>
  );
}