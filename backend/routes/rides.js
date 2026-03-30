const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const { sendRideJoinNotification } = require('../config/email');
const { authenticateToken } = require('../middleware/auth');
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
    res.status(500).json({ error: 'Failed to fetch rides', message: error.message });
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
router.post('/create', async (req, res) => {
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

    res.json({
      success: true,
      message: 'Ride posted successfully!',
      ride: newRide,
    });
  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({ error: 'Failed to create ride', message: error.message });
  }
});

// Join a ride
router.post('/:id/join', async (req, res) => {
  try {
    const { name, phone, whatsapp, email, seatsNeeded, contactVisibility } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
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

    // Send notification (don't wait for it - send async)
    sendRideJoinNotification(rideCreator, joiner, rideDetails).catch(err => {
      console.error('Failed to send notification email:', err);
    });

    res.json({
      success: true,
      message: 'Successfully joined the ride!',
      ride,
    });
  } catch (error) {
    console.error('Join ride error:', error);
    res.status(500).json({ error: 'Failed to join ride', message: error.message });
  }
});

// Delete a ride
router.delete('/:id', async (req, res) => {
  try {
    await Ride.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Ride deleted successfully',
    });
  } catch (error) {
    console.error('Delete ride error:', error);
    res.status(500).json({ error: 'Failed to delete ride', message: error.message });
  }
});

module.exports = router;
