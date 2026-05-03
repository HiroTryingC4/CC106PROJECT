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
const envConfig = fs.existsSync(envPath)
  ? dotenv.parse(fs.readFileSync(envPath))
  : {};

// Ensure modules that read process.env (e.g., Cloudinary utility) see values from backend/.env.
Object.assign(process.env, envConfig);

const resolvedEnv = {
  ...process.env,
  ...envConfig
};

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
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));

app.options('*', cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  skip: (req) => (
    req.method === 'OPTIONS' ||
    (req.method === 'GET' && req.path.startsWith('/api/properties')) ||
    (req.method === 'GET' && req.path.startsWith('/api/bookings')) ||
    req.path === '/api/host/verification-status' ||
    req.path === '/api/auth/me'
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
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

startServer();