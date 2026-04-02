const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['fruit', 'tailor', 'barber', 'food'],
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  hours: {
    type: String,
  },
  contact: {
    type: String,
    required: true,
  },
  whatsapp: {
    type: String,
  },
  speciality: {
    type: String,
  },
  priceRange: {
    type: String,
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  recommendations: {
    type: Number,
    default: 0,
  },
  recommendedBy: [{ type: String }], // stores IP addresses to prevent spam
  ratedBy: [{ ip: String, rating: Number }], // tracks individual ratings
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Vendor', vendorSchema);
