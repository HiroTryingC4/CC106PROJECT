import React, { useMemo, useState } from 'react';
import CommunicationAdminLayout from '../../components/common/CommunicationAdminLayout';
import { BellIcon, ArrowLeftIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { getNotificationPresentation } from '../../utils/notificationPresentation';

const CommunicationAdminNotifications = () => {
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

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    if (notification.subjectId) {
      switch (notification.type) {
        case 'booking':
        case 'booking_confirmed':
        case 'booking_reminder':
          navigate(`/comm-admin/bookings/${notification.subjectId}`);
          break;
        case 'property':
          navigate(`/comm-admin/properties/${notification.subjectId}`);
          break;
        case 'message':
          navigate('/comm-admin/messages');
          break;
        default:
          break;
      }
    }
  };

  return (
    <CommunicationAdminLayout>
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start space-x-3">
            <BellIcon className="w-8 h-8 text-green-600" />
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Communication Notifications</h1>
              <p className="mt-1 text-gray-600">You have {unreadCount} unread notifications</p>
            </div>
          </div>
          <button onClick={() => navigate(-1)} className="inline-flex items-center space-x-2 self-start rounded-full bg-white px-4 py-2 text-gray-600 shadow-sm ring-1 ring-gray-200 hover:text-gray-800">
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
          <div className="space-y-3 sm:space-y-4">
            {filteredNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`cursor-pointer rounded-2xl border-l-4 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6 ${notification.isRead ? 'border-l-transparent' : notification.borderColor}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:space-x-4 sm:gap-0">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${notification.bgColor}`}>
                      <Icon className={`w-6 h-6 ${notification.color}`} />
                    </div>

                    <div className="flex-1">
                      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
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

                    {!notification.isRead && <div className="h-3 w-3 rounded-full bg-green-500" />}
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
    </CommunicationAdminLayout>
  );
};

export default CommunicationAdminNotifications;