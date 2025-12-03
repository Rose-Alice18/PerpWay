const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const DeliveryRequest = require('../models/DeliveryRequest');
const MotorRider = require('../models/MotorRider');

// Create a test email transporter
// In production, use real email credentials
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password',
  },
});

// Submit delivery request
router.post('/request', async (req, res) => {
  try {
    const { name, contact, itemDescription, pickupPoint, dropoffPoint, deliveryType, notes } = req.body;

    // Save to database
    const deliveryRequest = new DeliveryRequest({
      name,
      contact,
      itemDescription,
      pickupPoint,
      dropoffPoint,
      deliveryType,
      notes,
    });

    await deliveryRequest.save();

    // Log the request
    console.log('📦 New delivery request saved:', deliveryRequest);

    // Prepare email content
    const deliveryTypeNames = {
      instant: 'Instant Delivery (2-4 hours)',
      'next-day': 'Next-Day Delivery',
      'weekly-standard': 'Weekly Standard Bulk Pickup',
    };

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #CE1126 0%, #FCD116 50%, #006B3F 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .info-section { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #CE1126; }
          .info-section h3 { margin-top: 0; color: #CE1126; }
          ul { list-style: none; padding: 0; }
          li { padding: 8px 0; border-bottom: 1px solid #eee; }
          li:last-child { border-bottom: none; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 12px 24px; background: #CE1126; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🚚 New Delivery Request</h2>
            <p>Perpway - Personal Easy Rides & Packages</p>
          </div>
          <div class="content">
            <div class="info-section">
              <h3>👤 Customer Information</h3>
              <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Contact:</strong> ${contact}</li>
              </ul>
            </div>

            <div class="info-section">
              <h3>📦 Delivery Details</h3>
              <ul>
                <li><strong>Item:</strong> ${itemDescription}</li>
                <li><strong>Pickup Point:</strong> ${pickupPoint}</li>
                <li><strong>Drop-off Point:</strong> ${dropoffPoint}</li>
                <li><strong>Delivery Type:</strong> ${deliveryTypeNames[deliveryType]}</li>
                ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ''}
              </ul>
            </div>

            <div class="info-section">
              <h3>⏰ Request Information</h3>
              <ul>
                <li><strong>Received at:</strong> ${new Date().toLocaleString()}</li>
                <li><strong>Status:</strong> Pending Authorization</li>
              </ul>
            </div>

            <p style="text-align: center; margin-top: 20px;">
              <a href="http://localhost:2000/admin/dashboard" class="btn">View in Dashboard</a>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated notification from Perpway</p>
            <p>© ${new Date().getFullYear()} Perpway. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Try to send email notification to admin
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER || 'noreply@perpway.com',
        to: 'roselinetsatsu@gmail.com',
        subject: `🚚 New Delivery Request from ${name} - Perpway`,
        html: emailContent,
      });
      console.log('✅ Email notification sent to roselinetsatsu@gmail.com!');
    } catch (emailError) {
      console.log('⚠️  Email sending failed (configure EMAIL_USER and EMAIL_PASS in .env)');
      console.log('Email error:', emailError.message);
      console.log('Request data saved to database - check admin dashboard.');
    }

    res.json({
      success: true,
      message: 'Delivery request received! We will contact you shortly.',
      requestId: `DEL-${Date.now()}`,
    });
  } catch (error) {
    console.error('Delivery request error:', error);
    res.status(500).json({ error: 'Failed to process delivery request' });
  }
});

// ============ ADMIN ROUTES ============

// Get all delivery requests (admin only)
router.get('/admin/all', async (req, res) => {
  try {
    const deliveries = await DeliveryRequest.find()
      .populate('assignedRider')
      .sort({ createdAt: -1 });
    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries', message: error.message });
  }
});

// Authorize a delivery request (admin only)
router.put('/admin/:id/authorize', async (req, res) => {
  try {
    const { authorizedBy } = req.body;
    const delivery = await DeliveryRequest.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    if (delivery.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending deliveries can be authorized' });
    }

    delivery.status = 'authorized';
    delivery.authorizedBy = authorizedBy;
    delivery.authorizedAt = new Date();

    await delivery.save();

    console.log(`✅ Delivery ${delivery._id} authorized by ${authorizedBy}`);

    res.json({
      success: true,
      message: 'Delivery authorized successfully',
      delivery,
    });
  } catch (error) {
    console.error('Authorize delivery error:', error);
    res.status(500).json({ error: 'Failed to authorize delivery', message: error.message });
  }
});

// Assign rider to delivery (admin only)
router.put('/admin/:id/assign', async (req, res) => {
  try {
    const { riderId } = req.body;
    const delivery = await DeliveryRequest.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    if (delivery.status !== 'authorized') {
      return res.status(400).json({ error: 'Only authorized deliveries can be assigned to riders' });
    }

    if (!riderId) {
      return res.status(400).json({ error: 'Rider ID is required' });
    }

    // Find the motor rider
    const rider = await MotorRider.findById(riderId);
    if (!rider) {
      return res.status(404).json({ error: 'Motor rider not found' });
    }

    // Check if rider is available
    if (rider.status !== 'active') {
      return res.status(400).json({ error: `Rider is currently ${rider.status}. Please select an active rider.` });
    }

    // Assign the delivery
    delivery.status = 'assigned';
    delivery.assignedRider = riderId;
    delivery.assignedRiderName = rider.name;
    delivery.assignedAt = new Date();

    // Update rider status to busy
    rider.status = 'busy';
    await rider.save();

    await delivery.save();

    console.log(`🏍️ Delivery ${delivery._id} assigned to ${rider.name} (${rider.phone})`);

    // Populate rider info before sending response
    await delivery.populate('assignedRider');

    res.json({
      success: true,
      message: `Delivery assigned to ${rider.name}`,
      delivery,
    });
  } catch (error) {
    console.error('Assign rider error:', error);
    res.status(500).json({ error: 'Failed to assign rider', message: error.message });
  }
});

// Quick assign to default delivery rider
router.put('/admin/:id/assign-default', async (req, res) => {
  try {
    const delivery = await DeliveryRequest.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    if (delivery.status !== 'authorized') {
      return res.status(400).json({ error: 'Only authorized deliveries can be assigned to riders' });
    }

    // Find the default delivery rider
    const defaultRider = await MotorRider.findOne({ isDefaultDeliveryRider: true });
    if (!defaultRider) {
      return res.status(404).json({ error: 'No default delivery rider set. Please assign manually or set a default rider.' });
    }

    // Check if default rider is available
    if (defaultRider.status !== 'active') {
      return res.status(400).json({
        error: `Default rider (${defaultRider.name}) is currently ${defaultRider.status}. Please assign manually.`,
        riderId: defaultRider._id,
        riderName: defaultRider.name,
        riderStatus: defaultRider.status
      });
    }

    // Assign the delivery
    delivery.status = 'assigned';
    delivery.assignedRider = defaultRider._id;
    delivery.assignedRiderName = defaultRider.name;
    delivery.assignedAt = new Date();

    // Update rider status to busy
    defaultRider.status = 'busy';
    await defaultRider.save();

    await delivery.save();

    console.log(`🏍️ Delivery ${delivery._id} auto-assigned to default rider ${defaultRider.name}`);

    // Populate rider info before sending response
    await delivery.populate('assignedRider');

    res.json({
      success: true,
      message: `Delivery assigned to ${defaultRider.name} (Default Rider)`,
      delivery,
    });
  } catch (error) {
    console.error('Auto-assign default rider error:', error);
    res.status(500).json({ error: 'Failed to assign default rider', message: error.message });
  }
});

// Update delivery status (admin/rider)
router.put('/admin/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const delivery = await DeliveryRequest.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const validStatuses = ['pending', 'authorized', 'assigned', 'in-progress', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    delivery.status = status;
    await delivery.save();

    console.log(`📦 Delivery ${delivery._id} status updated to ${status}`);

    res.json({
      success: true,
      message: `Delivery status updated to ${status}`,
      delivery,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status', message: error.message });
  }
});

// Get deliveries for a specific rider by rider code
router.get('/rider/:riderCode', async (req, res) => {
  try {
    const { riderCode } = req.params;
    console.log(`🔍 Looking for rider with code: ${riderCode}`);

    // Find the motor rider by their unique code
    const rider = await MotorRider.findOne({ riderCode: riderCode });
    console.log(`📋 Rider found:`, rider);

    if (!rider) {
      console.log(`❌ No rider found with code: ${riderCode}`);
      return res.status(404).json({ error: 'Rider not found' });
    }

    // Get all active deliveries for this rider
    const deliveries = await DeliveryRequest.find({
      assignedRider: rider._id,
      status: { $in: ['assigned', 'in-progress', 'delivered', 'cancelled'] }
    }).sort({ createdAt: -1 });

    console.log(`🏍️ Fetched ${deliveries.length} deliveries for rider: ${rider.name}`);

    res.json({
      riderName: rider.name,
      deliveries
    });
  } catch (error) {
    console.error('Get rider deliveries error:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries', message: error.message });
  }
});

// Update delivery statuses from rider
router.post('/rider/:riderCode/update', async (req, res) => {
  try {
    const { riderCode } = req.params;
    const { updates } = req.body;

    // Find the motor rider
    const rider = await MotorRider.findOne({ riderCode });

    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    // Process each update
    const updatePromises = updates.map(async (update) => {
      const delivery = await DeliveryRequest.findById(update.deliveryId);

      if (delivery && delivery.assignedRider.toString() === rider._id.toString()) {
        delivery.status = update.status;

        // Add notes if provided (for failed deliveries)
        if (update.notes && update.notes.trim()) {
          delivery.notes = delivery.notes
            ? `${delivery.notes}\n\nRider Note: ${update.notes}`
            : `Rider Note: ${update.notes}`;
        }

        await delivery.save();
        console.log(`📦 Delivery ${delivery._id} updated to ${update.status} by rider ${rider.name}`);
        return { success: true, deliveryId: update.deliveryId };
      }

      return { success: false, deliveryId: update.deliveryId };
    });

    const results = await Promise.all(updatePromises);
    const successCount = results.filter(r => r.success).length;

    console.log(`✅ Rider ${rider.name} updated ${successCount} deliveries`);

    res.json({
      success: true,
      message: `Successfully updated ${successCount} deliveries`,
      results
    });
  } catch (error) {
    console.error('Rider update error:', error);
    res.status(500).json({ error: 'Failed to update deliveries', message: error.message });
  }
});

module.exports = router;
