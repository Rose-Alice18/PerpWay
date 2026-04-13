const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

// Get all drivers
router.get('/', async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ rating: -1 });
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ error: 'Failed to fetch drivers', message: error.message });
  }
});

// Get single driver by ID
router.get('/:id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json(driver);
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({ error: 'Failed to fetch driver', message: error.message });
  }
});

// Rate a driver (one rating per user or IP)
router.post('/:id/rate', optionalAuth, async (req, res) => {
  try {
    const { rating } = req.body;
    const identifier = req.user?.id || req.ip || req.headers['x-forwarded-for'] || 'unknown';

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });

    const existingIndex = driver.ratedBy.findIndex(r => r.ip === identifier);
    if (existingIndex !== -1) {
      driver.ratedBy[existingIndex].rating = rating;
    } else {
      driver.ratedBy.push({ ip: identifier, rating });
    }

    // Recalculate average rating
    const total = driver.ratedBy.reduce((sum, r) => sum + r.rating, 0);
    driver.rating = Math.round((total / driver.ratedBy.length) * 10) / 10;
    driver.totalRatings = driver.ratedBy.length;

    await driver.save();
    res.json({ success: true, rating: driver.rating, totalRatings: driver.totalRatings });
  } catch (error) {
    console.error('Error rating driver:', error);
    res.status(500).json({ error: 'Failed to rate driver', message: error.message });
  }
});

// Create new driver (for admin use)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const driver = new Driver(req.body);
    await driver.save();
    res.status(201).json({ success: true, driver });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ error: 'Failed to create driver', message: error.message });
  }
});

// Update driver availability
router.patch('/:id/availability', async (req, res) => {
  try {
    const { availability } = req.body;
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { availability },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({ success: true, driver });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ error: 'Failed to update driver', message: error.message });
  }
});

// Update driver (full update for admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({ success: true, driver });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ error: 'Failed to update driver', message: error.message });
  }
});

// Delete driver (for admin use)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({ error: 'Failed to delete driver', message: error.message });
  }
});

module.exports = router;
