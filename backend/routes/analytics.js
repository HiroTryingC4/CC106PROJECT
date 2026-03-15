const express = require('express');
const router = express.Router();

// GET /api/analytics/host
router.get('/host', (req, res) => {
  res.json({ message: 'Host analytics endpoint - coming soon' });
});

// GET /api/analytics/admin
router.get('/admin', (req, res) => {
  res.json({ message: 'Admin analytics endpoint - coming soon' });
});

module.exports = router;