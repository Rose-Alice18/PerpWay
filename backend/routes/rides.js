const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const nodemailer = require('nodemailer');
const { sendRideJoinNotification } = require('../config/email');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('❌ SMTP connection failed (rides):', error.code, error.message);
    console.error('   EMAIL_USER set:', !!process.env.EMAIL_USER, '| EMAIL_PASS set:', !!process.env.EMAIL_PASS);
  } else {
    console.log('✅ SMTP ready (rides) — using:', process.env.EMAIL_USER);
  }
});

const sendAdminEmail = async (subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || 'roselinetsatsu@gmail.com',
      subject,
      html,
    });
    console.log(`✅ Admin notified: ${subject}`);
  } catch (err) {
    console.log('⚠️ Admin email failed:', err.message);
  }
};
const { authenticateToken, optionalAuth, requireAdmin } = require('../middleware/auth');
const { sendRideAlert } = require('../services/whatsapp');

// Get all rides
router.get('/', async (req, res) => {
  try {
    const includeAll = req.query.all === 'true';
    const query = includeAll ? {} : { status: 'active' };
    const rides = await Ride.find(query).sort({ departureDate: -1, departureTime: -1 });

    // For public (non-admin) requests, hide contact info of users who chose private
    if (!includeAll) {
      const sanitized = rides.map(ride => {
        const r = ride.toObject();
        r.joinedUsers = r.joinedUsers.map(u => {
          if (u.contactVisibility === 'private') {
            return { name: u.name, seatsNeeded: u.seatsNeeded, contactVisibility: 'private' };
          }
          return u;
        });
        return r;
      });
      return res.json(sanitized);
    }

    res.json(rides);
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).json({ error: 'Failed to fetch rides' });
  }
});

// GET user's ride history
router.get('/user/:email', authenticateToken, async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Only allow users to view their own history (admins can view any)
    if (req.user.role !== 'admin' && req.user.email !== email.toLowerCase()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Fetch all rides for this user (rides they created or joined)
    const createdRides = await Ride.find({ userEmail: email.toLowerCase() })
      .sort({ createdAt: -1 }); // Most recent first

    // Also find rides where user joined
    const joinedRides = await Ride.find({
      'joinedUsers.email': email.toLowerCase()
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      createdRides,
      joinedRides,
      totalCreated: createdRides.length,
      totalJoined: joinedRides.length
    });
  } catch (error) {
    console.error('Error fetching user rides:', error);
    res.status(500).json({ error: 'Failed to fetch ride history' });
  }
});

// Create new ride
router.post('/create', optionalAuth, async (req, res) => {
  try {
    const { name, contact, pickupLocation, destination, departureTime, departureDate, seatsNeeded, notes, userEmail } = req.body;

    // Parse seatsNeeded with validation and default to 1
    const seatsRequested = parseInt(seatsNeeded) || 1;

    // Validate seatsRequested is between 1-4
    if (seatsRequested < 1 || seatsRequested > 4) {
      return res.status(400).json({ error: 'Seats needed must be between 1 and 4' });
    }

    // Calculate available seats: 4 total seats - seats needed by creator
    const availableSeats = 4 - seatsRequested;

    const newRide = new Ride({
      name,
      contact,
      userEmail: userEmail ? userEmail.toLowerCase() : null,
      pickupLocation,
      destination,
      departureTime,
      departureDate,
      availableSeats,
      notes,
      joinedUsers: [],
      status: 'active',
    });

    await newRide.save();

    console.log('🚗 New ride posted:', newRide);

    // Notify WhatsApp groups (non-blocking)
    sendRideAlert(newRide).catch(err => console.error('WhatsApp alert failed:', err.message));

    // Notify admin by email (non-blocking)
    sendAdminEmail(
      `🚗 New Ride Posted by ${name} - Perpway`,
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#CE1126,#FCD116,#006B3F);color:white;padding:20px;border-radius:10px 10px 0 0;text-align:center">
          <h2>🚗 New Ride Posted</h2>
          <p>Perpway - Personal Easy Rides &amp; Packages</p>
        </div>
        <div style="background:#f9f9f9;padding:20px;border-radius:0 0 10px 10px">
          <div style="background:white;padding:15px;margin:10px 0;border-radius:8px;border-left:4px solid #CE1126">
            <h3 style="margin-top:0;color:#CE1126">👤 Poster</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Contact:</strong> ${contact}</p>
            <p><strong>Email:</strong> ${userEmail || 'Not provided'}</p>
          </div>
          <div style="background:white;padding:15px;margin:10px 0;border-radius:8px;border-left:4px solid #CE1126">
            <h3 style="margin-top:0;color:#CE1126">📍 Ride Details</h3>
            <p><strong>From:</strong> ${pickupLocation}</p>
            <p><strong>To:</strong> ${destination}</p>
            <p><strong>Date:</strong> ${departureDate}</p>
            <p><strong>Time:</strong> ${departureTime}</p>
            <p><strong>Seats Available:</strong> ${4 - (parseInt(seatsNeeded) || 1)}</p>
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          </div>
          <p style="text-align:center">
            <a href="${process.env.FRONTEND_URL || 'https://perpway.vercel.app'}/admin/dashboard" style="display:inline-block;padding:12px 24px;background:#CE1126;color:white;text-decoration:none;border-radius:6px">View in Dashboard</a>
          </p>
        </div>
        <p style="text-align:center;color:#666;font-size:12px">© ${new Date().getFullYear()} Perpway. All rights reserved.</p>
      </div>
      `
    );

    res.json({
      success: true,
      message: 'Ride posted successfully!',
      ride: newRide,
    });
  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({ error: 'Failed to create ride' });
  }
});

// Join a ride
router.post('/:id/join', optionalAuth, async (req, res) => {
  try {
    const { name, phone, whatsapp, email, seatsNeeded, contactVisibility } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    // Check if ride has already departed
    const rideDateTime = new Date(`${ride.departureDate}T${ride.departureTime}`);
    if (rideDateTime < new Date()) {
      return res.status(400).json({ error: 'This ride has already departed.' });
    }

    // Parse seatsNeeded as integer
    const seatsRequested = parseInt(seatsNeeded) || 1;

    // Check if user already joined (by phone number)
    const alreadyJoined = ride.joinedUsers.some(user => user.phone === phone);
    if (alreadyJoined) {
      return res.status(400).json({ error: 'You have already joined this ride' });
    }

    // Atomically decrement seats and add user — prevents overbooking race condition
    const updatedRide = await Ride.findOneAndUpdate(
      { _id: req.params.id, availableSeats: { $gte: seatsRequested }, status: 'active' },
      {
        $inc: { availableSeats: -seatsRequested },
        $push: {
          joinedUsers: {
            name,
            phone,
            whatsapp: whatsapp || phone,
            email: email || '',
            seatsNeeded: seatsRequested,
            contactVisibility: contactVisibility || 'private',
          }
        }
      },
      { new: true }
    );

    if (!updatedRide) {
      return res.status(400).json({ error: `Not enough seats available. You requested ${seatsRequested} seat(s).` });
    }

    // Use updatedRide for the rest of the handler
    Object.assign(ride, updatedRide.toObject());

    console.log(`🚙 ${name} (${phone}) joined ride ${ride._id} - took ${seatsRequested} seat(s) [${contactVisibility || 'private'}]`);

    // Send email notification to ride creator
    const rideCreator = {
      name: ride.name,
      email: ride.userEmail,
      contact: ride.contact,
    };

    const joiner = {
      name,
      phone,
      whatsapp: whatsapp || phone,
      email: email || '',
      seatsNeeded: seatsRequested,
    };

    const rideDetails = {
      pickupLocation: ride.pickupLocation,
      destination: ride.destination,
      departureDate: ride.departureDate,
      departureTime: ride.departureTime,
      availableSeats: ride.availableSeats,
    };

    // Send notification to ride creator (don't wait for it - send async)
    sendRideJoinNotification(rideCreator, joiner, rideDetails).catch(err => {
      console.error('Failed to send notification email:', err);
    });

    // Notify admin (non-blocking)
    sendAdminEmail(
      `🚗 ${name} joined a ride to ${rideDetails.destination} - Perpway`,
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#CE1126,#FCD116,#006B3F);color:white;padding:20px;border-radius:10px 10px 0 0;text-align:center">
          <h2>🚗 Ride Joined</h2>
          <p>Perpway - Personal Easy Rides &amp; Packages</p>
        </div>
        <div style="background:#f9f9f9;padding:20px;border-radius:0 0 10px 10px">
          <div style="background:white;padding:15px;margin:10px 0;border-radius:8px;border-left:4px solid #CE1126">
            <h3 style="margin-top:0;color:#CE1126">👤 New Rider</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>WhatsApp:</strong> ${whatsapp || phone}</p>
            <p><strong>Email:</strong> ${email || 'Not provided'}</p>
            <p><strong>Seats Needed:</strong> ${seatsRequested}</p>
          </div>
          <div style="background:white;padding:15px;margin:10px 0;border-radius:8px;border-left:4px solid #006B3F">
            <h3 style="margin-top:0;color:#006B3F">📍 Ride Details</h3>
            <p><strong>From:</strong> ${rideDetails.pickupLocation}</p>
            <p><strong>To:</strong> ${rideDetails.destination}</p>
            <p><strong>Date:</strong> ${rideDetails.departureDate}</p>
            <p><strong>Time:</strong> ${rideDetails.departureTime}</p>
            <p><strong>Seats Remaining:</strong> ${updatedRide.availableSeats}</p>
          </div>
          <div style="background:white;padding:15px;margin:10px 0;border-radius:8px;border-left:4px solid #FCD116">
            <h3 style="margin-top:0;color:#856404">🧑 Ride Creator</h3>
            <p><strong>Name:</strong> ${ride.name}</p>
            <p><strong>Contact:</strong> ${ride.contact}</p>
          </div>
          <p style="text-align:center">
            <a href="${process.env.FRONTEND_URL || 'https://perpway.vercel.app'}/admin/dashboard" style="display:inline-block;padding:12px 24px;background:#CE1126;color:white;text-decoration:none;border-radius:6px">View in Dashboard</a>
          </p>
        </div>
        <p style="text-align:center;color:#666;font-size:12px">© ${new Date().getFullYear()} Perpway. All rights reserved.</p>
      </div>
      `
    );

    res.json({
      success: true,
      message: 'Successfully joined the ride!',
      ride,
    });
  } catch (error) {
    console.error('Join ride error:', error);
    res.status(500).json({ error: 'Failed to join ride' });
  }
});

// Delete a ride (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await Ride.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Ride deleted successfully',
    });
  } catch (error) {
    console.error('Delete ride error:', error);
    res.status(500).json({ error: 'Failed to delete ride' });
  }
});

module.exports = router;
