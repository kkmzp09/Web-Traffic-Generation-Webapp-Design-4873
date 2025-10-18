# OrganiTrafficBoost Email API

Backend API service for sending transactional emails using Resend.

## 🚀 Features

- ✅ Welcome emails for new users
- ✅ Password reset emails
- ✅ Payment confirmation emails
- ✅ Payment pending notifications
- ✅ Campaign started notifications
- ✅ Rate limiting (10 emails/hour per IP)
- ✅ CORS enabled for frontend
- ✅ Security headers with Helmet
- ✅ PM2 process management
- ✅ Beautiful HTML email templates

## 📋 Prerequisites

- Node.js v16 or higher
- npm or yarn
- Resend API key
- Linux server (for deployment)

## 🔧 Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
RESEND_API_KEY=re_GvsKBzUC_L1rK6DY21xKeTE3ixF9p62dk
FROM_EMAIL=onboarding@resend.dev
COMPANY_NAME=OrganiTrafficBoost
SUPPORT_EMAIL=support@organitrafficboost.com
PORT=3000
NODE_ENV=development
```

### 3. Start Development Server

```bash
npm run dev
```

Server will run on http://localhost:3000

### 4. Test Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Test password reset email
curl -X POST http://localhost:3000/api/email/password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your@email.com",
    "userName": "Test User",
    "resetLink": "https://www.organitrafficboost.com/reset-password?token=test123"
  }'
```

## 🌐 API Endpoints

### Health Check
```
GET /health
```

### Send Welcome Email
```
POST /api/email/welcome
Content-Type: application/json

{
  "to": "user@example.com",
  "userName": "John Doe",
  "dashboardUrl": "https://www.organitrafficboost.com/dashboard"
}
```

### Send Password Reset Email
```
POST /api/email/password-reset
Content-Type: application/json

{
  "to": "user@example.com",
  "userName": "John Doe",
  "resetLink": "https://www.organitrafficboost.com/reset-password?token=abc123"
}
```

### Send Payment Confirmation
```
POST /api/email/payment-confirmation
Content-Type: application/json

{
  "to": "user@example.com",
  "userName": "John Doe",
  "planName": "Growth Plan",
  "amount": "$35",
  "transactionId": "TXN123456",
  "visits": "2,000"
}
```

### Send Payment Pending
```
POST /api/email/payment-pending
Content-Type: application/json

{
  "to": "user@example.com",
  "userName": "John Doe",
  "planName": "Growth Plan",
  "amount": "$35"
}
```

### Send Campaign Started
```
POST /api/email/campaign-started
Content-Type: application/json

{
  "to": "user@example.com",
  "userName": "John Doe",
  "campaignName": "My Campaign",
  "visits": "2,000",
  "startDate": "2025-10-18",
  "trackingUrl": "https://www.organitrafficboost.com/analytics"
}
```

## 🚀 Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to your Linux server.

## 📊 Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Email endpoints**: 10 emails per hour per IP

## 🔒 Security

- CORS enabled for specified origins only
- Helmet.js for security headers
- Rate limiting to prevent abuse
- Environment variables for sensitive data

## 🐛 Troubleshooting

### Emails not sending?
- Check Resend API key is correct
- Verify FROM_EMAIL is valid
- Check server logs: `pm2 logs`

### CORS errors?
- Verify your frontend domain is in the CORS whitelist
- Check server.js line 16-21

### Server not starting?
- Check if port 3000 is available
- Verify all environment variables are set
- Check Node.js version: `node --version`

## 📝 License

MIT
