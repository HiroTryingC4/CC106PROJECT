import React from 'react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useAuth } from '../../contexts/AuthContext';

const WebSocketTestPanel = () => {
  const { connected, socket, addNotification } = useWebSocket();
  const { user } = useAuth();

  const triggerDirectNotification = () => {
    if (addNotification) {
      addNotification({
        type: 'booking',
        title: 'Test Booking Notification',
        message: `Booking #${Math.floor(Math.random() * 1000)} has been confirmed!`
      });
      console.log('Direct notification added');
    }
  };

  const triggerBookingNotification = () => {
    if (socket && connected && user) {
      socket.emit('booking:update', {
        bookingId: Math.floor(Math.random() * 1000),
        hostId: user.id,
        guestId: user.id,
        status: 'confirmed'
      });
      console.log('Booking notification triggered');
    }
  };

  const triggerPropertyUpdate = () => {
    if (socket && connected && user) {
      socket.emit('property:update', {
        propertyId: Math.floor(Math.random() * 1000),
        hostId: user.id
      });
      console.log('Property update triggered');
    }
  };

  const triggerMessage = () => {
    if (socket && connected && user) {
      socket.emit('message:send', {
        conversationId: Math.floor(Math.random() * 1000),
        message: 'Test message from WebSocket!',
        recipientId: user.id
      });
      console.log('Message triggered');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border-2 border-blue-500 z-50">
      <div className="mb-3">
        <h3 className="font-bold text-lg mb-1">WebSocket Test Panel</h3>
        <p className="text-sm text-gray-600">
          Status: <span className={connected ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {connected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={triggerDirectNotification}
          disabled={!connected}
          className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-semibold"
        >
          ⚡ Direct Test (Instant)
        </button>

        <button
          onClick={triggerBookingNotification}
          disabled={!connected}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          📅 Test Booking
        </button>

        <button
          onClick={triggerPropertyUpdate}
          disabled={!connected}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          🏠 Test Property
        </button>

        <button
          onClick={triggerMessage}
          disabled={!connected}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          💬 Test Message
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Use "Direct Test" for instant results
      </p>
    </div>
  );
};

export default WebSocketTestPanel;
