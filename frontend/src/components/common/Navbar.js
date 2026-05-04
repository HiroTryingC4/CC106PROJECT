import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import RealtimeNotifications from './RealtimeNotifications';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const dropdownRef = useRef(null);

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

  if (!isPublicPage) {
    return (
      <nav className="hidden sm:block sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex-shrink-0">
              <span className="font-bold" style={{color: '#4E7B22', fontSize: '28px'}}>Smart Stay</span>
            </Link>

            <div className="flex items-center space-x-3">
              <RealtimeNotifications />

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

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                        user?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user?.role === 'host' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user?.role === 'admin' ? 'Administrator' : user?.role === 'host' ? 'Host' : 'Guest'}
                      </span>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { setShowProfileDropdown(false); navigate(
                          user?.role === 'admin' ? '/admin/dashboard' :
                          user?.role === 'host' ? '/host/dashboard' :
                          '/guest/profile'
                        );}}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        <span>{user?.role === 'admin' ? 'Admin Panel' : user?.role === 'host' ? 'Host Dashboard' : 'Profile'}</span>
                      </button>
                      <button
                        onClick={() => { setShowProfileDropdown(false); navigate(
                          user?.role === 'admin' ? '/admin/dashboard' :
                          user?.role === 'host' ? '/host/settings' :
                          '/guest/settings'
                        );}}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                        <span>Settings</span>
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/units', label: 'Units' },
    { to: '/recommendations', label: 'Explore' },
    { to: '/faqs', label: 'FAQs' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="font-bold" style={{color: '#4E7B22', fontSize: '28px'}}>Smart Stay</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? 'bg-green-50 text-[#4E7B22]'
                    : 'text-gray-500 hover:text-[#4E7B22] hover:bg-green-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-gray-700 hover:text-[#4E7B22] px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:border-[#4E7B22] transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="hidden sm:inline-flex bg-[#4E7B22] text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Sign Up
            </Link>

            {/* Mobile: compact auth buttons */}
            <Link
              to="/login"
              className="sm:hidden text-[#4E7B22] px-3 py-1.5 text-sm font-medium border border-[#4E7B22] rounded-lg"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="sm:hidden bg-[#4E7B22] text-white px-3 py-1.5 text-sm font-medium rounded-lg"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-4">
          {navLinks.map(({ to, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors ${
                  active ? 'text-[#4E7B22]' : 'text-gray-400'
                }`}
              >
                {to === '/' && (
                  <svg className={`w-5 h-5 mb-0.5 ${ active ? 'fill-[#4E7B22]' : 'fill-gray-400'}`} viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                )}
                {to === '/units' && (
                  <svg className={`w-5 h-5 mb-0.5 ${ active ? 'fill-[#4E7B22]' : 'fill-gray-400'}`} viewBox="0 0 24 24"><path d="M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zm-8 4H7v-2h2v2zm0-4H7V9h2v2zm0-4H7V5h2v2zm4 8h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm4 8h-2v-2h2v2zm0-4h-2V9h2v2z"/></svg>
                )}
                {to === '/recommendations' && (
                  <svg className={`w-5 h-5 mb-0.5 ${ active ? 'fill-[#4E7B22]' : 'fill-gray-400'}`} viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                )}
                {to === '/faqs' && (
                  <svg className={`w-5 h-5 mb-0.5 ${ active ? 'fill-[#4E7B22]' : 'fill-gray-400'}`} viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
                )}
                <span>{label}</span>
                {active && <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-[#4E7B22]" />}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;