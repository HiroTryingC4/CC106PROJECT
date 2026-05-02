# Typing Indicator Troubleshooting Guide

## Issue: Typing Animation Not Appearing

### Changes Made to Fix

1. **Backend WebSocket Events** - Fixed event names
   - Changed from `typing:indicator` to `typing:start` and `typing:stop`
   - Added direct user-to-user messaging (not just room-based)
   - Backend now sends to both conversation room AND directly to recipient

2. **Frontend Room Joining** - Added automatic room joining
   - Users now automatically join `conversation:${conversationId}` room when selecting a conversation
   - Users leave the room when switching conversations
   - This ensures they receive room-based events

3. **Added Debug Logging** - Console logs for troubleshooting
   - Logs when sending typing events
   - Logs when receiving typing events
   - Logs when joining/leaving conversation rooms

## How to Test

### Step 1: Open Browser Console
Open Developer Tools (F12) in both browser windows to see debug logs.

### Step 2: Login as Two Different Users
```
Window 1 (Incognito): Login as User A (e.g., guest)
Window 2 (Incognito): Login as User B (e.g., host)
```

### Step 3: Start a Conversation
- User A: Navigate to Messages and start conversation with User B
- User B: Navigate to Messages and open conversation with User A

### Step 4: Check Console Logs
You should see:
```
Joined conversation room: conversation:conv_u_1_2
WebSocket connected: abc123
```

### Step 5: Type a Message
When User A types, you should see in User A's console:
```
Sending typing:start event: { conversationId: "conv_u_1_2", recipientId: 2 }
```

And in User B's console:
```
Received typing:start event: { conversationId: "conv_u_1_2", userId: 1 }
```

### Step 6: Verify Animation
User B should see three bouncing dots appear at the bottom of the message list.

## Common Issues and Solutions

### Issue 1: No Console Logs at All
**Problem**: WebSocket not connected
**Solution**: 
- Check if backend server is running
- Verify WebSocket connection indicator (green dot on bell icon)
- Check browser console for connection errors

### Issue 2: Sending Events But Not Receiving
**Problem**: Not joined to conversation room
**Solution**:
- Verify you see "Joined conversation room" log
- Make sure both users are in the same conversation
- Check conversationId matches on both sides

### Issue 3: Events Received But Animation Not Showing
**Problem**: Frontend state not updating
**Solution**:
- Check if `typingUsers` state is being updated
- Verify `isOtherUserTyping` is true
- Check if typing indicator JSX is rendering

### Issue 4: Animation Shows for Own Typing
**Problem**: Not filtering out own userId
**Solution**:
- Backend should not send event back to sender
- Frontend should check `userId !== currentUserId`

### Issue 5: Animation Doesn't Disappear
**Problem**: Timeout not working
**Solution**:
- Check if `typing:stop` event is being sent
- Verify 3-second timeout is clearing
- Check if blur/send triggers stopTyping

## Debug Checklist

Run through this checklist in order:

- [ ] Backend server is running
- [ ] Both users are logged in
- [ ] Both users have WebSocket connected (green dot)
- [ ] Both users are in Messages page
- [ ] Both users have same conversation open
- [ ] Console shows "Joined conversation room" for both users
- [ ] Typing shows "Sending typing:start event" in sender's console
- [ ] Typing shows "Received typing:start event" in recipient's console
- [ ] Animation appears in recipient's chat window
- [ ] Stopping typing shows "Sending typing:stop event"
- [ ] Animation disappears in recipient's chat window

## Backend Event Flow

```
User A types
  ↓
Frontend: startTyping(conversationId, recipientId)
  ↓
WebSocket: emit('typing:start', { conversationId, recipientId })
  ↓
Backend: Receives 'typing:start' event
  ↓
Backend: Emits to conversation room AND directly to recipient
  ↓
User B's WebSocket: Receives 'typing:start' event
  ↓
Frontend: handleTypingStart() updates state
  ↓
UI: Renders typing animation
```

## Testing Commands

### Check WebSocket Connection
```javascript
// In browser console
console.log('WebSocket connected:', window.socket?.connected);
```

### Manually Trigger Typing Event
```javascript
// In browser console (User A)
window.socket?.emit('typing:start', { 
  conversationId: 'conv_u_1_2', 
  recipientId: 2 
});
```

### Check Typing State
```javascript
// In React DevTools
// Find GuestMessages or HostMessages component
// Check state: typingUsers
```

## Expected Console Output

### User A (Sender) Console:
```
Joined conversation room: conversation:conv_u_1_2
Sending typing:start event: { conversationId: "conv_u_1_2", recipientId: 2 }
Sending typing:stop event: { conversationId: "conv_u_1_2" }
```

### User B (Recipient) Console:
```
Joined conversation room: conversation:conv_u_1_2
Received typing:start event: { conversationId: "conv_u_1_2", userId: 1 }
Received typing:stop event: { conversationId: "conv_u_1_2" }
```

## Network Tab Verification

1. Open Network tab in DevTools
2. Filter by "WS" (WebSocket)
3. Click on the WebSocket connection
4. Go to "Messages" tab
5. You should see:
   - Outgoing: `42["typing:start",{"conversationId":"...","recipientId":...}]`
   - Incoming: `42["typing:start",{"conversationId":"...","userId":...}]`

## Still Not Working?

If typing indicator still doesn't work after following all steps:

1. **Restart Backend Server**
   ```bash
   # Stop server (Ctrl+C)
   # Start server again
   npm start
   ```

2. **Clear Browser Cache**
   - Hard refresh both windows (Ctrl+Shift+R)
   - Or close and reopen incognito windows

3. **Check Backend Logs**
   Look for these in backend console:
   ```
   Client connected: abc123
   User 1 authenticated on socket abc123
   Socket abc123 joined room: conversation:conv_u_1_2
   ```

4. **Verify User IDs**
   - Make sure both users have different IDs
   - Check conversationId format is correct
   - Verify otherUserId is set correctly

5. **Test with Different Browsers**
   - Chrome Window 1 + Firefox Window 2
   - This eliminates any browser-specific issues

## Success Indicators

You'll know it's working when:
- ✅ Console shows all expected logs
- ✅ Three dots appear when other user types
- ✅ Dots disappear when other user stops
- ✅ Dots disappear after 3 seconds of inactivity
- ✅ No errors in console
- ✅ Green dot shows WebSocket connected
