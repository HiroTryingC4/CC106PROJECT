# Testing Real-Time WebSocket Notifications

## What Was Fixed

✅ **Integrated RealtimeNotifications component into Navbar**
- Replaced static notification bell with real WebSocket component
- Shows green dot when connected
- Displays real-time notifications

✅ **Added WebSocketTestPanel for testing**
- Floating test panel in bottom-right corner
- Three test buttons to trigger different notification types
- Shows connection status

## How to Test

### Step 1: Ensure Servers Are Running

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm start
```

### Step 2: Login to the App

1. Go to http://localhost:3000
2. Login with any account
3. You should be redirected to your dashboard

### Step 3: Check WebSocket Connection

Look for these indicators:

**In Browser Console (F12):**
```
WebSocket connected: [socket-id]
WebSocket authenticated: {userId: X, socketId: '...'}
```

**In the UI:**
- Look at the notification bell icon (🔔) in the navbar
- You should see a **green dot** at the bottom-right of the bell
- This means WebSocket is connected!

### Step 4: Test Real-Time Notifications

You'll see a **blue test panel** in the bottom-right corner of the screen.

**Test Booking Notification:**
1. Click "📅 Test Booking Notification"
2. A notification should appear instantly in the notification dropdown
3. The bell icon should show a red badge with the count

**Test Property Update:**
1. Click "🏠 Test Property Update"
2. Property update notification appears

**Test Message:**
1. Click "💬 Test Message"
2. Message notification appears

### Step 5: View Notifications

1. Click the bell icon (🔔) in the navbar
2. A dropdown will appear showing all notifications
3. Each notification shows:
   - Icon (📅 booking, 🏠 property, 💬 message)
   - Message text
   - Timestamp
   - Unread indicator (blue background)

### Step 6: Manage Notifications

**Mark as Read:**
- Click on any notification to mark it as read
- Background changes from blue to white

**Mark All as Read:**
- Click "Mark all read" button at the top

**Clear All:**
- Click "Clear all notifications" button at the bottom

**Remove Individual:**
- Click the X button on any notification

## What You Should See

### Connected State:
```
Notification Bell:
├── 🔔 Bell icon
├── 🟢 Green dot (bottom-right) ← WebSocket connected!
└── 🔴 Red badge (top-right) ← Unread count
```

### Disconnected State:
```
Notification Bell:
├── 🔔 Bell icon
└── No green dot ← WebSocket disconnected
```

### Test Panel:
```
┌─────────────────────────────┐
│ WebSocket Test Panel        │
│ Status: 🟢 Connected        │
├─────────────────────────────┤
│ [📅 Test Booking]           │
│ [🏠 Test Property]          │
│ [💬 Test Message]           │
└─────────────────────────────┘
```

## Notification Types

### 1. Booking Notification (📅)
- Triggered when booking status changes
- Shows booking ID and status
- Sent to both host and guest

### 2. Property Update (🏠)
- Triggered when property changes
- Shows property ID
- Sent to users watching the property

### 3. Message Notification (💬)
- Triggered when new message arrives
- Shows conversation ID
- Sent to recipient

## Real-World Usage

In production, these notifications are triggered by:

**Backend Routes:**
```javascript
// Example: In booking route
const websocket = req.app.locals.websocket;
websocket.sendBookingUpdate(bookingId, hostId, guestId, 'confirmed', data);
```

**Frontend Events:**
```javascript
// Example: Listen for notifications
const { on } = useWebSocket();

useEffect(() => {
  return on('booking:notification', (data) => {
    // Handle notification
  });
}, [on]);
```

## Removing Test Panel

Once you've verified everything works, remove the test panel:

**In `frontend/src/App.js`:**
```javascript
// Remove this line:
import WebSocketTestPanel from './components/common/WebSocketTestPanel';

// Remove this component:
<WebSocketTestPanel />
```

## Troubleshooting

### No Green Dot?
- Check browser console for connection errors
- Verify backend is running
- Ensure you're logged in
- Try hard refresh (Ctrl+Shift+R)

### Notifications Not Appearing?
- Check WebSocket connection status
- Verify test panel shows "Connected"
- Check browser console for errors
- Try clicking test buttons again

### Test Panel Not Visible?
- Scroll down if page is scrolled up
- Check bottom-right corner
- Try zooming out (Ctrl + -)
- Ensure you're logged in

## Files Modified

1. `frontend/src/components/common/Navbar.js`
   - Integrated RealtimeNotifications component
   - Removed static notification bell

2. `frontend/src/components/common/RealtimeNotifications.js`
   - Already created (working component)

3. `frontend/src/components/common/WebSocketTestPanel.js`
   - New test component (temporary)

4. `frontend/src/App.js`
   - Added WebSocketTestPanel (temporary)

## Next Steps

After testing:
1. ✅ Verify green dot appears
2. ✅ Test all three notification types
3. ✅ Verify notifications appear instantly
4. ✅ Test mark as read functionality
5. ✅ Remove WebSocketTestPanel from App.js
6. ✅ Deploy to production

## Success Criteria

✅ Green dot visible on notification bell
✅ Notifications appear instantly when triggered
✅ Unread count updates correctly
✅ Mark as read works
✅ Clear all works
✅ Connection status accurate
✅ No console errors

---

**Status**: Ready for Testing! 🚀
**Test Panel**: Bottom-right corner
**Notification Bell**: Top-right navbar
