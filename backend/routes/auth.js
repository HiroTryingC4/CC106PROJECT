const express = require('express');
const router = express.Router();
const { createUserRepository } = require('../repo/userRepo');
const { generateVerificationToken, sendVerificationEmail } = require('../utils/emailService');

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
    const db = req.app.locals.db;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await userRepo.authenticateUser(email, password);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if email is verified (skip for admin and comm-admin)
    if (user.role !== 'admin' && user.role !== 'comm-admin') {
      const verificationCheck = await db.query(
        'SELECT email_verified FROM users WHERE id = $1',
        [user.id]
      );

      if (verificationCheck.rows.length > 0 && verificationCheck.rows[0].email_verified === false) {
        return res.status(403).json({ 
          message: 'Please verify your email before logging in. Check your inbox for the verification link.',
          emailNotVerified: true,
          email: user.email
        });
      }
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
    const db = req.app.locals.db;

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

    // Skip email verification for admin and comm-admin roles
    if (role !== 'admin' && role !== 'comm-admin') {
      // Generate verification token
      const verificationToken = generateVerificationToken();
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store verification token in database
      const tokenUpdate = await db.query(
        'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3 RETURNING id',
        [verificationToken, tokenExpires, newUser.id]
      );
      
      console.log('Token update result:', tokenUpdate.rowCount, 'rows updated for user', newUser.id);

      // Send verification email in background (don't block registration)
      sendVerificationEmail(email, firstName, verificationToken).then(emailResult => {
        if (!emailResult.success) {
          console.error('Failed to send verification email:', emailResult.error);
        } else {
          console.log('Verification email sent successfully to:', email);
        }
      }).catch(err => {
        console.error('Email send error:', err.message);
      });
    } else {
      // Auto-verify admin and comm-admin accounts
      await db.query(
        'UPDATE users SET email_verified = TRUE WHERE id = $1',
        [newUser.id]
      );
      console.log('Admin/Comm-Admin account auto-verified:', email);
    }

    // Initialize host data if registering as a host
    if (role === 'host' && hostRouter && hostRouter.initializeNewHost) {
      await hostRouter.initializeNewHost(newUser.id, firstName, lastName, email, company, db);
    }

    const token = generateToken(newUser);

    const responseMessage = (role === 'admin' || role === 'comm-admin') 
      ? 'Registration successful. You can now log in.'
      : 'Registration successful. Please check your email to verify your account.';

    res.status(201).json({
      message: responseMessage,
      user: toSafeUser(newUser),
      token: token,
      emailSent: (role !== 'admin' && role !== 'comm-admin')
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

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid current password or not authenticated
 *       500:
 *         description: Server error
 */
router.put('/change-password', async (req, res) => {
  try {
    const userRepo = getUserRepo(req);
    const { currentPassword, newPassword } = req.body;

    // Get user ID from session or token
    let userId = req.session?.userId;
    if (!userId) {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No authentication provided' });
      }
      userId = parseInt(token.split('_')[1], 10);
    }

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Get user
    const user = await userRepo.findUserById(userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await userRepo.verifyPassword(user.email, currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    await userRepo.updatePassword(userId, newPassword);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify user email with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    const db = req.app.locals.db;

    console.log('🔍 Email verification attempt:');
    console.log('   Token received:', token ? `${token.substring(0, 20)}... (length: ${token.length})` : 'NO TOKEN');

    if (!token) {
      console.log('   ❌ No token provided');
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Find user with this token
    console.log('   🔎 Looking up token in database...');
    const result = await db.query(
      'SELECT id, email, first_name, verification_token_expires, email_verified FROM users WHERE verification_token = $1',
      [token]
    );

    console.log('   📊 Query result:', result.rows.length, 'rows found');

    if (result.rows.length === 0) {
      console.log('   ❌ Token not found in database');
      console.log('   💡 Checking if token exists with different format...');
      
      // Check if any tokens exist at all
      const allTokens = await db.query(
        'SELECT id, email, LEFT(verification_token, 20) as token_preview FROM users WHERE verification_token IS NOT NULL'
      );
      console.log('   📋 Existing tokens in DB:', allTokens.rows.length);
      if (allTokens.rows.length > 0) {
        console.log('   Sample tokens:', allTokens.rows.map(r => `${r.email}: ${r.token_preview}...`));
      }
      
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    const user = result.rows[0];
    console.log('   ✅ User found:', user.email);

    // Check if already verified
    if (user.email_verified) {
      console.log('   ℹ️  Email already verified');
      return res.status(200).json({ message: 'Email already verified', alreadyVerified: true });
    }

    // Check if token expired
    if (new Date() > new Date(user.verification_token_expires)) {
      console.log('   ⏰ Token expired:', user.verification_token_expires);
      return res.status(400).json({ 
        message: 'Verification token has expired. Please request a new one.',
        expired: true 
      });
    }

    // Verify email
    console.log('   ✅ Verifying email...');
    await db.query(
      'UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE id = $1',
      [user.id]
    );

    console.log('   🎉 Email verified successfully!');
    res.json({ 
      message: 'Email verified successfully! You can now log in.',
      email: user.email
    });
  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({ message: 'Failed to verify email' });
  }
});

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification email sent
 *       400:
 *         description: Email already verified or not found
 *       500:
 *         description: Server error
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const db = req.app.locals.db;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const result = await db.query(
      'SELECT id, email, first_name, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'No account found with this email' });
    }

    const user = result.rows[0];

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update token in database
    await db.query(
      'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3',
      [verificationToken, tokenExpires, user.id]
    );

    // Send verification email
    const emailResult = await sendVerificationEmail(email, user.first_name, verificationToken);

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error || emailResult.message);
      console.error('SMTP_USER:', process.env.SMTP_USER || process.env.EMAIL_USER || 'NOT SET');
      console.error('FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');
    } else {
      console.log('Resend verification email sent successfully to:', email);
    }

    res.json({ message: 'Verification email sent. Please check your inbox.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Failed to resend verification email' });
  }
});

module.exports = router;