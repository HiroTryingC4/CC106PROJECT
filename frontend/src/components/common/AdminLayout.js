import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  BuildingOfficeIcon, 
  StarIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  const sidebarItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Units', href: '/admin/units', icon: BuildingOfficeIcon },
    { name: 'Reviews', href: '/admin/reviews', icon: StarIcon },
    { name: 'Activity Logs', href: '/admin/activity-logs', icon: ClipboardDocumentListIcon },
    { name: 'Security', href: '/admin/security', icon: ShieldCheckIcon },
    { name: 'Comm Admins', href: '/admin/comm-admin-management', icon: ChatBubbleLeftRightIcon },
    { name: 'Financial', href: '/admin/financial', icon: CurrencyDollarIcon },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 text-white flex-shrink-0" style={{backgroundColor: '#4E7B22'}}>
        <div className="p-6">
          <h2 className="font-semibold mb-2" style={{fontSize: '25px'}}>Admin Panel</h2>
          <p className="text-green-100 text-sm">
            Welcome, {user?.firstName || 'Admin'}
            <span className="block text-yellow-200 text-xs mt-1">🛡️ Administrator</span>
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
                <h3 className="text-lg font-semibold mb-4">Smart Stay Admin</h3>
                <p className="text-gray-300 text-sm">
                  Comprehensive platform management and analytics dashboard for administrators.
                </p>
              </div>
              
              <div>
                <h4 className="text-md font-semibold mb-4">Management</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/admin/users" className="text-gray-300 hover:text-white">User Management</Link></li>
                  <li><Link to="/admin/units" className="text-gray-300 hover:text-white">Property Units</Link></li>
                  <li><Link to="/admin/reviews" className="text-gray-300 hover:text-white">Reviews</Link></li>
                  <li><Link to="/admin/comm-admin-management" className="text-gray-300 hover:text-white">Comm Admins</Link></li>
                  <li><Link to="/admin/financial" className="text-gray-300 hover:text-white">Financial</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-md font-semibold mb-4">System</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/admin/security" className="text-gray-300 hover:text-white">Security Center</Link></li>
                  <li><Link to="/admin/activity-logs" className="text-gray-300 hover:text-white">Activity Logs</Link></li>
                  <li><Link to="/admin/reports" className="text-gray-300 hover:text-white">Reports</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-md font-semibold mb-4">Support</h4>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>Email: admin@smartstay.com</p>
                  <p>Phone: +1 (234) 567-8900</p>
                  <p>Emergency: +1 (234) 567-8911</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-8 text-center">
              <p className="text-sm text-gray-400">© 2024 Smart Stay Admin Panel. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;