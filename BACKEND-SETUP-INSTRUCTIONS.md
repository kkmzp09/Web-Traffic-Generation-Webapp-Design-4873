# Backend Setup Instructions for Free Scan Feature

## 1. Upload the Free Scan API

```bash
scp server-files/free-scan-api.js root@165.232.177.47:/root/traffic-app/server-files/
```

## 2. Update server.js

SSH into your server and edit `/root/traffic-app/server.js`:

```bash
ssh root@165.232.177.47
cd /root/traffic-app
nano server.js
```

Add these lines after the other API routes:

```javascript
// Free Scan API
const freeScanAPI = require('./server-files/free-scan-api');
app.use('/api/seo', freeScanAPI);
```

## 3. Configure Email Settings

Add these environment variables to your `.env` file:

```bash
nano .env
```

Add:

```env
# Email Configuration for Free Scan Reports
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**For Gmail:**
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate an "App Password" for "Mail"
4. Use that app password in SMTP_PASS

## 4. Install nodemailer (if not already installed)

```bash
npm install nodemailer
```

## 5. Restart the API Server

```bash
pm2 restart traffic-api
pm2 logs traffic-api
```

## 6. Test the Free Scan

```bash
curl -X POST https://api.organitrafficboost.com/api/seo/free-scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","email":"test@example.com"}'
```

## API Endpoint

**POST** `/api/seo/free-scan`

**Request Body:**
```json
{
  "url": "https://example.com",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Scan complete! Check your email for the detailed report.",
  "summary": {
    "totalPages": 10,
    "totalIssues": 45,
    "score": 72
  }
}
```

## Features

- ✅ Scans up to 10 pages for free
- ✅ Sends detailed HTML email report
- ✅ Includes SEO score and top issues
- ✅ CTA to upgrade to paid plans
- ✅ Lead generation (captures email)

## Troubleshooting

**Email not sending?**
- Check SMTP credentials in .env
- Check pm2 logs: `pm2 logs traffic-api`
- Test SMTP connection manually

**Scan timing out?**
- DataForSEO scans can take 1-2 minutes
- Frontend shows loading state
- Backend waits up to 2 minutes before timeout
