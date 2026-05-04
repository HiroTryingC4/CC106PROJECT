import React, { useState } from 'react';
import ChatBot from './ChatBot';
import { useAuth } from '../../contexts/AuthContext';

const ChatButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      {/* Floating Chat Button - hidden on mobile to avoid overlap with bottom nav */}
      <div className="hidden sm:fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setIsChatOpen((prev) => !prev)}
          className="text-white p-4 rounded-full shadow-lg hover:opacity-90 flex items-center space-x-2 transition-all hover:scale-105" 
          style={{backgroundColor: '#4E7B22'}}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="font-medium">{isChatOpen ? 'Close' : 'Chat'}</span>
        </button>
      </div>

      {/* ChatBot Modal */}
      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} userRole={user?.role || 'guest'} />
    </>
  );
};

export default ChatButton;