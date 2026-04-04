const express = require('express');
const router = express.Router();

// Will be set by server.js after hostRouter is loaded
let hostRouter = null;

router.setHostRouter = (router) => {
  hostRouter = router;
};

// Simple in-memory user storage (for design/testing purposes)
let users = [
  // Admin accounts
  {
    id: 1,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@smartstay.com',
    password: 'admin123',
    role: 'admin',
    verificationStatus: 'verified'
  },
  {
    id: 2,
    firstName: 'Communication',
    lastName: 'Admin',
    email: 'comadmin@smartstay.com',
    password: 'comadmin123',
    role: 'communication_admin',
    verificationStatus: 'verified'
  },
  // Host accounts
  {
    id: 3,
    firstName: 'John',
    lastName: 'Host',
    email: 'host@smartstay.com',
    password: 'host123',
    role: 'host',
    verificationStatus: 'verified'
  },
  {
    id: 4,
    firstName: 'Sarah',
    lastName: 'NewHost',
    email: 'newhost@smartstay.com',
    password: 'newhost123',
    role: 'host',
    verificationStatus: 'not_submitted'
  },
  // Guest account
  {
    id: 5,
    firstName: 'Jane',
    lastName: 'Guest',
    email: 'guest@smartstay.com',
    password: 'guest123',
    role: 'guest',
    verificationStatus: 'not_required'
  }
];

// Simple token generation
const generateToken = (user) => {
  return `token_${user.id}_${Date.now()}`;
};

// Password validation function
const validatePassword = (password) => {
  const requirements = {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  const isValid = Object.values(requirements).every(req => req);
  const errors = [];

  if (!requirements.minLength) errors.push('Password must be at least 12 characters long');
  if (!requirements.hasUppercase) errors.push('Password must contain at least one uppercase letter (A-Z)');
  if (!requirements.hasLowercase) errors.push('Password must contain at least one lowercase letter (a-z)');
  if (!requirements.hasNumber) errors.push('Password must contain at least one number (0-9)');
  if (!requirements.hasSpecialChar) errors.push('Password must contain at least one special character (!@#$%^&*)');

  return { isValid, errors, requirements };
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
  const { firstName, lastName, email, phone, company, password, role } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ 
      message: 'Password does not meet requirements',
      errors: passwordValidation.errors
    });
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
    phone: phone || '',
    company: company || '',
    password,
    role: role || 'guest',
    verificationStatus: role === 'host' ? 'not_submitted' : 'not_required'
  };

  users.push(newUser);

  // Initialize host data if registering as a host
  if (role === 'host' && hostRouter && hostRouter.initializeNewHost) {
    hostRouter.initializeNewHost(newUser.id, firstName, lastName, email, company);
  }

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