const express = require('express');

const router = express.Router();
const { getAuthUserId } = require('../utils/authMiddleware');

const sanitizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const generateAssistantReply = async ({ db, userId, message, roleHint }) => {
  const normalized = message.toLowerCase();

  // Guest: Check my bookings
  if (normalized.includes('check') && normalized.includes('booking')) {
    if (!userId) {
      return 'Please log in to view your bookings. You can browse available properties and make reservations after logging in.';
    }

    const bookingsResult = await db.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(CASE WHEN status = 'confirmed' THEN 1 END)::int AS confirmed,
              COUNT(CASE WHEN status = 'pending' THEN 1 END)::int AS pending
       FROM bookings WHERE guest_id = $1`,
      [userId]
    );
    const { total, confirmed, pending } = bookingsResult.rows[0] || { total: 0, confirmed: 0, pending: 0 };
    
    if (total === 0) {
      return 'You don\'t have any bookings yet. Browse our properties and make your first reservation!';
    }
    
    const bookingWord = total === 1 ? 'booking' : 'bookings';
    return `You have ${total} ${bookingWord}: ${confirmed} confirmed, ${pending} pending. Visit "My Bookings" to view details, make payments, or manage your reservations.`;
  }

  // Host: Check my properties
  if (normalized.includes('check') && normalized.includes('propert')) {
    if (!userId) {
      return 'Please log in to manage your properties.';
    }

    const propertiesResult = await db.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(CASE WHEN availability = true THEN 1 END)::int AS available
       FROM properties WHERE host_id = $1`,
      [userId]
    );
    const { total, available } = propertiesResult.rows[0] || { total: 0, available: 0 };
    
    if (total === 0) {
      return 'You don\'t have any properties listed yet. Add your first property to start hosting!';
    }
    
    const propertyWord = total === 1 ? 'property' : 'properties';
    return `You have ${total} ${propertyWord}: ${available} available for booking. Visit "My Properties" to manage listings, pricing, and availability.`;
  }

  // Host: View bookings
  if (normalized.includes('view') && normalized.includes('booking')) {
    if (!userId) {
      return 'Please log in to view bookings for your properties.';
    }

    const bookingsResult = await db.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END)::int AS confirmed,
              COUNT(CASE WHEN b.status = 'pending' THEN 1 END)::int AS pending
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       WHERE p.host_id = $1`,
      [userId]
    );
    const { total, confirmed, pending } = bookingsResult.rows[0] || { total: 0, confirmed: 0, pending: 0 };
    
    if (total === 0) {
      return 'You don\'t have any bookings yet. Bookings will appear here when guests reserve your properties.';
    }
    
    const bookingWord = total === 1 ? 'booking' : 'bookings';
    return `You have ${total} ${bookingWord} for your properties: ${confirmed} confirmed, ${pending} pending. Check "Bookings" to manage reservations.`;
  }

  // Host: Check payouts
  if (normalized.includes('check') && normalized.includes('payout')) {
    if (!userId) {
      return 'Please log in to view your payout information.';
    }

    const payoutResult = await db.query(
      `SELECT COUNT(*)::int AS total,
              COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0)::numeric AS completed_amount
       FROM payments WHERE host_id = $1`,
      [userId]
    );
    const { total, completed_amount } = payoutResult.rows[0] || { total: 0, completed_amount: 0 };
    
    if (total === 0) {
      return 'You don\'t have any payout records yet. Payouts will appear after guests complete bookings.';
    }
    
    const formattedAmount = parseFloat(completed_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const payoutWord = total === 1 ? 'payout' : 'payouts';
    return `You have ${total} ${payoutWord} with ₱${formattedAmount} completed. Visit "Payouts" for detailed transaction history.`;
  }

  // Host: Verification status
  if (normalized.includes('verification') && normalized.includes('status')) {
    if (!userId) {
      return 'Please log in to check your verification status.';
    }

    const verificationResult = await db.query(
      'SELECT verification_status FROM users WHERE id = $1',
      [userId]
    );
    const status = verificationResult.rows[0]?.verification_status || 'not_submitted';
    
    const statusMessages = {
      'approved': 'Your host verification is approved! You can now list properties and accept bookings.',
      'pending': 'Your verification is pending review. Our team will review your documents within 24-48 hours.',
      'rejected': 'Your verification was rejected. Please resubmit with correct documents.',
      'not_submitted': 'You haven\'t submitted verification yet. Complete verification to start hosting.'
    };
    
    return statusMessages[status] || `Your verification status is: ${status}.`;
  }

  // Browse properties
  if (normalized.includes('browse') && normalized.includes('propert')) {
    return 'Browse our available properties in the "Units" section. You can filter by location, price, amenities, and more to find your perfect stay!';
  }

  // View payment status
  if (normalized.includes('view') && normalized.includes('payment')) {
    if (!userId) {
      return 'Please log in to view your payment history. We support GCash, Maya, and Card payments.';
    }

    const paymentResult = await db.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(CASE WHEN status = 'completed' THEN 1 END)::int AS completed,
              COUNT(CASE WHEN status = 'pending' THEN 1 END)::int AS pending
       FROM payments WHERE payer_user_id = $1`,
      [userId]
    );
    const { total, completed, pending } = paymentResult.rows[0] || { total: 0, completed: 0, pending: 0 };
    
    if (total === 0) {
      return 'You don\'t have any payment records yet. Payments will appear here after you make a booking.';
    }
    
    const paymentWord = total === 1 ? 'payment' : 'payments';
    return `You have ${total} ${paymentWord}: ${completed} completed, ${pending} pending. Check "My Bookings" > "Payment History" tab for full details.`;
  }

  // Get support
  if (normalized.includes('get') && normalized.includes('support')) {
    return 'I\'m here to help! Common topics:\n• Booking issues - Problems with reservations\n• Payment questions - GCash, Maya, Card payments\n• Property inquiries - Questions about listings\n• Account settings - Profile and preferences\n• Cancellation policy - Refund information\n\nWhat do you need help with?';
  }

  // Support: Booking issues
  if ((normalized.includes('booking') && normalized.includes('issue')) || 
      (normalized.includes('problem') && normalized.includes('reservation'))) {
    return 'I can help with booking issues:\n• Pending bookings - Waiting for host confirmation\n• Payment problems - Failed or pending payments\n• Booking modifications - Date changes not allowed after confirmation\n• Cancellations - Check refund policy (100% refund 48+ hours before, 50% for 24-48 hours, no refund <24 hours)\n\nWhich issue are you experiencing?';
  }

  // Support: Pending bookings
  if (normalized.includes('pending') && normalized.includes('booking')) {
    if (!userId) {
      return 'Please log in to check your pending bookings.';
    }
    return 'Pending bookings are waiting for host confirmation. This usually takes 24-48 hours. You can:\n• Check status in "My Bookings" tab\n• Cancel if host hasn\'t responded\n• Contact host through the booking page\n\nIf pending for more than 48 hours, the booking will auto-cancel with full refund.';
  }

  // Support: Failed payments
  if ((normalized.includes('failed') || normalized.includes('fail')) && normalized.includes('payment')) {
    return 'For failed payments:\n• Check your payment method has sufficient funds\n• Verify card/account details are correct\n• Try a different payment method (GCash, Maya, or Card)\n• Contact your bank if issue persists\n• Retry payment in "My Bookings" > "Pay Now"\n\nNeed help with a specific failed payment?';
  }

  // Support: Pending payments
  if (normalized.includes('pending') && normalized.includes('payment')) {
    return 'Pending payments are being processed. This usually takes:\n• GCash/Maya: 5-15 minutes\n• Card payments: Instant to 24 hours\n\nIf payment is pending for more than 24 hours, please contact support or try paying again.';
  }

  // Support: Booking modifications
  if ((normalized.includes('booking') || normalized.includes('reservation')) && 
      (normalized.includes('modif') || normalized.includes('change') || normalized.includes('edit'))) {
    return 'Booking modifications:\n• Dates cannot be changed after confirmation\n• To change dates, you must cancel and rebook\n• Cancellation refunds depend on timing (see cancellation policy)\n• Guest count changes - Contact host directly\n\nWould you like to know about the cancellation policy?';
  }

  // Support: Payment questions
  if ((normalized.includes('payment') && normalized.includes('question')) ||
      (normalized.includes('payment') && normalized.includes('help'))) {
    return 'Payment help:\n• Accepted methods - GCash, Maya, Card payments\n• Payment status - Check "My Bookings" > "Payment History" tab\n• Failed payments - Try again or use different method\n• Refunds - Processed based on cancellation policy\n\nNeed help with a specific payment?';
  }

  // Support: Property inquiries
  if (normalized.includes('property') && normalized.includes('inquir')) {
    return 'Property questions:\n• Availability - Check calendar on property page\n• Amenities - View full list on property details\n• Location - Address shown on property page\n• House rules - Check-in/out times and policies\n• Contact host - Message through booking page\n\nWhat would you like to know?';
  }

  // Support: Account settings
  if (normalized.includes('account') && normalized.includes('setting')) {
    return 'Account settings help:\n• Profile - Update name, email, phone in Settings\n• Password - Change in Settings > Security\n• Preferences - Dark mode toggle in Settings\n• Notifications - Manage email alerts\n\nWhat do you need to change?';
  }

  // Support: Cancellation policy
  if (normalized.includes('cancellation') && normalized.includes('policy')) {
    return 'Cancellation Policy:\n• 48+ hours before check-in: 100% refund\n• 24-48 hours before: 50% refund\n• Less than 24 hours: No refund\n\nTo cancel a booking, go to "My Bookings" and click "Cancel Booking" on the reservation. Refunds are processed within 5-7 business days.';
  }

  // Help with account
  if (normalized.includes('help') && normalized.includes('account')) {
    return 'I can help with:\n• Profile settings - Update your personal information\n• Password changes - Secure your account\n• Notification preferences - Manage alerts\n• Privacy settings - Control your data\n\nWhat would you like to do?';
  }

  // Booking related
  if (normalized.includes('booking') || normalized.includes('reserve')) {
    if (!userId) {
      return 'You can browse available units and create a booking after login. Open Units, choose dates, then continue to payment.';
    }

    const bookingsResult = await db.query(
      'SELECT COUNT(*)::int AS count FROM bookings WHERE guest_id = $1',
      [userId]
    );
    const bookingCount = bookingsResult.rows[0]?.count || 0;
    const bookingWord = bookingCount === 1 ? 'booking' : 'bookings';
    return `You currently have ${bookingCount} ${bookingWord} in Smart Stay. I can help you check booking details, status, or payment next.`;
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
    const recordWord = paymentCount === 1 ? 'record' : 'records';
    return `I found ${paymentCount} payment ${recordWord} linked to your account. Tell me if you want help with pending, completed, or failed payments.`;
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

    // Get or create session
    let session;
    if (sessionId) {
      const sessionResult = await db.query(
        'SELECT * FROM chat_sessions WHERE session_id = $1',
        [sessionId]
      );
      session = sessionResult.rows[0];
    }

    if (!session && userId) {
      const sessionResult = await db.query(
        'SELECT * FROM chat_sessions WHERE user_id = $1 ORDER BY started_at DESC LIMIT 1',
        [userId]
      );
      session = sessionResult.rows[0];
    }

    if (!session) {
      return res.json({ sessionId: sessionId || null, messages: [] });
    }

    // Get messages for this session
    const result = await db.query(
      `SELECT id, session_id, sender, message, created_at
       FROM chat_messages
       WHERE session_id = $1
       ORDER BY created_at ASC
       LIMIT 100`,
      [session.session_id]
    );

    const messages = result.rows.map((row) => ({
      id: row.id,
      sender: row.sender === 'bot' ? 'assistant' : row.sender,
      text: row.message,
      timestamp: row.created_at,
      sessionId: row.session_id
    }));

    return res.json({
      sessionId: session.session_id,
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

    // Check if session exists, create if not
    const sessionCheck = await db.query(
      'SELECT * FROM chat_sessions WHERE session_id = $1',
      [sessionId]
    );

    if (sessionCheck.rows.length === 0) {
      // Create new session
      await db.query(
        `INSERT INTO chat_sessions (session_id, user_id, started_at, message_count, resolved)
         VALUES ($1, $2, NOW(), 0, false)`,
        [sessionId, userId]
      );
    }

    let assistantReply;
    let shouldResolve = false;
    try {
      assistantReply = await generateAssistantReply({
        db,
        userId,
        message,
        roleHint
      });

      // Detect if user is satisfied (resolution keywords)
      const normalized = message.toLowerCase();
      if (normalized.includes('thank') || normalized.includes('solved') || 
          normalized.includes('fixed') || normalized.includes('got it') ||
          normalized.includes('perfect') || normalized.includes('great')) {
        shouldResolve = true;
      }
    } catch (error) {
      console.error('Error generating assistant reply:', error);
      assistantReply = 'I apologize, but I encountered an error processing your request. Please try again.';
    }

    // Insert user message
    const userInsert = await db.query(
      `INSERT INTO chat_messages (session_id, sender, message, created_at)
       VALUES ($1, 'user', $2, NOW())
       RETURNING id, sender, message, created_at`,
      [sessionId, message]
    );

    // Insert assistant message
    const assistantInsert = await db.query(
      `INSERT INTO chat_messages (session_id, sender, message, created_at)
       VALUES ($1, 'bot', $2, NOW())
       RETURNING id, sender, message, created_at`,
      [sessionId, assistantReply]
    );

    // Update session
    await db.query(
      `UPDATE chat_sessions 
       SET message_count = message_count + 2,
           ended_at = NOW(),
           resolved = CASE WHEN $2 = true THEN true ELSE resolved END
       WHERE session_id = $1`,
      [sessionId, shouldResolve]
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
        sender: 'assistant',
        text: assistantInsert.rows[0].message,
        timestamp: assistantInsert.rows[0].created_at
      }
    };

    // Send real-time notification to comm admin via WebSocket
    if (websocket) {
      websocket.broadcast('chat:new-message', {
        sessionId,
        userId,
        message: message,
        timestamp: new Date()
      });
    }

    // Send to user if they're online
    if (userId && websocket) {
      websocket.sendToUser(userId, 'chat:message', response.assistantMessage);
    }

    return res.status(201).json(response);
  } catch (error) {
    console.error('Chat message error:', error);
    return res.status(500).json({ message: 'Failed to process chat message', error: error.message });
  }
});

// Mark session as resolved
router.post('/resolve', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userId = getAuthUserId(req);
    const { sessionId, resolved } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' });
    }

    await db.query(
      `UPDATE chat_sessions 
       SET resolved = $1, ended_at = NOW()
       WHERE session_id = $2`,
      [resolved, sessionId]
    );

    return res.json({ message: 'Session updated successfully', resolved });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update session', error: error.message });
  }
});

// Get session details
router.get('/session/:sessionId', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { sessionId } = req.params;

    const sessionResult = await db.query(
      'SELECT * FROM chat_sessions WHERE session_id = $1',
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const messagesResult = await db.query(
      `SELECT id, sender, message, created_at
       FROM chat_messages
       WHERE session_id = $1
       ORDER BY created_at ASC`,
      [sessionId]
    );

    return res.json({
      session: sessionResult.rows[0],
      messages: messagesResult.rows
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get session', error: error.message });
  }
});

// End session
router.post('/end-session', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' });
    }

    await db.query(
      `UPDATE chat_sessions 
       SET ended_at = NOW()
       WHERE session_id = $1`,
      [sessionId]
    );

    return res.json({ message: 'Session ended successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to end session', error: error.message });
  }
});

// Submit feedback
router.post('/feedback', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { sessionId, feedback } = req.body;

    if (!sessionId || !feedback) {
      return res.status(400).json({ message: 'sessionId and feedback are required' });
    }

    if (!['positive', 'negative'].includes(feedback)) {
      return res.status(400).json({ message: 'feedback must be positive or negative' });
    }

    await db.query(
      `UPDATE chat_sessions 
       SET feedback = $1
       WHERE session_id = $2`,
      [feedback, sessionId]
    );

    return res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit feedback', error: error.message });
  }
});

// Escalate to human support
router.post('/escalate', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const websocket = req.app.locals.websocket;
    const userId = getAuthUserId(req);
    const { sessionId, reason } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' });
    }

    // Mark session as escalated
    await db.query(
      `UPDATE chat_sessions 
       SET escalated = true, escalated_at = NOW()
       WHERE session_id = $1`,
      [sessionId]
    );

    // Get user info
    let userEmail = 'Anonymous';
    if (userId) {
      const userResult = await db.query(
        'SELECT email FROM users WHERE id = $1',
        [userId]
      );
      userEmail = userResult.rows[0]?.email || 'Anonymous';
    }

    // Create message for comm admin
    await db.query(
      `INSERT INTO messages (user_id, subject, message, status, priority, category)
       VALUES ($1, $2, $3, 'unread', 'high', 'communication')`,
      [
        userId,
        `Chat Escalation from ${userEmail}`,
        `User has requested human support. Session ID: ${sessionId}\nReason: ${reason || 'Not specified'}\n\nPlease review the chat history and respond.`
      ]
    );

    // Notify comm admin via WebSocket
    if (websocket) {
      websocket.broadcast('chat:escalation', {
        sessionId,
        userId,
        userEmail,
        reason,
        timestamp: new Date()
      });
    }

    return res.json({ message: 'Your request has been escalated to our support team. They will respond shortly.' });
  } catch (error) {
    console.error('Escalation error:', error);
    return res.status(500).json({ message: 'Failed to escalate', error: error.message });
  }
});

module.exports = router;