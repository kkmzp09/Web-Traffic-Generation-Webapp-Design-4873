// Test Resend Email API
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('📧 Testing Resend Email API...\n');

const transporter = nodemailer.createTransporter({
  host: 'smtp.resend.com',
  port: 587,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY
  }
});

transporter.sendMail({
  from: 'seo@organitrafficboost.com',
  to: 'kk@jobmakers.in',
  subject: '✅ Test Email - Automated SEO System',
  html: `
    <h1>🎉 Email System Working!</h1>
    <p>Your automated SEO monitoring system is ready!</p>
    <hr>
    <h2>What's Next:</h2>
    <ul>
      <li>✅ Database tables created</li>
      <li>✅ Cron jobs scheduled</li>
      <li>✅ DataForSEO API connected</li>
      <li>✅ Email system working</li>
    </ul>
    <p><strong>You'll receive automated reports after each scan!</strong></p>
  `
})
.then(() => {
  console.log('✅ Email Sent Successfully!');
  console.log('Check your inbox at: kk@jobmakers.in');
})
.catch(err => {
  console.error('❌ Email Error:', err.message);
});
