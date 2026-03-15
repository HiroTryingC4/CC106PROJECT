import React, { useState } from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import { 
  CalendarIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ClipboardDocumentCheckIcon,
  StarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const ActivityLogs = () => {
  const [activeTab, setActiveTab] = useState('all');

  const activityLogs = [
    {
      id: 1,
      type: 'booking',
      title: 'BOOKING CREATED',
      description: 'Created booking #11 for Cozy Studio',
      userId: 'User ID: 3',
      timestamp: '5/19/2024, 6:30:00 PM',
      icon: CalendarIcon,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 2,
      type: 'unit',
      title: 'UNIT CREATED',
      description: 'Created unit "Cozy Studio"',
      userId: 'User ID: 2',
      timestamp: '5/18/2024, 10:15:00 PM',
      icon: HomeIcon,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600'
    },
    {
      id: 3,
      type: 'payment',
      title: 'PAYMENT COMPLETED',
      description: 'Created payment for booking #1',
      userId: 'User ID: 3',
      timestamp: '5/17/2024, 7:00:00 PM',
      icon: CurrencyDollarIcon,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 4,
      type: 'booking',
      title: 'BOOKING APPROVED',
      description: 'Approved booking #1',
      userId: 'User ID: 2',
      timestamp: '5/17/2024, 6:30:00 PM',
      icon: ClipboardDocumentCheckIcon,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 5,
      type: 'review',
      title: 'REVIEW SUBMITTED',
      description: 'Submitted review for booking #3',
      userId: 'User ID: 3',
      timestamp: '5/16/2024, 5:30:00 PM',
      icon: StarIcon,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      id: 6,
      type: 'user',
      title: 'USER REGISTERED',
      description: 'New user account created',
      userId: 'User ID: 4',
      timestamp: '5/16/2024, 2:15:00 PM',
      icon: UserIcon,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      id: 7,
      type: 'payment',
      title: 'PAYMENT PROCESSED',
      description: 'Payment processed for booking #2',
      userId: 'User ID: 1',
      timestamp: '5/15/2024, 4:45:00 PM',
      icon: CurrencyDollarIcon,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 8,
      type: 'unit',
      title: 'UNIT APPROVED',
      description: 'Unit "Beach Villa" approved for listing',
      userId: 'Admin ID: 1',
      timestamp: '5/15/2024, 11:30:00 AM',
      icon: HomeIcon,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600'
    }
  ];

  const getFilteredLogs = () => {
    if (activeTab === 'all') return activityLogs;
    return activityLogs.filter(log => log.type === activeTab);
  };

  const getTabCount = (type) => {
    if (type === 'all') return activityLogs.length;
    return activityLogs.filter(log => log.type === type).length;
  };

  const filteredLogs = getFilteredLogs();

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-2">System activity and audit trail</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('booking')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'booking'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('unit')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'unit'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Units
          </button>
          <button
            onClick={() => setActiveTab('user')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'user'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'payment'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'review'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Reviews
          </button>
        </div>

        {/* Activity Log Cards */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-4">
            {filteredLogs.map((log) => {
              const Icon = log.icon;
              return (
                <div key={log.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-12 h-12 ${log.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${log.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wide">
                        {log.title}
                      </h3>
                      <span className="text-sm text-gray-500">{log.timestamp}</span>
                    </div>
                    <p className="text-gray-900 font-medium mt-1">{log.description}</p>
                    <p className="text-sm text-gray-500 mt-1">{log.userId}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Showing {filteredLogs.length} of {filteredLogs.length} logs
            </p>
          </div>
        </div>

        {/* Empty State */}
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity logs found</h3>
            <p className="text-gray-600">No {activeTab === 'all' ? '' : activeTab} activities to display.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ActivityLogs;