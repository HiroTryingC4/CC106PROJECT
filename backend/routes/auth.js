const express = require('express');
const router = express.Router();
const { createUserRepository } = require('../repo/userRepo');

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: SecurePass123!
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *       properties:
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         phone:
 *           type: string
 *           example: +1234567890
 *         company:
 *           type: string
 *           example: Tech Corp
 *         password:
 *           type: string
 *           format: password
 *           minLength: 12
 *           example: SecurePass123!
 *         role:
 *           type: string
 *           enum: [guest, host]
 *           default: guest
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Login successful
 *         user:
 *           $ref: '#/components/schemas/User'
 *         token:
 *           type: string
 *           example: token_1_1234567890
 */

// Will be set by server.js after hostRouter is loaded
let hostRouter = null;

router.setHostRouter = (router) => {
  hostRouter = router;
};

// Simple token generation
const generateToken = (user) => {
  return `token_${user.id}_${Date.now()}`;
};

const getUserRepo = (req) => createUserRepository(req.app.locals.db);

const toSafeUser = (user) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userRepo = getUserRepo(req);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await userRepo.authenticateUser(email, password);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    req.session.userId = user.id;
    req.session.userRole = user.role;

    res.json({
      message: 'Login successful',
      user: toSafeUser(user),
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to log in' });
  }
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or weak password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, company, password, role } = req.body;
    const userRepo = getUserRepo(req);

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

    const existingUser = await userRepo.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const newUser = await userRepo.createUser({
      firstName,
      lastName,
      email,
      phone: phone || '',
      company: company || '',
      password,
      role: role || 'guest',
      verificationStatus: role === 'host' ? 'not_submitted' : 'not_required'
    });

    // Initialize host data if registering as a host
    if (role === 'host' && hostRouter && hostRouter.initializeNewHost) {
      await hostRouter.initializeNewHost(newUser.id, firstName, lastName, email, company, req.app.locals.db);
    }

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Registration successful',
      user: toSafeUser(newUser),
      token: token
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    res.status(500).json({ message: 'Failed to register user' });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful
 */
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
router.get('/me', async (req, res) => {
  try {
    const userRepo = getUserRepo(req);

    let userId = req.session?.userId;

    // Backward compatible fallback to token auth
    if (!userId) {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No authentication provided' });
      }
      userId = parseInt(token.split('_')[1], 10);
    }

    const user = await userRepo.findUserById(userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json({ user: toSafeUser(user) });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to load current user' });
  }
});

module.exports = router;