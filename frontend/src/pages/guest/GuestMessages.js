import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { 
  PaperAirplaneIcon, 
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  ChatBubbleLeftRightIcon,
  LifebuoyIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import API_CONFIG from '../../config/api';

const GuestMessages = () => {
  const { user, token } = useAuth();
  const { startTyping, stopTyping, on, off, joinRoom, leaveRoom } = useWebSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const apiBaseUrl = API_CONFIG.BASE_URL;

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeoutRef = useRef({});

  const currentUserId = user?.id;
  const pendingTarget = location.state || {};

  const getAuthHeaders = () => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  });

  const formatRelativeTimestamp = (value) => {
    if (!value) return '';
    const date = new Date(value);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

  const buildConversationId = (userId, otherUserId, propertyId = null) => {
    const pair = [userId, otherUserId].sort((a, b) => a - b).join('_');
    if (propertyId) {
      return `conv_p_${propertyId}_${pair}`;
    }
    return `conv_u_${pair}`;
  };

  const initializeConversations = (payload) => {
    const summaries = payload.conversationSummaries || [];
    const messagesStore = payload.conversations || {};

    const mappedConversations = summaries.map((summary) => {
      const fullName = summary.otherUser?.fullName?.trim()
        || summary.otherUser?.email
        || `User #${summary.otherUserId}`;
      const initials = fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('') || 'U';

      return {
        id: summary.conversationId,
        conversationId: summary.conversationId,
        otherUserId: summary.otherUserId,
        hostName: fullName,
        propertyName: 'Host Chat',
        lastMessage: summary.lastMessage || '',
        timestamp: formatRelativeTimestamp(summary.lastMessageAt),
        unread: summary.unreadCount || 0,
        avatar: initials,
        isDraft: false,
        propertyId: null
      };
    });

    const normalizedMessageStore = {};
    Object.entries(messagesStore).forEach(([conversationId, entries]) => {
      normalizedMessageStore[conversationId] = (entries || []).map((entry) => ({
        id: entry.id,
        senderId: entry.senderId,
        receiverId: entry.receiverId,
        message: entry.message,
        timestamp: entry.timestamp,
        read: entry.read,
        conversationId
      }));
    });

    setMessagesByConversation(normalizedMessageStore);

    const targetUserId = parseInt(pendingTarget.targetUserId, 10);
    const targetPropertyId = parseInt(pendingTarget.propertyId, 10);
    if (!Number.isNaN(targetUserId) && currentUserId && targetUserId !== currentUserId) {
      const existingConversation = mappedConversations.find((conversation) => conversation.otherUserId === targetUserId);

      if (existingConversation) {
        setConversations(mappedConversations);
        setSelectedConversation(existingConversation.id);
        return;
      }

      const draftConversationId = buildConversationId(
        currentUserId,
        targetUserId,
        Number.isNaN(targetPropertyId) ? null : targetPropertyId
      );

      const draftConversation = {
        id: draftConversationId,
        conversationId: draftConversationId,
        otherUserId: targetUserId,
        hostName: pendingTarget.hostName || `Host #${targetUserId}`,
        propertyName: pendingTarget.propertyTitle || 'Host Chat',
        lastMessage: 'Start a conversation with this host',
        timestamp: 'Now',
        unread: 0,
        avatar: (pendingTarget.hostName || 'H').charAt(0).toUpperCase(),
        isDraft: true,
        propertyId: Number.isNaN(targetPropertyId) ? null : targetPropertyId
      };

      setConversations([draftConversation, ...mappedConversations]);
      setSelectedConversation(draftConversationId);
      return;
    }

    setConversations(mappedConversations);
    setSelectedConversation(mappedConversations[0]?.id || null);
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${apiBaseUrl}/users/messages`, {
          method: 'GET',
          credentials: 'include',
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error('Failed to load conversations');
        }

        const payload = await response.json();
        initializeConversations(payload);
        setError('');
      } catch (fetchError) {
        setError(fetchError.message || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl, user, token, currentUserId]);

  // Listen for typing events
  useEffect(() => {
    if (!on || !off) return;

    const handleTypingStart = (data) => {
      console.log('Received typing:start event:', data);
      const { conversationId, userId } = data;
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: userId
      }));

      // Clear existing timeout
      if (typingTimeoutRef.current[conversationId]) {
        clearTimeout(typingTimeoutRef.current[conversationId]);
      }

      // Auto-clear typing indicator after 3 seconds
      typingTimeoutRef.current[conversationId] = setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[conversationId];
          return updated;
        });
      }, 3000);
    };

    const handleTypingStop = (data) => {
      console.log('Received typing:stop event:', data);
      const { conversationId } = data;
      if (typingTimeoutRef.current[conversationId]) {
        clearTimeout(typingTimeoutRef.current[conversationId]);
      }
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[conversationId];
        return updated;
      });
    };

    const unsubscribeStart = on('typing:start', handleTypingStart);
    const unsubscribeStop = on('typing:stop', handleTypingStop);

    return () => {
      if (unsubscribeStart) unsubscribeStart();
      if (unsubscribeStop) unsubscribeStop();
      Object.values(typingTimeoutRef.current).forEach(clearTimeout);
    };
  }, [on, off]);

  const selectedConv = conversations.find((conversation) => conversation.id === selectedConversation) || null;

  // Join conversation room when selected
  useEffect(() => {
    if (selectedConversation && joinRoom) {
      joinRoom(`conversation:${selectedConversation}`);
      console.log(`Joined conversation room: conversation:${selectedConversation}`);
    }
    
    return () => {
      if (selectedConversation && leaveRoom) {
        leaveRoom(`conversation:${selectedConversation}`);
      }
    };
  }, [selectedConversation, joinRoom, leaveRoom]);

  const messages = useMemo(() => {
    if (!selectedConversation) {
      return [];
    }
    return messagesByConversation[selectedConversation] || [];
  }, [messagesByConversation, selectedConversation]);

  const filteredConversations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      return (
        conversation.hostName.toLowerCase().includes(normalizedSearch)
        || conversation.propertyName.toLowerCase().includes(normalizedSearch)
        || conversation.lastMessage.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [conversations, searchTerm]);

  useEffect(() => {
    const markIncomingAsRead = async () => {
      if (!selectedConversation || !currentUserId) {
        return;
      }

      const unreadIncoming = messages.filter((entry) => !entry.read && entry.senderId !== currentUserId);
      if (unreadIncoming.length === 0) {
        return;
      }

      try {
        await Promise.all(
          unreadIncoming.map((entry) =>
            fetch(`${apiBaseUrl}/users/messages/${entry.id}/read`, {
              method: 'PUT',
              credentials: 'include',
              headers: getAuthHeaders()
            })
          )
        );

        setMessagesByConversation((prev) => ({
          ...prev,
          [selectedConversation]: (prev[selectedConversation] || []).map((entry) => ({
            ...entry,
            read: true
          }))
        }));

        setConversations((prev) => prev.map((conversation) => (
          conversation.id === selectedConversation
            ? { ...conversation, unread: 0 }
            : conversation
        )));
      } catch (_) {
        // Ignore read sync failures to keep messaging responsive.
      }
    };

    markIncomingAsRead();
  }, [apiBaseUrl, currentUserId, messages, selectedConversation, token]);

  const handleSendMessage = async () => {
    const outgoing = newMessage.trim();
    if (!outgoing || !selectedConv || !selectedConv.otherUserId) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/users/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          receiverId: selectedConv.otherUserId,
          conversationId: selectedConv.isDraft ? undefined : selectedConv.conversationId,
          propertyId: selectedConv.propertyId || undefined,
          message: outgoing
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const payload = await response.json();
      const created = payload.messageData;
      const conversationId = created.conversationId;

      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), {
          id: created.id,
          senderId: created.senderId,
          receiverId: created.receiverId,
          message: created.message,
          timestamp: created.timestamp,
          read: created.read,
          conversationId
        }]
      }));

      setConversations((prev) => {
        const next = prev.map((conversation) => {
          if (conversation.id !== selectedConv.id) {
            return conversation;
          }

          return {
            ...conversation,
            id: conversationId,
            conversationId,
            isDraft: false,
            lastMessage: created.message,
            timestamp: formatRelativeTimestamp(created.timestamp)
          };
        });

        return next;
      });

      setSelectedConversation(conversationId);
      setNewMessage('');
    } catch (sendError) {
      setError(sendError.message || 'Failed to send message');
    }
  };

  const handleSendSupportMessage = () => {
    if (supportMessage.trim() && supportSubject.trim()) {
      // Handle sending support message to communication center
      alert('Your message has been sent to our support team. We will get back to you soon!');
      setSupportMessage('');
      setSupportSubject('');
      setShowSupportModal(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (selectedConv && selectedConv.otherUserId && startTyping) {
      console.log('Sending typing:start event:', { conversationId: selectedConversation, recipientId: selectedConv.otherUserId });
      startTyping(selectedConversation, selectedConv.otherUserId);
    }
  };

  const handleStopTyping = () => {
    if (selectedConversation && stopTyping) {
      console.log('Sending typing:stop event:', { conversationId: selectedConversation });
      stopTyping(selectedConversation);
    }
  };

  const isOtherUserTyping = selectedConversation && typingUsers[selectedConversation];

  return (
    <GuestLayout>
      <div className="h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                <button
                  onClick={() => setShowSupportModal(true)}
                  className="text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 flex items-center space-x-1"
                  style={{backgroundColor: '#4E7B22'}}
                >
                  <LifebuoyIcon className="w-4 h-4" />
                  <span>Support</span>
                </button>
              </div>
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="p-4 text-sm text-gray-500">Loading conversations...</div>
              )}

              {!loading && filteredConversations.length === 0 && (
                <div className="p-4 text-sm text-gray-500">No conversations yet.</div>
              )}

              {filteredConversations.map((conversation) => (
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
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === currentUserId
                            ? 'text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                        style={message.senderId === currentUserId ? {backgroundColor: '#4E7B22'} : {}}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === currentUserId ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isOtherUserTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-4 py-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleTyping}
                      onBlur={handleStopTyping}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                          handleStopTyping();
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        handleSendMessage();
                        handleStopTyping();
                      }}
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
                  <p className="text-gray-600">Choose a conversation from the list to start messaging a host</p>
                  {!user && (
                    <button
                      onClick={() => navigate('/login')}
                      className="mt-4 px-4 py-2 text-white rounded-lg hover:opacity-90"
                      style={{backgroundColor: '#4E7B22'}}
                    >
                      Login to Message Hosts
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Support Modal */}
        {showSupportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Support</h3>
                <button 
                  onClick={() => setShowSupportModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    placeholder="What do you need help with?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Please describe your issue or question in detail..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent resize-none"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleSendSupportMessage}
                    disabled={!supportMessage.trim() || !supportSubject.trim()}
                    className="flex-1 bg-[#4E7B22] text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Send Message
                  </button>
                  <button
                    onClick={() => setShowSupportModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </GuestLayout>
  );
};

export default GuestMessages;