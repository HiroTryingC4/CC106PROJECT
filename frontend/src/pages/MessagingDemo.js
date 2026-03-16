import React, { useState, useEffect } from 'react';
import { XMarkIcon, ChatBubbleLeftRightIcon, UserIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const MessagingDemo = () => {
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestMessages, setGuestMessages] = useState([
    {
      id: 1,
      sender: 'support',
      text: 'Hello! Welcome to Smart Stay. How can I help you today?',
      time: '9:15 AM',
      avatar: '🏠'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [adminMessages, setAdminMessages] = useState([]);

  // Load admin messages from localStorage
  useEffect(() => {
    const loadAdminMessages = () => {
      const storedMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]');
      setAdminMessages(storedMessages);
    };
    
    loadAdminMessages();
    
    // Refresh admin messages every 2 seconds to show real-time updates
    const interval = setInterval(loadAdminMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const userMessage = {
        id: guestMessages.length + 1,
        sender: 'user',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: '👤'
      };
      
      setGuestMessages([...guestMessages, userMessage]);
      
      // Store message for admin to see
      const adminMessage = {
        id: Date.now(),
        from: 'demo.guest@smartstay.com',
        fromName: 'Demo Guest User',
        to: 'support@smartstay.com',
        subject: 'Demo Message from Website',
        preview: newMessage.length > 100 ? newMessage.substring(0, 100) + '...' : newMessage,
        fullMessage: newMessage,
        timestamp: new Date().toLocaleString(),
        status: 'unread',
        priority: 'normal',
        category: 'general',
        userType: 'guest',
        repliedBy: null,
        repliedAt: null,
        replyStatus: 'pending',
        source: 'website_contact'
      };
      
      // Get existing messages from localStorage
      const existingMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]');
      
      // Add new message to the beginning of the array
      const updatedMessages = [adminMessage, ...existingMessages];
      
      // Store back to localStorage
      localStorage.setItem('adminMessages', JSON.stringify(updatedMessages));
      
      setNewMessage('');
      
      // Auto-reply from support
      setTimeout(() => {
        const supportReply = {
          id: guestMessages.length + 2,
          sender: 'support',
          text: 'Thank you for your message! Our team has received your inquiry and will get back to you within 24 hours.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: '🏠'
        };
        setGuestMessages(prev => [...prev, supportReply]);
      }, 1000);
    }
  };

  const clearMessages = () => {
    localStorage.removeItem('adminMessages');
    setAdminMessages([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-gray-100 text-gray-800';
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
      case 'general': return 'bg-purple-100 text-purple-800';
      case 'property': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Smart Stay Messaging System Demo</h1>
          <p className="text-xl text-gray-600">See how guest messages flow from the website to the admin panel</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Guest Side Demo */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Guest Experience</h2>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Public Website
              </span>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                This is what guests see when they click "Report Issue / Contact Admin" in the footer of any public page.
              </p>
              
              <button
                onClick={() => setShowGuestModal(true)}
                className="w-full flex items-center justify-center space-x-2 bg-[#4E7B22] text-white hover:bg-green-600 transition-colors px-4 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span>Report Issue / Contact Admin</span>
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Guest clicks the contact button</li>
                <li>2. Modern chat interface opens</li>
                <li>3. Guest types their message</li>
                <li>4. Message is sent and stored</li>
                <li>5. Auto-reply confirms receipt</li>
              </ol>
            </div>
          </div>

          {/* Admin Side Demo */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Admin Experience</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Admin Panel
              </span>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Messages from guests appear here in real-time. This simulates the Communication Admin Messages page.
              </p>
              
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setAdminMessages(JSON.parse(localStorage.getItem('adminMessages') || '[]'))}
                  className="px-4 py-2 bg-[#4E7B22] text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Refresh Messages
                </button>
                <button
                  onClick={clearMessages}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Clear Demo Messages
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {adminMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No messages yet. Send a message from the guest side to see it appear here!</p>
                </div>
              ) : (
                adminMessages.map((message) => (
                  <div key={message.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{message.fromName}</div>
                          <div className="text-sm text-gray-500">{message.subject}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        {message.timestamp}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-3">{message.preview}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}>
                        {message.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(message.priority)}`}>
                        {message.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(message.category)}`}>
                        {message.category}
                      </span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {message.userType}
                      </span>
                      {message.source === 'website_contact' && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 flex items-center space-x-1">
                          <span>🌐</span>
                          <span>Website</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4">Try It Out!</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Step 1: Send a Message</h4>
              <p className="text-blue-700 text-sm">
                Click "Report Issue / Contact Admin" on the left side and send a test message. 
                Try different messages to see how they appear.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Step 2: View in Admin</h4>
              <p className="text-blue-700 text-sm">
                Watch the right side to see your message appear in the admin panel with all the 
                proper labels and formatting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Messages Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#4E7B22] text-white rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-lg">🏠</span>
                </div>
                <div>
                  <h3 className="font-semibold">Smart Stay Support</h3>
                  <p className="text-sm opacity-90">Online</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuestModal(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {guestMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-[#4E7B22] flex items-center justify-center text-white text-sm flex-shrink-0">
                      {message.avatar}
                    </div>
                    <div>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-[#4E7B22] text-white rounded-br-md'
                            : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  className="w-10 h-10 bg-[#4E7B22] text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => setNewMessage('I have a booking issue')}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                >
                  Booking Issue
                </button>
                <button
                  onClick={() => setNewMessage('I need help with payment')}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                >
                  Payment Help
                </button>
                <button
                  onClick={() => setNewMessage('Property question')}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                >
                  Property Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingDemo;