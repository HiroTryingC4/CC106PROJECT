import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const CommunicationAdminLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  const sidebarItems = [
    { name: 'Dashboard', href: '/comm-admin/dashboard', icon: HomeIcon },
    { name: 'Messages', href: '/comm-admin/messages', icon: ChatBubbleLeftRightIcon },
    { name: 'Chatbot Analytics', href: '/comm-admin/chatbot-analytics', icon: ChartBarIcon },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 text-white flex-shrink-0" style={{backgroundColor: '#4E7B22'}}>
        <div className="p-6">
          <h2 className="font-semibold mb-2" style={{fontSize: '25px'}}>Communication Admin</h2>
          <p className="text-green-100 text-sm">
            Welcome, {user?.firstName || 'Comm Admin'}
            <span className="block text-yellow-200 text-xs mt-1">💬 Communication Manager</span>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Smart Stay Communication</h3>
                <p className="text-green-100 text-sm">
                  Dedicated communication management and chatbot analytics platform.
                </p>
              </div>
              
              <div>
                <h4 className="text-md font-semibold mb-4">Communication Tools</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/comm-admin/messages" className="text-green-100 hover:text-white">Message Center</Link></li>
                  <li><Link to="/comm-admin/chatbot-analytics" className="text-green-100 hover:text-white">Chatbot Analytics</Link></li>
                  <li><Link to="/comm-admin/settings" className="text-green-100 hover:text-white">Settings</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-md font-semibold mb-4">Support</h4>
                <div className="text-sm text-green-100 space-y-2">
                  <p>Email: comm-admin@smartstay.com</p>
                  <p>Phone: +1 (234) 567-8901</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-green-600 mt-8 pt-8 text-center">
              <p className="text-sm text-green-200">© 2024 Smart Stay Communication Admin. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CommunicationAdminLayout;