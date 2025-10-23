# SEO Automation Backend - Installation Guide

## Required Dependencies

Install these packages on your VPS:

```bash
cd /var/www/relay-api

# Install required packages
npm install axios cheerio node-cron nodemailer

# Or add to package.json and run npm install
```

## Package Details

- **axios** - HTTP client for making requests and calling OpenAI API
- **cheerio** - HTML parser for web scraping (like jQuery for Node.js)
- **node-cron** - Cron job scheduler for automated scans
- **nodemailer** - Email service for alerts and reports

## Environment Variables

Add these to your `.env` file on the VPS:

```bash
# OpenAI API Key (for AI-powered fixes)
OPENAI_API_KEY=your_openai_api_key_here

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Database (already configured)
DATABASE_URL=postgresql://neondb_owner:npg_5vl4FWcqJiOy@ep-nameless-brook-adzphzu5-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## Getting OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add it to your `.env` file
4. Cost: ~$0.002 per fix (very cheap with gpt-4o-mini)

## Gmail SMTP Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password":
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Create new app password for "Mail"
3. Use the generated password in SMTP_PASS

## Database Schema Deployment

Run the schema file on your Neon database:

```bash
# On your VPS
psql "postgresql://neondb_owner:npg_5vl4FWcqJiOy@ep-nameless-brook-adzphzu5-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" < /var/www/relay-api/seo-automation-schema.sql
```

Or manually copy and paste the SQL from `seo-automation-schema.sql` into your Neon SQL editor.

## Integration with Existing Server

Add to your main server file (e.g., `relay-api.js` or `server.js`):

```javascript
// Import SEO automation routes
const seoAutomationRoutes = require('./seo-automation-api');
const seoScheduler = require('./seo-scheduler');

// Add routes
app.use('/api/seo', seoAutomationRoutes);

// Start scheduler
seoScheduler.start();

console.log('SEO Automation system started');
```

## Testing the Setup

1. **Test Database Connection:**
```bash
psql "your_database_url" -c "SELECT * FROM seo_scans LIMIT 1;"
```

2. **Test Email Service:**
Create a test file `test-email.js`:
```javascript
const emailService = require('./seo-email-service');

emailService.testConnection().then(result => {
  console.log('Email test:', result ? 'SUCCESS' : 'FAILED');
});
```

Run: `node test-email.js`

3. **Test Scanner:**
Create `test-scanner.js`:
```javascript
const scanner = require('./seo-scanner-service');

scanner.scanPage('https://example.com').then(results => {
  console.log('Scan results:', results);
});
```

Run: `node test-scanner.js`

## Monitoring & Logs

The scheduler runs every hour and logs to console. To see logs:

```bash
# If using PM2
pm2 logs relay-api

# If using systemd
journalctl -u relay-api -f
```

## Troubleshooting

### Issue: OpenAI API errors
- Check API key is valid
- Ensure you have credits in your OpenAI account
- Check rate limits

### Issue: Email not sending
- Verify SMTP credentials
- Check Gmail app password is correct
- Ensure port 587 is not blocked

### Issue: Scans failing
- Check target website allows scraping
- Verify axios can make HTTPS requests
- Check for rate limiting

### Issue: Scheduler not running
- Verify cron syntax
- Check server time zone
- Ensure scheduler.start() is called

## Security Notes

1. **Never commit `.env` file** to git
2. **Rotate API keys** regularly
3. **Use app passwords** for email, not main password
4. **Limit OpenAI spending** in OpenAI dashboard
5. **Validate user input** before scanning URLs

## Cost Estimates

- **OpenAI API**: ~$0.002 per fix (very cheap)
- **Database**: Free tier on Neon (up to 10GB)
- **Email**: Free with Gmail
- **Server**: Your existing VPS

**Estimated cost for 1000 scans/month with AI fixes: ~$2-5**

## Next Steps

After installation:
1. Deploy database schema
2. Install dependencies
3. Configure environment variables
4. Test each component
5. Integrate with main server
6. Deploy frontend components
7. Test end-to-end workflow

## Support

If you encounter issues:
1. Check logs for error messages
2. Verify all environment variables are set
3. Test each service independently
4. Check database connectivity
5. Verify API keys are valid
