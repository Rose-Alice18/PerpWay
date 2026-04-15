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
  driverType: {
    type: String,
    default: 'berekuso',
    // Valid values are managed via Settings.driverTypes — no hardcoded enum here
  },
  note: {
    type: String,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  ratedBy: [{ ip: String, rating: Number }],
  workingTime: {
    start: {
      type: String,
      default: '06:00',
    },
    end: {
      type: String,
      default: '20:00',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Driver', driverSchema);
