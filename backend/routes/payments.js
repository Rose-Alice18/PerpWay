const express = require('express');
const router = express.Router();
const axios = require('axios');

// Initialize Paystack payment
router.post('/initialize', async (req, res) => {
  try {
    const { email, amount, metadata } = req.body;

    // Validate input
    if (!email || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Email and amount are required',
      });
    }

    // Initialize payment with Paystack
    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Convert to pesewas (kobo)
        currency: 'GHS',
        subaccount: process.env.PAYSTACK_SUBACCOUNT_CODE, // Perpway subaccount
        metadata: metadata || {},
        callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('💰 Payment initialized:', {
      reference: paystackResponse.data.data.reference,
      email,
      amount: `GHS ${amount}`,
    });

    res.json({
      success: true,
      data: paystackResponse.data.data,
    });
  } catch (error) {
    console.error('❌ Payment initialization error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Payment initialization failed',
      message: error.response?.data?.message || error.message,
    });
  }
});

// Verify Paystack payment
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: 'Payment reference is required',
      });
    }

    // Verify payment with Paystack
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = paystackResponse.data.data;

    console.log('✅ Payment verified:', {
      reference: paymentData.reference,
      status: paymentData.status,
      amount: `GHS ${paymentData.amount / 100}`,
      customer: paymentData.customer.email,
    });

    res.json({
      success: true,
      data: paymentData,
    });
  } catch (error) {
    console.error('❌ Payment verification error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed',
      message: error.response?.data?.message || error.message,
    });
  }
});

// Paystack webhook endpoint for payment notifications
router.post('/webhook/paystack', (req, res) => {
  const hash = require('crypto')
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash === req.headers['x-paystack-signature']) {
    // Webhook is valid
    const event = req.body;

    console.log('📨 Paystack webhook received:', {
      event: event.event,
      reference: event.data.reference,
      status: event.data.status,
    });

    // Handle different webhook events
    switch (event.event) {
      case 'charge.success':
        // Payment was successful
        console.log('✅ Payment successful via webhook:', event.data.reference);
        // TODO: Update your database, unlock content, send confirmation email, etc.
        break;
      case 'charge.failed':
        // Payment failed
        console.log('❌ Payment failed via webhook:', event.data.reference);
        break;
      default:
        console.log('📌 Unhandled webhook event:', event.event);
    }

    res.sendStatus(200);
  } else {
    // Invalid webhook signature
    console.error('⚠️ Invalid webhook signature');
    res.sendStatus(400);
  }
});

// Legacy mock endpoint (for backward compatibility during migration)
router.post('/tip', async (req, res) => {
  console.log('⚠️ Legacy /tip endpoint called - redirecting to /initialize');

  const { driverId, amount, method, phoneNumber } = req.body;

  res.json({
    success: true,
    message: 'Please use /payments/initialize endpoint',
    redirect: '/payments/initialize',
  });
});

module.exports = router;
