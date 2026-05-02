import React, { useEffect, useMemo, useState, useRef } from 'react';
import HostLayout from '../../components/common/HostLayout';
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import API_CONFIG from '../../config/api';

const HostMessages = () => {
  const { user, token } = useAuth();
  const { startTyping, stopTyping, on, off, joinRoom, leaveRoom } = useWebSocket();
  const apiBaseUrl = API_CONFIG.BASE_URL;

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeoutRef = useRef({});

  const currentUserId = user?.id;

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

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        if (!user) {
          setVerificationStatus(null);
          return;
        }

        const response = await fetch(`${apiBaseUrl}/host/verification-status`, {
          credentials: 'include',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          const data = await response.json();
          setVerificationStatus(data);
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
        setVerificationStatus({
          status: 'not_submitted',
          message: 'Complete your verification to unlock all host features.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationStatus();
  }, [apiBaseUrl, token, user]);

  const isVerified = ['verified', 'approved'].includes(verificationStatus?.status) || verificationStatus?.verified === true;

  const initializeConversations = (payload) => {
    const summaries = payload.conversationSummaries || [];
    const messagesStore = payload.conversations || {};

    const mappedConversations = summaries.map((summary) => {
      const fullName = summary.otherUser?.fullName?.trim()
        || summary.otherUser?.email
        || `Guest #${summary.otherUserId}`;

      const initials = fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('') || 'G';

      return {
        id: summary.conversationId,
        conversationId: summary.conversationId,
        otherUserId: summary.otherUserId,
        guest: {
          name: fullName,
          avatar: initials,
          lastSeen: 'Recently active'
        },
        property: 'Guest Chat',
        lastMessage: summary.lastMessage || '',
        timestamp: formatRelativeTimestamp(summary.lastMessageAt),
        unread: summary.unreadCount || 0,
        status: 'active'
      };
    });

    const normalizedMessageStore = {};
    Object.entries(messagesStore).forEach(([conversationId, entries]) => {
      normalizedMessageStore[conversationId] = (entries || []).map((entry) => ({
        id: entry.id,
        senderId: entry.senderId,
        receiverId: entry.receiverId,
        content: entry.message,
        timestamp: entry.timestamp,
        read: entry.read,
        conversationId
      }));
    });

    setConversations(mappedConversations);
    setMessagesByConversation(normalizedMessageStore);
    setSelectedConversation((prev) => {
      if (prev && mappedConversations.some((conversation) => conversation.id === prev)) {
        return prev;
      }
      return mappedConversations[0]?.id || null;
    });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !isVerified) {
        setConversations([]);
        setMessagesByConversation({});
        setSelectedConversation(null);
        return;
      }

      try {
        setMessagesLoading(true);
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
        setMessagesLoading(false);
      }
    };

    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl, isVerified, token, user]);

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

      if (typingTimeoutRef.current[conversationId]) {
        clearTimeout(typingTimeoutRef.current[conversationId]);
      }

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

  const filteredConversations = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      return (
        conversation.guest.name.toLowerCase().includes(normalized)
        || conversation.property.toLowerCase().includes(normalized)
        || conversation.lastMessage.toLowerCase().includes(normalized)
      );
    });
  }, [conversations, searchTerm]);

  const selectedConversationData = useMemo(() => {
    return conversations.find((conversation) => conversation.id === selectedConversation) || null;
  }, [conversations, selectedConversation]);

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
        // Keep chat responsive if read sync fails.
      }
    };

    markIncomingAsRead();
  }, [apiBaseUrl, currentUserId, messages, selectedConversation, token]);

  const handleSendMessage = async () => {
    const outgoing = newMessage.trim();
    if (!outgoing || !selectedConversationData || !selectedConversationData.otherUserId) {
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
          receiverId: selectedConversationData.otherUserId,
          conversationId: selectedConversationData.conversationId,
          message: outgoing
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const payload = await response.json();
      const created = payload.messageData;

      setMessagesByConversation((prev) => ({
        ...prev,
        [created.conversationId]: [...(prev[created.conversationId] || []), {
          id: created.id,
          senderId: created.senderId,
          receiverId: created.receiverId,
          content: created.message,
          timestamp: created.timestamp,
          read: created.read,
          conversationId: created.conversationId
        }]
      }));

      setConversations((prev) => prev.map((conversation) => (
        conversation.id === selectedConversationData.id
          ? {
              ...conversation,
              lastMessage: created.message,
              timestamp: formatRelativeTimestamp(created.timestamp)
            }
          : conversation
      )));

      setNewMessage('');
      setError('');
    } catch (sendError) {
      setError(sendError.message || 'Failed to send message');
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (selectedConversationData && selectedConversationData.otherUserId && startTyping) {
      console.log('Sending typing:start event:', { conversationId: selectedConversation, recipientId: selectedConversationData.otherUserId });
      startTyping(selectedConversation, selectedConversationData.otherUserId);
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
            {conversations.length === 0 && !isVerified ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages available</h3>
                  <p className="text-gray-600 mb-6">Complete verification to start communicating with guests.</p>
                  <a
                    href="/host/verification"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center space-x-2 font-medium"
                  >
                    <span>Complete Verification</span>
                  </a>
                </div>
              </div>
            ) : messagesLoading ? (
              <div className="p-4 text-sm text-gray-500">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                  <p className="text-gray-600">Messages from your guests will appear here.</p>
                </div>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation === conversation.id ? 'bg-green-50 border-green-200' : ''
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
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversationData ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{selectedConversationData.guest.avatar}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedConversationData.guest.name}</h3>
                    <p className="text-sm text-gray-500">{selectedConversationData.property}</p>
                    <p className="text-xs text-gray-400">Last seen: {selectedConversationData.guest.lastSeen}</p>
                  </div>
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
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
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
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    onBlur={handleStopTyping}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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