# Resend Email - Quick Start Guide

## ✅ You've Registered! Now Follow These Steps:

### Step 1: Get Your API Key (2 minutes)

1. Go to https://resend.com/api-keys
2. Click **"Create API Key"**
3. Name it: `TrafficGenPro Production`
4. Copy the key (starts with `re_`)
5. **Save it securely!**

### Step 2: Add API Key to Your Project (1 minute)

Create a `.env` file in your project root:

```bash
# Create .env file
echo VITE_RESEND_API_KEY=re_your_actual_key_here > .env
echo VITE_FROM_EMAIL=onboarding@resend.dev >> .env
echo VITE_SUPPORT_EMAIL=support@trafficgenpro.com >> .env
echo VITE_COMPANY_NAME=TrafficGenPro >> .env
```

**Or manually create `.env` file:**
```env
VITE_RESEND_API_KEY=re_your_actual_key_here
VITE_FROM_EMAIL=onboarding@resend.dev
VITE_SUPPORT_EMAIL=support@trafficgenpro.com
VITE_COMPANY_NAME=TrafficGenPro
```

### Step 3: Test It! (2 minutes)

Create a test file `test-email.js`:

```javascript
import { sendWelcomeEmail } from './src/utils/emailService.js';

// Test welcome email
sendWelcomeEmail({
  to: 'your-email@example.com', // Use YOUR email
  userName: 'Test User',
  dashboardUrl: 'http://localhost:5173/dashboard'
}).then(result => {
  console.log('Email sent:', result);
});
```

Run it:
```bash
node test-email.js
```

Check your inbox! 📧

### Step 4: Add to Netlify (For Production)

1. Go to Netlify Dashboard
2. Site Settings → Environment Variables
3. Add these variables:
   - `VITE_RESEND_API_KEY` = your API key
   - `VITE_FROM_EMAIL` = `onboarding@resend.dev`
   - `VITE_SUPPORT_EMAIL` = your support email
   - `VITE_COMPANY_NAME` = `TrafficGenPro`

### Step 5: Use in Your App

**Send Welcome Email:**
```javascript
import { sendWelcomeEmail } from './utils/emailService';

// After user signs up
await sendWelcomeEmail({
  to: user.email,
  userName: user.name,
  dashboardUrl: 'https://yoursite.com/dashboard'
});
```

**Send Payment Confirmation:**
```javascript
import { sendPaymentConfirmationEmail } from './utils/emailService';

// After payment verified
await sendPaymentConfirmationEmail({
  to: user.email,
  userName: user.name,
  planName: 'Growth Plan',
  amount: '₹2,900',
  transactionId: 'TXN123456',
  visits: '2,000'
});
```

**Send Payment Pending:**
```javascript
import { sendPaymentPendingEmail } from './utils/emailService';

// When user submits payment
await sendPaymentPendingEmail({
  to: user.email,
  userName: user.name,
  planName: 'Growth Plan',
  amount: '₹2,900'
});
```

## 📧 Available Email Functions:

1. `sendWelcomeEmail()` - New user signup
2. `sendPasswordResetEmail()` - Password reset request
3. `sendPaymentConfirmationEmail()` - Payment verified
4. `sendPaymentPendingEmail()` - Payment submitted
5. `sendCampaignStartedEmail()` - Campaign begins

## 🎯 Free Tier Limits:

- **3,000 emails/month** ✅
- **100 emails/day** ✅
- No credit card required ✅

## 🔧 Troubleshooting:

**Email not sending?**
- Check API key in `.env`
- Restart dev server after adding `.env`
- Check console for errors

**Email in spam?**
- Normal for `onboarding@resend.dev`
- Verify your own domain for better deliverability

## 🚀 Next Steps:

1. ✅ Get API key from Resend
2. ✅ Add to `.env` file
3. ✅ Test with your email
4. ✅ Add to Netlify environment variables
5. ✅ Integrate into your auth flow

**You're all set! Start sending emails! 📧**
