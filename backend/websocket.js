const { Server } = require('socket.io');

class WebSocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> socketId
    this.socketUsers = new Map(); // socketId -> userId
  }

  initialize(server, allowedOrigins) {
    this.io = new Server(server, {
      path: '/socket.io/',
      cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST']
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling'],
      allowEIO3: true
    });

    this.setupEventHandlers();
    console.log('WebSocket service initialized');
    console.log('Allowed origins:', allowedOrigins);
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', (data) => {
        const { userId, token } = data;
        
        if (userId) {
          // Store user-socket mapping
          this.userSockets.set(userId, socket.id);
          this.socketUsers.set(socket.id, userId);
          
          socket.userId = userId;
          socket.join(`user:${userId}`);
          
          console.log(`User ${userId} authenticated on socket ${socket.id}`);
          
          // Notify user they're connected
          socket.emit('authenticated', { userId, socketId: socket.id });
          
          // Broadcast user online status
          this.broadcastUserStatus(userId, 'online');
        }
      });

      // Handle joining rooms
      socket.on('join:room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room: ${roomId}`);
        socket.emit('joined:room', { roomId });
      });

      // Handle leaving rooms
      socket.on('leave:room', (roomId) => {
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left room: ${roomId}`);
        socket.emit('left:room', { roomId });
      });

      // Handle chat messages
      socket.on('message:send', (data) => {
        const { conversationId, message, recipientId } = data;
        
        // Emit to conversation room
        this.io.to(`conversation:${conversationId}`).emit('message:received', {
          conversationId,
          message,
          senderId: socket.userId,
          timestamp: new Date().toISOString()
        });

        // Also send directly to recipient if online
        if (recipientId) {
          this.sendToUser(recipientId, 'message:notification', {
            conversationId,
            message,
            senderId: socket.userId
          });
        }
      });

      // Handle typing indicators
      socket.on('typing:start', (data) => {
        const { conversationId, recipientId } = data;
        
        // Send to conversation room
        socket.to(`conversation:${conversationId}`).emit('typing:start', {
          userId: socket.userId,
          conversationId
        });
        
        // Also send directly to recipient if specified
        if (recipientId) {
          this.sendToUser(recipientId, 'typing:start', {
            userId: socket.userId,
            conversationId
          });
        }
      });

      socket.on('typing:stop', (data) => {
        const { conversationId, recipientId } = data;
        
        // Send to conversation room
        socket.to(`conversation:${conversationId}`).emit('typing:stop', {
          userId: socket.userId,
          conversationId
        });
        
        // Also send directly to recipient if specified
        if (recipientId) {
          this.sendToUser(recipientId, 'typing:stop', {
            userId: socket.userId,
            conversationId
          });
        }
      });

      // Handle booking notifications
      socket.on('booking:update', (data) => {
        const { bookingId, hostId, guestId, status } = data;
        
        // Notify host
        if (hostId) {
          this.sendToUser(hostId, 'booking:notification', {
            bookingId,
            status,
            type: 'update',
            timestamp: new Date().toISOString()
          });
        }
        
        // Notify guest
        if (guestId) {
          this.sendToUser(guestId, 'booking:notification', {
            bookingId,
            status,
            type: 'update',
            timestamp: new Date().toISOString()
          });
        }
      });

      // Handle property updates
      socket.on('property:update', (data) => {
        const { propertyId, hostId } = data;
        
        // Broadcast to all users watching this property
        this.io.to(`property:${propertyId}`).emit('property:changed', {
          propertyId,
          timestamp: new Date().toISOString()
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        
        const userId = this.socketUsers.get(socket.id);
        if (userId) {
          this.userSockets.delete(userId);
          this.socketUsers.delete(socket.id);
          
          // Broadcast user offline status
          this.broadcastUserStatus(userId, 'offline');
        }
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });
  }

  // Send message to specific user
  sendToUser(userId, event, data) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      console.log(`Sending ${event} to user ${userId} (socket ${socketId}):`, data);
      this.io.to(socketId).emit(event, data);
      return true;
    }
    console.log(`User ${userId} not connected, cannot send ${event}`);
    return false;
  }

  // Send message to room
  sendToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }

  // Broadcast to all connected clients
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  // Broadcast user status
  broadcastUserStatus(userId, status) {
    this.io.emit('user:status', {
      userId,
      status,
      timestamp: new Date().toISOString()
    });
  }

  // Send notification to user
  sendNotification(userId, notification) {
    return this.sendToUser(userId, 'notification', notification);
  }

  // Send booking update
  sendBookingUpdate(bookingId, hostId, guestId, status, data) {
    const notification = {
      bookingId,
      status,
      data,
      timestamp: new Date().toISOString()
    };

    if (hostId) {
      this.sendToUser(hostId, 'booking:notification', notification);
    }
    if (guestId) {
      this.sendToUser(guestId, 'booking:notification', notification);
    }
  }

  // Send property update
  sendPropertyUpdate(propertyId, data) {
    this.sendToRoom(`property:${propertyId}`, 'property:changed', {
      propertyId,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.userSockets.size;
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.userSockets.has(userId);
  }

  // Get all online users
  getOnlineUsers() {
    return Array.from(this.userSockets.keys());
  }
}

// Export singleton instance
module.exports = new WebSocketService();
