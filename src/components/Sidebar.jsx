import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../lib/authContext';

const { 
  FiGrid, FiTarget, FiBarChart2, FiSettings, FiPlayCircle, FiLogOut, FiZap, FiChevronDown, FiUser
} = FiIcons;

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const navLinks = [
    { to: '/', icon: FiGrid, text: 'Dashboard' },
    { to: '/direct-traffic', icon: FiTarget, text: 'Direct Traffic' },
    { to: '/seo-traffic', icon: FiZap, text: 'SEO Traffic' },
    { to: '/analytics', icon: FiBarChart2, text: 'Analytics' },
    { to: '/run-campaign', icon: FiPlayCircle, text: 'Run Campaign' },
    { to: '/settings', icon: FiSettings, text: 'Settings' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">TrafficGen</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navLinks.map(({ to, icon, text }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <SafeIcon icon={icon} className="mr-3 text-lg" />
            {text}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <SafeIcon icon={FiUser} className="text-blue-600"/>
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-800">{user?.email || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role || 'user'}</p>
                </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 transition-colors"
              title="Sign Out"
            >
              <SafeIcon icon={FiLogOut} className="text-xl" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;