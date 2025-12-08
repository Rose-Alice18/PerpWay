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

// Toggle category visibility
router.patch('/:id/toggle-visibility', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Toggle the visibility
    category.isVisible = !category.isVisible;
    await category.save();

    console.log(`📂 Category "${category.name}" visibility toggled to: ${category.isVisible ? 'VISIBLE' : 'HIDDEN'}`);

    res.json({
      success: true,
      message: `Category ${category.isVisible ? 'shown' : 'hidden'} successfully`,
      category
    });
  } catch (error) {
    console.error('Error toggling category visibility:', error);
    res.status(500).json({ error: 'Failed to toggle category visibility', message: error.message });
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

// Seed initial categories (admin only - for initial setup)
router.post('/seed', async (req, res) => {
  try {
    const existingCategories = await Category.find();
    if (existingCategories.length > 0) {
      return res.json({ success: true, message: `Database already has ${existingCategories.length} categories. Skipping seed.`, categories: existingCategories });
    }

    const defaultCategories = [
      {
        name: 'Seamstress',
        description: 'Professional tailoring and clothing alteration services',
        icon: '🧵',
        color: '#ec4899'
      },
      {
        name: 'Fruit Vendors',
        description: 'Fresh fruits and produce vendors',
        icon: '🍎',
        color: '#10b981'
      },
      {
        name: 'Nail Tech',
        description: 'Nail care, manicure, and pedicure services',
        icon: '💅',
        color: '#8b5cf6'
      },
      {
        name: 'Barbers',
        description: 'Professional barbershop and hair cutting services',
        icon: '💈',
        color: '#3b82f6'
      },
      {
        name: 'Food Vendors',
        description: 'Local food vendors and street food',
        icon: '🍔',
        color: '#f59e0b'
      },
      {
        name: 'Tailors',
        description: 'Custom clothing and suit tailoring',
        icon: '👔',
        color: '#06b6d4'
      }
    ];

    const result = await Category.insertMany(defaultCategories);
    res.json({ success: true, message: `Successfully seeded ${result.length} categories!`, categories: result });
  } catch (error) {
    console.error('Error seeding categories:', error);
    res.status(500).json({ error: 'Failed to seed categories', message: error.message });
  }
});

module.exports = router;
