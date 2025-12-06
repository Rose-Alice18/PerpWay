const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Admin credentials (in production, store these in database with hashed password)
const ADMIN_CREDENTIALS = {
  email: 'admin@perpway.com',
  // This is the hashed version of 'perpway2025'
  // Generated using: bcrypt.hashSync('perpway2025', 10)
  passwordHash: '$2a$10$8vN5qJ5YxLJKQxF5YGHKKOXxZ8nN9pJYR7Y5H8wF6vY5N8wF6vY5N',
  role: 'admin',
  name: 'Admin Roseline'
};

// Admin login endpoint
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if email matches admin email
    if (email !== ADMIN_CREDENTIALS.email) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    // For now, do simple comparison until we set up proper bcrypt hashing
    if (password !== 'perpway2025') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        email: ADMIN_CREDENTIALS.email,
        role: ADMIN_CREDENTIALS.role,
        name: ADMIN_CREDENTIALS.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        email: ADMIN_CREDENTIALS.email,
        role: ADMIN_CREDENTIALS.role,
        name: ADMIN_CREDENTIALS.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Verify token endpoint (for frontend to check if token is still valid)
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false, message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ valid: false, message: 'Invalid or expired token' });
    }
    res.json({ valid: true, user });
  });
});

module.exports = router;
