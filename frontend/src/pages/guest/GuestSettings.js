import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { ArrowLeftIcon, CogIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';

const GuestSettings = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [settings, setSettings] = useState({
    darkMode: false,
    autoSave: true,
    language: 'en',
    profileVisibility: true,
    locationSharing: false,
    dataAnalytics: true
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Load settings from backend on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const authToken = token || localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!authToken) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/users/profile`, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const prefs = data.preferences || {};
          
          setSettings({
            darkMode: prefs.darkMode || false,
            autoSave: prefs.autoSave !== undefined ? prefs.autoSave : true,
            language: prefs.language || 'en',
            profileVisibility: prefs.profileVisibility !== undefined ? prefs.profileVisibility : true,
            locationSharing: prefs.locationSharing || false,
            dataAnalytics: prefs.dataAnalytics !== undefined ? prefs.dataAnalytics : true
          });

          // Apply dark mode if enabled
          if (prefs.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [token]);

  // Toggle dark mode
  const handleDarkModeToggle = (enabled) => {
    setSettings(prev => ({ ...prev, darkMode: enabled }));
    
    if (enabled) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  // Save settings to backend
  const handleSaveSettings = async () => {
    try {
      const authToken = token || localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!authToken) {
        setSuccessMessage('Please log in to save settings');
        setTimeout(() => setSuccessMessage(''), 3000);
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/users/settings`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setSuccessMessage('Settings saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setSuccessMessage('Failed to save settings');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSuccessMessage('Error saving settings');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  return (
    <GuestLayout>
      <style>{`
        [data-theme="dark"] {
          background-color: #1a1a1a;
        }
        [data-theme="dark"] * {
          color: #ffffff !important;
        }
        [data-theme="dark"] .bg-white {
          background-color: #2d2d2d !important;
        }
        [data-theme="dark"] .bg-green-50 {
          background-color: #1a4d1a !important;
        }
        [data-theme="dark"] .text-green-800 {
          color: #90ee90 !important;
        }
        [data-theme="dark"] .border-green-200 {
          border-color: #2d5a2d !important;
        }
        [data-theme="dark"] .border-gray-200 {
          border-color: #404040 !important;
        }
        [data-theme="dark"] .border-gray-300 {
          border-color: #525252 !important;
        }
        [data-theme="dark"] .bg-gray-50 {
          background-color: #262626 !important;
        }
        [data-theme="dark"] .bg-gray-100 {
          background-color: #333333 !important;
        }
        [data-theme="dark"] .bg-gray-200 {
          background-color: #404040 !important;
        }
        [data-theme="dark"] input,
        [data-theme="dark"] select,
        [data-theme="dark"] textarea {
          background-color: #333333 !important;
          color: #ffffff !important;
          border-color: #525252 !important;
        }
        [data-theme="dark"] option {
          background-color: #333333 !important;
          color: #ffffff !important;
        }
        [data-theme="dark"] .shadow-sm {
          box-shadow: 0 1px 2px 0 rgba(255, 255, 255, 0.05) !important;
        }
        [data-theme="dark"] svg {
          color: #ffffff !important;
        }
      `}</style>
      <div className="space-y-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-600">
            Loading settings...
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-600 mt-1">Manage your app preferences and system settings</p>
            </div>

            <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CogIcon className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Dark Mode</h4>
                  <p className="text-sm text-gray-600">Switch between light and dark theme</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.darkMode}
                    onChange={(e) => handleDarkModeToggle(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Auto-save Forms</h4>
                  <p className="text-sm text-gray-600">Automatically save form data as you type</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.autoSave}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select 
                  value={settings.language}
                  onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="en">English</option>
                  <option value="fil">Filipino</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Security</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Profile Visibility</h4>
                  <p className="text-sm text-gray-600">Allow hosts to see your profile information</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.profileVisibility}
                    onChange={(e) => setSettings(prev => ({ ...prev, profileVisibility: e.target.checked }))}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Location Sharing</h4>
                  <p className="text-sm text-gray-600">Share your location for better recommendations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.locationSharing}
                    onChange={(e) => setSettings(prev => ({ ...prev, locationSharing: e.target.checked }))}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Data Analytics</h4>
                  <p className="text-sm text-gray-600">Help improve our service by sharing usage data</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.dataAnalytics}
                    onChange={(e) => setSettings(prev => ({ ...prev, dataAnalytics: e.target.checked }))}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* App Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">App Information</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">March 15, 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Build:</span>
                <span className="font-medium">2026.03.15</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                Terms of Service
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                Privacy Policy
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                Help & Support
              </button>
            </div>
          </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90"
                  style={{backgroundColor: '#4E7B22'}}
                >
                  Save Settings
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </GuestLayout>
  );
};

export default GuestSettings;