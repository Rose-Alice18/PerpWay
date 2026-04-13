const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });
const connectDatabase = require('./config/database');
const passport = require('./config/passport');
const { startRideReminderService } = require('./services/rideReminders');
const { initWhatsApp } = require('./services/whatsapp');

const app = express();

// Create upload directories if they don't exist
const uploadDirs = [
  'uploads',
  'uploads/shopping',
  'uploads/delivery',
  'uploads/vendors'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Connect to MongoDB
connectDatabase();

// Session configuration (required for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'perpway-session-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware
// CORS configuration for production - allow multiple origins
const allowedOrigins = [
  'http://localhost:2000',
  'http://localhost:3000',
  'https://perpway.app',
  'https://www.perpway.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
// Strict limit for auth and submission endpoints (prevents spam/brute force)
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in 15 minutes.' },
});

// General limit for all other API routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in 15 minutes.' },
});

app.use('/api/', generalLimiter);

// API Routes (must come BEFORE static files)
const authRoutes = require('./routes/auth');
const driverRoutes = require('./routes/drivers');
const vendorRoutes = require('./routes/vendors');
const deliveryRoutes = require('./routes/delivery');
const rideRoutes = require('./routes/rides');
const paymentRoutes = require('./routes/payments');
const motorRiderRoutes = require('./routes/motorRiders');
const categoryRoutes = require('./routes/categories');
const settingsRoutes = require('./routes/settings');
const financialRoutes = require('./routes/financials');
const shoppingRoutes = require('./routes/shopping');
const contactRoutes = require('./routes/contact');
const whatsappRoutes = require('./routes/whatsapp');

app.use('/api/auth', strictLimiter, authRoutes);
app.use('/api/contact', strictLimiter, contactRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/motor-riders', motorRiderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/financials', financialRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// API health check and welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Perpway API! ✨',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth',
      drivers: '/api/drivers',
      vendors: '/api/vendors',
      delivery: '/api/delivery',
      rides: '/api/rides',
      payments: '/api/payments',
      motorRiders: '/api/motor-riders',
      categories: '/api/categories',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Perpway server is running on port ${PORT}`);
  console.log(`🌍 Visit http://localhost:${PORT}`);

  // Start ride reminder service
  startRideReminderService();

  // Initialize WhatsApp client
  if (process.env.WHATSAPP_ENABLED === 'true') {
    initWhatsApp();
  }
});
