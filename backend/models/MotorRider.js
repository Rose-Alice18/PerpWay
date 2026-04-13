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
motorRiderSchema.pre('save', async function(next) {
  if (!this.riderCode) {
    const namePrefix = this.name.replace(/\s/g, '').substring(0, 3).toUpperCase();
    const phoneDigits = this.phone.replace(/\D/g, '').slice(-4);
    let code = `${namePrefix}${phoneDigits}`;

    // Ensure uniqueness — append random suffix on collision
    let exists = await mongoose.model('MotorRider').exists({ riderCode: code, _id: { $ne: this._id } });
    while (exists) {
      const suffix = Math.random().toString(36).substring(2, 4).toUpperCase();
      code = `${namePrefix}${phoneDigits}${suffix}`;
      exists = await mongoose.model('MotorRider').exists({ riderCode: code, _id: { $ne: this._id } });
    }

    this.riderCode = code;
  }
  next();
});

module.exports = mongoose.model('MotorRider', motorRiderSchema);
