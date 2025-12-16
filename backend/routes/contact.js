const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

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

// POST /api/contact/submit - Handle contact form submissions
router.post('/submit', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: 'All fields are required',
        details: {
          name: !name ? 'Name is required' : null,
          email: !email ? 'Email is required' : null,
          subject: !subject ? 'Subject is required' : null,
          message: !message ? 'Message is required' : null
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const transporter = createTransporter();

    // Email to admin (roselinetsatsu@gmail.com)
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: 'roselinetsatsu@gmail.com',
      replyTo: email, // User can reply directly to the sender
      subject: `📧 Contact Form: ${subject}`,
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
            .message-box { background: white; padding: 20px; margin: 20px 0; border: 1px solid #ddd; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="info-box">
                <h3>👤 Sender Information</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Subject:</strong> ${subject}</p>
              </div>

              <div class="message-box">
                <h3>💬 Message</h3>
                <p>${message.replace(/\n/g, '<br>')}</p>
              </div>

              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                <strong>Reply to this email directly</strong> to respond to ${name}. The reply will go to ${email}.
              </p>

              <div class="footer">
                <p>🚙 Perpway Contact Form</p>
                <p>Received on ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Confirmation email to sender
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '✅ We Received Your Message - Perpway',
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
              <h1>✅ Message Received!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Thank you for reaching out to Perpway! We've received your message and will get back to you as soon as possible.</p>

              <div class="info-box">
                <h3>📝 Your Message Details</h3>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Sent on:</strong> ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>

              <p>💡 <strong>What happens next?</strong></p>
              <ul>
                <li>Our team will review your message</li>
                <li>We typically respond within 24 hours</li>
                <li>You'll receive a reply at this email address: ${email}</li>
              </ul>

              <p>If you have any urgent matters, feel free to reach out to us directly via WhatsApp or phone!</p>

              <div class="footer">
                <p>🚙 Perpway - Personal Easy Rides & Packages</p>
                <p>Making campus life easier!</p>
                <p style="margin-top: 10px;">📧 support@perpway.com</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions)
    ]);

    console.log(`✅ Contact form submitted by ${name} (${email})`);

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.'
    });

  } catch (error) {
    console.error('❌ Error processing contact form:', error);
    res.status(500).json({
      error: 'Failed to send message. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
