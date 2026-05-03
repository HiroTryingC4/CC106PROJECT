import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  VideoCameraIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import PageTransition from './PageTransition';

const CommunicationAdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      logout();
    } finally {
      navigate('/login');
    }
  };

  const sidebarItems = [
    { name: 'Dashboard', href: '/comm-admin/dashboard', icon: HomeIcon },
    { name: 'Messages', href: '/comm-admin/messages', icon: ChatBubbleLeftRightIcon },
    { name: 'Live Chat', href: '/comm-admin/live-chat', icon: VideoCameraIcon },
    { name: 'Chatbot Analytics', href: '/comm-admin/chatbot-analytics', icon: ChartBarIcon },
  ];

  const isActive = (href) => location.pathname === href;

  useEffect(() => {
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 text-white shadow-md" style={{backgroundColor: '#4E7B22'}}>
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-lg font-semibold leading-tight sm:text-xl">Communication Admin</p>
            <p className="text-xs text-green-100 sm:text-sm">Welcome, {user?.firstName || 'Comm Admin'}</p>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform overflow-y-auto text-white shadow-2xl transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:z-auto lg:w-64 lg:translate-x-0 lg:shadow-none lg:h-screen lg:flex lg:flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{backgroundColor: '#4E7B22'}}
      >
        <div>
          <div className="p-6 sm:p-7 lg:p-6">
            <h2 className="font-semibold mb-2" style={{fontSize: '25px'}}>Communication Admin</h2>
            <p className="text-green-100 text-sm">
              Welcome, {user?.firstName || 'Comm Admin'}
              <span className="block text-yellow-200 text-xs mt-1">💬 Communication Manager</span>
            </p>
          </div>
          
          <nav className="mt-4 lg:mt-6">
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
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="mt-auto border-t border-white/15 p-6">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-white hover:bg-black hover:bg-opacity-20 rounded-2xl transition-colors justify-center gap-2"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 pt-0 lg:pt-0">
        <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
        
        {/* Footer */}
        <footer className="hidden lg:block text-white py-12" style={{backgroundColor: '#0C1805'}}>
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

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-6 text-center shadow-2xl ring-1 ring-black/5">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 shadow-inner">
              <ArrowRightOnRectangleIcon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Logout Confirmation</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Are you sure you want to logout from your account?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-medium text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationAdminLayout;