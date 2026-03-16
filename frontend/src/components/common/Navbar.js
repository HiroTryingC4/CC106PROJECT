import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const dropdownRef = useRef(null);

  // Mock notification count - in real app this would come from context/API
  const [notificationCount, setNotificationCount] = useState(2);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
    setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Check if we're on a public page (landing page, units, etc.)
  const isPublicPage = !isAuthenticated || location.pathname === '/' || location.pathname === '/units' || location.pathname === '/recommendations' || location.pathname === '/faqs' || location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className="shadow-sm" style={{backgroundColor: isPublicPage ? 'white' : '#F8FFD3'}}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold" style={{color: '#4E7B22', fontSize: '35px'}}>Smart Stay</span>
            </Link>
          </div>

          {/* Navigation Links - Show only on public pages */}
          {isPublicPage && (
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`px-3 py-2 text-sm font-medium ${
                  location.pathname === '/' 
                    ? 'text-gray-900 border-b-2 border-[#4E7B22]' 
                    : 'text-gray-500 hover:text-[#4E7B22]'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/units" 
                className={`px-3 py-2 text-sm font-medium ${
                  location.pathname === '/units' 
                    ? 'text-gray-900 border-b-2 border-[#4E7B22]' 
                    : 'text-gray-500 hover:text-[#4E7B22]'
                }`}
              >
                Units
              </Link>
              <Link 
                to="/recommendations" 
                className={`px-3 py-2 text-sm font-medium ${
                  location.pathname === '/recommendations' 
                    ? 'text-gray-900 border-b-2 border-[#4E7B22]' 
                    : 'text-gray-500 hover:text-[#4E7B22]'
                }`}
              >
                Recommendations
              </Link>
              <Link 
                to="/faqs" 
                className={`px-3 py-2 text-sm font-medium ${
                  location.pathname === '/faqs' 
                    ? 'text-gray-900 border-b-2 border-[#4E7B22]' 
                    : 'text-gray-500 hover:text-[#4E7B22]'
                }`}
              >
                FAQS
              </Link>
            </div>
          )}

          {/* Right side icons */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && user && !isPublicPage ? (
              <>
                {/* Notification Icon - Bell */}
                <button
                  onClick={() => {
                    if (user?.role === 'admin') {
                      navigate('/admin/notifications');
                    } else if (user?.role === 'comm-admin') {
                      navigate('/comm-admin/notifications');
                    } else if (user?.role === 'host') {
                      navigate('/host/notifications');
                    } else {
                      navigate('/guest/notifications');
                    }
                  }}
                  className="relative w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                  </svg>
                  {/* Notification Badge - only show if there are unread notifications */}
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>

                {/* Date Display with Calendar Icon */}
                <div className="text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center" style={{backgroundColor: '#4E7B22'}}>
                  <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                  </svg>
                  Oct 24, 2023
                </div>

                {/* User Profile Icon with Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleProfileDropdown}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    style={{backgroundColor: '#B8C5A0'}}
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.firstName || user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.email || 'user@smartstay.com'}</p>
                        {user?.isTrial && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Trial Account
                          </span>
                        )}
                        {user?.role === 'admin' && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                            Administrator
                          </span>
                        )}
                        {user?.role === 'comm-admin' && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            💬 Communication Manager
                          </span>
                        )}
                        {user?.role === 'host' && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Host Account
                          </span>
                        )}
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        {/* Profile */}
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            if (user?.role === 'admin') {
                              navigate('/admin/dashboard');
                            } else if (user?.role === 'comm-admin') {
                              navigate('/comm-admin/profile');
                            } else if (user?.role === 'host') {
                              navigate('/host/dashboard');
                            } else {
                              navigate('/guest/profile');
                            }
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                          <span>{user?.role === 'admin' ? 'Admin Panel' : user?.role === 'comm-admin' ? 'Profile' : user?.role === 'host' ? 'Host Dashboard' : 'Profile'}</span>
                        </button>

                        {/* System/Settings */}
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            if (user?.role === 'admin') {
                              navigate('/admin/security');
                            } else if (user?.role === 'comm-admin') {
                              navigate('/comm-admin/settings');
                            } else if (user?.role === 'host') {
                              navigate('/host/settings');
                            } else {
                              navigate('/guest/settings');
                            }
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                          </svg>
                          <span>{user?.role === 'admin' ? 'Security' : 'Settings'}</span>
                        </button>

                        {/* Divider */}
                        <div className="border-t border-gray-100 my-1"></div>

                        {/* Log out */}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                          </svg>
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-[#4E7B22] px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:border-[#4E7B22] transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-[#4E7B22] text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile menu button - Show only on public pages */}
            {isPublicPage && (
              <div className="md:hidden">
                <button 
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {isOpen ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu - Show only on public pages */}
        {isPublicPage && isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <Link 
                to="/" 
                className={`block px-3 py-2 text-base font-medium ${
                  location.pathname === '/' 
                    ? 'text-[#4E7B22] bg-green-50' 
                    : 'text-gray-500 hover:text-[#4E7B22] hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/units" 
                className={`block px-3 py-2 text-base font-medium ${
                  location.pathname === '/units' 
                    ? 'text-[#4E7B22] bg-green-50' 
                    : 'text-gray-500 hover:text-[#4E7B22] hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Units
              </Link>
              <Link 
                to="/recommendations" 
                className={`block px-3 py-2 text-base font-medium ${
                  location.pathname === '/recommendations' 
                    ? 'text-[#4E7B22] bg-green-50' 
                    : 'text-gray-500 hover:text-[#4E7B22] hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Recommendations
              </Link>
              <Link 
                to="/faqs" 
                className={`block px-3 py-2 text-base font-medium ${
                  location.pathname === '/faqs' 
                    ? 'text-[#4E7B22] bg-green-50' 
                    : 'text-gray-500 hover:text-[#4E7B22] hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                FAQS
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;