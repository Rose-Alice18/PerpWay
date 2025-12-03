const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ rating: -1 });
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors', message: error.message });
  }
});

// Get vendors by category
router.get('/category/:category', async (req, res) => {
  try {
    const vendors = await Vendor.find({ category: req.params.category }).sort({ rating: -1 });
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors', message: error.message });
  }
});

// Update vendor recommendations
router.post('/:id/recommend', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { $inc: { recommendations: 1 } },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json(vendor);
  } catch (error) {
    console.error('Error updating recommendations:', error);
    res.status(500).json({ error: 'Failed to update recommendations', message: error.message });
  }
});

// Create new vendor (for admin use)
router.post('/', async (req, res) => {
  try {
    const vendor = new Vendor(req.body);
    await vendor.save();
    res.status(201).json({ success: true, vendor });
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ error: 'Failed to create vendor', message: error.message });
  }
});

// Update vendor (for admin use)
router.put('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({ success: true, vendor });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ error: 'Failed to update vendor', message: error.message });
  }
});

// Delete vendor (for admin use)
router.delete('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ error: 'Failed to delete vendor', message: error.message });
  }
});

module.exports = router;
