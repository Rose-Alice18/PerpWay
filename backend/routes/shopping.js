const express = require('express');
const router = express.Router();
const ShoppingRequest = require('../models/ShoppingRequest');
const { uploadShopping } = require('../config/cloudinary');

// Create new shopping request
router.post('/create', uploadShopping.single('productImage'), async (req, res) => {
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
