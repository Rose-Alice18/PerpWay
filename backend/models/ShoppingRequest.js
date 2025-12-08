const mongoose = require('mongoose');

const shoppingRequestSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  userName: {
    type: String,
    required: true,
    trim: true,
  },
  userContact: {
    type: String,
    required: false,
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  productDescription: {
    type: String,
    required: true,
  },
  productImage: {
    type: String, // URL or base64 string
    required: true,
  },
  shopLocations: {
    type: String,
    required: true,
  },
  estimatedPrice: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['pending', 'authorized', 'assigned', 'purchased', 'delivered', 'cancelled'],
    default: 'pending',
  },
  adminNotes: {
    type: String,
  },
  actualPrice: {
    type: Number,
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid',
  },
  assignedTo: {
    name: String,
    contact: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  authorizedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
});

// Index for faster queries
shoppingRequestSchema.index({ userEmail: 1, status: 1 });
shoppingRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ShoppingRequest', shoppingRequestSchema);
