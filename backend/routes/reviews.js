const express = require('express');
const router = express.Router();

// GET /api/reviews
router.get('/', (req, res) => {
  res.json({ message: 'Reviews list endpoint - coming soon' });
});

// POST /api/reviews
router.post('/', (req, res) => {
  res.json({ message: 'Create review endpoint - coming soon' });
});

module.exports = router;