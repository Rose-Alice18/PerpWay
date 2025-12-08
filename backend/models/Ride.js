const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  contact: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  pickupLocation: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  departureTime: {
    type: String,
    required: true,
  },
  departureDate: {
    type: String,
    required: true,
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0,
    max: 4, // Max 4 seats for taxi (5 total seats - 1 driver)
  },
  notes: {
    type: String,
  },
  joinedUsers: [{
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
    },
    email: {
      type: String,
    },
    seatsNeeded: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    contactVisibility: {
      type: String,
      enum: ['private', 'public'],
      default: 'private',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
rideSchema.index({ departureDate: 1, status: 1 });

module.exports = mongoose.model('Ride', rideSchema);
