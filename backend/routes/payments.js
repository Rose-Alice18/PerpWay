const express = require('express');
const router = express.Router();
const axios = require('axios');
const nodemailer = require('nodemailer');
const TipPayment = require('../models/TipPayment');

const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

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

    // If payment is successful, record it in DB to grant 6-hour server-side access
    if (paymentData.status === 'success') {
      await TipPayment.findOneAndUpdate(
        { reference: paymentData.reference },
        {
          email: paymentData.customer.email,
          reference: paymentData.reference,
          amount: paymentData.amount / 100,
          expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        },
        { upsert: true }
      );
    }

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

// Check if user has active tip access (server-side unlock)
router.get('/tip-access', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.json({ hasAccess: false });

  const payment = await TipPayment.findOne({
    email: email.toLowerCase(),
    expiresAt: { $gt: new Date() },
  });

  res.json({ hasAccess: !!payment });
});

// Paystack webhook endpoint for payment notifications
router.post('/webhook/paystack', async (req, res) => {
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
      case 'charge.success': {
        // Payment was successful
        const { reference, amount, customer } = event.data;
        const amountGHS = (amount / 100).toFixed(2);
        const paymentDate = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        console.log('✅ Payment successful via webhook:', reference, `GHS ${amountGHS}`, customer.email);

        try {
          const transporter = createTransporter();

          // Confirmation email to the customer
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: customer.email,
            subject: '✅ Payment Confirmed - Perpway',
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #8B1E3F, #EAA221, #3C896D); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                  .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #3C896D; border-radius: 5px; }
                  .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>✅ Payment Confirmed!</h1>
                  </div>
                  <div class="content">
                    <p>Hi there!</p>
                    <p>Your tip payment on Perpway was successful. 🎉</p>
                    <p>We are truly grateful for your support. Every cedi you contribute helps us keep Perpway running and accessible for the entire Ashesi community. You are making a real difference — thank you so much! 💛</p>
                    <div class="info-box">
                      <h3>📋 Payment Details</h3>
                      <p><strong>Reference:</strong> ${reference}</p>
                      <p><strong>Amount:</strong> GHS ${amountGHS}</p>
                      <p><strong>Date:</strong> ${paymentDate}</p>
                    </div>
                    <p>You can now view the driver's contact information on the platform.</p>
                    <div class="footer">
                      <p>🚙 Perpway - Personal Easy Rides & Packages</p>
                      <p>Making campus life easier, one ride at a time!</p>
                    </div>
                  </div>
                </div>
              </body>
              </html>
            `,
          });
          console.log('📧 Confirmation email sent to:', customer.email);

          // Notification email to admin
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'roselinetsatsu@gmail.com',
            subject: `💰 New Tip Payment - GHS ${amountGHS}`,
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
                  .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>💰 New Tip Payment Received!</h1>
                  </div>
                  <div class="content">
                    <p>A user just tipped on Perpway.</p>
                    <div class="info-box">
                      <h3>📋 Payment Details</h3>
                      <p><strong>Reference:</strong> ${reference}</p>
                      <p><strong>Amount:</strong> GHS ${amountGHS}</p>
                      <p><strong>Customer:</strong> ${customer.email}</p>
                      <p><strong>Date:</strong> ${paymentDate}</p>
                    </div>
                    <div class="footer">
                      <p>🚙 Perpway Admin Notification</p>
                    </div>
                  </div>
                </div>
              </body>
              </html>
            `,
          });
          console.log('📧 Admin notification sent');
        } catch (emailError) {
          console.error('❌ Failed to send email:', emailError.message);
        }
        break;
      }
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
router.post('/tip', async (_req, res) => {
  console.log('⚠️ Legacy /tip endpoint called - redirecting to /initialize');

  res.json({
    success: true,
    message: 'Please use /payments/initialize endpoint',
    redirect: '/payments/initialize',
  });
});

module.exports = router;
