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
    return null;
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