import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  StarIcon, 
  CalendarDaysIcon, 
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import ChatButton from './ChatButton';

const GuestLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  const sidebarItems = [
    { name: 'Dashboard', href: '/guest/dashboard', icon: HomeIcon },
    { name: 'Units', href: '/guest/units', icon: BuildingOfficeIcon },
    { name: 'Recommendations', href: '/guest/recommendations', icon: StarIcon },
    { name: 'My Bookings', href: '/guest/bookings', icon: CalendarDaysIcon },
    { name: 'Messages', href: '/guest/messages', icon: ChatBubbleLeftRightIcon },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 text-white flex-shrink-0" style={{backgroundColor: '#4E7B22'}}>
        <div className="p-6">
          <h2 className="font-semibold mb-2" style={{fontSize: '25px'}}>Guest Panel</h2>
          <p className="text-green-100 text-sm">
            Welcome, {user?.firstName || 'Guest'}
            {user?.isTrial && <span className="block text-yellow-200 text-xs mt-1">🎯 Trial Mode</span>}
          </p>
        </div>
        
        <nav className="mt-6">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-white text-gray-900 border-r-4'
                    : 'text-white hover:bg-black hover:bg-opacity-20'
                }`}
                style={isActive(item.href) ? {borderRightColor: '#4E7B22'} : {}}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-8">
          {children}
        </div>
        
        {/* Footer */}
        <footer className="text-white py-12" style={{backgroundColor: '#0C1805'}}>
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Smart Stay</h3>
                <p className="text-gray-300 text-sm">
                  Your trusted platform for booking amazing properties with ease and confidence.
                </p>
              </div>
              
              <div>
                <h4 className="text-md font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
                  <li><Link to="/units" className="text-gray-300 hover:text-white">Browse Units</Link></li>
                  <li><Link to="/login" className="text-gray-300 hover:text-white">Login</Link></li>
                  <li><Link to="/register" className="text-gray-300 hover:text-white">Sign Up</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-md font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/faqs" className="text-gray-300 hover:text-white">FAQs</Link></li>
                  <li><Link to="/help" className="text-gray-300 hover:text-white">Help Center</Link></li>
                  <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact Us</Link></li>
                  <li><Link to="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-md font-semibold mb-4">Contact</h4>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>Email: info@smartstay.com</p>
                  <p>Phone: +1 (234) 567-8900</p>
                  <p>Address: 123 Main St, City, State</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-8 text-center">
              <p className="text-sm text-gray-400">© 2024 Smart Stay. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* Chat Button - Available on all guest pages */}
        <ChatButton />
      </div>
    </div>
  );
};

export default GuestLayout;