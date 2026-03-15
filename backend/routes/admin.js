const express = require('express');
const router = express.Router();

// GET /api/admin/dashboard
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Admin dashboard endpoint - coming soon' });
});

// GET /api/admin/users
router.get('/users', (req, res) => {
  res.json({ message: 'Admin users management endpoint - coming soon' });
});

module.exports = router;