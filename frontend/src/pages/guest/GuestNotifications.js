import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { ArrowLeftIcon, BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';

const GuestNotifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Sample notifications data with state management
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'booking',
      title: 'Booking Confirmed',
      message: 'Your booking for Luxury Beachfront Condo has been confirmed',
      date: '2/22/2026',
      isRead: false,
      icon: '🏠',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      hasLeftBorder: true,
      borderColor: 'border-l-green-500'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Successful',
      message: 'Your payment of ₱750 has been processed',
      date: '2/20/2026',
      isRead: true,
      icon: '💰',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      hasLeftBorder: false,
      borderColor: ''
    },
    {
      id: 3,
      type: 'message',
      title: 'New Message',
      message: 'Host replied to your...',
      date: '2/20/2026',
      isRead: false,
      icon: '💬',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      hasLeftBorder: true,
      borderColor: 'border-l-purple-500'
    }
  ]);

  const getFilteredNotifications = () => {
    if (activeTab === 'All') return notifications;
    if (activeTab === 'Unread') return notifications.filter(n => !n.isRead);
    if (activeTab === 'Read') return notifications.filter(n => n.isRead);
    return notifications;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const markAsRead = (id) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id
          ? { 
              ...notification, 
              isRead: true, 
              hasLeftBorder: false, 
              borderColor: '' 
            }
          : notification
      )
    );
    showToastMessage('Notification marked as read');
  };

  const deleteNotification = (id) => {
    const notificationToDelete = notifications.find(n => n.id === id);
    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== id)
    );
    showToastMessage(`"${notificationToDelete?.title}" deleted`);
  };

  const markAllAsRead = () => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({
        ...notification,
        isRead: true,
        hasLeftBorder: false,
        borderColor: ''
      }))
    );
    showToastMessage(`${unreadCount} notifications marked as read`);
  };

  const tabs = [
    { key: 'All', label: `All (${notifications.length})` },
    { key: 'Unread', label: `Unread (${unreadCount})` },
    { key: 'Read', label: `Read (${readCount})` }
  ];

  return (
    <GuestLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <BellIcon className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
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

        {/* Filter Tabs and Mark All as Read */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={activeTab === tab.key ? {backgroundColor: '#4E7B22'} : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              unreadCount === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Mark all as read
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {getFilteredNotifications().map((notification) => (
            <div 
              key={notification.id} 
              className={`bg-white rounded-lg shadow-sm p-6 ${
                notification.hasLeftBorder ? `border-l-4 ${notification.borderColor}` : ''
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
                  
                  <p className="text-gray-600 mb-4">{notification.message}</p>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 transition-colors"
                      >
                        <CheckIcon className="w-4 h-4" />
                        <span>Mark as Read</span>
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {getFilteredNotifications().length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BellIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600">You don't have any notifications in this category yet.</p>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in">
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
              <CheckIcon className="w-5 h-5" />
              <span className="font-medium">{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    </GuestLayout>
  );
};

export default GuestNotifications;