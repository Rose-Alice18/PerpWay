const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');

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

// Create new driver (for admin use)
router.post('/', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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
