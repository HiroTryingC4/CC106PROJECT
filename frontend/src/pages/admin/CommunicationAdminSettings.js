import React, { useState } from 'react';
import CommunicationAdminLayout from '../../components/common/CommunicationAdminLayout';
import { 
  Cog6ToothIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserGroupIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const CommunicationAdminSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [chatbotAlerts, setChatbotAlerts] = useState(false);
  const [autoResponse, setAutoResponse] = useState(true);
  const [responseTime, setResponseTime] = useState('2');
  const [maxConcurrentChats, setMaxConcurrentChats] = useState('10');

  const handleSaveSettings = () => {
    // Handle save settings logic here
    alert('Settings saved successfully!');
  };

  return (
    <CommunicationAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Communication Settings</h2>
          <p className="text-gray-600 mt-2">Configure communication preferences and system settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BellIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Notification Settings</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive email alerts for new messages</p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emailNotifications ? 'bg-[#4E7B22]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Message Alerts</h4>
                  <p className="text-sm text-gray-600">Get notified about urgent messages</p>
                </div>
                <button
                  onClick={() => setMessageAlerts(!messageAlerts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    messageAlerts ? 'bg-[#4E7B22]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      messageAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Chatbot Alerts</h4>
                  <p className="text-sm text-gray-600">Notifications about chatbot performance</p>
                </div>
                <button
                  onClick={() => setChatbotAlerts(!chatbotAlerts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    chatbotAlerts ? 'bg-[#4E7B22]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      chatbotAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Communication Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Communication Settings</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Auto Response</h4>
                  <p className="text-sm text-gray-600">Automatically respond to common queries</p>
                </div>
                <button
                  onClick={() => setAutoResponse(!autoResponse)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoResponse ? 'bg-[#4E7B22]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoResponse ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <ClockIcon className="w-5 h-5 text-gray-500" />
                  <h4 className="font-medium text-gray-900">Response Time Target (hours)</h4>
                </div>
                <select
                  value={responseTime}
                  onChange={(e) => setResponseTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent"
                >
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="4">4 hours</option>
                  <option value="8">8 hours</option>
                  <option value="24">24 hours</option>
                </select>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <UserGroupIcon className="w-5 h-5 text-gray-500" />
                  <h4 className="font-medium text-gray-900">Max Concurrent Chats</h4>
                </div>
                <select
                  value={maxConcurrentChats}
                  onChange={(e) => setMaxConcurrentChats(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent"
                >
                  <option value="5">5 chats</option>
                  <option value="10">10 chats</option>
                  <option value="15">15 chats</option>
                  <option value="20">20 chats</option>
                  <option value="25">25 chats</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Cog6ToothIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">System Status</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckIcon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-medium text-gray-900">Message System</h4>
              <p className="text-sm text-green-600 mt-1">Online</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckIcon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-medium text-gray-900">Chatbot Service</h4>
              <p className="text-sm text-green-600 mt-1">Active</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckIcon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-medium text-gray-900">Notification Service</h4>
              <p className="text-sm text-green-600 mt-1">Running</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="bg-[#4E7B22] text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <CheckIcon className="w-5 h-5" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </CommunicationAdminLayout>
  );
};

export default CommunicationAdminSettings;