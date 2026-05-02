const express = require('express');

const router = express.Router();
const { getAuthUserId } = require('../utils/authMiddleware');

const sanitizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const generateAssistantReply = async ({ db, userId, message, roleHint }) => {
  const normalized = message.toLowerCase();

  if (normalized.includes('booking') || normalized.includes('reserve')) {
    if (!userId) {
      return 'You can browse available units and create a booking after login. Open Units, choose dates, then continue to payment.';
    }

    const bookingsResult = await db.query(
      'SELECT COUNT(*)::int AS count FROM bookings WHERE guest_id = $1',
      [userId]
    );
    const bookingCount = bookingsResult.rows[0]?.count || 0;
    return `You currently have ${bookingCount} booking(s) in Smart Stay. I can help you check booking details, status, or payment next.`;
  }

  if (normalized.includes('payment') || normalized.includes('gcash') || normalized.includes('paymaya')) {
    if (!userId) {
      return 'Payments support GCash, PayMaya, and bank transfer. Log in first so I can check your payment records.';
    }

    const paymentResult = await db.query(
      "SELECT COUNT(*)::int AS count FROM payments WHERE payer_user_id = $1 OR host_id = $1",
      [userId]
    );
    const paymentCount = paymentResult.rows[0]?.count || 0;
    return `I found ${paymentCount} payment record(s) linked to your account. Tell me if you want help with pending, completed, or failed payments.`;
  }

  if (normalized.includes('host') || normalized.includes('verification')) {
    if (!userId) {
      return 'Host verification is available after login from the Host Verification page. Submit your business details and required documents.';
    }

    const hostStatusResult = await db.query(
      'SELECT verification_status FROM users WHERE id = $1 LIMIT 1',
      [userId]
    );
    const status = hostStatusResult.rows[0]?.verification_status || 'not_submitted';
    return `Your current verification status is ${status}. If it is pending, an admin review is still in progress.`;
  }

  if (normalized.includes('hello') || normalized.includes('hi') || normalized.includes('hey')) {
    return 'Hello! I am your Smart Stay assistant. Ask me about bookings, payments, host verification, or account help.';
  }

  if (roleHint === 'host') {
    return 'I can help with host tasks: bookings, payouts, property management, and verification. Ask me what you want to manage right now.';
  }

  return 'I can help you with bookings, payments, properties, and account questions. Tell me what you need and I will guide you step by step.';
};

// GET /api/chat/history - Get chatbot history for current user/session
router.get('/history', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = getAuthUserId(req);
    const sessionId = sanitizeText(req.query.sessionId) || sanitizeText(req.sessionID);

    if (!sessionId && !userId) {
      return res.json({ sessionId: null, messages: [] });
    }

    const result = await db.query(
      `
        SELECT id, session_id, user_id, sender, message, created_at
        FROM chatbot_messages
        WHERE ($1::int IS NOT NULL AND user_id = $1)
           OR ($2::text <> '' AND session_id = $2)
        ORDER BY created_at ASC
        LIMIT 100
      `,
      [userId, sessionId || '']
    );

    const messages = result.rows.map((row) => ({
      id: row.id,
      sender: row.sender,
      text: row.message,
      timestamp: row.created_at,
      sessionId: row.session_id
    }));

    return res.json({
      sessionId: sessionId || result.rows[0]?.session_id || null,
      messages
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load chat history', error: error.message });
  }
});

// POST /api/chat/message - Send message to assistant and persist conversation
router.post('/message', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const websocket = req.app.locals.websocket;
    const userId = getAuthUserId(req);
    const message = sanitizeText(req.body?.message);
    const roleHint = sanitizeText(req.body?.roleHint).toLowerCase();
    const requestedSessionId = sanitizeText(req.body?.sessionId);
    const sessionId = requestedSessionId || sanitizeText(req.sessionID) || `anon_${Date.now()}`;

    if (!message) {
      return res.status(400).json({ message: 'message is required' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ message: 'message must be 2000 characters or fewer' });
    }

    const assistantReply = await generateAssistantReply({
      db,
      userId,
      message,
      roleHint
    });

    const userInsert = await db.query(
      `
        INSERT INTO chatbot_messages (session_id, user_id, sender, message, created_at)
        VALUES ($1, $2, 'user', $3, NOW())
        RETURNING id, sender, message, created_at
      `,
      [sessionId, userId, message]
    );

    const assistantInsert = await db.query(
      `
        INSERT INTO chatbot_messages (session_id, user_id, sender, message, created_at)
        VALUES ($1, $2, 'assistant', $3, NOW())
        RETURNING id, sender, message, created_at
      `,
      [sessionId, userId, assistantReply]
    );

    const response = {
      sessionId,
      userMessage: {
        id: userInsert.rows[0].id,
        sender: userInsert.rows[0].sender,
        text: userInsert.rows[0].message,
        timestamp: userInsert.rows[0].created_at
      },
      assistantMessage: {
        id: assistantInsert.rows[0].id,
        sender: assistantInsert.rows[0].sender,
        text: assistantInsert.rows[0].message,
        timestamp: assistantInsert.rows[0].created_at
      }
    };

    // Send real-time notification via WebSocket if user is online
    if (userId && websocket) {
      websocket.sendToUser(userId, 'chat:message', response.assistantMessage);
    }

    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to process chat message', error: error.message });
  }
});

module.exports = router;