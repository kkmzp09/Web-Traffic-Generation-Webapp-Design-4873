// server-files/contact-form-api.js
// Contact form API endpoint with Resend email integration

const express = require('express');
const router = express.Router();
const { Resend } = require('resend');

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/contact/submit
router.post('/submit', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Subject mapping
    const subjectLabels = {
      general: 'General Inquiry',
      support: 'Technical Support',
      billing: 'Billing Question',
      refund: 'Refund Request',
      feature: 'Feature Request',
      partnership: 'Partnership Opportunity'
    };

    const subjectLabel = subjectLabels[subject] || subject;

    // Send email to admin using Resend
    const emailResult = await resend.emails.send({
      from: 'OrganiTraffic Contact Form <contact@organitrafficboost.com>',
      to: 'support@organitrafficboost.com', // Your email where you want to receive contact form submissions
      replyTo: email, // User's email for easy reply
      subject: `[Contact Form] ${subjectLabel} - ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #4b5563; margin-bottom: 5px; }
            .value { background: white; padding: 12px; border-radius: 6px; border: 1px solid #d1d5db; }
            .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">📧 New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">From:</div>
                <div class="value">${name}</div>
              </div>
              
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              
              <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${subjectLabel}</div>
              </div>
              
              <div class="field">
                <div class="label">Message:</div>
                <div class="value" style="white-space: pre-wrap;">${message}</div>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent from the OrganiTraffic contact form.</p>
              <p>Reply directly to this email to respond to ${name}.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log('✅ Contact form email sent:', emailResult);

    // Send auto-reply to user
    try {
      await resend.emails.send({
        from: 'OrganiTraffic Support <support@organitrafficboost.com>',
        to: email,
        subject: 'We received your message - OrganiTraffic',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
              .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Thank You for Contacting Us!</h1>
              </div>
              <div class="content">
                <p>Hi ${name},</p>
                
                <p>We've received your message regarding <strong>${subjectLabel}</strong> and our team will review it shortly.</p>
                
                <p>We typically respond within 24 hours during business hours (Monday - Friday, 9:00 AM - 6:00 PM IST).</p>
                
                <p><strong>Your message:</strong></p>
                <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; white-space: pre-wrap;">${message}</div>
                
                <p>In the meantime, you can:</p>
                <ul>
                  <li>Check out our <a href="https://organitrafficboost.com/pricing" style="color: #667eea;">pricing plans</a></li>
                  <li>Read our <a href="https://organitrafficboost.com/terms-of-service" style="color: #667eea;">terms of service</a></li>
                  <li>Visit our <a href="https://organitrafficboost.com" style="color: #667eea;">website</a></li>
                </ul>
                
                <p>Best regards,<br>
                <strong>OrganiTraffic Team</strong></p>
              </div>
              <div class="footer">
                <p>OrganiTraffic - Professional SEO & Traffic Generation</p>
                <p>#35 Gangeshvarnath Jooj, Chunar, Mirzapur, Uttar Pradesh 231304, India</p>
                <p>Email: support@organitrafficboost.com | Phone: 6394370783</p>
              </div>
            </div>
          </body>
          </html>
        `
      });
      console.log('✅ Auto-reply sent to user');
    } catch (autoReplyError) {
      console.error('⚠️ Auto-reply failed (non-critical):', autoReplyError);
    }

    res.json({
      success: true,
      message: 'Your message has been sent successfully! We\'ll get back to you soon.'
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message. Please try again later.'
    });
  }
});

module.exports = router;
