const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Vendor = require('../models/Vendor');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories', message: error.message });
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category', message: error.message });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ success: true, category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category', message: error.message });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category', message: error.message });
  }
});

// Update vendor counts for all categories
router.post('/update-counts', async (req, res) => {
  try {
    const categories = await Category.find();

    for (const category of categories) {
      const count = await Vendor.countDocuments({ category: category.name });
      category.vendorCount = count;
      await category.save();
    }

    res.json({ success: true, message: 'Category counts updated' });
  } catch (error) {
    console.error('Error updating category counts:', error);
    res.status(500).json({ error: 'Failed to update category counts', message: error.message });
  }
});

module.exports = router;
