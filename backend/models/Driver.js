const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  photo: {
    type: String,
    default: '👨‍✈️',
  },
  carType: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: true,
  },
  availability: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available',
  },
  contact: {
    type: String,
    required: true,
  },
  whatsapp: {
    type: String,
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5,
  },
  note: {
    type: String,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Driver', driverSchema);
