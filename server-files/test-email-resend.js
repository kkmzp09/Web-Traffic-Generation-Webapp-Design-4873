// Test Resend Email API using native fetch
require('dotenv').config();

console.log('📧 Testing Resend Email API...\n');

const emailData = {
  from: 'OrganiTraffic SEO <seo@organitrafficboost.com>',
  to: ['kk@jobmakers.in'],
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
};

fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(emailData)
})
.then(res => res.json())
.then(data => {
  if (data.id) {
    console.log('✅ Email Sent Successfully!');
    console.log('Email ID:', data.id);
    console.log('Check your inbox at: kk@jobmakers.in');
  } else {
    console.error('❌ Error:', data);
  }
})
.catch(err => {
  console.error('❌ Email Error:', err.message);
});
