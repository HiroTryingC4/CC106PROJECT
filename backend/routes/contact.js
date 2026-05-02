const express = require('express');
const router = express.Router();
const { getAuthUserId } = require('../utils/authMiddleware');

const getPool = (req) => req.app.locals.db;

const isAdmin = async (req, userId) => {
  const pool = getPool(req);
  const result = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
  return result.rows[0]?.role === 'admin' || result.rows[0]?.role === 'communication_admin';
};

// POST /api/contact - Submit contact message (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const pool = getPool(req);
    const result = await pool.query(
      `
        INSERT INTO contact_messages (name, email, subject, message, status, created_at)
        VALUES ($1, $2, $3, $4, 'unread', NOW())
        RETURNING *
      `,
      [name, email, subject || 'General Inquiry', message]
    );

    return res.status(201).json({
      message: 'Message sent successfully. We will get back to you soon!',
      contactMessage: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating contact message:', error);
    return res.status(500).json({ message: 'Failed to send message' });
  }
});

// GET /api/contact - Get all contact messages (admin only)
router.get('/', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId || !(await isAdmin(req, userId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const pool = getPool(req);
    const { status } = req.query;

    let query = 'SELECT * FROM contact_messages';
    const params = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    return res.json({
      messages: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// GET /api/contact/:id - Get single contact message (admin only)
router.get('/:id', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId || !(await isAdmin(req, userId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messageId = parseInt(req.params.id, 10);
    if (Number.isNaN(messageId)) {
      return res.status(400).json({ message: 'Invalid message ID' });
    }

    const pool = getPool(req);
    const result = await pool.query('SELECT * FROM contact_messages WHERE id = $1', [messageId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching contact message:', error);
    return res.status(500).json({ message: 'Failed to fetch message' });
  }
});

// PUT /api/contact/:id/status - Update message status (admin only)
router.put('/:id/status', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId || !(await isAdmin(req, userId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messageId = parseInt(req.params.id, 10);
    if (Number.isNaN(messageId)) {
      return res.status(400).json({ message: 'Invalid message ID' });
    }

    const { status } = req.body;
    if (!['unread', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const pool = getPool(req);
    const result = await pool.query(
      `
        UPDATE contact_messages
        SET status = $1
        WHERE id = $2
        RETURNING *
      `,
      [status, messageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    return res.json({
      message: 'Status updated successfully',
      contactMessage: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating message status:', error);
    return res.status(500).json({ message: 'Failed to update status' });
  }
});

// PUT /api/contact/:id/reply - Reply to message (admin only)
router.put('/:id/reply', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId || !(await isAdmin(req, userId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messageId = parseInt(req.params.id, 10);
    if (Number.isNaN(messageId)) {
      return res.status(400).json({ message: 'Invalid message ID' });
    }

    const { replyMessage } = req.body;
    if (!replyMessage) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    const pool = getPool(req);
    const result = await pool.query(
      `
        UPDATE contact_messages
        SET
          reply_message = $1,
          replied_at = NOW(),
          status = 'replied'
        WHERE id = $2
        RETURNING *
      `,
      [replyMessage, messageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    return res.json({
      message: 'Reply sent successfully',
      contactMessage: result.rows[0]
    });
  } catch (error) {
    console.error('Error replying to message:', error);
    return res.status(500).json({ message: 'Failed to send reply' });
  }
});

// DELETE /api/contact/:id - Delete contact message (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId || !(await isAdmin(req, userId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messageId = parseInt(req.params.id, 10);
    if (Number.isNaN(messageId)) {
      return res.status(400).json({ message: 'Invalid message ID' });
    }

    const pool = getPool(req);
    const result = await pool.query('DELETE FROM contact_messages WHERE id = $1 RETURNING id', [messageId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    return res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    return res.status(500).json({ message: 'Failed to delete message' });
  }
});

module.exports = router;
