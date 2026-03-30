const mongoose = require('mongoose');

const tipPaymentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  reference: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

tipPaymentSchema.index({ email: 1, expiresAt: 1 });

module.exports = mongoose.model('TipPayment', tipPaymentSchema);
