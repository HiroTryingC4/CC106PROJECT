import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import axios from 'axios';
import API_CONFIG from '../config/api';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef(0);

  const apiBaseUrl = API_CONFIG.BASE_URL;
  const wsBase = API_CONFIG.WS_URL;

  // Fetch notifications from backend with rate limiting
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    // Prevent concurrent fetches
    if (fetchingRef.current) return;
    
    // Rate limit: minimum 5 seconds between fetches
    const now = Date.now();
    if (now - lastFetchRef.current < 5000) return;
    
    try {
      fetchingRef.current = true;
      lastFetchRef.current = now;
      
      const response = await axios.get(`${apiBaseUrl}/notifications`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true
      });
      
      const backendNotifications = response.data.notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        timestamp: n.createdAt,
        userId: n.userId,
        subjectId: n.subjectId ?? n.subject_id ?? null
      }));
      
      setNotifications(backendNotifications);
    } catch (error) {
      if (error.response?.status === 429) {
        console.warn('Rate limited - too many notification requests');
      } else {
        console.error('Failed to fetch notifications:', error);
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user, token, apiBaseUrl]);

  // Load notifications on mount and when user changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Add notification helper
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => {
      const newNotification = {
        id: notification.id || Date.now() + Math.random(),
        timestamp: notification.timestamp || notification.createdAt || new Date().toISOString(),
        read: notification.read || false,
        ...notification
      };
      return [newNotification, ...prev];
    });
  }, []);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Create socket connection
    const newSocket = io(wsBase, {
      path: '/socket.io/',
      transports: ['polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      autoConnect: true,
      forceNew: false,
      withCredentials: true,
      timeout: 20000
    });

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('authenticate', {
        userId: user.id,
        token: token
      });
    });

    newSocket.on('authenticated', () => {
      // Authentication successful
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      // Silently handle connection errors - they're often just upgrade attempts
      // Only log in development if it's not a websocket upgrade issue
      if (process.env.NODE_ENV === 'development') {
        if (!error?.message?.includes('websocket') && !error?.message?.includes('closed')) {
          console.error('WebSocket connection error:', error?.message);
        }
      }
    });

    // Handle user status updates
    newSocket.on('user:status', (data) => {
      setOnlineUsers((prev) => {
        if (data.status === 'online') {
          return [...new Set([...prev, data.userId])];
        } else {
          return prev.filter(id => id !== data.userId);
        }
      });
    });

    // Handle notifications
    newSocket.on('notification', (notification) => {
      addNotification(notification);
    });

    // Handle booking notifications
    newSocket.on('booking:notification', (data) => {
      addNotification({
        type: 'booking',
        title: 'Booking Update',
        message: `Booking #${data.bookingId} status: ${data.status}`,
        data
      });
    });

    // Handle message notifications
    newSocket.on('message:received', (data) => {
      addNotification({
        type: 'message',
        title: 'New Message',
        message: `New message in conversation #${data.conversationId}`,
        data
      });
    });

    // Handle property updates
    newSocket.on('property:changed', (data) => {
      addNotification({
        type: 'property',
        title: 'Property Update',
        message: `Property #${data.propertyId} has been updated`,
        data
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, token, wsBase, addNotification]);

  // Join a room
  const joinRoom = useCallback((roomId) => {
    if (socket && connected) {
      socket.emit('join:room', roomId);
    }
  }, [socket, connected]);

  // Leave a room
  const leaveRoom = useCallback((roomId) => {
    if (socket && connected) {
      socket.emit('leave:room', roomId);
    }
  }, [socket, connected]);

  // Send a message
  const sendMessage = useCallback((conversationId, message, recipientId) => {
    if (socket && connected) {
      socket.emit('message:send', {
        conversationId,
        message,
        recipientId
      });
    }
  }, [socket, connected]);

  // Start typing indicator
  const startTyping = useCallback((conversationId, recipientId) => {
    if (socket && connected) {
      socket.emit('typing:start', {
        conversationId,
        recipientId
      });
    }
  }, [socket, connected]);

  // Stop typing indicator
  const stopTyping = useCallback((conversationId) => {
    if (socket && connected) {
      socket.emit('typing:stop', {
        conversationId
      });
    }
  }, [socket, connected]);

  // Subscribe to event
  const on = useCallback((event, callback) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
  }, [socket]);

  // Unsubscribe from event
  const off = useCallback((event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  }, [socket]);

  // Clear notifications
  const clearNotifications = useCallback(async () => {
    try {
      // Delete all notifications from backend
      await Promise.all(
        notifications.map(n => 
          axios.delete(`${apiBaseUrl}/notifications/${n.id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true
          })
        )
      );
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }, [notifications, token, apiBaseUrl]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (id) => {
    try {
      await axios.put(`${apiBaseUrl}/notifications/${id}/read`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [token, apiBaseUrl]);

  // Delete notification
  const deleteNotification = useCallback(async (id) => {
    try {
      await axios.delete(`${apiBaseUrl}/notifications/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [token, apiBaseUrl]);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Check if user is online
  const isUserOnline = useCallback((userId) => {
    return onlineUsers.includes(userId);
  }, [onlineUsers]);

  const value = {
    socket,
    connected,
    onlineUsers,
    notifications,
    unreadCount,
    loading,
    addNotification,
    markNotificationAsRead,
    deleteNotification,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    on,
    off,
    clearNotifications,
    isUserOnline,
    refreshNotifications: fetchNotifications
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
