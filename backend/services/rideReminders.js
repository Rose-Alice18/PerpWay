const cron = require('node-cron');
const Ride = require('../models/Ride');
const { sendRideReminder } = require('../config/email');

// Run every day at 6:00 PM to send reminders for next-day rides
const startRideReminderService = () => {
  // Run at midnight daily: mark past rides as cancelled
  cron.schedule('0 0 * * *', async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
      const result = await Ride.updateMany(
        { status: 'active', departureDate: { $lt: todayStr } },
        { $set: { status: 'cancelled' } }
      );
      if (result.modifiedCount > 0) {
        console.log(`🧹 Cleaned up ${result.modifiedCount} expired ride(s)`);
      }
    } catch (error) {
      console.error('❌ Error cleaning up expired rides:', error);
    }
  });

  // Schedule: Every day at 18:00 (6:00 PM)
  cron.schedule('0 18 * * *', async () => {
    console.log('🔔 Checking for rides that need reminders...');

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // Find all active rides scheduled for tomorrow
      const ridesForTomorrow = await Ride.find({
        status: 'active',
        departureDate: {
          $gte: tomorrow,
          $lt: dayAfterTomorrow,
        },
      });

      console.log(`📧 Found ${ridesForTomorrow.length} rides for tomorrow`);

      // Send reminders for each ride
      for (const ride of ridesForTomorrow) {
        console.log(`Sending reminder for ride: ${ride._id} (${ride.pickupLocation} → ${ride.destination})`);
        await sendRideReminder(ride);
      }

      console.log('✅ Ride reminders sent successfully!');
    } catch (error) {
      console.error('❌ Error sending ride reminders:', error);
    }
  });

  console.log('✅ Ride reminder service started - will run daily at 6:00 PM');
};

module.exports = { startRideReminderService };
