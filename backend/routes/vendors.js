const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

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

// Update vendor recommendations (one per IP)
router.post('/:id/recommend', async (req, res) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    if (vendor.recommendedBy.includes(ip)) {
      return res.status(400).json({ error: 'You have already recommended this vendor' });
    }

    vendor.recommendations += 1;
    vendor.recommendedBy.push(ip);
    await vendor.save();

    res.json(vendor);
  } catch (error) {
    console.error('Error updating recommendations:', error);
    res.status(500).json({ error: 'Failed to update recommendations', message: error.message });
  }
});

// Rate a vendor (one rating per IP)
router.post('/:id/rate', async (req, res) => {
  try {
    const { rating } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    const existingIndex = vendor.ratedBy.findIndex(r => r.ip === ip);
    if (existingIndex !== -1) {
      // Update existing rating
      vendor.ratedBy[existingIndex].rating = rating;
    } else {
      vendor.ratedBy.push({ ip, rating });
    }

    // Recalculate average rating
    const total = vendor.ratedBy.reduce((sum, r) => sum + r.rating, 0);
    vendor.rating = Math.round((total / vendor.ratedBy.length) * 10) / 10;

    await vendor.save();
    res.json({ success: true, rating: vendor.rating, totalRatings: vendor.ratedBy.length });
  } catch (error) {
    console.error('Error rating vendor:', error);
    res.status(500).json({ error: 'Failed to rate vendor', message: error.message });
  }
});

// Create new vendor (for admin use)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
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
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
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

// Bulk update vendor category name (used when a category is renamed or deleted)
router.put('/bulk/category', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { oldName, newName } = req.body;
    if (!oldName) return res.status(400).json({ error: 'oldName is required' });

    const update = newName
      ? { category: newName }           // rename
      : { category: 'Uncategorised' };  // deleted — move to fallback

    const result = await require('../models/Vendor').updateMany(
      { category: oldName },
      { $set: update }
    );

    res.json({ success: true, updated: result.modifiedCount });
  } catch (error) {
    console.error('Bulk category update error:', error);
    res.status(500).json({ error: 'Failed to update vendor categories', message: error.message });
  }
});

// Delete vendor (for admin use)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
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
