import React, { useState } from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  EyeIcon,
  TrashIcon,
  Cog6ToothIcon,
  PlusIcon,
  PencilIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const AdminMessages = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState("Hello! I'm your smart assistant. How can I help you today?");
  const [fallbackMessage, setFallbackMessage] = useState("I'm not sure I understand that. Could you rephrase that?");
  const [responseDelay, setResponseDelay] = useState(3000);

  const faqs = [
    {
      id: 1,
      question: "How do I book a unit?",
      answer: "To book a unit, browse available properties, select your desired unit, choose your check in and check out dates, and complete the booking process with payment"
    },
    {
      id: 2,
      question: "What payment methods do you accept?",
      answer: "We accept payments via QR code. After booking, you'll receive a QR code to scan and complete your payment securely"
    },
    {
      id: 3,
      question: "What is the cancellation policy?",
      answer: "You can cancel your booking up to 48 hours before check-in for a full refund. Cancellations within 48 hours are subject to a 50% fee."
    },
    {
      id: 4,
      question: "How do I check in?",
      answer: "Check-in instructions will be sent to your email 24 hours before your arrival. You'll receive the unit access code and any special instructions."
    }
  ];

  const messages = [
    {
      id: 1,
      from: 'john.doe@example.com',
      to: 'jane.smith@example.com',
      subject: 'Question about booking cancellation',
      preview: 'Hi, I need to cancel my booking for next week due to an emergency...',
      timestamp: '2024-03-15 14:30:25',
      status: 'unread',
      priority: 'normal',
      category: 'booking'
    },
    {
      id: 2,
      from: 'support@smartstay.com',
      to: 'mike.johnson@example.com',
      subject: 'Payment issue resolved',
      preview: 'Your payment issue has been resolved. Your booking is now confirmed...',
      timestamp: '2024-03-15 13:45:12',
      status: 'sent',
      priority: 'high',
      category: 'payment'
    },
    {
      id: 3,
      from: 'sarah.wilson@example.com',
      to: 'support@smartstay.com',
      subject: 'Inappropriate guest behavior',
      preview: 'I need to report inappropriate behavior from a guest at my property...',
      timestamp: '2024-03-15 12:20:33',
      status: 'flagged',
      priority: 'urgent',
      category: 'complaint'
    },
    {
      id: 4,
      from: 'alex.brown@example.com',
      to: 'host.support@smartstay.com',
      subject: 'Property listing approval',
      preview: 'When will my property listing be approved? It has been pending for 3 days...',
      timestamp: '2024-03-15 11:15:45',
      status: 'read',
      priority: 'normal',
      category: 'property'
    },
  ];

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || message.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-gray-100 text-gray-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'booking': return 'bg-blue-100 text-blue-800';
      case 'payment': return 'bg-green-100 text-green-800';
      case 'complaint': return 'bg-red-100 text-red-800';
      case 'property': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Messages Center</h2>
          <p className="text-gray-600 mt-2">Monitor and manage platform communications</p>
        </div>

        {/* Chatbot Management Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Chatbox Management</h3>
              <p className="text-gray-600 mt-1">Manage the main website chatbot assistant</p>
            </div>
            <button 
              onClick={() => navigate('/admin/chatbot-analytics')}
              className="bg-[#4E7B22] text-white px-4 py-2 rounded-lg hover:bg-[#3d6219] flex items-center space-x-2"
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>Analytics & Monitoring</span>
            </button>
          </div>

          {/* Chatbot Configuration */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Chatbox Configuration</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableChatbot"
                  checked={chatbotEnabled}
                  onChange={(e) => setChatbotEnabled(e.target.checked)}
                  className="w-4 h-4 text-[#4E7B22] border-gray-300 rounded focus:ring-[#4E7B22]"
                />
                <label htmlFor="enableChatbot" className="text-sm font-medium text-gray-900">
                  ✓ Enable Chatbot
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
                <input
                  type="text"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent"
                  placeholder="Hello! I'm your smart assistant. How can I help you today?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fallback Message</label>
                <input
                  type="text"
                  value={fallbackMessage}
                  onChange={(e) => setFallbackMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent"
                  placeholder="I'm not sure I understand that. Could you rephrase that?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Response Delay (ms)</label>
                <input
                  type="number"
                  value={responseDelay}
                  onChange={(e) => setResponseDelay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent"
                  placeholder="3000"
                />
              </div>

              <button className="bg-[#4E7B22] text-white px-6 py-2 rounded-lg hover:bg-[#3d6219]">
                Save Configuration
              </button>
            </div>
          </div>

          {/* FAQ Management */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h4>
              <button className="bg-[#4E7B22] text-white px-4 py-2 rounded-lg hover:bg-[#3d6219] flex items-center space-x-2">
                <PlusIcon className="w-4 h-4" />
                <span>ADD FAQ</span>
              </button>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                        {faq.id}
                      </div>
                      <h5 className="font-medium text-gray-900">{faq.question}</h5>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                      <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm ml-8">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Messages</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">12,847</p>
            <p className="text-sm text-blue-600 mt-1">Last 30 days</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Unread Messages</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">234</p>
            <p className="text-sm text-blue-600 mt-1">Needs attention</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Flagged Messages</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">12</p>
            <p className="text-sm text-red-600 mt-1">Requires review</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Response Time</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">2.4h</p>
            <p className="text-sm text-green-600 mt-1">Average</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages by sender, recipient, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="sent">Sent</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredMessages.map((message) => (
              <div key={message.id} className="p-6 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedMessage(message)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{message.from}</span>
                          <span className="text-gray-500">→</span>
                          <span className="text-gray-600">{message.to}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}>
                            {message.status}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(message.priority)}`}>
                            {message.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(message.category)}`}>
                            {message.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{message.subject}</h3>
                    <p className="text-gray-600 mb-3">{message.preview}</p>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {message.timestamp}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button className="text-blue-600 hover:text-blue-800">
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{selectedMessage.subject}</h3>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-900">From:</span>
                  <span className="text-gray-600">{selectedMessage.from}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-900">To:</span>
                  <span className="text-gray-600">{selectedMessage.to}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-900">Time:</span>
                  <span className="text-gray-600">{selectedMessage.timestamp}</span>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-gray-700 leading-relaxed">{selectedMessage.preview}</p>
                </div>
                
                <div className="flex space-x-3 pt-4 border-t">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Reply
                  </button>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                    Forward
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;