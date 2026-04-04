const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const multer = require('multer');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartstay', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const propertiesRouter = require('./routes/properties');
const bookingsRouter = require('./routes/bookings');
const paymentsRouter = require('./routes/payments');
const reviewsRouter = require('./routes/reviews');
const adminRouter = require('./routes/admin');
const analyticsRouter = require('./routes/analytics');
const hostRouter = require('./routes/host');

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/properties', propertiesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/host', hostRouter);

// Set admin router reference in host router
if (hostRouter.setAdminRouter) {
  hostRouter.setAdminRouter(adminRouter);
}

// Set host router reference in admin router  
if (adminRouter.setHostRouter) {
  adminRouter.setHostRouter(hostRouter);
}

// Set host router reference in auth router
if (authRouter.setHostRouter) {
  authRouter.setHostRouter(hostRouter);
}

// Simple in-memory verification storage
let verificationSubmissions = {
  // Pre-populate verified host (user ID 3) with completed verification
  3: {
    firstName: 'John',
    lastName: 'Host',
    email: 'host@smartstay.com',
    phone: '+1234567890',
    company: 'Host Properties LLC',
    businessAddress: '123 Business St, City, State 12345',
    businessType: 'Property Management',
    yearsOfExperience: '5',
    propertyCount: '3',
    expectedRevenue: '$50,000',
    bankName: 'First National Bank',
    accountNumber: '****1234',
    routingNumber: '****5678',
    files: {
      idDocumentPhoto: {
        originalName: 'id_document.jpg',
        size: 1024000,
        mimetype: 'image/jpeg',
        fileId: '3_idDocumentPhoto_verified'
      },
      ownerHoldingIdPhoto: {
        originalName: 'owner_holding_id.jpg',
        size: 1024000,
        mimetype: 'image/jpeg',
        fileId: '3_ownerHoldingIdPhoto_verified'
      },
      proofOfOwnership: {
        originalName: 'property_deed.pdf',
        size: 2048000,
        mimetype: 'application/pdf',
        fileId: '3_proofOfOwnership_verified'
      }
    },
    submittedAt: '2024-02-01T10:00:00.000Z',
    status: 'verified',
    verifiedAt: '2024-02-02T14:30:00.000Z',
    verifiedBy: 'admin@smartstay.com'
  }
};
let fileStorage = {}; // Store actual file buffers

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Host verification endpoint (simple implementation)
app.post('/api/host/verification', upload.fields([
  { name: 'idDocumentPhoto', maxCount: 1 },
  { name: 'ownerHoldingIdPhoto', maxCount: 1 },
  { name: 'proofOfOwnership', maxCount: 1 },
  { name: 'additionalDocuments', maxCount: 1 }
]), (req, res) => {
  console.log('Host verification submission received:');
  console.log('Body:', req.body);
  console.log('Files:', req.files);
  
  // Get user ID from token (simple implementation)
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  
  // Store actual file buffers
  if (req.files) {
    Object.keys(req.files).forEach(key => {
      if (req.files[key][0]) {
        const fileId = `${userId}_${key}_${Date.now()}`;
        fileStorage[fileId] = {
          buffer: req.files[key][0].buffer,
          mimetype: req.files[key][0].mimetype,
          originalName: req.files[key][0].originalname
        };
        // Store file ID in verification data
        if (!verificationSubmissions[userId]) {
          verificationSubmissions[userId] = {};
        }
        if (!verificationSubmissions[userId].fileIds) {
          verificationSubmissions[userId].fileIds = {};
        }
        verificationSubmissions[userId].fileIds[key] = fileId;
      }
    });
  }
  
  // Store verification data (including file info)
  const verificationData = {
    ...req.body,
    files: req.files ? Object.keys(req.files).reduce((acc, key) => {
      acc[key] = req.files[key][0] ? {
        originalName: req.files[key][0].originalname,
        size: req.files[key][0].size,
        mimetype: req.files[key][0].mimetype,
        fileId: verificationSubmissions[userId]?.fileIds?.[key]
      } : null;
      return acc;
    }, {}) : {},
    submittedAt: new Date().toISOString(),
    status: 'pending'
  };
  
  verificationSubmissions[userId] = { ...verificationSubmissions[userId], ...verificationData };
  
  console.log('Stored verification data for user', userId, ':', verificationData);
  
  res.json({
    message: 'Verification documents submitted successfully! Please wait for admin approval.',
    status: 'pending'
  });
});

// Get host verification status and data
app.get('/api/host/verification-status', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  const submission = verificationSubmissions[userId];
  
  if (submission) {
    res.json({
      status: submission.status,
      submittedAt: submission.submittedAt,
      message: 'Your verification is currently under review. We will notify you once it\'s complete.',
      data: submission
    });
  } else {
    res.json({
      status: 'not_submitted',
      message: 'Complete your verification to unlock all host features.'
    });
  }
});

// Serve uploaded files
app.get('/api/files/:fileId', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  const fileId = req.params.fileId;
  
  // Check if file belongs to the requesting user
  if (!fileId.startsWith(`${userId}_`)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const file = fileStorage[fileId];
  if (!file) {
    return res.status(404).json({ message: 'File not found' });
  }
  
  // Set appropriate headers
  res.set({
    'Content-Type': file.mimetype,
    'Content-Disposition': `inline; filename="${file.originalName}"`,
    'Cache-Control': 'private, max-age=3600'
  });
  
  res.send(file.buffer);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});