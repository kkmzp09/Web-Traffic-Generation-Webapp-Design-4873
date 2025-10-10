import React, { useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../lib/authContext.jsx';

const { FiBell, FiUser, FiSearch, FiChevronDown, FiLogIn, FiUserPlus, FiSettings, FiLogOut, FiShield, FiMenu } = FiIcons;

const Header = ({ onMenuClick, onAuthClick }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogin = () => {
    onAuthClick('login');
    setIsProfileDropdownOpen(false);
  };

  const handleRegister = () => {
    onAuthClick('register');
    setIsProfileDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileDropdownOpen(false);
  };

  const handleSettings = () => {
    // Navigate to settings
    console.log('Settings clicked');
    setIsProfileDropdownOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <SafeIcon icon={FiMenu} className="text-xl" />
          </button>
          
          {/* Search bar */}
          <div className="relative hidden sm:block">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns, analytics..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 lg:w-80"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search button for mobile */}
          <button className="sm:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <SafeIcon icon={FiSearch} className="text-xl" />
          </button>
          
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <SafeIcon icon={FiBell} className="text-xl" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
          </button>
          
          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={toggleProfileDropdown}
              className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <SafeIcon icon={FiUser} className="text-white text-sm" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {isAuthenticated ? user.name : 'Guest User'}
                </p>
                <p className="text-xs text-gray-500">
                  {isAuthenticated ? 'Premium User' : 'Not logged in'}
                </p>
              </div>
              <SafeIcon 
                icon={FiChevronDown} 
                className={`text-gray-400 transition-transform hidden sm:block ${isProfileDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {!isAuthenticated ? (
                  <>
                    {/* Guest User Options */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">Welcome to TrafficGen Pro</p>
                      <p className="text-xs text-gray-500 mt-1">Sign in to access all features</p>
                    </div>
                    
                    <button
                      onClick={handleLogin}
                      className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                    >
                      <SafeIcon icon={FiLogIn} className="text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Sign In</p>
                        <p className="text-xs text-gray-500">Access your dashboard</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={handleRegister}
                      className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                    >
                      <SafeIcon icon={FiUserPlus} className="text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Create Account</p>
                        <p className="text-xs text-gray-500">Start generating traffic</p>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Authenticated User Options */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 flex items-center space-x-1">
                        <SafeIcon icon={FiShield} className="text-green-500" />
                        <span>Premium Account</span>
                      </p>
                    </div>
                    
                    <button
                      onClick={handleSettings}
                      className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                    >
                      <SafeIcon icon={FiSettings} className="text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Account Settings</p>
                        <p className="text-xs text-gray-500">Manage your profile</p>
                      </div>
                    </button>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-red-50 transition-colors text-red-600"
                      >
                        <SafeIcon icon={FiLogOut} className="text-red-600" />
                        <div>
                          <p className="text-sm font-medium">Sign Out</p>
                          <p className="text-xs text-red-500">End your session</p>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isProfileDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;