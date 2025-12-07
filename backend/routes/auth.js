const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');

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
    const jwtSecret = process.env.JWT_SECRET || 'perpway-fallback-secret-key-2025';

    if (!process.env.JWT_SECRET) {
      console.warn('⚠️ WARNING: JWT_SECRET not found in environment variables, using fallback');
    }

    const token = jwt.sign(
      {
        email: ADMIN_CREDENTIALS.email,
        role: ADMIN_CREDENTIALS.role,
        name: ADMIN_CREDENTIALS.name
      },
      jwtSecret,
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

  const jwtSecret = process.env.JWT_SECRET || 'perpway-fallback-secret-key-2025';

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ valid: false, message: 'Invalid or expired token' });
    }
    res.json({ valid: true, user });
  });
});

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/signin?error=auth_failed',
    session: false
  }),
  (req, res) => {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'perpway-fallback-secret-key-2025';

      // Generate JWT token for the authenticated user
      const token = jwt.sign(
        {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name,
          role: req.user.role
        },
        jwtSecret,
        { expiresIn: '7d' } // 7 days for Google auth
      );

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:2000';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        profilePicture: req.user.profilePicture
      }))}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect('/signin?error=server_error');
    }
  }
);

// Get current authenticated user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'perpway-fallback-secret-key-2025';

    jwt.verify(token, jwtSecret, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }

      // If it's admin
      if (decoded.role === 'admin') {
        return res.json({
          email: decoded.email,
          name: decoded.name,
          role: decoded.role
        });
      }

      // If it's regular user, fetch from database
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture
      });
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
