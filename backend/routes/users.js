const express = require('express');
const router = express.Router();
const { getAuthUserId } = require('../utils/authMiddleware');

const getPool = (req) => req.app.locals.db;

const mapMessageRow = (row) => ({
  id: row.id,
  conversationId: row.conversation_id,
  senderId: row.sender_id,
  receiverId: row.receiver_id,
  propertyId: row.property_id,
  bookingId: row.booking_id,
  message: row.message,
  timestamp: row.created_at,
  read: row.is_read
});

const buildConversationId = ({ senderId, receiverId, bookingId, propertyId }) => {
  const pair = [senderId, receiverId].sort((a, b) => a - b).join('_');

  if (bookingId) {
    return `conv_b_${bookingId}_${pair}`;
  }

  if (propertyId) {
    return `conv_p_${propertyId}_${pair}`;
  }

  return `conv_u_${pair}`;
};

const mapProfileRow = (row) => ({
  id: row.id,
  firstName: row.first_name || '',
  lastName: row.last_name || '',
  email: row.email || '',
  phone: row.phone || '',
  company: row.company || '',
  bio: row.bio || '',
  profilePicture: row.profile_picture || '',
  preferences: row.preferences || {},
  hostInfo: row.host_info || {},
  guestInfo: row.guest_info || {}
});

// GET /api/users/profile - Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const db = getPool(req);
    const result = await db.query(
      `
        SELECT
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          u.company,
          up.bio,
          up.profile_picture,
          up.preferences,
          up.host_info,
          up.guest_info
        FROM users u
        LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE u.id = $1
        LIMIT 1
      `,
      [userId]
    );

    const profileRow = result.rows[0];
    if (!profileRow) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.json(mapProfileRow(profileRow));
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Failed to load profile' });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      bio,
      profilePicture,
      preferences,
      hostInfo,
      guestInfo
    } = req.body || {};

    const db = getPool(req);

    await db.query(
      `
        UPDATE users
        SET
          first_name = COALESCE($2, first_name),
          last_name = COALESCE($3, last_name),
          email = COALESCE($4, email),
          phone = COALESCE($5, phone),
          company = COALESCE($6, company),
          updated_at = NOW()
        WHERE id = $1
      `,
      [
        userId,
        firstName || null,
        lastName || null,
        email || null,
        phone || null,
        company || null
      ]
    );

    await db.query(
      `
        INSERT INTO user_profiles (
          user_id,
          bio,
          profile_picture,
          preferences,
          host_info,
          guest_info,
          updated_at
        )
        VALUES (
          $1,
          COALESCE($2, ''),
          COALESCE($3, ''),
          COALESCE($4::jsonb, '{"notifications":true,"emailUpdates":true,"smsAlerts":false}'::jsonb),
          COALESCE($5::jsonb, '{}'::jsonb),
          COALESCE($6::jsonb, '{}'::jsonb),
          NOW()
        )
        ON CONFLICT (user_id)
        DO UPDATE SET
          bio = COALESCE(EXCLUDED.bio, user_profiles.bio),
          profile_picture = COALESCE(EXCLUDED.profile_picture, user_profiles.profile_picture),
          preferences = COALESCE(EXCLUDED.preferences, user_profiles.preferences),
          host_info = COALESCE(EXCLUDED.host_info, user_profiles.host_info),
          guest_info = COALESCE(EXCLUDED.guest_info, user_profiles.guest_info),
          updated_at = NOW()
      `,
      [
        userId,
        bio || null,
        profilePicture || null,
        preferences ? JSON.stringify(preferences) : null,
        hostInfo ? JSON.stringify(hostInfo) : null,
        guestInfo ? JSON.stringify(guestInfo) : null
      ]
    );

    const profileResult = await db.query(
      `
        SELECT
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.phone,
          u.company,
          up.bio,
          up.profile_picture,
          up.preferences,
          up.host_info,
          up.guest_info
        FROM users u
        LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE u.id = $1
        LIMIT 1
      `,
      [userId]
    );

    return res.json({
      message: 'Profile updated successfully',
      profile: mapProfileRow(profileResult.rows[0])
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
});

// GET /api/users/messages - Get user messages
router.get('/messages', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const pool = getPool(req);
    const { conversationId } = req.query;

    const whereClauses = ['(sender_id = $1 OR receiver_id = $1)'];
    const params = [userId];

    if (conversationId) {
      whereClauses.push(`conversation_id = $${params.length + 1}`);
      params.push(conversationId);
    }

    const messageResult = await pool.query(
      `
        SELECT
          id,
          conversation_id,
          sender_id,
          receiver_id,
          property_id,
          booking_id,
          message,
          is_read,
          created_at
        FROM messages
        WHERE ${whereClauses.join(' AND ')}
        ORDER BY created_at ASC
      `,
      params
    );

    const userMessages = messageResult.rows.map(mapMessageRow);
    const conversations = {};

    userMessages.forEach((message) => {
      if (!conversations[message.conversationId]) {
        conversations[message.conversationId] = [];
      }
      conversations[message.conversationId].push(message);
    });

    const conversationSummariesResult = await pool.query(
      `
        WITH conversation_data AS (
          SELECT
            m.conversation_id,
            MAX(m.created_at) AS last_message_at,
            (ARRAY_AGG(m.message ORDER BY m.created_at DESC))[1] AS last_message,
            (ARRAY_AGG(
              CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
              ORDER BY m.created_at DESC
            ))[1] AS other_user_id,
            COUNT(*) FILTER (WHERE m.receiver_id = $1 AND m.is_read = false) AS unread_count
          FROM messages m
          WHERE m.sender_id = $1 OR m.receiver_id = $1
          GROUP BY m.conversation_id
        )
        SELECT
          cd.conversation_id,
          cd.last_message_at,
          cd.last_message,
          cd.unread_count,
          cd.other_user_id,
          u.first_name,
          u.last_name,
          u.email
        FROM conversation_data cd
        LEFT JOIN users u ON u.id = cd.other_user_id
        ORDER BY cd.last_message_at DESC
      `,
      [userId]
    );

    const conversationSummaries = conversationSummariesResult.rows.map((row) => ({
      conversationId: row.conversation_id,
      otherUserId: row.other_user_id,
      otherUser: row.other_user_id
        ? {
            id: row.other_user_id,
            firstName: row.first_name || '',
            lastName: row.last_name || '',
            fullName: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
            email: row.email || ''
          }
        : null,
      lastMessage: row.last_message || '',
      lastMessageAt: row.last_message_at,
      unreadCount: parseInt(row.unread_count, 10) || 0
    }));

    return res.json({
      messages: userMessages,
      conversations,
      conversationSummaries,
      total: userMessages.length
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// POST /api/users/messages - Send new message
router.post('/messages', async (req, res) => {
  try {
    const senderId = getAuthUserId(req);
    if (!senderId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const {
      receiverId,
      conversationId,
      message,
      propertyId,
      bookingId
    } = req.body;

    const parsedReceiverId = parseInt(receiverId, 10);
    if (!parsedReceiverId || Number.isNaN(parsedReceiverId)) {
      return res.status(400).json({ message: 'receiverId is required' });
    }

    if (parsedReceiverId === senderId) {
      return res.status(400).json({ message: 'You cannot send a message to yourself' });
    }

    const normalizedMessage = typeof message === 'string' ? message.trim() : '';
    if (!normalizedMessage) {
      return res.status(400).json({ message: 'message is required' });
    }

    const parsedPropertyId = propertyId ? parseInt(propertyId, 10) : null;
    const parsedBookingId = bookingId ? parseInt(bookingId, 10) : null;
    if (propertyId && Number.isNaN(parsedPropertyId)) {
      return res.status(400).json({ message: 'propertyId must be a number' });
    }
    if (bookingId && Number.isNaN(parsedBookingId)) {
      return res.status(400).json({ message: 'bookingId must be a number' });
    }

    const pool = getPool(req);
    const receiverResult = await pool.query(
      'SELECT id FROM users WHERE id = $1 LIMIT 1',
      [parsedReceiverId]
    );

    if (!receiverResult.rows[0]) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const normalizedConversationId = typeof conversationId === 'string' && conversationId.trim()
      ? conversationId.trim()
      : buildConversationId({
          senderId,
          receiverId: parsedReceiverId,
          bookingId: parsedBookingId,
          propertyId: parsedPropertyId
        });

    const insertResult = await pool.query(
      `
        INSERT INTO messages (
          conversation_id,
          sender_id,
          receiver_id,
          property_id,
          booking_id,
          message,
          is_read,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, false, NOW(), NOW())
        RETURNING
          id,
          conversation_id,
          sender_id,
          receiver_id,
          property_id,
          booking_id,
          message,
          is_read,
          created_at
      `,
      [
        normalizedConversationId,
        senderId,
        parsedReceiverId,
        parsedPropertyId,
        parsedBookingId,
        normalizedMessage
      ]
    );

    const createdMessage = mapMessageRow(insertResult.rows[0]);

    // Send real-time message via WebSocket to conversation room
    const websocket = req.app.locals.websocket;
    if (websocket) {
      // Emit to conversation room so both users get the message
      websocket.sendToRoom(`conversation:${normalizedConversationId}`, 'message:new', {
        conversationId: normalizedConversationId,
        message: createdMessage
      });
    }

    // Create notification for receiver
    try {
      // Get sender info
      const senderResult = await pool.query(
        'SELECT first_name, last_name FROM users WHERE id = $1 LIMIT 1',
        [senderId]
      );
      const senderName = senderResult.rows[0]
        ? `${senderResult.rows[0].first_name || ''} ${senderResult.rows[0].last_name || ''}`.trim()
        : 'Someone';

      // Insert notification into database
      const notificationResult = await pool.query(
        `
          INSERT INTO user_notifications (user_id, type, title, message, is_read, created_at)
          VALUES ($1, 'message', $2, $3, false, NOW())
          RETURNING id, user_id, type, title, message, is_read, created_at
        `,
        [
          parsedReceiverId,
          'New Message',
          `${senderName} sent you a message`
        ]
      );

      const notification = notificationResult.rows[0];

      // Send notification via WebSocket
      if (websocket) {
        websocket.sendToUser(parsedReceiverId, 'notification', {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          read: notification.is_read,
          createdAt: notification.created_at
        });
      }
    } catch (notifError) {
      console.error('Failed to create message notification:', notifError);
      // Don't fail the message send if notification fails
    }

    return res.status(201).json({
      message: 'Message sent successfully',
      messageData: createdMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ message: 'Failed to send message' });
  }
});

// PUT /api/users/messages/:id/read - Mark a received message as read
router.put('/messages/:id/read', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const messageId = parseInt(req.params.id, 10);
    if (!messageId || Number.isNaN(messageId)) {
      return res.status(400).json({ message: 'Invalid message id' });
    }

    const pool = getPool(req);
    const updateResult = await pool.query(
      `
        UPDATE messages
        SET is_read = true, updated_at = NOW()
        WHERE id = $1
          AND receiver_id = $2
        RETURNING
          id,
          conversation_id,
          sender_id,
          receiver_id,
          property_id,
          booking_id,
          message,
          is_read,
          created_at
      `,
      [messageId, userId]
    );

    const updatedRow = updateResult.rows[0];
    if (!updatedRow) {
      return res.status(404).json({ message: 'Message not found' });
    }

    return res.json({
      message: 'Message marked as read',
      messageData: mapMessageRow(updatedRow)
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return res.status(500).json({ message: 'Failed to update message' });
  }
});

// GET /api/users/notifications - Get user notifications
router.get('/notifications', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const { read } = req.query;
    const db = getPool(req);

    const params = [userId];
    const where = ['user_id = $1'];

    if (read !== undefined) {
      where.push(`is_read = $${params.length + 1}`);
      params.push(read === 'true');
    }

    const notificationsResult = await db.query(
      `
        SELECT id, user_id, type, title, message, is_read, created_at
        FROM user_notifications
        WHERE ${where.join(' AND ')}
        ORDER BY created_at DESC
      `,
      params
    );

    const unreadResult = await db.query(
      `
        SELECT COUNT(*)::int AS unread_count
        FROM user_notifications
        WHERE user_id = $1 AND is_read = false
      `,
      [userId]
    );

    const notifications = notificationsResult.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      read: row.is_read,
      createdAt: row.created_at
    }));

    return res.json({
      notifications,
      total: notifications.length,
      unreadCount: unreadResult.rows[0]?.unread_count || 0
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// PUT /api/users/notifications/:id/read - Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const notificationId = parseInt(req.params.id, 10);
    if (Number.isNaN(notificationId)) {
      return res.status(400).json({ message: 'Invalid notification id' });
    }

    const db = getPool(req);
    const updateResult = await db.query(
      `
        UPDATE user_notifications
        SET is_read = true
        WHERE id = $1 AND user_id = $2
        RETURNING id, user_id, type, title, message, is_read, created_at
      `,
      [notificationId, userId]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const row = updateResult.rows[0];
    return res.json({
      message: 'Notification marked as read',
      notification: {
        id: row.id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        message: row.message,
        read: row.is_read,
        createdAt: row.created_at
      }
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return res.status(500).json({ message: 'Failed to update notification' });
  }
});

// GET /api/users/:id/basic - Get basic user identity by ID
router.get('/:id/basic', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const db = getPool(req);
    const result = await db.query(
      `
        SELECT id, first_name, last_name, email
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [userId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return res.json({
      id: user.id,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email || '',
      fullName
    });
  } catch (error) {
    console.error('Error fetching basic user:', error);
    return res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// GET /api/users/:id/public - Get public user profile
router.get('/:id/public', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const db = getPool(req);
    const result = await db.query(
      `
        SELECT
          u.id,
          u.first_name,
          u.last_name,
          up.bio,
          up.profile_picture,
          up.host_info,
          up.guest_info
        FROM users u
        LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE u.id = $1
        LIMIT 1
      `,
      [userId]
    );

    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      id: row.id,
      firstName: row.first_name || '',
      lastName: row.last_name || '',
      bio: row.bio || '',
      profilePicture: row.profile_picture || '',
      hostInfo: row.host_info || {},
      guestInfo: row.guest_info || {}
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return res.status(500).json({ message: 'Failed to fetch public profile' });
  }
});

// POST /api/users/settings - Update user settings
router.post('/settings', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const db = getPool(req);
    const existingResult = await db.query(
      `SELECT preferences FROM user_profiles WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    const existingPrefs = existingResult.rows[0]?.preferences || {
      notifications: true,
      emailUpdates: true,
      smsAlerts: false
    };

    const nextPrefs = {
      ...existingPrefs,
      ...(req.body || {})
    };

    await db.query(
      `
        INSERT INTO user_profiles (user_id, preferences, updated_at)
        VALUES ($1, $2::jsonb, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET
          preferences = EXCLUDED.preferences,
          updated_at = NOW()
      `,
      [userId, JSON.stringify(nextPrefs)]
    );

    return res.json({
      message: 'Settings updated successfully',
      preferences: nextPrefs
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ message: 'Failed to update settings' });
  }
});

module.exports = router;
