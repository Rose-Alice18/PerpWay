const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Delivery Pricing
  pricing: {
    instant: { type: Number, default: 10 }, // GH₵10
    nextDay: { type: Number, default: 7 },  // GH₵7
    weeklyStation: { type: Number, default: 5 } // GH₵5
  },

  // Auto-Assignment Rules
  autoAssignment: {
    enabled: { type: Boolean, default: false },
    assignToDefaultRider: { type: Boolean, default: true },
    balanceWorkload: { type: Boolean, default: false }, // Assign to least busy rider
    considerLocation: { type: Boolean, default: false }, // Future: assign by proximity
    maxDeliveriesPerRider: { type: Number, default: 10 }
  },

  // Notification Templates
  notificationTemplates: {
    deliveryAssigned: {
      type: String,
      default: '📦 New Delivery Assignment\n\n' +
               'Rider: {riderName}\n' +
               'Customer: {customerName}\n' +
               'Contact: {customerContact}\n' +
               'Item: {itemDescription}\n' +
               'Pickup: {pickupPoint}\n' +
               'Dropoff: {dropoffPoint}\n' +
               'Type: {deliveryType}\n\n' +
               'Please confirm receipt and update status.'
    },
    deliveryCompleted: {
      type: String,
      default: '✅ Delivery Completed\n\n' +
               'Thank you for using Perpway!\n' +
               'Delivery #{deliveryId} has been completed successfully.'
    },
    deliveryReminder: {
      type: String,
      default: '⏰ Delivery Reminder\n\n' +
               'Rider: {riderName}\n' +
               'You have a pending delivery assigned.\n' +
               'Please update the status.'
    }
  },

  // Business Hours & Holidays
  businessHours: {
    enabled: { type: Boolean, default: true },
    schedule: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        monday: { open: '08:00', close: '18:00', closed: false },
        tuesday: { open: '08:00', close: '18:00', closed: false },
        wednesday: { open: '08:00', close: '18:00', closed: false },
        thursday: { open: '08:00', close: '18:00', closed: false },
        friday: { open: '08:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '15:00', closed: false },
        sunday: { open: '00:00', close: '00:00', closed: true }
      }
    },
    holidays: [{
      date: String, // YYYY-MM-DD format
      name: String,
      description: String
    }]
  },

  // Platform Announcements
  announcements: [{
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'error'],
      default: 'info'
    },
    active: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    targetAudience: {
      type: String,
      enum: ['all', 'users', 'riders', 'drivers'],
      default: 'all'
    },
    createdAt: { type: Date, default: Date.now },
    createdBy: String
  }],

  // SLA (Service Level Agreement) Thresholds
  sla: {
    pendingToAuthorized: { type: Number, default: 60 }, // minutes
    authorizedToAssigned: { type: Number, default: 30 }, // minutes
    assignedToInProgress: { type: Number, default: 30 }, // minutes
    inProgressToDelivered: { type: Number, default: 120 }, // minutes
    instantDeliveryMax: { type: Number, default: 60 }, // minutes (total)
    nextDayDeliveryMax: { type: Number, default: 1440 }, // minutes (24 hours)
    weeklyStationDeliveryMax: { type: Number, default: 10080 } // minutes (7 days)
  },

  // General Settings
  general: {
    platformName: { type: String, default: 'Perpway' },
    supportEmail: { type: String, default: 'support@perpway.com' },
    supportPhone: { type: String, default: '+233 XX XXX XXXX' },
    currency: { type: String, default: 'GH₵' },
    timezone: { type: String, default: 'Africa/Accra' },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: 'We are currently under maintenance. Please check back soon.' }
  },

  updatedAt: { type: Date, default: Date.now },
  updatedBy: String
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

settingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);
