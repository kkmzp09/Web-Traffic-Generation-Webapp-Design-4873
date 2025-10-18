# Resend Email Integration Setup Guide

## 🚀 Quick Setup Steps

### Step 1: Get Your Resend API Key

1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name it: "TrafficGenPro Production"
4. Copy the API key (starts with `re_`)
5. **IMPORTANT:** Save it securely - you won't see it again!

### Step 2: Verify Your Domain (Optional but Recommended)

**For better deliverability:**
1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain (e.g., `trafficgenpro.com`)
4. Add the DNS records to your domain provider
5. Wait for verification (usually 5-10 minutes)

**Or use Resend's domain (easier for testing):**
- You can send from `onboarding@resend.dev` without domain verification
- Limited to 100 emails/day
- Good for testing, not for production

### Step 3: Add Environment Variables

Create/update `.env` file in your project root:

```env
# Resend API Key
VITE_RESEND_API_KEY=re_your_api_key_here

# Email Settings
VITE_FROM_EMAIL=noreply@yourdomain.com
VITE_SUPPORT_EMAIL=support@yourdomain.com
VITE_COMPANY_NAME=TrafficGenPro
```

**For Netlify deployment:**
1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add these variables:
   - `VITE_RESEND_API_KEY` = your API key
   - `VITE_FROM_EMAIL` = your sender email
   - `VITE_SUPPORT_EMAIL` = your support email
   - `VITE_COMPANY_NAME` = TrafficGenPro

### Step 4: Install Resend Package

```bash
npm install resend
```

## 📧 Email Templates Included

### 1. Welcome Email
**Trigger:** New user signs up
**Template:** `src/emails/WelcomeEmail.jsx`
**Includes:**
- Personalized greeting
- Getting started guide
- Quick links to dashboard
- Support contact

### 2. Password Reset Email
**Trigger:** User requests password reset
**Template:** `src/emails/PasswordResetEmail.jsx`
**Includes:**
- Reset link (expires in 1 hour)
- Security notice
- Alternative support option

### 3. Payment Confirmation Email
**Trigger:** Payment verified (UPI or USDT)
**Template:** `src/emails/PaymentConfirmationEmail.jsx`
**Includes:**
- Payment details
- Plan information
- Invoice/receipt
- Next steps

### 4. Campaign Started Email
**Trigger:** Traffic campaign begins
**Template:** `src/emails/CampaignStartedEmail.jsx`
**Includes:**
- Campaign details
- Expected delivery timeline
- Tracking link
- Support contact

### 5. Campaign Completed Email
**Trigger:** Traffic campaign finishes
**Template:** `src/emails/CampaignCompletedEmail.jsx`
**Includes:**
- Campaign results
- Statistics (visits delivered, completion rate)
- Analytics link
- Upsell to next plan

### 6. Payment Pending Email
**Trigger:** User submits payment for verification
**Template:** `src/emails/PaymentPendingEmail.jsx`
**Includes:**
- Verification timeline (24-48 hours)
- What happens next
- Support contact

## 🔧 Usage Examples

### Send Welcome Email
```javascript
import { sendWelcomeEmail } from './utils/emailService';

// After user signs up
await sendWelcomeEmail({
  to: user.email,
  userName: user.name,
  dashboardUrl: 'https://yoursite.com/dashboard'
});
```

### Send Password Reset
```javascript
import { sendPasswordResetEmail } from './utils/emailService';

// When user requests reset
await sendPasswordResetEmail({
  to: user.email,
  userName: user.name,
  resetLink: `https://yoursite.com/reset-password?token=${token}`
});
```

### Send Payment Confirmation
```javascript
import { sendPaymentConfirmationEmail } from './utils/emailService';

// After payment verified
await sendPaymentConfirmationEmail({
  to: user.email,
  userName: user.name,
  planName: 'Professional Plan',
  amount: '₹4,900',
  transactionId: 'TXN123456',
  visits: '5,000'
});
```

### Send Campaign Notification
```javascript
import { sendCampaignStartedEmail } from './utils/emailService';

// When campaign starts
await sendCampaignStartedEmail({
  to: user.email,
  userName: user.name,
  campaignName: 'Website Traffic Campaign',
  visits: '5,000',
  startDate: '2025-10-20',
  trackingUrl: 'https://yoursite.com/analytics'
});
```

## 🎨 Email Template Customization

All email templates are in `src/emails/` directory. You can customize:
- **Colors:** Change brand colors in each template
- **Logo:** Add your logo URL
- **Content:** Modify text and messaging
- **Layout:** Adjust structure and design

## 🔒 Security Best Practices

### 1. Protect Your API Key
- ✅ Never commit API keys to Git
- ✅ Use environment variables
- ✅ Add `.env` to `.gitignore`
- ✅ Rotate keys regularly

### 2. Validate Email Addresses
```javascript
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
```

### 3. Rate Limiting
- Implement rate limiting to prevent abuse
- Resend free tier: 3,000 emails/month
- Monitor usage in Resend dashboard

### 4. Unsubscribe Links
- Add unsubscribe option for marketing emails
- Not required for transactional emails (welcome, password reset)
- Required for campaign notifications

## 📊 Monitoring & Analytics

### Resend Dashboard
Track in real-time:
- Emails sent
- Delivery rate
- Open rate (if tracking enabled)
- Bounce rate
- Spam complaints

### Access Dashboard:
https://resend.com/emails

## 🐛 Troubleshooting

### Email Not Sending?
1. **Check API key:** Verify it's correct in `.env`
2. **Check from email:** Must match verified domain
3. **Check console:** Look for error messages
4. **Check Resend logs:** View in dashboard

### Email Going to Spam?
1. **Verify domain:** Add SPF, DKIM records
2. **Warm up domain:** Start with low volume
3. **Avoid spam words:** Check content
4. **Add unsubscribe:** For marketing emails

### Rate Limit Errors?
1. **Check usage:** View in Resend dashboard
2. **Upgrade plan:** If exceeding 3,000/month
3. **Implement queue:** Batch emails

## 💰 Pricing & Limits

### Free Tier
- **3,000 emails/month**
- **100 emails/day**
- All features included
- No credit card required

### Pro Plan ($20/month)
- **50,000 emails/month**
- **Unlimited daily sends**
- Priority support
- Advanced analytics

### When to Upgrade?
- When you consistently hit 3,000/month
- When you need more than 100/day
- When you need priority support

## 🔄 Migration from Other Services

### From SendGrid
```javascript
// Old (SendGrid)
sgMail.send({ to, from, subject, html })

// New (Resend)
resend.emails.send({ to, from, subject, html })
```

### From Mailgun
```javascript
// Old (Mailgun)
mailgun.messages().send({ to, from, subject, html })

// New (Resend)
resend.emails.send({ to, from, subject, html })
```

## 📝 Testing

### Test Emails Locally
```javascript
// Use test mode
const testEmail = async () => {
  const result = await sendWelcomeEmail({
    to: 'test@example.com',
    userName: 'Test User',
    dashboardUrl: 'http://localhost:5173/dashboard'
  });
  console.log('Email sent:', result);
};
```

### Test Recipients
- Use your own email for testing
- Check spam folder
- Verify all links work
- Test on mobile devices

## 🚀 Production Checklist

- [ ] API key added to environment variables
- [ ] Domain verified (or using Resend domain)
- [ ] All email templates tested
- [ ] From email configured correctly
- [ ] Support email configured
- [ ] Error handling implemented
- [ ] Rate limiting in place
- [ ] Monitoring set up
- [ ] Unsubscribe links added (for marketing)
- [ ] Privacy policy updated

## 📞 Support

### Resend Support
- Documentation: https://resend.com/docs
- Discord: https://resend.com/discord
- Email: support@resend.com

### Common Issues
1. **"Invalid API key"** → Check `.env` file
2. **"Domain not verified"** → Use `onboarding@resend.dev` for testing
3. **"Rate limit exceeded"** → Wait or upgrade plan
4. **"Email bounced"** → Verify recipient email

## 🎯 Next Steps

1. **Get API key** from Resend dashboard
2. **Add to `.env`** file
3. **Test welcome email** with your email
4. **Verify domain** (optional)
5. **Deploy to production**
6. **Monitor in dashboard**

---

**Your Resend integration is ready to use! Start sending beautiful transactional emails! 📧**
