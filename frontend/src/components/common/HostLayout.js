import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  CalendarDaysIcon, 
  CreditCardIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  TagIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import ChatButton from './ChatButton';

const HostLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  const sidebarItems = [
    { name: 'Dashboard', href: '/host/dashboard', icon: HomeIcon },
    { name: 'My Units', href: '/host/units', icon: BuildingOfficeIcon },
    { name: 'Bookings', href: '/host/bookings', icon: CalendarDaysIcon },
    { name: 'Payments', href: '/host/payments', icon: CreditCardIcon },
    { name: 'Financial', href: '/host/financial', icon: ChartBarIcon },
    { name: 'Messages', href: '/host/messages', icon: ChatBubbleLeftRightIcon },
    { name: 'Reports', href: '/host/reports', icon: DocumentTextIcon },
    { name: 'Promo Codes', href: '/host/promo-codes', icon: TagIcon },
    { name: 'Settings', href: '/host/settings', icon: Cog6ToothIcon },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 text-white flex-shrink-0" style={{backgroundColor: '#4E7B22'}}>
        <div className="p-6">
          <h2 className="font-semibold mb-2" style={{fontSize: '25px'}}>Host Panel</h2>
          <p className="text-green-100 text-sm">
            Welcome, {user?.firstName || 'Host'}
            {user?.isHost && <span className="block text-yellow-200 text-xs mt-1">🏠 Host Mode</span>}
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
                  Your trusted platform for managing and monetizing your properties with ease.
                </p>
              </div>
              
              <div>
                <h4 className="text-md font-semibold mb-4">Host Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/host/help" className="text-gray-300 hover:text-white">Host Guide</Link></li>
                  <li><Link to="/host/community" className="text-gray-300 hover:text-white">Community</Link></li>
                  <li><Link to="/host/resources" className="text-gray-300 hover:text-white">Resources</Link></li>
                  <li><Link to="/host/insurance" className="text-gray-300 hover:text-white">Insurance</Link></li>
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
                  <p>Email: hosts@smartstay.com</p>
                  <p>Phone: +1 (234) 567-8901</p>
                  <p>Host Support: 24/7</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-8 text-center">
              <p className="text-sm text-gray-400">© 2024 Smart Stay. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* Chat Button - Available on all host pages */}
        <ChatButton />
      </div>
    </div>
  );
};

export default HostLayout;