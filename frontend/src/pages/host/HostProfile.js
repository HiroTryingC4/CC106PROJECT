import React, { useState, useEffect } from 'react';
import HostLayout from '../../components/common/HostLayout';
import { 
  UserCircleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_CONFIG from '../../config/api';

const API_BASE = API_CONFIG.BASE_URL;

const HostProfile = () => {
  const navigate = useNavigate();
  const { user, token, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: ''
  });

  // Computed display values pulled from real DB data
  const [memberSince, setMemberSince] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('not_submitted');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        // Fetch full profile from server to get latest data
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/users/profile`, {
          credentials: 'include',
          headers
        });

        if (res.ok) {
          const data = await res.json();
          setProfileData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            company: data.company || ''
          });
        } else {
          // Fallback to AuthContext user data
          setProfileData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            company: user.company || ''
          });
        }
      } catch {
        setProfileData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          company: user.company || ''
        });
      }

      // Real member since from user.createdAt (set by userRepo)
      const createdAt = user.createdAt;
      if (createdAt) {
        const date = new Date(createdAt);
        setMemberSince(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      } else {
        setMemberSince('—');
      }

      // Real verification status
      setVerificationStatus(user.verificationStatus || 'not_submitted');
      setLoading(false);
    };

    fetchProfile();
  }, [user, token]);

  const handleProfileUpdate = async () => {
    setSaving(true);
    setErrorMessage('');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        // Refresh AuthContext so navbar/header shows updated name
        await refreshUser();
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setErrorMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Network error — could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrorMessage('');
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || ''
      });
    }
  };

  const verificationBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800">✓ Verified Host</p>
          </div>
        );
      case 'pending':
        return (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm font-medium text-yellow-800">⏳ Verification Pending</p>
          </div>
        );
      case 'not_submitted':
        return (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600">⚠ Not Yet Verified</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <HostLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading...</div>
        </div>
      </HostLayout>
    );
  }

  return (
    <HostLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account information and settings</p>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center space-x-2">
            <CheckIcon className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-2">
            <XMarkIcon className="w-5 h-5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter first name"
                    />
                  ) : (
                    <p className="text-gray-900 py-2 font-medium">{profileData.firstName || 'Not provided'}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter last name"
                    />
                  ) : (
                    <p className="text-gray-900 py-2 font-medium">{profileData.lastName || 'Not provided'}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  ) : (
                    <p className="text-gray-900 py-2 font-medium">{profileData.email || 'Not provided'}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">This is your login email</p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-gray-900 py-2 font-medium">{profileData.phone || 'Not provided'}</p>
                  )}
                </div>

                {/* Company/Business Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter business name"
                    />
                  ) : (
                    <p className="text-gray-900 py-2 font-medium">{profileData.company || 'Not provided'}</p>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex space-x-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleProfileUpdate}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <CheckIcon className="w-5 h-5" />
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Profile Summary */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-4xl font-bold">
                    {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {profileData.firstName} {profileData.lastName}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{profileData.email}</p>
                {/* Real verification badge from DB */}
                {verificationBadge()}
              </div>
            </div>

            {/* Account Status — all values from DB */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Member Since</span>
                  <span className="text-gray-900 font-medium">{memberSince || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-gray-200">
                  <span className="text-gray-600">Account Status</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-gray-200">
                  <span className="text-gray-600">Role</span>
                  <span className="text-gray-900 font-medium capitalize">{user?.role || 'Host'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-gray-200">
                  <span className="text-gray-600">Verification</span>
                  <span className={`text-xs font-semibold capitalize ${
                    verificationStatus === 'verified' ? 'text-green-700' :
                    verificationStatus === 'pending' ? 'text-yellow-700' :
                    'text-gray-500'
                  }`}>
                    {verificationStatus?.replace('_', ' ') || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HostLayout>
  );
};

export default HostProfile;
