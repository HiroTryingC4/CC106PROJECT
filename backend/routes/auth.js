const express = require('express');
const router = express.Router();

// Simple in-memory user storage (for design/testing purposes)
let users = [
  {
    id: 1,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@smartstay.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: 2,
    firstName: 'John',
    lastName: 'Host',
    email: 'host@smartstay.com',
    password: 'host123',
    role: 'host'
  },
  {
    id: 3,
    firstName: 'Jane',
    lastName: 'Guest',
    email: 'guest@smartstay.com',
    password: 'guest123',
    role: 'guest'
  }
];

// Simple token generation
const generateToken = (user) => {
  return `token_${user.id}_${Date.now()}`;
};

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Find user
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Generate token
  const token = generateToken(user);

  // Return user data (without password)
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    message: 'Login successful',
    user: userWithoutPassword,
    token: token
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ message: 'User with this email already exists' });
  }

  // Create new user
  const newUser = {
    id: users.length + 1,
    firstName,
    lastName,
    email,
    password,
    role: role || 'guest'
  };

  users.push(newUser);

  // Generate token
  const token = generateToken(newUser);

  // Return user data (without password)
  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({
    message: 'Registration successful',
    user: userWithoutPassword,
    token: token
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// GET /api/auth/me (get current user)
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Simple token validation (extract user ID from token)
  const userId = parseInt(token.split('_')[1]);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // Return user data (without password)
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

module.exports = router;