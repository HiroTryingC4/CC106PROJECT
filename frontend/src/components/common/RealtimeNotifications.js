import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';

const RealtimeNotifications = () => {
  const { connected, notifications, unreadCount, loading, markNotificationAsRead, deleteNotification, refreshNotifications } = useWebSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  // Refresh notifications when dropdown opens
  useEffect(() => {
    if (showNotifications) {
      refreshNotifications();
    }
  }, [showNotifications, refreshNotifications]);

  const handleViewAll = () => {
    setShowNotifications(false);
    
    // Navigate to appropriate notifications page based on role
    if (user?.role === 'admin') {
      navigate('/admin/notifications');
    } else if (user?.role === 'communication_admin') {
      navigate('/comm-admin/notifications');
    } else if (user?.role === 'host') {
      navigate('/host/notifications');
    } else {
      navigate('/guest/notifications');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'message':
        return '💬';
      case 'property':
        return '🏠';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
        {connected && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
              {!connected && (
                <span className="ml-2 text-xs text-red-500">(Offline)</span>
              )}
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No new notifications
              </div>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <span className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleViewAll}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Notifications →
              </button>
            </div>
          )}

          {notifications.length > 5 && (
            <div className="px-4 py-2 bg-blue-50 text-center">
              <p className="text-xs text-blue-600">
                Showing 5 of {notifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RealtimeNotifications;
