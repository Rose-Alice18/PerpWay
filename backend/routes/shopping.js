const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const ShoppingRequest = require('../models/ShoppingRequest');
const { uploadShopping } = require('../config/cloudinary');
const { optionalAuth } = require('../middleware/auth');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Create new shopping request
router.post('/create', optionalAuth, uploadShopping.single('productImage'), async (req, res) => {
  try {
    const { userEmail, userName, userContact, productName, productDescription, shopLocations, estimatedPrice } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Product image is required' });
    }

    const newRequest = new ShoppingRequest({
      userEmail,
      userName,
      userContact,
      productName,
      productDescription,
      productImage: req.file.path, // Cloudinary URL
      shopLocations,
      estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : null,
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    await newRequest.save();

    console.log('🛒 New shopping request created:', newRequest);

    // Send admin email notification
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || 'roselinetsatsu@gmail.com',
        subject: `🛒 New Shopping Request from ${userName} - Perpway`,
        html: `
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
                <h2>🛒 New Shopping Request</h2>
                <p>Perpway - Personal Easy Rides & Packages</p>
              </div>
              <div class="content">
                <div class="info-section">
                  <h3>👤 Customer Information</h3>
                  <ul>
                    <li><strong>Name:</strong> ${userName}</li>
                    <li><strong>Contact:</strong> ${userContact}</li>
                    <li><strong>Email:</strong> ${userEmail || 'Not provided'}</li>
                  </ul>
                </div>
                <div class="info-section">
                  <h3>🛍️ Product Details</h3>
                  <ul>
                    <li><strong>Product:</strong> ${productName}</li>
                    <li><strong>Description:</strong> ${productDescription || 'N/A'}</li>
                    <li><strong>Shop Locations:</strong> ${shopLocations || 'N/A'}</li>
                    <li><strong>Estimated Price:</strong> ${estimatedPrice ? 'GH₵' + estimatedPrice : 'N/A'}</li>
                  </ul>
                </div>
                <div class="info-section">
                  <h3>⏰ Request Information</h3>
                  <ul>
                    <li><strong>Received at:</strong> ${new Date().toLocaleString()}</li>
                    <li><strong>Status:</strong> Pending</li>
                  </ul>
                </div>
                <p style="text-align: center; margin-top: 20px;">
                  <a href="${process.env.FRONTEND_URL || 'https://perpway.vercel.app'}/admin/dashboard" class="btn">View in Dashboard</a>
                </p>
              </div>
              <div class="footer">
                <p>This is an automated notification from Perpway</p>
                <p>© ${new Date().getFullYear()} Perpway. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log('✅ Admin notified of new shopping request');
    } catch (emailError) {
      console.log('⚠️ Admin email failed:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Shopping request submitted successfully!',
      request: newRequest,
    });
  } catch (error) {
    console.error('Create shopping request error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      error: 'Failed to create shopping request',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all shopping requests (admin)
router.get('/admin/all', async (req, res) => {
  try {
    const requests = await ShoppingRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching shopping requests:', error);
    res.status(500).json({ error: 'Failed to fetch shopping requests' });
  }
});

// Get user's shopping requests
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const requests = await ShoppingRequest.find({ userEmail: email.toLowerCase() })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests,
      total: requests.length,
    });
  } catch (error) {
    console.error('Error fetching user shopping requests:', error);
    res.status(500).json({ error: 'Failed to fetch shopping requests' });
  }
});

// Update shopping request status (admin)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, actualPrice, assignedTo } = req.body;

    const updateData = { status };

    if (adminNotes) updateData.adminNotes = adminNotes;
    if (actualPrice) updateData.actualPrice = parseFloat(actualPrice);
    if (assignedTo) updateData.assignedTo = assignedTo;

    if (status === 'authorized') {
      updateData.authorizedAt = new Date();
    }

    if (status === 'delivered') {
      updateData.completedAt = new Date();
    }

    const request = await ShoppingRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: 'Shopping request not found' });
    }

    res.json({
      success: true,
      message: 'Shopping request updated successfully',
      request,
    });
  } catch (error) {
    console.error('Update shopping request error:', error);
    res.status(500).json({ error: 'Failed to update shopping request' });
  }
});

// Update payment status
router.put('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const request = await ShoppingRequest.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: 'Shopping request not found' });
    }

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      request,
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// Delete shopping request
router.delete('/:id', async (req, res) => {
  try {
    await ShoppingRequest.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Shopping request deleted successfully',
    });
  } catch (error) {
    console.error('Delete shopping request error:', error);
    res.status(500).json({ error: 'Failed to delete shopping request' });
  }
});

module.exports = router;
