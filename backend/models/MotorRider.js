const mongoose = require('mongoose');

const motorRiderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  whatsapp: {
    type: String
  },
  motorcycleType: {
    type: String
  },
  plateNumber: {
    type: String
  },
  location: {
    type: String
  },
  riderCode: {
    type: String,
    unique: true,
    sparse: true
  },
  isDefaultDeliveryRider: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 5,
    min: 0,
    max: 5
  },
  completedDeliveries: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'busy'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Generate unique rider code before saving
motorRiderSchema.pre('save', function(next) {
  if (!this.riderCode) {
    // Generate code: First 3 letters of name + last 4 digits of phone
    const namePrefix = this.name.replace(/\s/g, '').substring(0, 3).toUpperCase();
    const phoneDigits = this.phone.replace(/\D/g, '').slice(-4);
    this.riderCode = `${namePrefix}${phoneDigits}`;
  }
  next();
});

module.exports = mongoose.model('MotorRider', motorRiderSchema);
