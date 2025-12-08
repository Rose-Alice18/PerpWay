const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');

// Get all rides
router.get('/', async (req, res) => {
  try {
    const rides = await Ride.find({ status: 'active' }).sort({ departureDate: 1, departureTime: 1 });
    res.json(rides);
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).json({ error: 'Failed to fetch rides', message: error.message });
  }
});

// GET user's ride history
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
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

    // Check if there are enough available seats
    if (ride.availableSeats <= 0) {
      return res.status(400).json({ error: 'No available seats' });
    }

    if (ride.availableSeats < seatsRequested) {
      return res.status(400).json({
        error: `Not enough seats available. Only ${ride.availableSeats} seat(s) left, but you requested ${seatsRequested} seat(s).`
      });
    }

    // Check if user already joined (by phone number)
    const alreadyJoined = ride.joinedUsers.some(user => user.phone === phone);
    if (alreadyJoined) {
      return res.status(400).json({ error: 'You have already joined this ride' });
    }

    // Add user with full contact details including seats needed and visibility preference
    ride.joinedUsers.push({
      name,
      phone,
      whatsapp: whatsapp || phone, // Use phone if WhatsApp not provided
      email: email || '',
      seatsNeeded: seatsRequested,
      contactVisibility: contactVisibility || 'private', // Default to private
    });
    ride.availableSeats -= seatsRequested;

    await ride.save();

    console.log(`🚙 ${name} (${phone}) joined ride ${ride._id} - took ${seatsRequested} seat(s) [${contactVisibility || 'private'}]`);

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
