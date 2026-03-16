import React, { useState } from 'react';
import HostLayout from '../../components/common/HostLayout';
import { 
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const HostNotifications = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'booking',
      title: 'New Booking Request',
      message: 'John Smith has requested to book Trial#1 for Feb 22-24, 2026',
      timestamp: '2 minutes ago',
      isRead: false,
      priority: 'high',
      icon: CalendarDaysIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      actionRequired: true,
      bookingId: '17',
      guestName: 'John Smith',
      unit: 'Trial#1',
      dates: 'Feb 22-24, 2026'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of ₱1,500 received from Maria Garcia for booking #18',
      timestamp: '15 minutes ago',
      isRead: false,
      priority: 'medium',
      icon: CreditCardIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      actionRequired: false,
      amount: '₱1,500',
      guestName: 'Maria Garcia',
      bookingId: '18'
    },
    {
      id: 3,
      type: 'message',
      title: 'New Message',
      message: 'David Lee sent you a message about his upcoming stay',
      timestamp: '1 hour ago',
      isRead: true,
      priority: 'medium',
      icon: ChatBubbleLeftRightIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      actionRequired: true,
      guestName: 'David Lee',
      messagePreview: 'Hi, I wanted to ask about early check-in...'
    },
    {
      id: 4,
      type: 'system',
      title: 'Property Verification Complete',
      message: 'Your property Trial#3 has been successfully verified and is now live',
      timestamp: '2 hours ago',
      isRead: true,
      priority: 'low',
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      actionRequired: false,
      unit: 'Trial#3'
    },
    {
      id: 5,
      type: 'booking',
      title: 'Booking Cancelled',
      message: 'Anna Wilson cancelled her booking for Trial#1 (Feb 25-26, 2026)',
      timestamp: '3 hours ago',
      isRead: true,
      priority: 'medium',
      icon: ExclamationTriangleIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      actionRequired: false,
      guestName: 'Anna Wilson',
      unit: 'Trial#1',
      dates: 'Feb 25-26, 2026'
    },
    {
      id: 6,
      type: 'review',
      title: 'New Review Received',
      message: 'You received a 5-star review from Sarah Johnson',
      timestamp: '5 hours ago',
      isRead: true,
      priority: 'low',
      icon: UserIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      actionRequired: false,
      guestName: 'Sarah Johnson',
      rating: 5,
      reviewPreview: 'Amazing stay! The host was very responsive...'
    },
    {
      id: 7,
      type: 'system',
      title: 'Monthly Report Available',
      message: 'Your February 2026 earnings report is ready for download',
      timestamp: '1 day ago',
      isRead: true,
      priority: 'low',
      icon: InformationCircleIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      actionRequired: false,
      reportMonth: 'February 2026'
    },
    {
      id: 8,
      type: 'payment',
      title: 'Payment Verification Required',
      message: 'Payment from Tom Wilson requires verification for booking #19',
      timestamp: '1 day ago',
      isRead: false,
      priority: 'high',
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      actionRequired: true,
      guestName: 'Tom Wilson',
      bookingId: '19',
      amount: '₱2,000'
    }
  ]);

  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.isRead;
    if (activeTab === 'action-required') return notification.actionRequired;
    return notification.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired).length;

  const handleMarkAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const handleDeleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    setSelectedNotifications(prev => prev.filter(selectedId => selectedId !== id));
  };

  const handleBulkDelete = () => {
    setNotifications(prev => 
      prev.filter(notification => !selectedNotifications.includes(notification.id))
    );
    setSelectedNotifications([]);
  };

  const handleSelectNotification = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const getNotificationAction = (notification) => {
    switch (notification.type) {
      case 'booking':
        if (notification.actionRequired) {
          return (
            <div className="flex space-x-2 mt-2">
              <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">
                View Booking
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                Approve
              </button>
            </div>
          );
        }
        break;
      case 'message':
        if (notification.actionRequired) {
          return (
            <button className="mt-2 px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700">
              Reply
            </button>
          );
        }
        break;
      case 'payment':
        if (notification.actionRequired) {
          return (
            <button className="mt-2 px-3 py-1 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700">
              Verify Payment
            </button>
          );
        }
        break;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${badges[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  return (
    <HostLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">Stay updated with your property management activities</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {selectedNotifications.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Delete Selected ({selectedNotifications.length})</span>
              </button>
            )}
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BellIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Action Required</p>
                <p className="text-2xl font-bold text-gray-900">{actionRequiredCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CalendarDaysIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter(n => n.timestamp.includes('minutes') || n.timestamp.includes('hour')).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'action-required', label: 'Action Required', count: actionRequiredCount },
            { key: 'booking', label: 'Bookings', count: notifications.filter(n => n.type === 'booking').length },
            { key: 'payment', label: 'Payments', count: notifications.filter(n => n.type === 'payment').length },
            { key: 'message', label: 'Messages', count: notifications.filter(n => n.type === 'message').length },
            { key: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.key
                  ? 'bg-white bg-opacity-20 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {filteredNotifications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === filteredNotifications.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    Select All ({filteredNotifications.length})
                  </span>
                </label>
                {selectedNotifications.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedNotifications.length} selected
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 p-6 transition-all duration-200 hover:shadow-md ${
                  notification.borderColor
                } ${!notification.isRead ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                    className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${notification.bgColor}`}>
                    <Icon className={`w-5 h-5 ${notification.color}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className={`text-sm font-semibold ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          {getPriorityBadge(notification.priority)}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {notification.timestamp}
                        </p>
                        
                        {/* Action Buttons */}
                        {getNotificationAction(notification)}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Mark as read"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete notification"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <BellIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600">
              {activeTab === 'all' 
                ? "You're all caught up! No notifications at the moment."
                : `No ${activeTab.replace('-', ' ')} notifications found.`
              }
            </p>
          </div>
        )}
      </div>
    </HostLayout>
  );
};

export default HostNotifications;