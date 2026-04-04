import React from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import { BellIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const AdminNotifications = () => {
  const navigate = useNavigate();

  // Static notification data for UI display
  const notifications = [
    {
      id: 1,
      type: 'security',
      title: 'Security Alert',
      message: 'Multiple failed login attempts detected from IP 192.168.1.100',
      date: '2/22/2026',
      isRead: false,
      icon: '🔒',
      iconBg: 'bg-red-100',
      borderColor: 'border-l-red-500'
    },
    {
      id: 2,
      type: 'user',
      title: 'New User Registration',
      message: 'John Smith has registered as a new host',
      date: '2/21/2026',
      isRead: true,
      icon: '👤',
      iconBg: 'bg-blue-100',
      borderColor: ''
    },
    {
      id: 3,
      type: 'system',
      title: 'System Update',
      message: 'Platform maintenance scheduled for tonight at 2:00 AM',
      date: '2/20/2026',
      isRead: false,
      icon: '⚙️',
      iconBg: 'bg-yellow-100',
      borderColor: 'border-l-yellow-500'
    },
    {
      id: 4,
      type: 'financial',
      title: 'Payment Issue',
      message: 'Transaction #12345 requires manual review',
      date: '2/19/2026',
      isRead: true,
      icon: '💳',
      iconBg: 'bg-green-100',
      borderColor: ''
    }
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <BellIcon className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Admin Notifications</h1>
              <p className="text-gray-600 mt-1">You have {unreadCount} unread notifications</p>
            </div>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          <button className="px-4 py-2 rounded-lg font-medium text-white" style={{backgroundColor: '#4E7B22'}}>
            All ({notifications.length})
          </button>
          <button className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300">
            Unread ({unreadCount})
          </button>
          <button className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300">
            Read ({readCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`bg-white rounded-lg shadow-sm p-6 ${
                !notification.isRead ? `border-l-4 ${notification.borderColor}` : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${notification.iconBg}`}>
                  <span className="text-xl">{notification.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    <span className="text-sm text-gray-500">{notification.date}</span>
                  </div>
                  
                  <p className="text-gray-600">{notification.message}</p>
                </div>

                {/* Read Status Indicator */}
                {!notification.isRead && (
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;