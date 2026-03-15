const express = require('express');
const router = express.Router();

// GET /api/bookings
router.get('/', (req, res) => {
  res.json({ message: 'Bookings list endpoint - coming soon' });
});

// POST /api/bookings
router.post('/', (req, res) => {
  res.json({ message: 'Create booking endpoint - coming soon' });
});

module.exports = router;