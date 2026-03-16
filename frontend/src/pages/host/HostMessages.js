import React, { useState } from 'react';
import HostLayout from '../../components/common/HostLayout';
import { 
  ChatBubbleLeftRightIcon,
  UserIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const HostMessages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const conversations = [
    {
      id: 1,
      guest: {
        name: 'Sarah Johnson',
        avatar: 'SJ',
        lastSeen: '2 hours ago'
      },
      property: 'Luxury Beachfront Condo',
      lastMessage: 'Thank you for the quick response! Looking forward to our stay.',
      timestamp: '2024-06-20 14:30',
      unread: 0,
      status: 'active'
    },
    {
      id: 2,
      guest: {
        name: 'Mike Chen',
        avatar: 'MC',
        lastSeen: 'Online'
      },
      property: 'Downtown Studio',
      lastMessage: 'Is early check-in possible?',
      timestamp: '2024-06-20 16:45',
      unread: 2,
      status: 'pending'
    }
  ];

  const messages = selectedConversation ? [
    {
      id: 1,
      sender: 'guest',
      content: 'Hi! I have a booking for next week. Is early check-in possible?',
      timestamp: '2024-06-20 16:30'
    },
    {
      id: 2,
      sender: 'host',
      content: 'Hello! Yes, early check-in is available for a small fee of ₱500. What time were you thinking?',
      timestamp: '2024-06-20 16:35'
    },
    {
      id: 3,
      sender: 'guest',
      content: 'Perfect! Around 11 AM would be great. How do I arrange this?',
      timestamp: '2024-06-20 16:45'
    }
  ] : [];

  return (
    <HostLayout>
      <div className="h-[calc(100vh-200px)] flex bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.id === conversation.id ? 'bg-green-50 border-green-200' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{conversation.guest.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900 truncate">{conversation.guest.name}</h3>
                      {conversation.unread > 0 && (
                        <span className="bg-green-600 text-white text-xs rounded-full px-2 py-1 ml-2">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{conversation.property}</p>
                    <p className="text-sm text-gray-600 truncate mt-1">{conversation.lastMessage}</p>
                    <p className="text-xs text-gray-400 mt-1">{conversation.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{selectedConversation.guest.avatar}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedConversation.guest.name}</h3>
                    <p className="text-sm text-gray-500">{selectedConversation.property}</p>
                    <p className="text-xs text-gray-400">Last seen: {selectedConversation.guest.lastSeen}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'host' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'host'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'host' ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newMessage.trim()) {
                        // Handle send message
                        setNewMessage('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newMessage.trim()) {
                        // Handle send message
                        setNewMessage('');
                      }
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation from the list to start messaging with your guests.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </HostLayout>
  );
};

export default HostMessages;