import React, { useState, useEffect } from 'react';
import HostLayout from '../../components/common/HostLayout';
import { 
  UserIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const HostSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    bio: ''
  });

  // Load profile data from logged-in user
  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        bio: user.bio || 'Share more about yourself and your hosting experience.'
      });
    }
  }, [user]);

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  const [faqResponses, setFaqResponses] = useState([
    {
      id: 1,
      question: 'How do I book a unit?',
      answer: 'To book a unit, browse available properties, select your desired unit, choose your check-in and check-out dates, and complete the booking with payment.',
      tags: ['Book', 'Booking', 'Reserve', 'Reservation', 'How to book']
    },
    {
      id: 2,
      question: 'What payment methods do you accept?',
      answer: 'We accept payments via QR code. After booking, you\'ll receive a QR code to scan and complete your payment securely.',
      tags: ['pay', 'qr code', 'payment', 'payment method']
    },
    {
      id: 3,
      question: 'What is the cancellation policy?',
      answer: 'You can cancel your booking up to 48 hours before check-in for a full refund. Cancellations within 48 hours are subject to a 50% fee.',
      tags: ['cancel', 'refund', 'policy', 'cancellation']
    },
    {
      id: 4,
      question: 'How do I check in?',
      answer: 'Check-in instructions will be sent to your email 24 hours before your arrival. You\'ll receive the unit access code and any special instructions.',
      tags: ['arrival', 'check in', 'access code']
    },
    {
      id: 5,
      question: 'What about security deposits?',
      answer: 'A security deposit is required for all bookings. It will be returned within 7 days after checkout if there are no damages or issues.',
      tags: ['fee', 'deposit', 'refund', 'security deposit']
    },
    {
      id: 6,
      question: 'Can I modify my booking?',
      answer: 'Yes, you can modify your booking dates from your dashboard. Changes are subject to availability and may affect the total price.',
      tags: ['change', 'modify', 'edit booking', 'update booking']
    },
    {
      id: 7,
      question: 'How do I contact the host?',
      answer: 'You can message the host directly through your booking details page. The host will receive your message and respond promptly.',
      tags: []
    }
  ]);

  const [activeSessions] = useState([
    {
      id: 1,
      device: 'MacBook Pro - Chrome',
      location: 'San Francisco, CA',
      status: 'current',
      lastActive: 'Active now'
    },
    {
      id: 2,
      device: 'iPhone 14 - Safari',
      location: 'San Francisco, CA',
      status: 'active',
      lastActive: '2 hours ago'
    }
  ]);

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'chatbot', label: 'Chatbot' },
    { key: 'security', label: 'Security' }
  ];

  const handleProfileSave = () => {
    console.log('Saving profile:', profile);
  };

  const handleSecurityUpdate = () => {
    console.log('Updating security:', security);
  };

  const handleFaqEdit = (id) => {
    console.log('Editing FAQ:', id);
  };

  const handleFaqDelete = (id) => {
    setFaqResponses(faqResponses.filter(faq => faq.id !== id));
  };

  return (
    <HostLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-8 space-y-8">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              
              {/* Profile Photo */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <img 
                      src="/api/placeholder/80/80" 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <UserIcon className="w-10 h-10 text-white hidden" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                </div>
                <button className="text-gray-600 hover:text-gray-800 font-medium transition-colors">
                  Change Photo
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">First Name</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500 font-medium"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Last Name</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  rows={5}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none font-medium"
                />
              </div>

              <div className="flex space-x-4 pt-4 border-t border-gray-100">
                <button 
                  onClick={handleProfileSave}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  Save Changes
                </button>
                <button className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Chatbot Tab */}
          {activeTab === 'chatbot' && (
            <div className="p-8 space-y-8">
              <h2 className="text-xl font-semibold text-gray-900">FAQ Responses</h2>
              
              <div className="space-y-6">
                {faqResponses.map((faq) => (
                  <div key={faq.id} className="border-2 border-gray-300 rounded-xl p-6 hover:shadow-sm transition-shadow duration-200 bg-white hover:border-gray-400">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleFaqEdit(faq.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors duration-200 border border-blue-200 hover:border-blue-300"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleFaqDelete(faq.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors duration-200 border border-red-200 hover:border-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed font-medium">{faq.answer}</p>
                    
                    {faq.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {faq.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium border-2 border-yellow-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="p-8 space-y-8">
              <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
              
              {/* Password Change */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Current Password</label>
                  <input
                    type="password"
                    value={security.currentPassword}
                    onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200 text-gray-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">New Password</label>
                  <input
                    type="password"
                    value={security.newPassword}
                    onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200 text-gray-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Confirm New Password</label>
                  <input
                    type="password"
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all duration-200 text-gray-900 font-medium"
                  />
                </div>

                <button 
                  onClick={handleSecurityUpdate}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  Update Password
                </button>
              </div>

              {/* Two Factor Authentication */}
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Two Factor Authentication</h3>
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border-2 border-gray-300">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Enable 2FA</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={security.twoFactorEnabled}
                      onChange={(e) => setSecurity({...security, twoFactorEnabled: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 shadow-sm border-2 border-gray-300"></div>
                  </label>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
                <div className="space-y-4">
                  {activeSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border-2 border-gray-300 hover:shadow-sm transition-shadow duration-200 hover:border-gray-400">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">{session.device}</h4>
                        <p className="text-sm text-gray-600 font-medium">{session.location} • {session.lastActive}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {session.status === 'current' ? (
                          <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full border-2 border-green-300">
                            Current
                          </span>
                        ) : (
                          <button className="text-red-600 hover:text-red-800 text-sm font-medium px-4 py-2 rounded-md hover:bg-red-50 transition-colors duration-200 border-2 border-red-200 hover:border-red-300">
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </HostLayout>
  );
};

export default HostSettings;