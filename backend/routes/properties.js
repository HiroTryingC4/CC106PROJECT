const express = require('express');
const router = express.Router();

// GET /api/properties
router.get('/', (req, res) => {
  res.json({ message: 'Properties list endpoint - coming soon' });
});

// POST /api/properties
router.post('/', (req, res) => {
  res.json({ message: 'Create property endpoint - coming soon' });
});

module.exports = router;