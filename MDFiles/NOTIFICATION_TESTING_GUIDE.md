# Notification System - Quick Start Guide

## Testing Real Notifications

Now that the test panel has been removed, here's how to test the notification system with real data:

### Method 1: Using the Backend API Directly

You can create notifications using the backend API endpoint:

```bash
# Create a notification for a specific user
curl -X POST http://localhost:5000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "booking",
    "title": "New Booking Request",
    "message": "You have a new booking request for Property #123",
    "userId": 1
  }'
```

### Method 2: Trigger Real Events

The system automatically creates notifications when these events occur:

1. **Booking Events**
   - Create a new booking
   - Update booking status
   - Cancel a booking

2. **Message Events**
   - Send a message in chat
   - Receive a message

3. **Property Events**
   - Create a new property
   - Update property details
   - Change property status

### Method 3: Using Postman/Insomnia

Import this collection to test notifications:

**POST** `http://localhost:5000/api/notifications`

Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
```

Body:
```json
{
  "type": "message",
  "title": "New Message",
  "message": "You have a new message from John Doe",
  "userId": 1
}
```

### Method 4: Database Direct Insert (Development Only)

For quick testing, you can insert directly into the database:

```sql
-- For regular users (guest, host)
INSERT INTO user_notifications (user_id, type, title, message, is_read, created_at)
VALUES (1, 'booking', 'Test Notification', 'This is a test notification', false, NOW());

-- For admin users
INSERT INTO admin_notifications (type, title, message, target_user_id, priority, is_read, created_at)
VALUES ('system', 'Test Admin Notification', 'This is a test admin notification', NULL, 'high', false, NOW());
```

## Viewing Notifications

### Bell Icon (All Users)
1. Look at the navbar
2. Click the bell icon
3. See the 5 most recent notifications
4. Click "View All Notifications" to see the full list

### Notification Pages
- **Guest**: Navigate to `/guest/notifications`
- **Host**: Navigate to `/host/notifications`
- **Admin**: Navigate to `/admin/notifications`
- **Communication Admin**: Navigate to `/comm-admin/notifications`

## WebSocket Connection Status

The bell icon shows a green dot when WebSocket is connected:
- **Green dot**: Connected and receiving real-time updates
- **No dot**: Disconnected (notifications still work via API polling)

## Common Notification Types

| Type | Description | Example Use Case |
|------|-------------|------------------|
| `booking` | Booking-related events | New booking, status change |
| `message` | Chat messages | New message received |
| `property` | Property updates | Property approved, updated |
| `payment` | Payment events | Payment received, refund |
| `system` | System notifications | Maintenance, updates |
| `general` | General notifications | Announcements, reminders |

## Troubleshooting

### Notifications Not Appearing
1. Check WebSocket connection (green dot on bell icon)
2. Verify backend server is running
3. Check browser console for errors
4. Verify user is authenticated
5. Check database for notifications: `SELECT * FROM user_notifications WHERE user_id = YOUR_USER_ID;`

### WebSocket Not Connecting
1. Ensure backend server is running on correct port
2. Check CORS settings in backend
3. Verify Socket.IO is initialized in `backend/server.js`
4. Check browser console for connection errors

### Notifications Not Persisting
1. Verify database connection
2. Check notification API endpoints are working
3. Verify user has correct permissions
4. Check backend logs for errors

## Development Tips

### Creating Test Notifications Programmatically

Add this helper function to your backend for testing:

```javascript
// backend/utils/testNotifications.js
const createTestNotification = async (db, userId, type = 'general') => {
  const notifications = {
    booking: {
      title: 'New Booking Request',
      message: 'You have a new booking request for Property #123'
    },
    message: {
      title: 'New Message',
      message: 'John Doe sent you a message'
    },
    property: {
      title: 'Property Updated',
      message: 'Your property listing has been updated'
    },
    payment: {
      title: 'Payment Received',
      message: 'You received a payment of $150.00'
    }
  };

  const notification = notifications[type] || {
    title: 'Test Notification',
    message: 'This is a test notification'
  };

  await db.query(
    `INSERT INTO user_notifications (user_id, type, title, message, is_read, created_at)
     VALUES ($1, $2, $3, $4, false, NOW())`,
    [userId, type, notification.title, notification.message]
  );
};

module.exports = { createTestNotification };
```

### Monitoring Notifications

Add logging to track notification creation:

```javascript
// In backend/routes/notifications.js
console.log(`[NOTIFICATION] Created ${type} notification for user ${userId}`);
```

## File Cleanup (Optional)

The following file is no longer used and can be deleted:
- `frontend/src/components/common/WebSocketTestPanel.js`

However, you may want to keep it for reference or future testing needs.
