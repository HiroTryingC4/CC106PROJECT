# WebSocket Real-Time Communication Guide

## Overview
SmartStay now includes WebSocket support for real-time bidirectional communication between clients and server using Socket.IO.

## Architecture

### Backend (Socket.IO Server)
- **Location**: `backend/websocket.js`
- **Integration**: `backend/server.js`
- **Port**: Same as Express server (5000)
- **Transport**: WebSocket with polling fallback

### Frontend (Socket.IO Client)
- **Context**: `frontend/src/contexts/WebSocketContext.js`
- **Component**: `frontend/src/components/common/RealtimeNotifications.js`
- **Integration**: Wrapped in App.js

## Features Implemented

### 1. User Authentication
- Automatic authentication on connection
- User-socket mapping for targeted messaging
- Online/offline status tracking

### 2. Real-Time Messaging
- Instant message delivery
- Typing indicators
- Read receipts support
- Conversation rooms

### 3. Booking Notifications
- Real-time booking status updates
- Notifications to both host and guest
- Instant confirmation alerts

### 4. Property Updates
- Live property availability changes
- Price updates
- Property status changes

### 5. User Presence
- Online/offline status
- Active users list
- Connection state management

## Backend API

### WebSocket Events

#### Client → Server

**authenticate**
```javascript
socket.emit('authenticate', {
  userId: 123,
  token: 'user_token'
});
```

**join:room**
```javascript
socket.emit('join:room', 'conversation:456');
```

**leave:room**
```javascript
socket.emit('leave:room', 'conversation:456');
```

**message:send**
```javascript
socket.emit('message:send', {
  conversationId: 456,
  message: 'Hello!',
  recipientId: 789
});
```

**typing:start**
```javascript
socket.emit('typing:start', {
  conversationId: 456,
  recipientId: 789
});
```

**typing:stop**
```javascript
socket.emit('typing:stop', {
  conversationId: 456
});
```

**booking:update**
```javascript
socket.emit('booking:update', {
  bookingId: 123,
  hostId: 456,
  guestId: 789,
  status: 'confirmed'
});
```

**property:update**
```javascript
socket.emit('property:update', {
  propertyId: 123,
  hostId: 456
});
```

#### Server → Client

**authenticated**
```javascript
socket.on('authenticated', (data) => {
  console.log('Authenticated:', data.userId);
});
```

**user:status**
```javascript
socket.on('user:status', (data) => {
  console.log(`User ${data.userId} is ${data.status}`);
});
```

**message:received**
```javascript
socket.on('message:received', (data) => {
  console.log('New message:', data.message);
});
```

**typing:indicator**
```javascript
socket.on('typing:indicator', (data) => {
  console.log(`User ${data.userId} is typing: ${data.isTyping}`);
});
```

**booking:notification**
```javascript
socket.on('booking:notification', (data) => {
  console.log('Booking update:', data);
});
```

**property:changed**
```javascript
socket.on('property:changed', (data) => {
  console.log('Property updated:', data.propertyId);
});
```

**notification**
```javascript
socket.on('notification', (notification) => {
  console.log('General notification:', notification);
});
```

## Frontend Usage

### Using WebSocket Context

```javascript
import { useWebSocket } from '../contexts/WebSocketContext';

function MyComponent() {
  const { 
    connected, 
    sendMessage, 
    joinRoom, 
    on,
    isUserOnline 
  } = useWebSocket();

  useEffect(() => {
    // Join a conversation room
    joinRoom('conversation:123');

    // Listen for messages
    const unsubscribe = on('message:received', (data) => {
      console.log('New message:', data);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [joinRoom, on]);

  const handleSendMessage = () => {
    sendMessage('conversation:123', 'Hello!', recipientId);
  };

  return (
    <div>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={handleSendMessage}>Send Message</button>
    </div>
  );
}
```

### Using Realtime Notifications Component

```javascript
import RealtimeNotifications from '../components/common/RealtimeNotifications';

function Navbar() {
  return (
    <nav>
      {/* Other nav items */}
      <RealtimeNotifications />
    </nav>
  );
}
```

## Server-Side Integration

### Sending Notifications from Routes

```javascript
// In any route handler
router.post('/bookings', async (req, res) => {
  // ... create booking logic ...
  
  const websocket = req.app.locals.websocket;
  
  // Send notification to host
  websocket.sendBookingUpdate(
    bookingId,
    hostId,
    guestId,
    'confirmed',
    bookingData
  );
  
  res.json({ success: true });
});
```

### Broadcasting Updates

```javascript
// Send to specific user
websocket.sendToUser(userId, 'notification', {
  message: 'Your booking is confirmed!'
});

// Send to room
websocket.sendToRoom('property:123', 'property:changed', {
  propertyId: 123,
  availability: false
});

// Broadcast to all
websocket.broadcast('system:announcement', {
  message: 'System maintenance in 1 hour'
});
```

## Room Naming Conventions

- **User rooms**: `user:{userId}`
- **Conversation rooms**: `conversation:{conversationId}`
- **Property rooms**: `property:{propertyId}`
- **Booking rooms**: `booking:{bookingId}`

## Connection Management

### Auto-Reconnection
- Enabled by default
- 5 reconnection attempts
- 1 second delay between attempts

### Connection States
- `connecting` - Initial connection
- `connected` - Successfully connected
- `disconnected` - Connection lost
- `reconnecting` - Attempting to reconnect

### Handling Disconnections

```javascript
const { connected } = useWebSocket();

useEffect(() => {
  if (!connected) {
    // Show offline indicator
    // Queue messages for later
  } else {
    // Sync queued messages
    // Update UI
  }
}, [connected]);
```

## Security Considerations

### Authentication
- Users must authenticate after connection
- Token validation on server
- Automatic disconnection for invalid tokens

### Authorization
- Room access control
- User-specific message filtering
- Rate limiting on events

### Data Validation
- All incoming data validated
- Sanitization of user input
- Maximum message size limits

## Performance Optimization

### Connection Pooling
- Reuse existing connections
- Automatic cleanup on disconnect
- Memory-efficient user mapping

### Event Throttling
- Typing indicators debounced
- Status updates batched
- Message queuing for offline users

### Scalability
- Horizontal scaling with Redis adapter (future)
- Load balancing support
- Session affinity configuration

## Testing WebSocket

### Manual Testing
1. Open browser console
2. Connect to server
3. Monitor WebSocket tab in DevTools
4. Send test events

### Automated Testing
```javascript
// Example test
import { io } from 'socket.io-client';

test('should receive message', (done) => {
  const socket = io('http://localhost:5000');
  
  socket.on('connect', () => {
    socket.emit('authenticate', { userId: 1 });
  });
  
  socket.on('message:received', (data) => {
    expect(data.message).toBeDefined();
    socket.disconnect();
    done();
  });
});
```

## Troubleshooting

### Connection Issues
- Check CORS configuration
- Verify server is running
- Check firewall settings
- Inspect browser console for errors

### Message Not Received
- Verify user is authenticated
- Check room membership
- Confirm event name spelling
- Validate data format

### Performance Issues
- Monitor connection count
- Check event frequency
- Review message size
- Optimize event handlers

## Migration from Polling

### Before (Polling)
```javascript
// Poll every 5 seconds
setInterval(() => {
  fetch('/api/messages')
    .then(res => res.json())
    .then(data => updateMessages(data));
}, 5000);
```

### After (WebSocket)
```javascript
// Real-time updates
const { on } = useWebSocket();

useEffect(() => {
  return on('message:received', (data) => {
    updateMessages(data);
  });
}, [on]);
```

### Benefits
- ✅ Instant updates (no delay)
- ✅ Reduced server load (no polling)
- ✅ Lower bandwidth usage
- ✅ Better user experience
- ✅ Bidirectional communication

## Future Enhancements

### Planned Features
- [ ] Redis adapter for multi-server scaling
- [ ] Message persistence and replay
- [ ] Voice/video call signaling
- [ ] File transfer support
- [ ] Presence channels
- [ ] Private encrypted channels
- [ ] Message reactions
- [ ] Delivery receipts

### Integration Ideas
- Real-time analytics dashboard
- Live property availability map
- Collaborative booking calendar
- Admin monitoring console
- Customer support chat

## Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [React Context API](https://react.dev/reference/react/useContext)

## Support

For WebSocket-related issues:
1. Check server logs for connection errors
2. Verify client console for event errors
3. Test with Socket.IO admin UI
4. Review this documentation

---

**Status**: Production Ready ✅
**Version**: 1.0.0
**Last Updated**: 2024
