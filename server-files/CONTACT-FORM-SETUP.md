# Contact Form API Setup Instructions

## Overview
The contact form now sends emails via Resend API when users submit the form.

## Files Created/Modified

### Backend:
- **`server-files/contact-form-api.js`** - New API endpoint for contact form submissions

### Frontend:
- **`src/pages/ContactUs.jsx`** - Updated to call the backend API

## Backend Setup (VPS)

### 1. Upload the new API file to VPS:
```bash
scp server-files/contact-form-api.js root@67.217.60.57:/root/relay/
```

### 2. Add the route to your main server file (relay-api.js or similar):

```javascript
// Contact Form API
const contactFormAPI = require('./contact-form-api');
app.use('/api/contact', contactFormAPI);
console.log('✅ Contact Form API initialized');
```

### 3. Ensure Resend package is installed:
```bash
cd /root/relay
npm install resend
```

### 4. Verify RESEND_API_KEY is in your .env file:
```
RESEND_API_KEY=your_resend_api_key_here
```

### 5. Restart PM2:
```bash
pm2 restart relay-api
pm2 logs relay-api
```

## How It Works

1. **User submits form** → Frontend sends data to `/api/contact/submit`
2. **Backend validates** → Checks all required fields
3. **Sends 2 emails via Resend:**
   - **To you (admin):** Notification with user's message and contact details
   - **To user:** Auto-reply confirming receipt
4. **Returns success** → Frontend shows success message

## Email Recipients

- **Admin email:** `support@organitrafficboost.com` (receives all contact form submissions)
- **User email:** Gets auto-reply confirmation

## Testing

After deployment, test the contact form at:
- https://organitrafficboost.com/contact

You should receive:
1. Email notification with the user's message
2. User should receive auto-reply confirmation

## Troubleshooting

If emails aren't working:
1. Check PM2 logs: `pm2 logs relay-api`
2. Verify Resend API key is valid
3. Check that route is registered in main server file
4. Verify domain is verified in Resend dashboard
