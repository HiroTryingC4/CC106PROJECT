import React, { useState, useEffect, useRef } from 'react';
import CommunicationAdminLayout from '../../components/common/CommunicationAdminLayout';
import {
  ChatBubbleLeftRightIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import API_CONFIG from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

const CommunicationAdminLiveChat = () => {
  const { token } = useAuth();
  const [activeSessions, setActiveSessions] = useState([]);
  const [escalatedSessions, setEscalatedSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminMessage, setAdminMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('all');
  const messagesEndRef = useRef(null);

  const filteredSessions = activeSessions.filter(s => {
    if (filter === 'active') return !s.resolved;
    if (filter === 'resolved') return s.resolved;
    if (filter === 'escalated') return s.escalated;
    return true;
  });

  useEffect(() => {
    fetchActiveSessions();
    fetchEscalatedSessions();
    
    // Refresh every 10 seconds
    const interval = setInterval(() => {
      fetchActiveSessions();
      fetchEscalatedSessions();
      if (selectedSession) {
        fetchSessionDetails(selectedSession);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [sessionDetails]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchActiveSessions = async () => {
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/comm-admin/chatbot/active-sessions`, {
        credentials: 'include',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setActiveSessions(data);
      }
    } catch (error) {
      console.error('Error fetching active sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEscalatedSessions = async () => {
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/comm-admin/chatbot/escalated`, {
        credentials: 'include',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setEscalatedSessions(data);
      }
    } catch (error) {
      console.error('Error fetching escalated sessions:', error);
    }
  };

  const fetchSessionDetails = async (sessionId) => {
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/comm-admin/chatbot/session/${sessionId}`, {
        credentials: 'include',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setSessionDetails(data);
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
    }
  };

  const handleViewSession = (sessionId) => {
    setSelectedSession(sessionId);
    fetchSessionDetails(sessionId);
  };

  const handleJoinSession = async (sessionId) => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/comm-admin/chatbot/join-session`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ sessionId })
      });

      if (response.ok) {
        fetchSessionDetails(sessionId);
      }
    } catch (error) {
      console.error('Error joining session:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!adminMessage.trim() || !selectedSession) return;

    setSending(true);
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/comm-admin/chatbot/send-message`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          sessionId: selectedSession,
          message: adminMessage
        })
      });

      if (response.ok) {
        setAdminMessage('');
        fetchSessionDetails(selectedSession);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleResolveSession = async (sessionId, resolved) => {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/comm-admin/chatbot/session/${sessionId}/resolve`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({ resolved, notes: '' })
      });

      if (response.ok) {
        fetchActiveSessions();
        fetchEscalatedSessions();
        if (selectedSession === sessionId) {
          setSelectedSession(null);
          setSessionDetails(null);
        }
      }
    } catch (error) {
      console.error('Error resolving session:', error);
    }
  };

  const getSenderColor = (sender) => {
    switch (sender) {
      case 'user': return 'bg-blue-100 text-blue-900';
      case 'bot': return 'bg-gray-100 text-gray-900';
      case 'admin': return 'bg-green-100 text-green-900';
      default: return 'bg-gray-100 text-gray-900';
    }
  };

  return (
    <CommunicationAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Live Chat Monitoring</h2>
          <p className="text-gray-600 mt-2">Monitor and manage active chatbot conversations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Active Sessions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Conversations</h3>
                <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                  {filteredSessions.length}
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
                {['all', 'active', 'resolved', 'escalated'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                      filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <div
                      key={session.sessionId}
                      onClick={() => handleViewSession(session.sessionId)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-green-300 ${
                        selectedSession === session.sessionId ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900 truncate max-w-[140px]">{session.userEmail}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {session.escalated && <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            session.resolved ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {session.resolved ? 'Resolved' : 'Active'}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 truncate">{session.lastMessage || 'No messages'}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{session.messageCount} messages</span>
                        <span>{session.timeAgo}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No conversations found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            {selectedSession && sessionDetails ? (
              <div className="bg-white rounded-lg shadow-sm flex flex-col h-[600px]">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {sessionDetails.session.user_email}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Session ID: {sessionDetails.session.session_id}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!sessionDetails.session.admin_joined && (
                      <button
                        onClick={() => handleJoinSession(selectedSession)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Join Chat
                      </button>
                    )}
                    <button
                      onClick={() => handleResolveSession(selectedSession, true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSession(null);
                        setSessionDetails(null);
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                  {sessionDetails.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-md px-4 py-2 rounded-lg ${getSenderColor(message.sender)}`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium capitalize">{message.sender}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                {sessionDetails.session.admin_joined && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={adminMessage}
                        onChange={(e) => setAdminMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!adminMessage.trim() || sending}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PaperAirplaneIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm h-[600px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Select a chat to view conversation</p>
                  <p className="text-sm mt-2">Choose from active or escalated chats</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </CommunicationAdminLayout>
  );
};

export default CommunicationAdminLiveChat;
