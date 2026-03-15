import React, { useState } from 'react';
import GuestLayout from '../../components/common/GuestLayout';
import { 
  PaperAirplaneIcon, 
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';

const GuestMessages = () => {
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [newMessage, setNewMessage] = useState('');

  const conversations = [
    {
      id: 1,
      hostName: 'Maria Santos',
      propertyName: 'Modern Studio in Makati',
      lastMessage: 'Thank you for your booking! Check-in instructions will be sent 24 hours before your arrival.',
      timestamp: '2 hours ago',
      unread: 2,
      avatar: 'MS'
    },
    {
      id: 2,
      hostName: 'John Cruz',
      propertyName: 'Cozy Apartment in BGC',
      lastMessage: 'The WiFi password is SmartStay2024. Enjoy your stay!',
      timestamp: '1 day ago',
      unread: 0,
      avatar: 'JC'
    },
    {
      id: 3,
      hostName: 'Anna Reyes',
      propertyName: 'Executive Suite in Ortigas',
      lastMessage: 'Hi! Just wanted to check if everything was okay during your stay.',
      timestamp: '3 days ago',
      unread: 1,
      avatar: 'AR'
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'host',
      message: 'Hello! Welcome to Smart Stay. I\'m Maria, your host for the Modern Studio in Makati.',
      timestamp: '10:30 AM',
      date: 'Today'
    },
    {
      id: 2,
      sender: 'guest',
      message: 'Hi Maria! Thank you for the warm welcome. I\'m excited about my stay.',
      timestamp: '10:35 AM',
      date: 'Today'
    },
    {
      id: 3,
      sender: 'host',
      message: 'Great! I wanted to confirm your check-in time. You mentioned 3 PM, is that still good for you?',
      timestamp: '10:40 AM',
      date: 'Today'
    },
    {
      id: 4,
      sender: 'guest',
      message: 'Yes, 3 PM works perfectly. Should I call when I arrive?',
      timestamp: '10:45 AM',
      date: 'Today'
    },
    {
      id: 5,
      sender: 'host',
      message: 'Perfect! Yes, please call me at +63 917 123 4567 when you arrive. I\'ll meet you at the lobby.',
      timestamp: '10:50 AM',
      date: 'Today'
    },
    {
      id: 6,
      sender: 'host',
      message: 'Thank you for your booking! Check-in instructions will be sent 24 hours before your arrival.',
      timestamp: '2:15 PM',
      date: 'Today'
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message
      setNewMessage('');
    }
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <GuestLayout>
      <div className="h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation === conversation.id ? 'border-l-4' : ''
                  }`}
                  style={selectedConversation === conversation.id ? {
                    backgroundColor: '#f0f9f0',
                    borderLeftColor: '#4E7B22'
                  } : {}}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{backgroundColor: '#4E7B22'}}>
                      {conversation.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {conversation.hostName}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                          {conversation.unread > 0 && (
                            <span className="text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center" style={{backgroundColor: '#4E7B22'}}>
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{conversation.propertyName}</p>
                      <p className="text-sm text-gray-600 mt-1 truncate">{conversation.lastMessage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{backgroundColor: '#4E7B22'}}>
                        {selectedConv.avatar}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{selectedConv.hostName}</h3>
                        <p className="text-sm text-gray-600">{selectedConv.propertyName}</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'guest' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'guest'
                            ? 'text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                        style={message.sender === 'guest' ? {backgroundColor: '#4E7B22'} : {}}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'guest' ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="text-white p-2 rounded-lg hover:opacity-90"
                      style={{backgroundColor: '#4E7B22'}}
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </GuestLayout>
  );
};

export default GuestMessages;