const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const categories = [
  {
    name: 'Seamstress',
    description: 'Professional tailoring and clothing alteration services',
    icon: '🧵',
    color: '#ec4899' // pink
  },
  {
    name: 'Fruit Vendors',
    description: 'Fresh fruits and produce vendors',
    icon: '🍎',
    color: '#10b981' // green
  },
  {
    name: 'Nail Tech',
    description: 'Nail care, manicure, and pedicure services',
    icon: '💅',
    color: '#8b5cf6' // purple
  },
  {
    name: 'Barbers',
    description: 'Professional barbershop and hair cutting services',
    icon: '💈',
    color: '#3b82f6' // blue
  },
  {
    name: 'Food Vendors',
    description: 'Local food vendors and street food',
    icon: '🍔',
    color: '#f59e0b' // amber
  },
  {
    name: 'Tailors',
    description: 'Custom clothing and suit tailoring',
    icon: '👔',
    color: '#06b6d4' // cyan
  }
];

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/perpway');
    console.log('✅ Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️  Cleared existing categories');

    // Insert new categories
    const result = await Category.insertMany(categories);
    console.log(`✨ Successfully seeded ${result.length} categories:`);
    result.forEach(cat => {
      console.log(`   ${cat.icon} ${cat.name} - ${cat.description}`);
    });

    console.log('\n🎉 Category seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
