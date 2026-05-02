const express = require('express');
const router = express.Router();
const { getAuthUserId } = require('../utils/authMiddleware');
const crypto = require('crypto');

const getPool = (req) => req.app.locals.db;

// POST /api/pending-bookings - Store booking data temporarily before payment
router.post('/', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const { bookingData } = req.body;
    
    if (!bookingData) {
      return res.status(400).json({ message: 'Booking data is required' });
    }

    const pool = getPool(req);
    
    // Generate unique pending ID
    const pendingId = `PB-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    
    // Store for 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
    await pool.query(
      `INSERT INTO pending_bookings (pending_id, guest_id, booking_data, expires_at, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [pendingId, userId, JSON.stringify(bookingData), expiresAt]
    );

    return res.json({ pendingId });
  } catch (error) {
    console.error('Error storing pending booking:', error);
    return res.status(500).json({ message: 'Failed to store booking data' });
  }
});

// GET /api/pending-bookings/:pendingId - Retrieve pending booking data
router.get('/:pendingId', async (req, res) => {
  try {
    const { pendingId } = req.params;
    
    console.log('Retrieving pending booking:', pendingId);
    
    if (!pendingId) {
      return res.status(400).json({ message: 'Pending ID is required' });
    }

    const pool = getPool(req);
    
    const result = await pool.query(
      `SELECT booking_data, expires_at FROM pending_bookings 
       WHERE pending_id = $1 AND expires_at > NOW()`,
      [pendingId]
    );

    console.log('Query result:', result.rows.length, 'rows found');

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pending booking not found or expired' });
    }

    const bookingData = result.rows[0].booking_data;
    
    console.log('Retrieved booking data:', bookingData);
    
    // Delete after retrieval (one-time use)
    await pool.query('DELETE FROM pending_bookings WHERE pending_id = $1', [pendingId]);

    return res.json({ bookingData });
  } catch (error) {
    console.error('Error retrieving pending booking:', error);
    return res.status(500).json({ message: 'Failed to retrieve booking data' });
  }
});

module.exports = router;
