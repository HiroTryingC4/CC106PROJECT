const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../utils/authMiddleware');

// Middleware to set req.user from req.userId
const setUserFromAuth = async (req, res, next) => {
  if (req.userId) {
    const db = req.app.locals.db;
    const result = await db.query('SELECT id, email, first_name, last_name, role FROM users WHERE id = $1', [req.userId]);
    if (result.rows.length > 0) {
      req.user = result.rows[0];
    }
  }
  next();
};

// Get communication dashboard stats
router.get('/dashboard/stats', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Get total messages count
    const messagesResult = await db.query(
      'SELECT COUNT(*) as total FROM messages'
    );
    const totalMessages = parseInt(messagesResult.rows[0].total) || 0;

    // Get chatbot conversations count (from chat_sessions)
    const chatbotResult = await db.query(
      "SELECT COUNT(DISTINCT session_id) as total FROM chat_sessions WHERE started_at >= NOW() - INTERVAL '30 days'"
    );
    const chatbotConversations = parseInt(chatbotResult.rows[0]?.total) || 0;

    // Calculate average response time (in hours)
    const responseTimeResult = await db.query(`
      SELECT AVG(EXTRACT(EPOCH FROM (m.replied_at - m.created_at)) / 3600) as avg_hours
      FROM messages m
      WHERE m.replied_at IS NOT NULL
      AND m.created_at >= NOW() - INTERVAL '30 days'
    `);
    const avgResponseTime = parseFloat(responseTimeResult.rows[0]?.avg_hours) || 0;

    // Calculate success rate (replied messages / total messages)
    const successResult = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN replied_at IS NOT NULL THEN 1 ELSE 0 END) as replied
      FROM messages
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);
    const total = parseInt(successResult.rows[0]?.total) || 0;
    const replied = parseInt(successResult.rows[0]?.replied) || 0;
    const successRate = total > 0 ? ((replied / total) * 100).toFixed(2) : 0;

    res.json({
      totalMessages,
      chatbotConversations,
      avgResponseTime: avgResponseTime.toFixed(1),
      successRate
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats', details: error.message });
  }
});

// Get recent activity
router.get('/dashboard/activity', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const result = await db.query(`
      SELECT 
        m.id,
        'message' as type,
        CONCAT('New message from ', u.email) as title,
        u.email as description,
        m.created_at as time,
        m.status,
        m.priority,
        CASE 
          WHEN m.priority = 'urgent' THEN 'urgent'
          WHEN m.status = 'unread' THEN 'normal'
          ELSE 'low'
        END as priority_level
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY m.created_at DESC
      LIMIT 5
    `);

    const formattedActivities = result.rows.map(activity => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      time: getTimeAgo(activity.time),
      status: activity.status || 'unread',
      priority: activity.priority_level
    }));

    res.json(formattedActivities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity', details: error.message });
  }
});

// Get all messages
router.get('/messages', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { search, status } = req.query;
    
    let query = `
      SELECT 
        m.id,
        m.subject,
        m.message as preview,
        m.message as "fullMessage",
        m.status,
        m.priority,
        m.category,
        m.created_at as timestamp,
        m.replied_at as "repliedAt",
        m.replied_by as "repliedBy",
        CASE WHEN m.replied_at IS NOT NULL THEN 'replied' ELSE 'pending' END as "replyStatus",
        u.email as "from",
        CONCAT(u.first_name, ' ', u.last_name, ' (', u.role, ')') as "fromName",
        u.role as "userType"
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (search) {
      query += ` AND (u.email ILIKE $${paramCount} OR m.subject ILIKE $${paramCount + 1} OR m.message ILIKE $${paramCount + 2})`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
      paramCount += 3;
    }
    
    if (status && status !== 'all') {
      query += ` AND m.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    query += ` ORDER BY m.created_at DESC`;
    
    const result = await db.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
});

// Reply to a message
router.post('/messages/:id/reply', requireAuth, requireRole('admin', 'communication_admin'), setUserFromAuth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { reply } = req.body;
    const adminId = req.user.id;
    
    await db.query(
      `UPDATE messages 
       SET status = 'read', 
           replied_at = NOW(), 
           replied_by = $1,
           reply_message = $2
       WHERE id = $3`,
      [adminId, reply, id]
    );
    
    res.json({ message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ error: 'Failed to send reply', details: error.message });
  }
});

// Mark message as read
router.put('/messages/:id/read', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    
    await db.query(
      'UPDATE messages SET status = $1 WHERE id = $2',
      ['read', id]
    );
    
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read', details: error.message });
  }
});

// Delete message
router.delete('/messages/:id', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    
    await db.query('DELETE FROM messages WHERE id = $1', [id]);
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message', details: error.message });
  }
});

// Get chatbot analytics stats
router.get('/chatbot/analytics/stats', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { timeRange = '7d' } = req.query;
    
    // Calculate time interval
    let interval = '7 days';
    if (timeRange === '24h') interval = '24 hours';
    else if (timeRange === '30d') interval = '30 days';
    else if (timeRange === '90d') interval = '90 days';
    
    // Total conversations
    const conversationsResult = await db.query(
      `SELECT COUNT(*) as total FROM chat_sessions WHERE started_at >= NOW() - INTERVAL '${interval}'`
    );
    const totalConversations = parseInt(conversationsResult.rows[0]?.total) || 0;
    
    // Active users
    const usersResult = await db.query(
      `SELECT COUNT(DISTINCT user_id) as total FROM chat_sessions WHERE started_at >= NOW() - INTERVAL '${interval}' AND user_id IS NOT NULL`
    );
    const activeUsers = parseInt(usersResult.rows[0]?.total) || 0;
    
    // Average response time (in seconds)
    const avgResponseTime = 1.2; // Placeholder - would need message timestamps to calculate
    
    // Success rate (resolved conversations)
    const successResult = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN resolved = true THEN 1 ELSE 0 END) as resolved
      FROM chat_sessions
      WHERE started_at >= NOW() - INTERVAL '${interval}'`
    );
    const total = parseInt(successResult.rows[0]?.total) || 0;
    const resolved = parseInt(successResult.rows[0]?.resolved) || 0;
    const successRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;
    
    res.json({
      totalConversations,
      activeUsers,
      avgResponseTime,
      successRate
    });
  } catch (error) {
    console.error('Error fetching chatbot analytics stats:', error);
    res.status(500).json({ error: 'Failed to fetch analytics stats', details: error.message });
  }
});

// Get chatbot performance metrics
router.get('/chatbot/analytics/performance', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { timeRange = '7d' } = req.query;
    
    let interval = '7 days';
    if (timeRange === '24h') interval = '24 hours';
    else if (timeRange === '30d') interval = '30 days';
    else if (timeRange === '90d') interval = '90 days';
    
    // Resolution rate
    const resolutionResult = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN resolved = true THEN 1 ELSE 0 END) as resolved
      FROM chat_sessions
      WHERE started_at >= NOW() - INTERVAL '${interval}'`
    );
    const total = parseInt(resolutionResult.rows[0]?.total) || 0;
    const resolved = parseInt(resolutionResult.rows[0]?.resolved) || 0;
    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;
    
    // User satisfaction - calculate from resolved sessions (assuming resolved = satisfied)
    const userSatisfaction = resolutionRate;
    
    // Escalation rate - sessions that ended but not resolved
    const escalationResult = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN ended_at IS NOT NULL AND resolved = false THEN 1 ELSE 0 END) as escalated
      FROM chat_sessions
      WHERE started_at >= NOW() - INTERVAL '${interval}'`
    );
    const totalSessions = parseInt(escalationResult.rows[0]?.total) || 0;
    const escalated = parseInt(escalationResult.rows[0]?.escalated) || 0;
    const escalationRate = totalSessions > 0 ? ((escalated / totalSessions) * 100).toFixed(1) : 0;
    
    // Peak hours - find hour with most sessions
    const peakHoursResult = await db.query(
      `SELECT 
        EXTRACT(HOUR FROM started_at) as hour,
        COUNT(*) as count
      FROM chat_sessions
      WHERE started_at >= NOW() - INTERVAL '${interval}'
      GROUP BY EXTRACT(HOUR FROM started_at)
      ORDER BY count DESC
      LIMIT 1`
    );
    const peakHour = peakHoursResult.rows[0]?.hour;
    const peakHours = peakHour !== undefined 
      ? `${Math.floor(peakHour)}:00 - ${Math.floor(peakHour) + 1}:00`
      : 'N/A';
    
    // Busiest day - find day of week with most sessions
    const busiestDayResult = await db.query(
      `SELECT 
        TO_CHAR(started_at, 'Day') as day_name,
        COUNT(*) as count
      FROM chat_sessions
      WHERE started_at >= NOW() - INTERVAL '${interval}'
      GROUP BY TO_CHAR(started_at, 'Day'), EXTRACT(DOW FROM started_at)
      ORDER BY count DESC
      LIMIT 1`
    );
    const busiestDay = busiestDayResult.rows[0]?.day_name?.trim() || 'N/A';
    
    // Average session length
    const sessionLengthResult = await db.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_seconds
      FROM chat_sessions
      WHERE ended_at IS NOT NULL
      AND started_at >= NOW() - INTERVAL '${interval}'`
    );
    const avgSeconds = parseFloat(sessionLengthResult.rows[0]?.avg_seconds) || 0;
    const avgMinutes = Math.floor(avgSeconds / 60);
    const avgSecondsRemainder = Math.floor(avgSeconds % 60);
    const avgSessionLength = `${avgMinutes}m ${avgSecondsRemainder}s`;
    
    // Return users - users with more than one session
    const returnUsersResult = await db.query(
      `SELECT 
        COUNT(DISTINCT user_id) as total_users,
        COUNT(DISTINCT CASE WHEN session_count > 1 THEN user_id END) as return_users
      FROM (
        SELECT user_id, COUNT(*) as session_count
        FROM chat_sessions
        WHERE user_id IS NOT NULL
        AND started_at >= NOW() - INTERVAL '${interval}'
        GROUP BY user_id
      ) as user_sessions`
    );
    const totalUsers = parseInt(returnUsersResult.rows[0]?.total_users) || 0;
    const returnUsersCount = parseInt(returnUsersResult.rows[0]?.return_users) || 0;
    const returnUsers = totalUsers > 0 ? ((returnUsersCount / totalUsers) * 100).toFixed(1) : 0;
    
    res.json({
      resolutionRate,
      userSatisfaction,
      escalationRate,
      peakHours,
      busiestDay,
      avgSessionLength,
      returnUsers
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics', details: error.message });
  }
});

// Get top questions from chatbot
router.get('/chatbot/analytics/top-questions', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { timeRange = '7d', limit = 5 } = req.query;
    
    let interval = '7 days';
    if (timeRange === '24h') interval = '24 hours';
    else if (timeRange === '30d') interval = '30 days';
    else if (timeRange === '90d') interval = '90 days';
    
    // Get most frequent questions from chat messages
    const result = await db.query(
      `SELECT 
        cm.message as question,
        COUNT(*) as count
      FROM chat_messages cm
      JOIN chat_sessions cs ON cm.session_id = cs.session_id
      WHERE cm.sender = 'user'
      AND cs.started_at >= NOW() - INTERVAL '${interval}'
      AND LENGTH(cm.message) > 10
      GROUP BY cm.message
      ORDER BY count DESC
      LIMIT $1`,
      [limit]
    );
    
    // Calculate total for percentage
    const totalResult = await db.query(
      `SELECT COUNT(*) as total
      FROM chat_messages cm
      JOIN chat_sessions cs ON cm.session_id = cs.session_id
      WHERE cm.sender = 'user'
      AND cs.started_at >= NOW() - INTERVAL '${interval}'`
    );
    
    const total = parseInt(totalResult.rows[0]?.total) || 1;
    
    const topQuestions = result.rows.map(row => ({
      question: row.question,
      count: parseInt(row.count),
      percentage: ((parseInt(row.count) / total) * 100).toFixed(1)
    }));
    
    res.json(topQuestions);
  } catch (error) {
    console.error('Error fetching top questions:', error);
    res.status(500).json({ error: 'Failed to fetch top questions', details: error.message });
  }
});

// Get unanswered questions from chatbot
router.get('/chatbot/analytics/unanswered-questions', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { timeRange = '7d', limit = 5 } = req.query;
    
    let interval = '7 days';
    if (timeRange === '24h') interval = '24 hours';
    else if (timeRange === '30d') interval = '30 days';
    else if (timeRange === '90d') interval = '90 days';
    
    // Get questions from unresolved sessions
    const result = await db.query(
      `SELECT 
        cm.message as question,
        COUNT(*) as count,
        MAX(cm.created_at) as last_asked
      FROM chat_messages cm
      JOIN chat_sessions cs ON cm.session_id = cs.session_id
      WHERE cm.sender = 'user'
      AND cs.resolved = false
      AND cs.started_at >= NOW() - INTERVAL '${interval}'
      AND LENGTH(cm.message) > 10
      GROUP BY cm.message
      ORDER BY count DESC, last_asked DESC
      LIMIT $1`,
      [limit]
    );
    
    const unansweredQuestions = result.rows.map(row => ({
      question: row.question,
      count: parseInt(row.count),
      timestamp: getTimeAgo(row.last_asked)
    }));
    
    res.json(unansweredQuestions);
  } catch (error) {
    console.error('Error fetching unanswered questions:', error);
    res.status(500).json({ error: 'Failed to fetch unanswered questions', details: error.message });
  }
});

// Get recent conversations
router.get('/chatbot/analytics/conversations', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { limit = 10 } = req.query;
    
    const result = await db.query(
      `SELECT 
        cs.id,
        cs.session_id,
        COALESCE(u.email, 'Anonymous') as user,
        cs.message_count as messages,
        CASE 
          WHEN cs.ended_at IS NOT NULL THEN 
            CONCAT(
              EXTRACT(EPOCH FROM (cs.ended_at - cs.started_at))::INTEGER / 60, 'm ',
              EXTRACT(EPOCH FROM (cs.ended_at - cs.started_at))::INTEGER % 60, 's'
            )
          ELSE 'Ongoing'
        END as duration,
        CASE 
          WHEN cs.resolved = true THEN 'resolved'
          WHEN cs.ended_at IS NULL THEN 'ongoing'
          ELSE 'escalated'
        END as status,
        cs.started_at,
        'positive' as satisfaction
      FROM chat_sessions cs
      LEFT JOIN users u ON cs.user_id = u.id
      ORDER BY cs.started_at DESC
      LIMIT $1`,
      [limit]
    );
    
    const conversations = result.rows.map(conv => ({
      id: conv.id,
      user: conv.user,
      messages: conv.messages,
      duration: conv.duration,
      status: conv.status,
      timestamp: getTimeAgo(conv.started_at),
      satisfaction: conv.satisfaction
    }));
    
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations', details: error.message });
  }
});

// Get active chat sessions
router.get('/chatbot/active-sessions', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const result = await db.query(
      `SELECT 
        cs.session_id,
        cs.user_id,
        cs.message_count,
        cs.started_at,
        cs.ended_at,
        cs.escalated,
        cs.resolved,
        COALESCE(u.email, 'Anonymous') as user_email,
        (
          SELECT message 
          FROM chat_messages 
          WHERE session_id = cs.session_id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT created_at 
          FROM chat_messages 
          WHERE session_id = cs.session_id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message_time
      FROM chat_sessions cs
      LEFT JOIN users u ON cs.user_id = u.id
      ORDER BY cs.started_at DESC
      LIMIT 50`
    );
    
    const sessions = result.rows.map(row => ({
      sessionId: row.session_id,
      userId: row.user_id,
      userEmail: row.user_email,
      messageCount: row.message_count,
      startedAt: row.started_at,
      lastMessage: row.last_message,
      lastMessageTime: row.last_message_time,
      escalated: row.escalated,
      resolved: row.resolved,
      timeAgo: getTimeAgo(row.last_message_time || row.started_at)
    }));
    
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({ error: 'Failed to fetch active sessions', details: error.message });
  }
});

// Get session details with full conversation
router.get('/chatbot/session/:sessionId', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { sessionId } = req.params;
    
    const sessionResult = await db.query(
      `SELECT 
        cs.*,
        COALESCE(u.email, 'Anonymous') as user_email,
        COALESCE(u.first_name, 'Anonymous') as first_name,
        COALESCE(u.last_name, 'User') as last_name
      FROM chat_sessions cs
      LEFT JOIN users u ON cs.user_id = u.id
      WHERE cs.session_id = $1`,
      [sessionId]
    );
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const messagesResult = await db.query(
      `SELECT id, sender, message, created_at
       FROM chat_messages
       WHERE session_id = $1
       ORDER BY created_at ASC`,
      [sessionId]
    );
    
    res.json({
      session: sessionResult.rows[0],
      messages: messagesResult.rows
    });
  } catch (error) {
    console.error('Error fetching session details:', error);
    res.status(500).json({ error: 'Failed to fetch session details', details: error.message });
  }
});

// Join/take over a chat session
router.post('/chatbot/join-session', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const websocket = req.app.locals.websocket;
    const { sessionId } = req.body;
    const adminId = req.userId;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    await db.query(
      `UPDATE chat_sessions SET admin_joined = true, admin_id = $1 WHERE session_id = $2`,
      [adminId, sessionId]
    );

    const sessionResult = await db.query(
      'SELECT user_id FROM chat_sessions WHERE session_id = $1',
      [sessionId]
    );
    const userId = sessionResult.rows[0]?.user_id;

    if (userId && websocket) {
      websocket.sendToUser(userId, 'chat:admin-joined', {
        sessionId,
        message: 'A support agent has joined the conversation'
      });
    }

    res.json({ message: 'Successfully joined session' });
  } catch (error) {
    console.error('Error joining session:', error);
    res.status(500).json({ error: 'Failed to join session', details: error.message });
  }
});

// Send message as admin in chat session
router.post('/chatbot/send-message', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const websocket = req.app.locals.websocket;
    const { sessionId, message } = req.body;
    const adminId = req.userId;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }

    // Insert admin message
    const result = await db.query(
      `INSERT INTO chat_messages (session_id, sender, message, created_at)
       VALUES ($1, 'admin', $2, NOW())
       RETURNING id, sender, message, created_at`,
      [sessionId, message]
    );

    // Update session
    await db.query(
      `UPDATE chat_sessions
       SET message_count = message_count + 1,
           ended_at = NOW(),
           admin_id = $1
       WHERE session_id = $2`,
      [adminId, sessionId]
    );

    // Get session user_id to notify via WebSocket
    const sessionResult = await db.query(
      'SELECT user_id FROM chat_sessions WHERE session_id = $1',
      [sessionId]
    );
    const userId = sessionResult.rows[0]?.user_id;

    if (userId && websocket) {
      websocket.sendToUser(userId, 'chat:admin-message', {
        id: result.rows[0].id,
        sender: 'admin',
        text: result.rows[0].message,
        timestamp: result.rows[0].created_at
      });
    }

    res.json({ message: 'Message sent successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error sending admin message:', error);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
});

// Mark session as resolved
router.put('/chatbot/session/:sessionId/resolve', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const websocket = req.app.locals.websocket;
    const { sessionId } = req.params;
    const { resolved, notes } = req.body;
    
    await db.query(
      `UPDATE chat_sessions 
       SET resolved = $1, 
           resolution_notes = $2,
           ended_at = NOW()
       WHERE session_id = $3`,
      [resolved, notes, sessionId]
    );
    
    // Get session user_id
    const sessionResult = await db.query(
      'SELECT user_id FROM chat_sessions WHERE session_id = $1',
      [sessionId]
    );
    
    const userId = sessionResult.rows[0]?.user_id;
    
    // Notify user via WebSocket
    if (userId && websocket) {
      websocket.sendToUser(userId, 'chat:session-resolved', {
        sessionId,
        resolved,
        message: resolved ? 'Your issue has been resolved' : 'Session reopened'
      });
    }
    
    res.json({ message: 'Session updated successfully' });
  } catch (error) {
    console.error('Error resolving session:', error);
    res.status(500).json({ error: 'Failed to resolve session', details: error.message });
  }
});

// Get escalated sessions
router.get('/chatbot/escalated', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const result = await db.query(
      `SELECT 
        cs.session_id,
        cs.user_id,
        cs.message_count,
        cs.escalated_at,
        cs.resolved,
        COALESCE(u.email, 'Anonymous') as user_email,
        (
          SELECT message 
          FROM chat_messages 
          WHERE session_id = cs.session_id 
          AND sender = 'user'
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_user_message
      FROM chat_sessions cs
      LEFT JOIN users u ON cs.user_id = u.id
      WHERE cs.escalated = true
      AND cs.resolved = false
      ORDER BY cs.escalated_at DESC
      LIMIT 50`
    );
    
    const sessions = result.rows.map(row => ({
      sessionId: row.session_id,
      userId: row.user_id,
      userEmail: row.user_email,
      messageCount: row.message_count,
      escalatedAt: row.escalated_at,
      reason: row.last_user_message,
      timeAgo: getTimeAgo(row.escalated_at)
    }));
    
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching escalated sessions:', error);
    res.status(500).json({ error: 'Failed to fetch escalated sessions', details: error.message });
  }
});

// Get communication settings
router.get('/settings', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const result = await db.query(
      'SELECT * FROM communication_settings WHERE id = 1'
    );
    
    if (result.rows.length === 0) {
      // Return default settings
      return res.json({
        emailNotifications: true,
        messageAlerts: true,
        chatbotAlerts: false,
        autoResponse: true,
        responseTime: 2,
        maxConcurrentChats: 10
      });
    }
    
    const settings = result.rows[0];
    res.json({
      emailNotifications: settings.email_notifications,
      messageAlerts: settings.message_alerts,
      chatbotAlerts: settings.chatbot_alerts,
      autoResponse: settings.auto_response,
      responseTime: settings.response_time_hours,
      maxConcurrentChats: settings.max_concurrent_chats
    });
  } catch (error) {
    console.error('Error fetching communication settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings', details: error.message });
  }
});

// Update communication settings
router.put('/settings', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { 
      emailNotifications, 
      messageAlerts, 
      chatbotAlerts, 
      autoResponse, 
      responseTime, 
      maxConcurrentChats 
    } = req.body;
    
    const existing = await db.query('SELECT id FROM communication_settings WHERE id = 1');
    
    if (existing.rows.length === 0) {
      await db.query(
        `INSERT INTO communication_settings 
         (id, email_notifications, message_alerts, chatbot_alerts, auto_response, response_time_hours, max_concurrent_chats) 
         VALUES (1, $1, $2, $3, $4, $5, $6)`,
        [emailNotifications, messageAlerts, chatbotAlerts, autoResponse, responseTime, maxConcurrentChats]
      );
    } else {
      await db.query(
        `UPDATE communication_settings 
         SET email_notifications = $1, 
             message_alerts = $2, 
             chatbot_alerts = $3, 
             auto_response = $4, 
             response_time_hours = $5, 
             max_concurrent_chats = $6,
             updated_at = NOW()
         WHERE id = 1`,
        [emailNotifications, messageAlerts, chatbotAlerts, autoResponse, responseTime, maxConcurrentChats]
      );
    }
    
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating communication settings:', error);
    res.status(500).json({ error: 'Failed to update settings', details: error.message });
  }
});

// Get system status
router.get('/system-status', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const result = await db.query(
      'SELECT service_name, status, last_checked FROM system_status ORDER BY service_name'
    );
    
    const statusMap = {
      message_system: { name: 'Message System', status: 'online' },
      chatbot_service: { name: 'Chatbot Service', status: 'online' },
      notification_service: { name: 'Notification Service', status: 'online' }
    };
    
    result.rows.forEach(row => {
      const key = row.service_name;
      if (statusMap[key]) {
        statusMap[key].status = row.status;
      }
    });
    
    res.json(Object.values(statusMap));
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({ error: 'Failed to fetch system status', details: error.message });
  }
});

// Get chatbot settings
router.get('/chatbot/settings', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const result = await db.query(
      'SELECT * FROM chatbot_settings WHERE id = 1'
    );
    
    if (result.rows.length === 0) {
      // Return default settings
      return res.json({
        enabled: true,
        welcomeMessage: "Hello! I'm your smart assistant. How can I help you today?",
        fallbackMessage: "I'm not sure I understand that. Could you rephrase that?",
        responseDelay: 3000
      });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching chatbot settings:', error);
    res.status(500).json({ error: 'Failed to fetch chatbot settings', details: error.message });
  }
});

// Update chatbot settings
router.put('/chatbot/settings', requireAuth, requireRole('admin', 'communication_admin'), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { enabled, welcomeMessage, fallbackMessage, responseDelay } = req.body;
    
    const existing = await db.query('SELECT id FROM chatbot_settings WHERE id = 1');
    
    if (existing.rows.length === 0) {
      await db.query(
        `INSERT INTO chatbot_settings (id, enabled, welcome_message, fallback_message, response_delay) 
         VALUES (1, $1, $2, $3, $4)`,
        [enabled, welcomeMessage, fallbackMessage, responseDelay]
      );
    } else {
      await db.query(
        `UPDATE chatbot_settings 
         SET enabled = $1, welcome_message = $2, fallback_message = $3, response_delay = $4
         WHERE id = 1`,
        [enabled, welcomeMessage, fallbackMessage, responseDelay]
      );
    }
    
    res.json({ message: 'Chatbot settings updated successfully' });
  } catch (error) {
    console.error('Error updating chatbot settings:', error);
    res.status(500).json({ error: 'Failed to update chatbot settings', details: error.message });
  }
});

// Helper function to format time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
}

module.exports = router;
