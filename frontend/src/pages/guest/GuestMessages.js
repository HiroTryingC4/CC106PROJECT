import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import {
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  ChatBubbleLeftRightIcon
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [showConversationListOnMobile, setShowConversationListOnMobile] = useState(true);
  const typingTimeoutRef = useRef({});
  const messagesEndRef = useRef(null);

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
    return propertyId ? `conv_p_${propertyId}_${pair}` : `conv_u_${pair}`;
  };

  const initializeConversations = (payload) => {
    const summaries = payload.conversationSummaries || [];
    const messagesStore = payload.conversations || {};

    const mappedConversations = summaries.map((summary) => {
      const fullName = summary.otherUser?.fullName?.trim() || summary.otherUser?.email || `User #${summary.otherUserId}`;
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

  useEffect(() => {
    if (!on || !off) return;

    const handleTypingStart = (data) => {
      const { conversationId, userId } = data;
      setTypingUsers((prev) => ({ ...prev, [conversationId]: userId }));

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

    const handleNewMessage = (data) => {
      const { conversationId, message } = data;

      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: [
          ...(prev[conversationId] || []),
          {
            id: message.id,
            senderId: message.senderId,
            receiverId: message.receiverId,
            message: message.message,
            timestamp: message.timestamp,
            read: message.read,
            conversationId
          }
        ]
      }));

      setConversations((prev) => prev.map((conv) => (
        conv.conversationId === conversationId
          ? {
              ...conv,
              lastMessage: message.message,
              timestamp: formatRelativeTimestamp(message.timestamp),
              unread: message.senderId !== currentUserId ? (conv.unread || 0) + 1 : conv.unread
            }
          : conv
      )));
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

  const selectedConv = conversations.find((conversation) => conversation.id === selectedConversation) || null;

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
    if (!selectedConversation) return [];
    const msgs = messagesByConversation[selectedConversation] || [];
    return [...msgs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [messagesByConversation, selectedConversation]);

  const filteredConversations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return conversations;

    return conversations.filter((conversation) => (
      conversation.hostName.toLowerCase().includes(normalizedSearch)
      || conversation.propertyName.toLowerCase().includes(normalizedSearch)
      || conversation.lastMessage.toLowerCase().includes(normalizedSearch)
    ));
  }, [conversations, searchTerm]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const appendLocalMessage = (conversationId, recipientId, text) => {
    const now = new Date().toISOString();
    const localMessage = {
      id: `local-${Date.now()}`,
      senderId: currentUserId,
      receiverId: recipientId,
      message: text,
      timestamp: now,
      read: true,
      conversationId
    };

    setMessagesByConversation((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), localMessage]
    }));

    setConversations((prev) => prev.map((conversation) => (
      conversation.id === selectedConversation
        ? {
            ...conversation,
            lastMessage: text,
            timestamp: formatRelativeTimestamp(now),
            unread: 0
          }
        : conversation
    )));
  };

  useEffect(() => {
    const markIncomingAsRead = async () => {
      if (!selectedConversation || !currentUserId) return;

      const unreadIncoming = messages.filter((entry) => !entry.read && entry.senderId !== currentUserId);
      if (unreadIncoming.length === 0) return;

      try {
        await Promise.all(
          unreadIncoming.map((entry) => fetch(`${apiBaseUrl}/users/messages/${entry.id}/read`, {
            method: 'PUT',
            credentials: 'include',
            headers: getAuthHeaders()
          }))
        );

        setMessagesByConversation((prev) => ({
          ...prev,
          [selectedConversation]: (prev[selectedConversation] || []).map((entry) => ({ ...entry, read: true }))
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
    if (!outgoing || !selectedConv || !selectedConv.otherUserId) return;

    setError('');

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

      setConversations((prev) => prev.map((conversation) => {
        if (conversation.id !== selectedConv.id) return conversation;
        return {
          ...conversation,
          id: conversationId,
          conversationId,
          isDraft: false,
          lastMessage: created.message,
          timestamp: formatRelativeTimestamp(created.timestamp)
        };
      }));

      if (selectedConv.isDraft) {
        setSelectedConversation(conversationId);
      }

      setNewMessage('');
    } catch (sendError) {
      appendLocalMessage(selectedConv.conversationId || selectedConversation, selectedConv.otherUserId, outgoing);
      setNewMessage('');
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (selectedConv && selectedConv.otherUserId && startTyping) {
      startTyping(selectedConversation, selectedConv.otherUserId);
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
        {loading && <div className="p-4 text-sm text-gray-500">Loading conversations...</div>}

        {!loading && filteredConversations.length === 0 && (
          <div className="p-4 text-sm text-gray-500">No conversations yet.</div>
        )}

        {filteredConversations.map((conversation) => (
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
                {conversation.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{conversation.hostName}</h3>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                    {conversation.unread > 0 && (
                      <span className="text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center" style={{ backgroundColor: '#4E7B22' }}>
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1 truncate">{conversation.propertyName}</p>
                <p className="text-sm text-gray-600 mt-1 truncate">{conversation.lastMessage}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const ChatPane = () => (
    <div className={`flex-1 flex flex-col min-w-0 h-full ${showConversationListOnMobile ? 'hidden md:flex' : 'flex'}`}>
      {selectedConv ? (
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
                  {selectedConv.avatar}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-gray-900">{selectedConv.hostName}</h3>
                  <p className="truncate text-xs text-gray-500">{selectedConv.propertyName}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:block shrink-0 p-4 sm:p-5 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex justify-between items-center gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <button
                  onClick={() => setShowConversationListOnMobile(true)}
                  className="md:hidden p-2 -ml-1 rounded-lg hover:bg-gray-100 flex-shrink-0"
                  aria-label="Back to conversations"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0" style={{ backgroundColor: '#4E7B22' }}>
                  {selectedConv.avatar}
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{selectedConv.hostName}</h3>
                  <p className="text-sm text-gray-600 truncate">{selectedConv.propertyName}</p>
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
                  <p className="text-sm break-words">{message.message}</p>
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
            <p className="text-gray-600">Choose a conversation from the list to start messaging a host</p>
            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="mt-4 px-4 py-2 text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: '#4E7B22' }}
              >
                Login to Message Hosts
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <GuestLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Chat with your hosts</p>
        </div>
        <div className="h-[calc(100vh-280px)] min-h-[560px] bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="flex h-full min-h-0 flex-col md:flex-row">
            <ConversationList />
            <ChatPane />
          </div>
        </div>
      </div>
    </GuestLayout>
  );
};

export default GuestMessages;
