import React, { useState } from 'react';
import { StarIcon, ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Recommendations = () => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'support',
      text: 'Hello! Welcome to Smart Stay. I\'m here to help you with any questions or issues you may have.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: 'SS'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const userMessage = {
        id: messages.length + 1,
        sender: 'user',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: '👤'
      };
      
      setMessages([...messages, userMessage]);
      
      // Store message for admin to see
      const adminMessage = {
        id: Date.now(), // Use timestamp as unique ID
        from: 'guest@smartstay.com',
        fromName: 'Guest User',
        to: 'support@smartstay.com',
        subject: 'Guest Inquiry from Recommendations Page',
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
        source: 'website_contact' // Mark as coming from website contact
      };
      
      // Get existing messages from localStorage
      const existingMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]');
      
      // Add new message to the beginning of the array (most recent first)
      const updatedMessages = [adminMessage, ...existingMessages];
      
      // Store back to localStorage
      localStorage.setItem('adminMessages', JSON.stringify(updatedMessages));
      
      setNewMessage('');
      
      // Auto-reply from support
      setTimeout(() => {
        const supportReply = {
          id: messages.length + 2,
          sender: 'support',
          text: 'Thank you for reaching out! I\'ve received your message and our support team will get back to you within 24 hours. Is there anything else I can help you with right now?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: 'SS'
        };
        setMessages(prev => [...prev, supportReply]);
      }, 1000);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center">
            Trending Now 
            <span className="ml-3 text-purple-500">✨</span>
          </h1>
          <p className="text-xl text-gray-600">
            Properties we think you'll love based on your preferences
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {/* Luxury Beachfront Condo */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Luxury Beachfront Condo"
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 bg-[#4E7B22] text-white text-sm font-medium rounded-full flex items-center">
                  🏢 CONDO
                </span>
              </div>
              <div className="absolute top-4 right-4 flex items-center bg-white bg-opacity-95 px-3 py-1.5 rounded-full shadow-sm">
                <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-lg font-bold ml-1">4.9</span>
                <span className="text-gray-500 ml-1">(98)</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3 border-b-2 border-[#4E7B22] pb-2 inline-block">
                Luxury Beachfront Condo
              </h3>
              <p className="text-gray-600 text-base mb-6 leading-relaxed">
                Stunning 2-bedroom condo with ocean views, modern amenities, and direct beach access.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-[#4E7B22]">₱150</span>
                  <span className="text-gray-500 text-lg ml-1">/night</span>
                </div>
                <div className="text-gray-500 text-base">
                  2 bed • 2 bath • 4 guests
                </div>
              </div>
            </div>
          </div>

          {/* Modern Downtown Studio */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Modern Downtown Studio"
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 bg-[#4E7B22] text-white text-sm font-medium rounded-full flex items-center">
                  🏢 STUDIO
                </span>
              </div>
              <div className="absolute top-4 right-4 flex items-center bg-white bg-opacity-95 px-3 py-1.5 rounded-full shadow-sm">
                <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-lg font-bold ml-1">4.5</span>
                <span className="text-gray-500 ml-1">(28)</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3 border-b-2 border-[#4E7B22] pb-2 inline-block">
                Modern Downtown Studio
              </h3>
              <p className="text-gray-600 text-base mb-6 leading-relaxed">
                Cozy studio apartment in the heart of downtown, perfect for business travelers.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-[#4E7B22]">₱85</span>
                  <span className="text-gray-500 text-lg ml-1">/night</span>
                </div>
                <div className="text-gray-500 text-base">
                  1 bed • 1 bath • 2 guests
                </div>
              </div>
            </div>
          </div>

          {/* Family-Friendly Villa */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Family-Friendly Villa"
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 bg-[#4E7B22] text-white text-sm font-medium rounded-full flex items-center">
                  🏡 VILLA
                </span>
              </div>
              <div className="absolute top-4 right-4 flex items-center bg-white bg-opacity-95 px-3 py-1.5 rounded-full shadow-sm">
                <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-lg font-bold ml-1">4.5</span>
                <span className="text-gray-500 ml-1">(65)</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3 border-b-2 border-[#4E7B22] pb-2 inline-block">
                Family-Friendly Villa
              </h3>
              <p className="text-gray-600 text-base mb-6 leading-relaxed">
                Spacious 3-bedroom villa with private pool, perfect for families.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-[#4E7B22]">₱220</span>
                  <span className="text-gray-500 text-lg ml-1">/night</span>
                </div>
                <div className="text-gray-500 text-base">
                  3 bed • 3 bath • 6 guests
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white py-12 mt-16" style={{backgroundColor: '#0C1805'}}>
        <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-2xl font-bold mb-4" style={{color: '#4E7B22'}}>Smart Stay</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                Your trusted platform for booking amazing properties with ease and confidence.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="/units" className="hover:text-white transition-colors">Browse Units</a></li>
                <li><a href="/recommendations" className="hover:text-white transition-colors">Recommendations</a></li>
                <li><a href="/faqs" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Contact</h4>
              <div className="space-y-3 text-gray-400 mb-6">
                <p>Email: info@smartstay.com</p>
                <p>Phone: +1 (234) 567-8900</p>
                <p>Address: 123 Main St, City, State</p>
              </div>
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full flex items-center justify-center space-x-2 bg-[#4E7B22] text-white hover:bg-green-600 transition-colors px-4 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span>Report Issue / Contact Admin</span>
              </button>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Smart Stay. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Messages Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full h-[700px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#4E7B22] rounded-full flex items-center justify-center text-white font-bold">
                  SS
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Smart Stay Support</h3>
                  <p className="text-sm text-gray-500">Online</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>
                    {message.sender === 'support' ? (
                      // Support message (left side)
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-[#4E7B22] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          SS
                        </div>
                        <div className="flex-1">
                          <div className="bg-white rounded-lg p-3 shadow-sm border">
                            <p className="text-gray-800 text-sm leading-relaxed">{message.text}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 ml-1">{message.time}</p>
                        </div>
                      </div>
                    ) : (
                      // User message (right side)
                      <div className="flex justify-end">
                        <div className="max-w-[80%]">
                          <div className="bg-[#4E7B22] text-white rounded-lg p-3 shadow-sm">
                            <p className="text-sm leading-relaxed">{message.text}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-right mr-1">{message.time}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent outline-none text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-12 h-12 bg-[#4E7B22] text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => setNewMessage('I have a booking issue with my reservation')}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
                >
                  Booking Issue
                </button>
                <button
                  onClick={() => setNewMessage('I need help with payment processing')}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
                >
                  Payment Help
                </button>
                <button
                  onClick={() => setNewMessage('I have a question about property amenities')}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
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

export default Recommendations;