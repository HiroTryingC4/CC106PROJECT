import React, { useState, useEffect } from 'react';
import CommunicationAdminLayout from '../../components/common/CommunicationAdminLayout';
import { 
  Cog6ToothIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserGroupIcon,
  CheckIcon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import API_CONFIG from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

const CommunicationAdminSettings = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [chatbotAlerts, setChatbotAlerts] = useState(false);
  const [autoResponse, setAutoResponse] = useState(true);
  const [responseTime, setResponseTime] = useState('2');
  const [maxConcurrentChats, setMaxConcurrentChats] = useState('10');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [systemStatus, setSystemStatus] = useState([]);

  useEffect(() => {
    fetchSettings();
    fetchSystemStatus();
  }, [token]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/comm-admin/settings`, {
        credentials: 'include',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setEmailNotifications(data.emailNotifications);
        setMessageAlerts(data.messageAlerts);
        setChatbotAlerts(data.chatbotAlerts);
        setAutoResponse(data.autoResponse);
        setResponseTime(data.responseTime.toString());
        setMaxConcurrentChats(data.maxConcurrentChats.toString());
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/comm-admin/system-status`, {
        credentials: 'include',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data);
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const faqs = [
    {
      id: 1,
      question: 'How do email notifications work?',
      answer: 'Email notifications are sent to your registered email address whenever you receive a new message or when there are important updates. You can customize the frequency and types of notifications in the settings above.'
    },
    {
      id: 2,
      question: 'What is the Auto Response feature?',
      answer: 'Auto Response automatically sends predefined replies to common queries, helping you respond faster to users. The system uses AI to detect common questions and provides instant answers based on your configured responses.'
    },
    {
      id: 3,
      question: 'How is response time calculated?',
      answer: 'Response time is the average time taken to reply to messages. It is calculated from when a message is received until the first response is sent. Setting a target helps you maintain quality service standards.'
    },
    {
      id: 4,
      question: 'What happens when max concurrent chats is reached?',
      answer: 'When the maximum number of concurrent chats is reached, new incoming chats will be queued and users will be notified of the wait time. This helps prevent overwhelming your team and maintains service quality.'
    },
    {
      id: 5,
      question: 'Can I customize chatbot responses?',
      answer: 'Yes, you can customize chatbot responses through the Chatbot Analytics page. Navigate to the chatbot settings to add, edit, or remove automated responses based on your needs.'
    }
  ];

  const handleSaveSettings = () => {
    setShowSaveModal(true);
  };

  const confirmSave = async () => {
    setIsSaving(true);
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/comm-admin/settings`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          emailNotifications,
          messageAlerts,
          chatbotAlerts,
          autoResponse,
          responseTime: parseInt(responseTime),
          maxConcurrentChats: parseInt(maxConcurrentChats)
        })
      });

      if (response.ok) {
        setShowSaveModal(false);
        // Optionally show success message
      } else {
        console.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CommunicationAdminLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Communication Settings</h2>
          <p className="mt-2 text-gray-600">Configure communication preferences and system settings</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Notification Settings */}
          <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BellIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Notification Settings</h3>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
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

              <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
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

              <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Communication Settings</h3>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
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

              <div className="rounded-xl bg-gray-50 p-4">
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

              <div className="rounded-xl bg-gray-50 p-4">
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
        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Cog6ToothIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">System Status</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {systemStatus.length > 0 ? (
              systemStatus.map((service, index) => (
                <div key={index} className={`rounded-2xl p-4 text-center ${
                  service.status === 'online' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    service.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {service.status === 'online' ? (
                      <CheckIcon className="w-6 h-6 text-white" />
                    ) : (
                      <XMarkIcon className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                  <p className={`text-sm mt-1 capitalize ${
                    service.status === 'online' ? 'text-green-600' : 'text-red-600'
                  }`}>{service.status}</p>
                </div>
              ))
            ) : (
              <>
                <div className="rounded-2xl bg-green-50 p-4 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900">Message System</h4>
                  <p className="text-sm text-green-600 mt-1">Online</p>
                </div>

                <div className="rounded-2xl bg-green-50 p-4 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900">Chatbot Service</h4>
                  <p className="text-sm text-green-600 mt-1">Active</p>
                </div>

                <div className="rounded-2xl bg-green-50 p-4 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900">Notification Service</h4>
                  <p className="text-sm text-green-600 mt-1">Running</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <QuestionMarkCircleIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {expandedFaq === faq.id ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-4 pb-4 pt-0 text-sm text-gray-600 bg-gray-50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="inline-flex w-full items-center justify-center space-x-2 rounded-xl bg-[#4E7B22] px-6 py-3 text-white hover:bg-green-700 transition-colors sm:w-auto"
          >
            <CheckIcon className="w-5 h-5" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Save Confirmation Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 text-center shadow-2xl ring-1 ring-black/5">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-inner">
              <CheckIcon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Save Configuration</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Are you sure you want to save these communication settings? This will update your notification preferences and system configurations.
            </p>
            <div className="mt-3 rounded-xl bg-blue-50 p-3">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Changes will take effect immediately and may affect how you receive notifications.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                disabled={isSaving}
                className="flex-1 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                disabled={isSaving}
                className="flex-1 rounded-2xl bg-[#4E7B22] px-4 py-3 font-medium text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </CommunicationAdminLayout>
  );
};

export default CommunicationAdminSettings;