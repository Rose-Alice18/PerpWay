const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  icon: {
    type: String,
    default: '🏷️'
  },
  color: {
    type: String,
    default: '#f97316' // orange
  },
  vendorCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
