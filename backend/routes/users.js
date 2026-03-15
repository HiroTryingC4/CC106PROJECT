const express = require('express');
const router = express.Router();

// GET /api/users/profile
router.get('/profile', (req, res) => {
  res.json({ message: 'User profile endpoint - coming soon' });
});

// PUT /api/users/profile
router.put('/profile', (req, res) => {
  res.json({ message: 'Update profile endpoint - coming soon' });
});

module.exports = router;