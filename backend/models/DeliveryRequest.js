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
  userEmail: {
    type: String,
    trim: true,
    lowercase: true,
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
  // Financial fields
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'mobile-money', 'card', 'other'],
  },
  paidAt: {
    type: Date,
  },
  riderCommission: {
    type: Number,
    default: 0, // Amount rider gets (e.g., 70% of price)
  },
  platformRevenue: {
    type: Number,
    default: 0, // Amount platform keeps (e.g., 30% of price)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deliveredAt: {
    type: Date,
  },
});

module.exports = mongoose.model('DeliveryRequest', deliveryRequestSchema);
