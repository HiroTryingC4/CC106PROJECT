import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HostLayout from '../../components/common/HostLayout';
import {
  BellIcon,
  CheckCircleIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useWebSocket } from '../../contexts/WebSocketContext';

const HostNotifications = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markNotificationAsRead, deleteNotification, clearNotifications } = useWebSocket();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'message':
        return '💬';
      case 'property':
        return '🏠';
      case 'payment':
        return '💳';
      default:
        return '🔔';
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'booking':
        navigate('/host/bookings');
        break;
      case 'message':
        navigate('/host/messages');
        break;
      case 'property':
        navigate('/host/units');
        break;
      case 'payment':
        navigate('/host/payments');
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    await Promise.all(unreadNotifications.map(n => markNotificationAsRead(n.id)));
  };

  return (
    <HostLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">You have {unreadCount} unread notifications</p>
          </div>

          <div className="flex items-center space-x-3">
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-600 shadow-sm">
            Loading notifications...
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BellIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                <p className="text-gray-600">You'll see notifications here when they arrive.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-white rounded-lg shadow-sm border-l-4 p-6 transition-all duration-200 hover:shadow-md cursor-pointer ${
                    notification.read ? 'border-l-gray-300' : 'border-l-green-500 bg-green-50'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className={`text-sm font-semibold ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title || 'Notification'}
                            </h3>
                            {!notification.read && <div className="w-2 h-2 bg-green-600 rounded-full" />}
                          </div>

                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markNotificationAsRead(notification.id);
                              }}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Mark as read"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
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
              ))
            )}
          </div>
        )}
      </div>
    </HostLayout>
  );
};

export default HostNotifications;