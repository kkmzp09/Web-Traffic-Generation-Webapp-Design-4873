require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'https://www.organitrafficboost.com',
    'https://organitrafficboost.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Email rate limiting (stricter)
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10 // limit each IP to 10 emails per hour
});

// Constants
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const COMPANY_NAME = process.env.COMPANY_NAME || 'OrganiTrafficBoost';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@organitrafficboost.com';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'OrganiTrafficBoost Email API' });
});

// Welcome Email
app.post('/api/email/welcome', emailLimiter, async (req, res) => {
  try {
    const { to, userName, dashboardUrl } = req.body;

    if (!to || !userName) {
      return res.status(400).json({ error: 'Missing required fields: to, userName' });
    }

    const { data, error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: `Welcome to ${COMPANY_NAME}! 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${COMPANY_NAME}!</h1>
            </div>
            <div class="content">
              <h2>Hi ${userName}! 👋</h2>
              <p>Thank you for joining ${COMPANY_NAME}! Your account is now active and ready to use.</p>
              <p>We're excited to help you boost your website traffic with our premium services.</p>
              <p style="text-align: center;">
                <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
              </p>
              <p><strong>What's next?</strong></p>
              <ul>
                <li>Choose your perfect plan</li>
                <li>Set up your first campaign</li>
                <li>Watch your traffic grow!</li>
              </ul>
              <p>If you have any questions, feel free to reach out to us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
            </div>
            <div class="footer">
              <p>© 2025 ${COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Password Reset Email
app.post('/api/email/password-reset', emailLimiter, async (req, res) => {
  try {
    const { to, userName, resetLink } = req.body;

    if (!to || !resetLink) {
      return res.status(400).json({ error: 'Missing required fields: to, resetLink' });
    }

    const { data, error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: 'Reset Your Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${userName || 'there'}!</h2>
              <p>We received a request to reset your password for your ${COMPANY_NAME} account.</p>
              <p style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                If you didn't request this password reset, please ignore this email or contact our support team immediately.
              </div>
              <p>Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
            </div>
            <div class="footer">
              <p>© 2025 ${COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Payment Confirmation Email
app.post('/api/email/payment-confirmation', emailLimiter, async (req, res) => {
  try {
    const { to, userName, planName, amount, transactionId, visits } = req.body;

    if (!to || !planName || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: `Payment Confirmed! 🎉 Your ${planName} is Active`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Payment Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Hi ${userName}!</h2>
              <p>Great news! Your payment has been confirmed and your ${planName} is now active.</p>
              <div class="details">
                <h3>Order Details:</h3>
                <p><strong>Plan:</strong> ${planName}</p>
                <p><strong>Amount:</strong> ${amount}</p>
                <p><strong>Visits:</strong> ${visits}</p>
                ${transactionId ? `<p><strong>Transaction ID:</strong> ${transactionId}</p>` : ''}
              </div>
              <p style="text-align: center;">
                <a href="https://www.organitrafficboost.com/dashboard" class="button">View Dashboard</a>
              </p>
              <p>Your traffic campaign will start shortly. You can track your progress in real-time from your dashboard.</p>
              <p>Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
            </div>
            <div class="footer">
              <p>© 2025 ${COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Payment Pending Email
app.post('/api/email/payment-pending', emailLimiter, async (req, res) => {
  try {
    const { to, userName, planName, amount } = req.body;

    if (!to || !planName || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: 'Payment Received - Under Verification',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏳ Payment Received!</h1>
            </div>
            <div class="content">
              <h2>Hi ${userName}!</h2>
              <p>Thank you for your payment! We've received your payment for ${planName} (${amount}).</p>
              <div class="info">
                <strong>📋 What's Next?</strong><br>
                Your payment is currently being verified. This usually takes 24-48 hours. We'll send you a confirmation email once it's approved.
              </div>
              <p><strong>Order Summary:</strong></p>
              <ul>
                <li>Plan: ${planName}</li>
                <li>Amount: ${amount}</li>
                <li>Status: Under Verification</li>
              </ul>
              <p>Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
            </div>
            <div class="footer">
              <p>© 2025 ${COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Campaign Started Email
app.post('/api/email/campaign-started', emailLimiter, async (req, res) => {
  try {
    const { to, userName, campaignName, visits, startDate, trackingUrl } = req.body;

    if (!to || !campaignName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: `🚀 Campaign "${campaignName}" Started!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .stats { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Campaign Started!</h1>
            </div>
            <div class="content">
              <h2>Hi ${userName}!</h2>
              <p>Exciting news! Your campaign "<strong>${campaignName}</strong>" has started and traffic is now flowing to your website.</p>
              <div class="stats">
                <h3>Campaign Details:</h3>
                <p><strong>Campaign:</strong> ${campaignName}</p>
                <p><strong>Visits:</strong> ${visits}</p>
                <p><strong>Started:</strong> ${startDate || 'Just now'}</p>
              </div>
              <p style="text-align: center;">
                <a href="${trackingUrl || 'https://www.organitrafficboost.com/analytics'}" class="button">View Analytics</a>
              </p>
              <p>Track your campaign performance in real-time from your dashboard. Watch as your traffic grows!</p>
              <p>Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
            </div>
            <div class="footer">
              <p>© 2025 ${COMPANY_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Email API server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});
