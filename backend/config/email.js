const nodemailer = require('nodemailer');
const User = require('../models/User');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send notification to ride creator when someone joins
const sendRideJoinNotification = async (rideCreator, joiner, rideDetails) => {
  // Check if ride creator has an email (is a registered user)
  if (!rideCreator.email) {
    console.log(`⚠️  Ride creator ${rideCreator.name} has no email - skipping notification`);
    return { success: false, reason: 'No email provided' };
  }

  // Check if user has enabled email notifications
  try {
    const user = await User.findOne({ email: rideCreator.email });

    if (!user) {
      console.log(`⚠️  Ride creator ${rideCreator.email} is not a registered user - skipping notification`);
      return { success: false, reason: 'Not a registered user' };
    }

    if (!user.settings || !user.settings.emailNotifications) {
      console.log(`⚠️  ${rideCreator.email} has disabled email notifications - skipping`);
      return { success: false, reason: 'Email notifications disabled' };
    }
  } catch (error) {
    console.error('Error checking user notification settings:', error);
    return { success: false, error };
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: rideCreator.email || rideCreator.contact, // Send to creator's email or use contact
    subject: `🚗 Someone Joined Your Ride to ${rideDetails.destination}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B1E3F, #EAA221, #3C896D); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #8B1E3F; border-radius: 5px; }
          .button { display: inline-block; background: #8B1E3F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 New Rider Joined!</h1>
          </div>
          <div class="content">
            <p>Hi ${rideCreator.name},</p>
            <p>Great news! Someone has joined your ride:</p>

            <div class="info-box">
              <h3>📍 Ride Details</h3>
              <p><strong>From:</strong> ${rideDetails.pickupLocation}</p>
              <p><strong>To:</strong> ${rideDetails.destination}</p>
              <p><strong>Date:</strong> ${new Date(rideDetails.departureDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p><strong>Time:</strong> ${rideDetails.departureTime}</p>
              <p><strong>Available Seats:</strong> ${rideDetails.availableSeats} seats remaining</p>
            </div>

            <div class="info-box">
              <h3>👤 New Rider Information</h3>
              <p><strong>Name:</strong> ${joiner.name}</p>
              <p><strong>Phone:</strong> ${joiner.phone}</p>
              ${joiner.whatsapp ? `<p><strong>WhatsApp:</strong> ${joiner.whatsapp}</p>` : ''}
              ${joiner.email ? `<p><strong>Email:</strong> ${joiner.email}</p>` : ''}
              <p><strong>Seats Needed:</strong> ${joiner.seatsNeeded}</p>
            </div>

            <p>💡 <strong>What to do next:</strong></p>
            <ul>
              <li>Contact ${joiner.name} to confirm pickup details</li>
              <li>Check your dashboard to see all riders</li>
              <li>Make sure everyone has the meeting point</li>
            </ul>

            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Your Dashboard</a>

            <div class="footer">
              <p>🚙 Perpway - Personal Easy Rides & Packages</p>
              <p>Making campus life easier, one ride at a time!</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${rideCreator.name} (${rideCreator.email || rideCreator.contact})`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending ride join email:', error);
    return { success: false, error };
  }
};

// Send reminder to all ride participants before departure
const sendRideReminder = async (ride) => {
  const transporter = createTransporter();

  // Send to ride creator
  if (ride.userEmail) {
    // Check if creator has enabled email notifications
    try {
      const creatorUser = await User.findOne({ email: ride.userEmail });

      if (!creatorUser) {
        console.log(`⚠️  Ride creator ${ride.userEmail} is not a registered user - skipping reminder`);
      } else if (!creatorUser.settings || !creatorUser.settings.emailNotifications) {
        console.log(`⚠️  ${ride.userEmail} has disabled email notifications - skipping reminder`);
      } else {
        // User exists and has notifications enabled - send reminder
    const creatorMailOptions = {
      from: process.env.EMAIL_USER,
      to: ride.userEmail,
      subject: `⏰ Reminder: Your Ride to ${ride.destination} is Tomorrow!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8B1E3F, #EAA221, #3C896D); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #EAA221; border-radius: 5px; }
            .riders-list { background: white; padding: 15px; border-radius: 5px; margin-top: 15px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Ride Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${ride.name},</p>
              <p>This is a friendly reminder about your upcoming ride tomorrow!</p>

              <div class="info-box">
                <h3>📍 Ride Details</h3>
                <p><strong>From:</strong> ${ride.pickupLocation}</p>
                <p><strong>To:</strong> ${ride.destination}</p>
                <p><strong>Date:</strong> ${new Date(ride.departureDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <p><strong>Time:</strong> ${ride.departureTime}</p>
              </div>

              ${ride.joinedUsers && ride.joinedUsers.length > 0 ? `
              <div class="riders-list">
                <h3>👥 Riders (${ride.joinedUsers.length})</h3>
                ${ride.joinedUsers.map(user => `
                  <p>• ${user.name} - ${user.phone} ${user.contactVisibility === 'visible' ? '(Contact visible to others)' : '(Private)'}</p>
                `).join('')}
              </div>
              ` : '<p><em>No one has joined this ride yet.</em></p>'}

              <p>💡 <strong>Don't forget to:</strong></p>
              <ul>
                <li>Confirm with all riders</li>
                <li>Share the exact meeting point</li>
                <li>Check traffic conditions before leaving</li>
              </ul>

              <div class="footer">
                <p>🚙 Perpway - Personal Easy Rides & Packages</p>
                <p>Have a safe trip!</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

        try {
          await transporter.sendMail(creatorMailOptions);
          console.log(`✅ Reminder sent to ride creator: ${ride.name}`);
        } catch (error) {
          console.error(`❌ Error sending reminder to ${ride.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Error checking creator notification settings:', error);
    }
  }

  // Send to joined riders
  for (const joiner of ride.joinedUsers || []) {
    if (joiner.email) {
      // Check if joiner has enabled email notifications
      try {
        const joinerUser = await User.findOne({ email: joiner.email });

        if (!joinerUser) {
          console.log(`⚠️  Rider ${joiner.email} is not a registered user - skipping reminder`);
          continue;
        }

        if (!joinerUser.settings || !joinerUser.settings.emailNotifications) {
          console.log(`⚠️  ${joiner.email} has disabled email notifications - skipping reminder`);
          continue;
        }

        // User exists and has notifications enabled - send reminder
      const joinerMailOptions = {
        from: process.env.EMAIL_USER,
        to: joiner.email,
        subject: `⏰ Reminder: Ride to ${ride.destination} is Tomorrow!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #8B1E3F, #EAA221, #3C896D); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #EAA221; border-radius: 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⏰ Ride Reminder</h1>
              </div>
              <div class="content">
                <p>Hi ${joiner.name},</p>
                <p>Don't forget - your ride to ${ride.destination} is tomorrow!</p>

                <div class="info-box">
                  <h3>📍 Ride Details</h3>
                  <p><strong>From:</strong> ${ride.pickupLocation}</p>
                  <p><strong>To:</strong> ${ride.destination}</p>
                  <p><strong>Date:</strong> ${new Date(ride.departureDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  <p><strong>Time:</strong> ${ride.departureTime}</p>
                </div>

                <div class="info-box">
                  <h3>👤 Ride Creator</h3>
                  <p><strong>Name:</strong> ${ride.name}</p>
                  <p><strong>Contact:</strong> ${ride.contact}</p>
                </div>

                <p>💡 <strong>Please:</strong></p>
                <ul>
                  <li>Be ready 5-10 minutes before departure</li>
                  <li>Contact ${ride.name} if you need to cancel</li>
                  <li>Bring exact change if cost-sharing</li>
                </ul>

                <div class="footer">
                  <p>🚙 Perpway - Personal Easy Rides & Packages</p>
                  <p>Have a safe trip!</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      };

        try {
          await transporter.sendMail(joinerMailOptions);
          console.log(`✅ Reminder sent to rider: ${joiner.name}`);
        } catch (error) {
          console.error(`❌ Error sending reminder to ${joiner.name}:`, error);
        }
      } catch (error) {
        console.error(`Error checking rider ${joiner.email} notification settings:`, error);
      }
    }
  }
};

module.exports = {
  sendRideJoinNotification,
  sendRideReminder,
};
