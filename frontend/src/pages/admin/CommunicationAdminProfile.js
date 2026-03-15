import React, { useState } from 'react';
import CommunicationAdminLayout from '../../components/common/CommunicationAdminLayout';
import { 
  UserCircleIcon,
  PencilIcon,
  KeyIcon,
  ShieldCheckIcon,
  BellIcon,
  CameraIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const CommunicationAdminProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || 'Communication',
    lastName: user?.lastName || 'Admin',
    email: user?.email || 'comm-admin@smartstay.com',
    phone: '+1 (234) 567-8901',
    department: 'Communication Management',
    role: 'Communication Administrator',
    joinDate: '2023-02-01',
    lastLogin: '2024-03-15 14:30:25',
    permissions: ['Message Management', 'Chatbot Configuration', 'Communication Analytics', 'User Support']
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    messageAlerts: true,
    chatbotAlerts: true,
    systemUpdates: false,
    urgentMessages: true
  });

  const handleProfileUpdate = () => {
    setIsEditing(false);
    // Show success message
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setShowPasswordForm(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <CommunicationAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Communication Admin Profile</h2>
          <p className="text-gray-600 mt-2">Manage your communication admin account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#4E7B22] text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <p className="text-gray-900 py-2">{profileData.department}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <p className="text-gray-900 py-2">{profileData.role}</p>
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-3 mt-6 pt-6 border-t">
                  <button
                    onClick={handleProfileUpdate}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#4E7B22] text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <KeyIcon className="w-4 h-4" />
                  <span>Change Password</span>
                </button>
              </div>

              {showPasswordForm && (
                <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handlePasswordChange}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Update Password
                    </button>
                    <button
                      onClick={() => setShowPasswordForm(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Enabled
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
              
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {key === 'messageAlerts' && 'Get notified about new messages'}
                        {key === 'chatbotAlerts' && 'Notifications about chatbot performance'}
                        {key === 'systemUpdates' && 'Updates about system maintenance'}
                        {key === 'urgentMessages' && 'Alerts for urgent messages requiring attention'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-[#4E7B22]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-[#4E7B22] rounded-full flex items-center justify-center mb-4">
                  <ChatBubbleLeftRightIcon className="w-20 h-20 text-white" />
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  <CameraIcon className="w-4 h-4" />
                  <span>Change Photo</span>
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Join Date</label>
                  <p className="text-gray-900">{profileData.joinDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Last Login</label>
                  <p className="text-gray-900">{profileData.lastLogin}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Account Status</label>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
              <div className="space-y-2">
                {profileData.permissions.map((permission, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">{permission}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CommunicationAdminLayout>
  );
};

export default CommunicationAdminProfile;