const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const http = require('http');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const websocketService = require('./websocket');
const { runMigrations } = require('./migrate');

const envPath = path.resolve(__dirname, '.env');
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER;
const envConfig = (!isProduction && fs.existsSync(envPath))
  ? dotenv.parse(fs.readFileSync(envPath))
  : {};

// Only load .env file in development — in production, use platform env vars directly
if (!isProduction) {
  Object.assign(process.env, envConfig);
}

const resolvedEnv = isProduction ? process.env : { ...process.env, ...envConfig };

const app = express();

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Debug endpoint to verify swagger spec is loaded (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/api-docs-debug', (req, res) => {
    try {
      const hasSpec = !!swaggerSpec && Object.keys(swaggerSpec).length > 0;
      return res.json({ swaggerSpecLoaded: hasSpec, keys: hasSpec ? Object.keys(swaggerSpec) : [] });
    } catch (e) {
      return res.json({ swaggerSpecLoaded: false, error: e.message });
    }
  });
}

// Swagger API Documentation
// Serve the raw swagger JSON explicitly to avoid HTML/redirect responses
app.get('/api-docs/swagger.json', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    return res.send(JSON.stringify(swaggerSpec, null, 2));
  } catch (e) {
    return res.status(500).json({ message: 'Failed to generate swagger JSON', error: e.message });
  }
});

// Serve Swagger UI and force the UI's request base to the backend server
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SmartStay API Documentation',
  // Ensure the UI uses the backend at port 5000 for "Try it out" requests.
  // This avoids cases where a saved client-side selection (or autodetected origin)
  // points the UI at the frontend (port 3000) and returns 404s.
  swaggerOptions: {
    // Point the UI to the served swagger JSON so it doesn't try to fetch an API base path.
    urls: [
      { url: 'http://localhost:5000/api-docs/swagger.json', name: 'Local (swagger JSON)' }
    ]
  }
}));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow Swagger UI to load
}));
app.use(compression());

// CORS configuration
const allowedOrigins = [
  process.env.LOCAL_REACT_ORIGIN,
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2,
  'https://smartstay-rho.vercel.app',
  'https://smartstay-kxl6.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Allow any Vercel preview/production deployment for this project
  if (/^https:\/\/smartstay[a-z0-9-]*\.vercel\.app$/.test(origin)) return true;
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) return callback(null, true);
    console.warn(`CORS blocked for origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true
}));

app.options('*', cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) return callback(null, true);
    console.warn(`CORS blocked for origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  skip: (req) => (
    req.method === 'OPTIONS' ||
    req.path.startsWith('/api/auth') ||
    req.path.startsWith('/api/chat') ||
    req.path.startsWith('/api/notifications') ||
    req.path.startsWith('/api/properties') ||
    req.path.startsWith('/api/bookings') ||
    req.path.startsWith('/api/host') ||
    req.path.startsWith('/api/faqs')
  )
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: resolvedEnv.SESSION_SECRET || 'smartstay_dev_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: resolvedEnv.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: resolvedEnv.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Logging
app.use(morgan('combined', {
  skip: (req) => req.path === '/api/host/verification-status'
}));

// Database connection
const pool = new Pool(
  resolvedEnv.DATABASE_URL
    ? {
        connectionString: resolvedEnv.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        host: resolvedEnv.DB_HOST || 'localhost',
        user: resolvedEnv.DB_USER || 'postgres',
        password: resolvedEnv.DB_PASSWORD || 'postgres',
        database: resolvedEnv.DB_NAME || 'smartstay',
        port: parseInt(resolvedEnv.DB_PORT || '5432', 10)
      }
);

app.locals.db = pool;

// Routes
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const propertiesRouter = require('./routes/properties');
const bookingsRouter = require('./routes/bookings');
const bookingWithPaymentRouter = require('./routes/bookingWithPayment');
const paymentsRouter = require('./routes/payments');
const reviewsRouter = require('./routes/reviews');
const adminRouter = require('./routes/admin');
const analyticsRouter = require('./routes/analytics');
const hostRouter = require('./routes/host');
const chatRouter = require('./routes/chat');
const notificationsRouter = require('./routes/notifications');
const promoCodesRouter = require('./routes/promoCodes');
const faqsRouter = require('./routes/faqs');
const contactRouter = require('./routes/contact');
const pendingBookingsRouter = require('./routes/pendingBookings');
const checkoutPhotosRouter = require('./routes/checkoutPhotos');
const commAdminRouter = require('./routes/commAdmin');

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/properties', propertiesRouter);
app.use('/api/bookings/with-payment', bookingWithPaymentRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/host', hostRouter);
app.use('/api/chat', chatRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/promo-codes', promoCodesRouter);
app.use('/api/faqs', faqsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/pending-bookings', pendingBookingsRouter);
app.use('/api/bookings/:id/checkout-photos', checkoutPhotosRouter);
app.use('/api/comm-admin', commAdminRouter);

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

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug: test activity log insert directly
app.get('/api/debug/activity-log-test', async (req, res) => {
  try {
    const db = req.app.locals.db;
    // Check if table exists
    const tableCheck = await db.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'admin_activity_logs'
      ) AS exists`
    );
    const tableExists = tableCheck.rows[0]?.exists;

    if (!tableExists) {
      return res.json({ tableExists: false, message: 'admin_activity_logs table does NOT exist in DB' });
    }

    // Try inserting a test log
    await db.query(
      `INSERT INTO admin_activity_logs (actor_user_id, action, description, ip_address, user_agent, created_at)
       VALUES (NULL, 'debug_test', 'Test log from debug endpoint', '', '', NOW())`
    );

    // Count total logs
    const countResult = await db.query('SELECT COUNT(*)::int AS total FROM admin_activity_logs');
    return res.json({
      tableExists: true,
      insertSuccess: true,
      totalLogs: countResult.rows[0]?.total,
      message: 'Table exists and insert succeeded'
    });
  } catch (err) {
    return res.json({ tableExists: 'unknown', insertSuccess: false, error: err.message });
  }
});

// SMTP test endpoint (temporary debug)
app.get('/api/debug/smtp', async (req, res) => {
  const nodemailer = require('nodemailer');
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);

  if (!user || !pass) {
    return res.json({ configured: false, user: user || 'NOT SET' });
  }

  try {
    const transporter = nodemailer.createTransport({ host, port, secure: false, auth: { user, pass } });
    await transporter.verify();
    return res.json({ configured: true, verified: true, user });
  } catch (err) {
    return res.json({ configured: true, verified: false, user, error: err.message });
  }
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

const startServer = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL connected successfully');

    // Migrations disabled - run manually with: node migrate.js
    // This prevents duplicate data on server restart
    console.log('Note: Database migrations are disabled on startup.');
    console.log('To run migrations manually, use: node migrate.js');

    const PORT = process.env.PORT || 5000;
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Initialize WebSocket service
    websocketService.initialize(server, allowedOrigins);
    
    // Store WebSocket service in app locals for route access
    app.locals.websocket = websocketService;
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
      console.log(`WebSocket server ready`);
      console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);
      console.log(`SMTP configured: ${!!(process.env.SMTP_USER || process.env.EMAIL_USER)}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

startServer();