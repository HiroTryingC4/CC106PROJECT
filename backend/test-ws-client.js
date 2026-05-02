const { io } = require('socket.io-client');

const socket = io('http://localhost:5000', {
  path: '/socket.io/',
  transports: ['polling', 'websocket'],
  reconnection: true,
  timeout: 20000
});

socket.on('connect', () => {
  console.log('Connected ✅ Socket ID:', socket.id);
  socket.emit('authenticate', { userId: 999, token: 'test' });
});

socket.on('authenticated', (data) => {
  console.log('Authenticated:', data);
});

socket.on('connect_error', (err) => {
  console.error('connect_error:', err.message || err);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('error', (err) => {
  console.error('Socket error:', err);
});

// Exit after 15 seconds
setTimeout(() => {
  console.log('Closing client');
  socket.close();
  process.exit(0);
}, 15000);
