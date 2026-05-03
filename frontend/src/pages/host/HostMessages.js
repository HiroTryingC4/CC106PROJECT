import React, { useEffect, useMemo, useState, useRef } from 'react';
import HostLayout from '../../components/common/HostLayout';
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  EllipsisVerticalIcon
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
  const [showConversationListOnMobile, setShowConversationListOnMobile] = useState(true);
  const typingTimeoutRef = useRef({});
  const messagesEndRef = useRef(null);

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

    // Listen for incoming messages in real-time
    const handleNewMessage = (data) => {
      console.log('Received new message:', data);
      const { conversationId, message } = data;
      
      // Add message to the conversation
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), {
          id: message.id,
          senderId: message.senderId,
          receiverId: message.receiverId,
          content: message.message,
          timestamp: message.timestamp,
          read: message.read,
          conversationId
        }]
      }));

      // Update conversation list
      setConversations((prev) => prev.map((conv) => 
        conv.conversationId === conversationId
          ? {
              ...conv,
              lastMessage: message.message,
              timestamp: formatRelativeTimestamp(message.timestamp),
              unread: message.senderId !== currentUserId ? (conv.unread || 0) + 1 : conv.unread
            }
          : conv
      ));
    };

    const unsubscribeStart = on('typing:start', handleTypingStart);
    const unsubscribeStop = on('typing:stop', handleTypingStop);
    const unsubscribeMessage = on('message:new', handleNewMessage);

    return () => {
      if (unsubscribeStart) unsubscribeStart();
      if (unsubscribeStop) unsubscribeStop();
      if (unsubscribeMessage) unsubscribeMessage();
      Object.values(typingTimeoutRef.current).forEach(clearTimeout);
    };
  }, [on, off, currentUserId]);

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

  useEffect(() => {
    if (selectedConversation && joinRoom) {
      joinRoom(`conversation:${selectedConversation}`);
    }
    
    return () => {
      if (selectedConversation && leaveRoom) {
        leaveRoom(`conversation:${selectedConversation}`);
      }
    };
  }, [selectedConversation, joinRoom, leaveRoom]);

  useEffect(() => {
    if (selectedConversation) {
      setShowConversationListOnMobile(false);
    }
  }, [selectedConversation]);

  const messages = useMemo(() => {
    if (!selectedConversation) {
      return [];
    }
    const msgs = messagesByConversation[selectedConversation] || [];
    // Sort messages by timestamp to show oldest first, newest at bottom
    return [...msgs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [messagesByConversation, selectedConversation]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

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

      // Only update conversation metadata, not messages (WebSocket will handle that)
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
      startTyping(selectedConversation, selectedConversationData.otherUserId);
    }
  };

  const handleStopTyping = () => {
    if (selectedConversation && stopTyping) {
      stopTyping(selectedConversation);
    }
  };

  const isOtherUserTyping = selectedConversation && typingUsers[selectedConversation];

  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom(), 100);
    return () => clearTimeout(timer);
  }, [messages, isOtherUserTyping]);

  const ConversationList = () => (
    <div className={`border-gray-200 border-b md:border-b-0 md:border-r flex-col ${showConversationListOnMobile ? 'flex' : 'hidden'} md:flex md:w-80 lg:w-[34%]`}>
      <div className="p-4 sm:p-5 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
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

      <div className="flex-1 overflow-y-auto max-h-[50vh] md:max-h-none">
        {conversations.length === 0 && !isVerified ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages available</h3>
              <p className="text-gray-600 mb-6">Complete verification to start communicating with guests.</p>
              <a
                href="/host/verification"
                className="text-white px-6 py-3 rounded-lg hover:opacity-90 inline-flex items-center space-x-2 font-medium"
                style={{ backgroundColor: '#4E7B22' }}
              >
                <span>Complete Verification</span>
              </a>
            </div>
          </div>
        ) : messagesLoading ? (
          <div className="p-4 text-sm text-gray-500">Loading conversations...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No conversations yet.</div>
        ) : (
          filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => {
                setSelectedConversation(conversation.id);
                setShowConversationListOnMobile(false);
              }}
              className={`w-full text-left p-4 sm:p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversation === conversation.id ? 'border-l-4' : ''
              }`}
              style={selectedConversation === conversation.id ? {
                backgroundColor: '#f0f9f0',
                borderLeftColor: '#4E7B22'
              } : {}}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: '#4E7B22' }}>
                  {conversation.guest.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{conversation.guest.name}</h3>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                      {conversation.unread > 0 && (
                        <span className="text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center" style={{ backgroundColor: '#4E7B22' }}>
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 truncate">{conversation.property}</p>
                  <p className="text-sm text-gray-600 mt-1 truncate">{conversation.lastMessage}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  const ChatPane = () => (
    <div className={`flex-1 flex flex-col min-w-0 h-full ${showConversationListOnMobile ? 'hidden md:flex' : 'flex'}`}>
      {selectedConversationData ? (
        <>
          <div className="md:hidden shrink-0 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                onClick={() => setShowConversationListOnMobile(true)}
                className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                aria-label="Back to conversations"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium text-white" style={{ backgroundColor: '#4E7B22' }}>
                  {selectedConversationData.guest.avatar}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-gray-900">{selectedConversationData.guest.name}</h3>
                  <p className="truncate text-xs text-gray-500">{selectedConversationData.property}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:block shrink-0 p-4 sm:p-5 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex justify-between items-center gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0" style={{ backgroundColor: '#4E7B22' }}>
                  {selectedConversationData.guest.avatar}
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{selectedConversationData.guest.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{selectedConversationData.property}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
                <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gray-50" style={{ scrollBehavior: 'smooth' }}>
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-4 py-2 rounded-2xl break-words shadow-sm ${
                    message.senderId === currentUserId ? 'text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                  style={message.senderId === currentUserId ? { backgroundColor: '#4E7B22' } : {}}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.senderId === currentUserId ? 'text-green-100' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isOtherUserTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} style={{ height: '1px' }} />
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-white p-4 sm:p-5">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                onBlur={handleStopTyping}
                placeholder="Type your message..."
                className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
                className="text-white p-2 rounded-lg hover:opacity-90 flex-shrink-0"
                style={{ backgroundColor: '#4E7B22' }}
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-600">Choose a conversation from the list to start messaging with your guests</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <HostLayout>
      <div className="h-[calc(100vh-200px)] min-h-[560px] bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="flex h-full min-h-0 flex-col md:flex-row">
          <ConversationList />
          <ChatPane />
        </div>
      </div>
    </HostLayout>
  );
};

export default HostMessages;