const express = require('express');
const router = express.Router();
const MotorRider = require('../models/MotorRider');

// Get all motor riders
router.get('/', async (req, res) => {
  try {
    const motorRiders = await MotorRider.find().sort({ isDefaultDeliveryRider: -1, rating: -1 });
    res.json(motorRiders);
  } catch (error) {
    console.error('Error fetching motor riders:', error);
    res.status(500).json({ error: 'Failed to fetch motor riders', message: error.message });
  }
});

// Get default delivery rider
router.get('/default', async (req, res) => {
  try {
    const defaultRider = await MotorRider.findOne({ isDefaultDeliveryRider: true });
    if (!defaultRider) {
      return res.status(404).json({ error: 'No default delivery rider set' });
    }
    res.json(defaultRider);
  } catch (error) {
    console.error('Error fetching default rider:', error);
    res.status(500).json({ error: 'Failed to fetch default rider', message: error.message });
  }
});

// Create new motor rider
router.post('/', async (req, res) => {
  try {
    const motorRider = new MotorRider(req.body);
    await motorRider.save();
    res.status(201).json({ success: true, motorRider });
  } catch (error) {
    console.error('Error creating motor rider:', error);
    res.status(500).json({ error: 'Failed to create motor rider', message: error.message });
  }
});

// Update motor rider
router.put('/:id', async (req, res) => {
  try {
    const motorRider = await MotorRider.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!motorRider) {
      return res.status(404).json({ error: 'Motor rider not found' });
    }

    res.json({ success: true, motorRider });
  } catch (error) {
    console.error('Error updating motor rider:', error);
    res.status(500).json({ error: 'Failed to update motor rider', message: error.message });
  }
});

// Set as default delivery rider
router.put('/:id/set-default', async (req, res) => {
  try {
    // Remove default from all riders
    await MotorRider.updateMany({}, { isDefaultDeliveryRider: false });

    // Set this rider as default
    const motorRider = await MotorRider.findByIdAndUpdate(
      req.params.id,
      { isDefaultDeliveryRider: true },
      { new: true }
    );

    if (!motorRider) {
      return res.status(404).json({ error: 'Motor rider not found' });
    }

    res.json({ success: true, motorRider });
  } catch (error) {
    console.error('Error setting default rider:', error);
    res.status(500).json({ error: 'Failed to set default rider', message: error.message });
  }
});

// Delete motor rider
router.delete('/:id', async (req, res) => {
  try {
    const motorRider = await MotorRider.findByIdAndDelete(req.params.id);

    if (!motorRider) {
      return res.status(404).json({ error: 'Motor rider not found' });
    }

    res.json({ success: true, message: 'Motor rider deleted successfully' });
  } catch (error) {
    console.error('Error deleting motor rider:', error);
    res.status(500).json({ error: 'Failed to delete motor rider', message: error.message });
  }
});

module.exports = router;
