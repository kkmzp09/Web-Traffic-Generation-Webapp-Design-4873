import React, { useState, useEffect, useRef } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../lib/authContext';
import { useNavigate } from 'react-router-dom';

const { 
  FiMenu, FiX, FiSearch, FiBell, FiUser, FiLogOut, 
  FiChevronDown, FiSettings, FiHelpCircle 
} = FiIcons;

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      // Defensive cleanup
      const keysToRemove = ['authToken', 'accessToken', 'refreshToken', 'user', 'userId'];
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch (e) {
          // Ignore storage errors
        }
      });
      window.location.href = '/#/login'; // Force redirect
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const DropdownItem = ({ icon, text, onClick, className }) => (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${className}`}
    >
      <SafeIcon icon={icon} className="w-5 h-5 mr-3" />
      <span>{text}</span>
    </button>
  );

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-gray-800">
              Trafficker
            </div>
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2">
              <SafeIcon icon={FiSearch} className="text-gray-500" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent focus:outline-none ml-2 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <SafeIcon icon={FiBell} className="h-6 w-6 text-gray-600" />
            </button>
            
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
              >
                <SafeIcon icon={FiUser} className="h-6 w-6 text-gray-600"/>
                {user && (
                  <span className="hidden md:inline text-sm font-medium text-gray-700">
                    {user.email}
                  </span>
                )}
                <SafeIcon icon={FiChevronDown} className="h-4 w-4 text-gray-600" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                  <DropdownItem icon={FiSettings} text="Settings" onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }} />
                  <DropdownItem icon={FiHelpCircle} text="Help" onClick={() => setIsDropdownOpen(false)} />
                  <div className="border-t border-gray-100 my-1"></div>
                  <DropdownItem icon={FiLogOut} text="Sign Out" onClick={handleLogout} className="text-red-600" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;