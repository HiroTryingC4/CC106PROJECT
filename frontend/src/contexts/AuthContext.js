import React, { createContext, useContext, useState, useEffect } from 'react';
import API_CONFIG from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiBaseUrl = API_CONFIG.BASE_URL;

  /**
   * Fetches the current user from the server.
   * Used on startup and after profile updates.
   */
  const fetchCurrentUser = async (storedToken) => {
    try {
      const headers = {};
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }
      const response = await fetch(`${apiBaseUrl}/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        return data.user || null;
      }
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');

      if (storedToken) {
        // Always validate stored token against the server — catches deleted/banned users
        const serverUser = await fetchCurrentUser(storedToken);
        if (serverUser) {
          setUser(serverUser);
          setToken(storedToken);
          // Keep storage up-to-date with latest server data
          const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
          storage.setItem('user', JSON.stringify(serverUser));
        } else {
          // Token invalid or user gone — clear storage
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('token');
        }
      } else {
        // Fallback: session cookie auth (no token in storage)
        const serverUser = await fetchCurrentUser(null);
        if (serverUser) {
          setUser(serverUser);
        }
      }

      setLoading(false);
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (userData, userToken, rememberMe = true) => {
    setUser(userData);
    setToken(userToken);

    // Ensure only one storage has active auth data at a time.
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(userData));
    storage.setItem('token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');

    fetch(`${apiBaseUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    }).catch(() => {});
  };

  /**
   * Re-fetches the current user from the server and updates context state.
   * Call this after profile updates to keep the UI in sync with the DB.
   */
  const refreshUser = async () => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const serverUser = await fetchCurrentUser(storedToken);
    if (serverUser) {
      setUser(serverUser);
      const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(serverUser));
    }
    return serverUser;
  };

  const value = {
    user,
    token,
    login,
    logout,
    refreshUser,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};