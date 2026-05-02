import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { ArrowLeftIcon, BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../hooks/useNotifications';
import { getNotificationPresentation } from '../../utils/notificationPresentation';

const GuestNotifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { notifications, loading, error, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications({ scope: 'user' });

  const viewModel = useMemo(
    () => notifications.map((notification) => ({
      ...notification,
      ...getNotificationPresentation(notification, 'user')
    })),
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'All') return viewModel;
    if (activeTab === 'Unread') return viewModel.filter((notification) => !notification.isRead);
    if (activeTab === 'Read') return viewModel.filter((notification) => notification.isRead);
    return viewModel;
  }, [activeTab, viewModel]);

  const readCount = viewModel.filter((notification) => notification.isRead).length;

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const onMarkAsRead = async (id) => {
    await markAsRead(id);
    showToastMessage('Notification marked as read');
  };

  const onDeleteNotification = async (notification) => {
    await deleteNotification(notification.id);
    showToastMessage(`"${notification.title}" deleted`);
  };

  const onMarkAllAsRead = async () => {
    await markAllAsRead();
    showToastMessage(`${unreadCount} notifications marked as read`);
  };

  const tabs = [
    { key: 'All', label: `All (${viewModel.length})` },
    { key: 'Unread', label: `Unread (${unreadCount})` },
    { key: 'Read', label: `Read (${readCount})` }
  ];

  return (
    <GuestLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <BellIcon className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">You have {unreadCount} unread notifications</p>
            </div>
          </div>
          <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.key ? 'text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={activeTab === tab.key ? { backgroundColor: '#4E7B22' } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={onMarkAllAsRead}
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

        {loading && (
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-600 shadow-sm">
            Loading notifications...
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${notification.isRead ? 'border-l-transparent' : notification.borderColor}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${notification.bgColor}`}>
                      <Icon className={`w-6 h-6 ${notification.color}`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                        <span className="text-sm text-gray-500">{notification.dateLabel}</span>
                      </div>

                      <p className="text-gray-600 mb-4">{notification.message}</p>

                      <div className="flex space-x-4">
                        {!notification.isRead && (
                          <button
                            onClick={() => onMarkAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 transition-colors"
                          >
                            <CheckIcon className="w-4 h-4" />
                            <span>Mark as Read</span>
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteNotification(notification)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BellIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600">You don't have any notifications in this category yet.</p>
          </div>
        )}

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