import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiPlay, FiBarChart3, FiSettings, FiZap } = FiIcons;

const Sidebar = ({ activePage, setActivePage }) => {
  const location = useLocation();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/' },
    { id: 'campaigns', label: 'Campaigns', icon: FiPlay, path: '/campaigns' },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart3, path: '/analytics' },
    { id: 'settings', label: 'Settings', icon: FiSettings, path: '/settings' }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-50">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <SafeIcon icon={FiZap} className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">TrafficGen</h1>
            <p className="text-sm text-gray-500">Pro Traffic Generator</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <SafeIcon icon={item.icon} className="text-lg" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
          <h3 className="font-semibold text-sm">Upgrade to Pro</h3>
          <p className="text-xs opacity-90 mt-1">Unlimited campaigns & advanced analytics</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;