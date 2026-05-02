# WebSocket Troubleshooting Guide

## Error: "Invalid namespace"

This error occurs when the Socket.IO client tries to connect but the server hasn't been restarted with WebSocket support.

### Solution

**Step 1: Stop the backend server**
- Press `Ctrl+C` in the terminal running the backend
- Or close the terminal window
- Or run: `taskkill /F /IM node.exe` (Windows)

**Step 2: Restart the backend**
```bash
cd backend
npm start
```

**Step 3: Verify WebSocket is running**
Look for these messages in the console:
```
PostgreSQL connected successfully
Server running on port 5000
API Documentation available at http://localhost:5000/api-docs
WebSocket server ready
```

**Step 4: Restart the frontend**
```bash
cd frontend
npm start
```

**Step 5: Test the connection**
1. Open browser console (F12)
2. Login to the app
3. Look for: `WebSocket connected: <socket-id>`
4. Look for: `WebSocket authenticated: {userId: ...}`

## Common Issues

### Issue 1: Connection Error
**Symptom**: `WebSocket connection error: TransportError`

**Solution**:
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify no firewall blocking

### Issue 2: Authentication Failed
**Symptom**: Connected but not authenticated

**Solution**:
- Ensure user is logged in
- Check token is valid
- Verify userId is being sent

### Issue 3: Events Not Received
**Symptom**: Connected but no events

**Solution**:
- Check event names match exactly
- Verify room membership
- Check server logs for errors

### Issue 4: Disconnects Frequently
**Symptom**: Connects then disconnects

**Solution**:
- Check network stability
- Increase pingTimeout in server config
- Check for server errors

## Verification Checklist

✅ Backend server restarted after WebSocket changes
✅ Console shows "WebSocket server ready"
✅ Frontend shows "WebSocket connected"
✅ Green dot appears on notification bell
✅ No errors in browser console
✅ No errors in server console

## Manual Test

### Test 1: Connection
```javascript
// In browser console
const socket = io('http://localhost:5000');
socket.on('connect', () => console.log('Connected!'));
```

### Test 2: Authentication
```javascript
socket.emit('authenticate', { userId: 1, token: 'test' });
socket.on('authenticated', (data) => console.log('Auth:', data));
```

### Test 3: Room Join
```javascript
socket.emit('join:room', 'test-room');
socket.on('joined:room', (data) => console.log('Joined:', data));
```

## Debug Mode

Enable detailed logging:

**Backend** (`websocket.js`):
```javascript
this.io.on('connection', (socket) => {
  console.log('=== NEW CONNECTION ===');
  console.log('Socket ID:', socket.id);
  console.log('Transport:', socket.conn.transport.name);
  // ... rest of code
});
```

**Frontend** (`WebSocketContext.js`):
```javascript
newSocket.on('connect', () => {
  console.log('=== CONNECTED ===');
  console.log('Socket ID:', newSocket.id);
  console.log('Connected:', newSocket.connected);
});
```

## Environment Variables

Ensure these are set correctly:

**Backend** (`.env`):
```
PORT=5000
```

**Frontend** (`.env`):
```
REACT_APP_API_URL=http://localhost:5000
```

## Port Conflicts

If port 5000 is in use:

**Option 1**: Kill the process
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**Option 2**: Use different port
```javascript
// backend/server.js
const PORT = process.env.PORT || 5001;

// frontend/.env
REACT_APP_API_URL=http://localhost:5001
```

## Still Not Working?

1. Clear browser cache and cookies
2. Try incognito/private mode
3. Check browser console for CORS errors
4. Verify Socket.IO versions match (4.7.2)
5. Test with different browser
6. Check antivirus/firewall settings

## Success Indicators

When working correctly, you should see:

**Backend Console**:
```
WebSocket service initialized
Client connected: abc123
User 1 authenticated on socket abc123
```

**Frontend Console**:
```
WebSocket connected: abc123
WebSocket authenticated: {userId: 1, socketId: "abc123"}
```

**UI**:
- Green dot on notification bell
- "Online" status indicator
- Real-time notifications appear

## Need Help?

If still having issues:
1. Check server logs for errors
2. Check browser console for errors
3. Verify all files were saved
4. Ensure npm install completed
5. Try restarting computer (clears all processes)
