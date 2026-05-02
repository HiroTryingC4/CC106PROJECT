import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import API_CONFIG from '../config/api';

const apiBaseUrl = API_CONFIG.BASE_URL;

const buildHeaders = (token, hasBody = false) => {
  const headers = {
    Accept: 'application/json'
  };

  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return { message: text };
};

const mapNotification = (notification, scope) => ({
  ...notification,
  scope: notification.scope || scope,
  isRead: notification.isRead ?? notification.read ?? false,
  createdAt: notification.createdAt || notification.timestamp || new Date().toISOString(),
  priority: notification.priority || 'medium',
  userId: notification.userId ?? null
});

export const useNotifications = ({ scope }) => {
  const { user, token, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const query = new URLSearchParams();
      if (scope) {
        query.set('scope', scope);
      }

      const response = await fetch(`${apiBaseUrl}/notifications${query.toString() ? `?${query.toString()}` : ''}`, {
        method: 'GET',
        headers: buildHeaders(token),
        credentials: 'include'
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load notifications');
      }

      const nextNotifications = (data.notifications || []).map((notification) =>
        mapNotification(notification, data.scope || scope)
      );

      setNotifications(nextNotifications);
      setUnreadCount(data.unreadCount ?? nextNotifications.filter((notification) => !notification.isRead).length);
    } catch (fetchError) {
      setNotifications([]);
      setUnreadCount(0);
      setError(fetchError.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [authLoading, scope, token, user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const request = useCallback(
    async (path, options = {}) => {
      if (!user) {
        throw new Error('No authenticated user');
      }

      const response = await fetch(`${apiBaseUrl}/notifications${path}`, {
        method: options.method || 'GET',
        headers: buildHeaders(token, Boolean(options.body)),
        credentials: 'include',
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    },
    [token, user]
  );

  const markAsRead = useCallback(
    async (id) => {
      await request(`/${id}/read${scope ? `?scope=${encodeURIComponent(scope)}` : ''}`, { method: 'PUT' });
      await fetchNotifications();
    },
    [fetchNotifications, request, scope]
  );

  const markAllAsRead = useCallback(
    async () => {
      await request(`/read-all${scope ? `?scope=${encodeURIComponent(scope)}` : ''}`, {
        method: 'PUT',
        body: { scope }
      });
      await fetchNotifications();
    },
    [fetchNotifications, request, scope]
  );

  const deleteNotification = useCallback(
    async (id) => {
      await request(`/${id}${scope ? `?scope=${encodeURIComponent(scope)}` : ''}`, { method: 'DELETE' });
      await fetchNotifications();
    },
    [fetchNotifications, request, scope]
  );

  const createNotification = useCallback(
    async (payload) => {
      const data = await request('', {
        method: 'POST',
        body: { ...payload, scope }
      });
      await fetchNotifications();
      return data;
    },
    [fetchNotifications, request, scope]
  );

  return {
    notifications,
    loading,
    error,
    unreadCount,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
  };
};
