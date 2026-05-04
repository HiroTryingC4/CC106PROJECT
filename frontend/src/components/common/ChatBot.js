import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import API_CONFIG from '../../config/api';

const ChatBot = ({ isOpen, onClose, userRole = 'guest' }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [sessionId, setSessionId] = useState(() => {
    const existing = localStorage.getItem('smartstay_chat_session_id');
    return existing || '';
  });
  const messagesEndRef = useRef(null);
  const apiBaseUrl = API_CONFIG.BASE_URL;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadHistory = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const query = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
        const response = await fetch(`${apiBaseUrl}/chat/history${query}`, {
          method: 'GET',
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!response.ok) {
          throw new Error('Failed to load chat history');
        }

        const data = await response.json();

        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId);
          localStorage.setItem('smartstay_chat_session_id', data.sessionId);
        }

        const mappedMessages = (data.messages || []).map((entry) => ({
          id: entry.id,
          text: entry.text,
          sender: entry.sender === 'assistant' || entry.sender === 'bot' ? 'bot' 
                : entry.sender === 'admin' ? 'admin'
                : 'user',
          timestamp: new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        if (mappedMessages.length > 0) {
          setMessages(mappedMessages);
          return;
        }

        setMessages([
          {
            id: Date.now(),
            text: "Hello! I'm your Smart Stay assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } catch (error) {
        setMessages([
          {
            id: Date.now(),
            text: "Hello! I'm your Smart Stay assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    };

    loadHistory();
  }, [apiBaseUrl, isOpen, sessionId]);

  const handleSendMessage = async (messageText = null) => {
    const outgoingMessage = messageText ? messageText.trim() : inputMessage.trim();
    if (!outgoingMessage) return;

    const userMessage = {
      id: Date.now(),
      text: outgoingMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) setInputMessage('');
    setIsTyping(true);

    // Add delay for quick actions to feel more natural
    if (messageText) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');

      const response = await fetch(`${apiBaseUrl}/chat/message`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          sessionId,
          roleHint: user?.role || 'guest',
          message: outgoingMessage
        })
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const data = await response.json();

      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem('smartstay_chat_session_id', data.sessionId);
      }

      const botMessage = {
        id: data.assistantMessage?.id || Date.now() + 1,
        text: data.assistantMessage?.text || 'Thanks for your message. I am here to help.',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
      setShowQuickActions(true);
    } catch (error) {
      const fallbackMessage = {
        id: Date.now() + 1,
        text: 'I am having trouble connecting right now. Please try again in a moment.',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, fallbackMessage]);
      setShowQuickActions(true);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-25"
        onClick={onClose}
      ></div>

      {/* Chat Window — full screen on mobile, floating on desktop */}
      <div className="relative w-full h-full sm:w-96 sm:h-[600px] sm:rounded-t-2xl bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 text-white flex items-center justify-between flex-shrink-0" style={{backgroundColor: '#4E7B22'}}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Smart Stay Assistant</h3>
              <p className="text-sm text-white text-opacity-80">Online</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender === 'user'
                  ? 'text-white'
                  : message.sender === 'admin'
                  ? 'bg-green-100 text-green-900 border border-green-300'
                  : 'bg-white text-gray-800 shadow-sm'
              }`}
              style={message.sender === 'user' ? {backgroundColor: '#4E7B22'} : {}}
              >
                {message.sender === 'admin' && (
                  <p className="text-xs font-semibold text-green-700 mb-1">Support Agent</p>
                )}
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-white text-opacity-70' : 'text-gray-500'
                }`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-2 rounded-2xl shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {showQuickActions && messages.length > 0 && !isTyping && (
            <div className="flex flex-col space-y-2">
              <p className="text-xs text-gray-500 text-center mb-2">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                {userRole === 'guest' ? (
                  <>
                    <button
                      onClick={() => handleSendMessage('Check my bookings')}
                      className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium shadow-sm border border-gray-200 transition-colors"
                    >
                      📅 My Bookings
                    </button>
                    <button
                      onClick={() => handleSendMessage('View payment status')}
                      className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium shadow-sm border border-gray-200 transition-colors"
                    >
                      💳 Payments
                    </button>
                    <button
                      onClick={() => handleSendMessage('Browse properties')}
                      className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium shadow-sm border border-gray-200 transition-colors"
                    >
                      🏠 Properties
                    </button>
                    <button
                      onClick={() => handleSendMessage('Get support')}
                      className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium shadow-sm border border-gray-200 transition-colors"
                    >
                      💬 Support
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleSendMessage('Check my properties')}
                      className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium shadow-sm border border-gray-200 transition-colors"
                    >
                      🏠 My Properties
                    </button>
                    <button
                      onClick={() => handleSendMessage('View bookings')}
                      className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium shadow-sm border border-gray-200 transition-colors"
                    >
                      📅 Bookings
                    </button>
                    <button
                      onClick={() => handleSendMessage('Check payouts')}
                      className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium shadow-sm border border-gray-200 transition-colors"
                    >
                      💰 Payouts
                    </button>
                    <button
                      onClick={() => handleSendMessage('Verification status')}
                      className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium shadow-sm border border-gray-200 transition-colors"
                    >
                      ✓ Verification
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input Area */}
        <div className="p-4" style={{backgroundColor: '#F8FFD3'}}>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message ..."
              className="flex-1 px-4 py-3 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{backgroundColor: '#4E7B22'}}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;