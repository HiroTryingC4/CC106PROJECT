const express = require('express');
const router = express.Router();

// POST /api/payments/process
router.post('/process', (req, res) => {
  res.json({ message: 'Payment processing endpoint - coming soon' });
});

module.exports = router;