const mongoose = require('mongoose');

const deliveryRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  contact: {
    type: String,
    required: true,
  },
  itemDescription: {
    type: String,
    required: true,
  },
  pickupPoint: {
    type: String,
    required: true,
  },
  dropoffPoint: {
    type: String,
    required: true,
  },
  deliveryType: {
    type: String,
    enum: ['instant', 'next-day', 'weekly-station'],
    required: true,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'authorized', 'assigned', 'in-progress', 'delivered', 'cancelled'],
    default: 'pending',
  },
  authorizedBy: {
    type: String,
  },
  authorizedAt: {
    type: Date,
  },
  assignedRider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MotorRider',
  },
  assignedRiderName: {
    type: String,
  },
  assignedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('DeliveryRequest', deliveryRequestSchema);
