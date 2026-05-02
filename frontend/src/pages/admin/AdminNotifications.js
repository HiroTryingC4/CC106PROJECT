import React, { useMemo, useState } from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import { BellIcon, ArrowLeftIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { getNotificationPresentation } from '../../utils/notificationPresentation';

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');

  const { notifications, loading, error, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications({ scope: 'admin' });

  const viewModel = useMemo(
    () => notifications.map((notification) => ({
      ...notification,
      ...getNotificationPresentation(notification, 'admin')
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <BellIcon className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Admin Notifications</h1>
              <p className="text-gray-600 mt-1">You have {unreadCount} unread notifications</p>
            </div>
          </div>
          <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'All', label: `All (${viewModel.length})` },
            { key: 'Unread', label: `Unread (${unreadCount})` },
            { key: 'Read', label: `Read (${readCount})` }
          ].map((tab) => (
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

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              unreadCount === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
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

                      <p className="text-gray-600">{notification.message}</p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700"
                          >
                            <CheckIcon className="h-4 w-4" />
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {!notification.isRead && <div className="w-3 h-3 bg-green-500 rounded-full" />}
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
            <p className="text-gray-600">There are no notifications in this category yet.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;