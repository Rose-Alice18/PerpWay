const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const connectDatabase = require('./config/database');

const app = express();

// Connect to MongoDB
connectDatabase();

// Middleware
// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:2000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes (must come BEFORE static files)
const authRoutes = require('./routes/auth');
const driverRoutes = require('./routes/drivers');
const vendorRoutes = require('./routes/vendors');
const deliveryRoutes = require('./routes/delivery');
const rideRoutes = require('./routes/rides');
const paymentRoutes = require('./routes/payments');
const motorRiderRoutes = require('./routes/motorRiders');
const categoryRoutes = require('./routes/categories');

app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/motor-riders', motorRiderRoutes);
app.use('/api/categories', categoryRoutes);

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
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Perpway server is running on port ${PORT}`);
  console.log(`🌍 Visit http://localhost:${PORT}`);
});
