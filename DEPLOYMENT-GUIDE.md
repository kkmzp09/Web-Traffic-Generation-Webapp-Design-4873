# 🚀 Deployment Guide - Automated SEO Monitoring

## Prerequisites

You'll need API keys from:
1. ✅ **OpenAI** (ChatGPT) - For AI content generation
2. ✅ **DataForSEO** - For SERP competitor analysis  
3. ✅ **Resend** - For email reports

---

## Step 1: Get API Keys

### 1.1 OpenAI (ChatGPT) API Key

**You already have this!** ✅

```bash
# Your existing key in .env:
OPENAI_API_KEY=sk-your-key-here
```

**Usage:** AI-generated content for fixes
**Cost:** ~$0.002 per fix (~$10-20/month)

---

### 1.2 DataForSEO API Key

**Get it from:** https://dataforseo.com

**Steps:**
1. Go to https://dataforseo.com
2. Click "Sign Up" (or "Get Started")
3. Create account
4. Go to Dashboard
5. Copy your credentials:
   - **Login:** (usually your email)
   - **Password:** (API password, not account password)

**Pricing:**
- Pay-as-you-go: $0.05 per keyword search
- Monthly: $30 for 1000 searches
- **Recommended:** Start with pay-as-you-go

**Add to .env:**
```bash
DATAFORSEO_LOGIN=your-email@example.com
DATAFORSEO_PASSWORD=your-api-password-here
```

**Usage:** Fetches real SERP results for competitor analysis
**Cost:** ~$5-10/month (depending on keywords tracked)

---

### 1.3 Resend API Key

**Get it from:** https://resend.com

**Steps:**
1. Go to https://resend.com
2. Click "Get Started Free"
3. Create account
4. Go to API Keys section
5. Click "Create API Key"
6. Copy the key (starts with `re_`)

**Pricing:**
- **Free tier:** 3,000 emails/month ✅
- **Pro:** $20/month for 50,000 emails

**Add to .env:**
```bash
RESEND_API_KEY=re_your-key-here
```

**Usage:** Sends automated email reports to users
**Cost:** $0 (free tier is enough)

---

## Step 2: Update .env File

### On Your Server:

```bash
ssh root@67.217.60.57
cd /root/relay
nano .env
```

### Add These Lines:

```bash
# Existing (you already have this)
OPENAI_API_KEY=sk-your-key-here
DATABASE_URL=postgresql://...

# NEW: Add these
DATAFORSEO_LOGIN=your-email@example.com
DATAFORSEO_PASSWORD=your-api-password
RESEND_API_KEY=re_your-key-here
APP_URL=https://organitrafficboost.com

# Email configuration
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

---

## Step 3: Deploy Backend Files

### 3.1 Upload Files

```bash
# From your local machine:
scp server-files/automated-seo-monitor.js root@67.217.60.57:/root/relay/
scp server-files/create-monitoring-tables.sql root@67.217.60.57:/root/relay/
scp server-files/setup-automated-monitoring.sh root@67.217.60.57:/root/relay/
```

### 3.2 Create Database Tables

```bash
ssh root@67.217.60.57
cd /root/relay

# Run SQL script
node -e "
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sql = fs.readFileSync('create-monitoring-tables.sql', 'utf8');
pool.query(sql)
  .then(() => {
    console.log('✅ Tables created');
    pool.end();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    pool.end();
  });
"
```

### 3.3 Setup Cron Jobs

```bash
chmod +x setup-automated-monitoring.sh
./setup-automated-monitoring.sh
```

This will:
- ✅ Create database tables
- ✅ Setup daily scans (2 AM)
- ✅ Setup weekly reports (Sunday 3 AM)
- ✅ Create log files

---

## Step 4: Test the System

### 4.1 Test Email Sending

```bash
cd /root/relay
node -e "
require('dotenv').config();
const nodemailer = require('nodemailer');

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
  to: 'your-email@example.com', // YOUR EMAIL HERE
  subject: 'Test Email from OrganiTraffic',
  html: '<h1>✅ Email system working!</h1>'
})
.then(() => console.log('✅ Email sent!'))
.catch(err => console.error('❌ Error:', err));
"
```

**Expected:** You receive test email within 1 minute

---

### 4.2 Test DataForSEO API

```bash
node -e "
require('dotenv').config();
const axios = require('axios');

const auth = Buffer.from(
  process.env.DATAFORSEO_LOGIN + ':' + process.env.DATAFORSEO_PASSWORD
).toString('base64');

axios.post(
  'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
  [{
    keyword: 'seo services',
    language_code: 'en',
    location_code: 2840,
    device: 'desktop',
    depth: 10
  }],
  {
    headers: {
      'Authorization': 'Basic ' + auth,
      'Content-Type': 'application/json'
    }
  }
)
.then(res => {
  console.log('✅ DataForSEO working!');
  console.log('Results:', res.data.tasks[0].result[0].items.length);
})
.catch(err => console.error('❌ Error:', err.message));
"
```

**Expected:** Shows 10 SERP results

---

### 4.3 Test Full Monitoring Run

```bash
cd /root/relay
node automated-seo-monitor.js
```

**Expected output:**
```
🤖 Starting Automated SEO Monitoring...
📊 Found X site(s) to monitor

🔍 Processing: example.com
  📈 Running SEO scan...
  🔎 Analyzing competitors...
  ⚡ Auto-applying fixes...
  📊 Tracking rankings...
  📧 Sending email report to user@email.com...
  ✅ Email sent to user@email.com
✅ Completed monitoring for example.com

🎉 Automated monitoring complete!
```

---

## Step 5: Deploy Frontend

### 5.1 Commit and Push

```bash
# On your local machine:
cd C:\Users\Administrator\OrrganiTraffic\Web-Traffic-Generation-Webapp-Design-4873

git add src/components/SetAndForgetOnboarding.jsx
git add src/components/AutomatedMonitoringSettings.jsx
git commit -m "Add automated monitoring system with DataForSEO integration"
git push origin main
```

### 5.2 Netlify Auto-Deploy

Netlify will automatically deploy (2-3 minutes)

**Check:** https://organitrafficboost.com

---

## Step 6: Verify Cron Jobs

### Check Cron Schedule

```bash
crontab -l
```

**Expected output:**
```
0 2 * * * cd /root/relay && node automated-seo-monitor.js >> /var/log/seo-monitor.log 2>&1
0 3 * * 0 cd /root/relay && node automated-seo-monitor.js --comprehensive >> /var/log/seo-monitor-weekly.log 2>&1
```

### View Logs

```bash
# View daily log
tail -f /var/log/seo-monitor.log

# View weekly log
tail -f /var/log/seo-monitor-weekly.log
```

---

## Step 7: Enable Monitoring for Test Site

### 7.1 Via Dashboard

1. Go to https://organitrafficboost.com
2. Login
3. Go to "Automated Monitoring Settings"
4. Enter website URL
5. Add keywords (optional)
6. Enable "Auto-Fix"
7. Set frequency: "Weekly"
8. Click "Save Settings"

### 7.2 Via Database (Manual)

```bash
ssh root@67.217.60.57
cd /root/relay

node -e "
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query(\`
  UPDATE seo_scans 
  SET 
    monitoring_enabled = true,
    auto_fix_enabled = true,
    scan_frequency = 'weekly',
    target_keywords = ARRAY['seo services', 'web design']
  WHERE url = 'https://freehosting.me.uk'
\`)
.then(() => {
  console.log('✅ Monitoring enabled');
  pool.end();
})
.catch(err => {
  console.error('❌ Error:', err);
  pool.end();
});
"
```

---

## Step 8: Wait for First Automated Run

### When It Runs:
- **Daily:** 2:00 AM server time
- **Weekly:** Sunday 3:00 AM

### Or Run Manually:
```bash
cd /root/relay
node automated-seo-monitor.js
```

### Check Email:
- Check inbox for email report
- Should arrive within 1-2 minutes

---

## Troubleshooting

### Issue: Email not sending

**Check:**
```bash
# Verify Resend API key
echo $RESEND_API_KEY

# Test email manually
node -e "..." # (see Step 4.1)
```

**Fix:**
- Verify API key is correct
- Check Resend dashboard for errors
- Verify sender domain is verified

---

### Issue: DataForSEO not working

**Check:**
```bash
# Verify credentials
echo $DATAFORSEO_LOGIN
echo $DATAFORSEO_PASSWORD

# Test API manually
node -e "..." # (see Step 4.2)
```

**Fix:**
- Verify credentials are correct
- Check DataForSEO dashboard for credits
- System falls back to mock data if API fails

---

### Issue: Cron not running

**Check:**
```bash
# View cron logs
tail -f /var/log/seo-monitor.log

# Check cron status
systemctl status cron
```

**Fix:**
```bash
# Restart cron
systemctl restart cron

# Re-add cron jobs
crontab -e
```

---

### Issue: Widget not applying fixes

**Check:**
```bash
# Verify widget script is on website
curl https://freehosting.me.uk | grep "organitrafficboost.com/widget.js"

# Check widget API
curl https://api.organitrafficboost.com/api/seo/widget/fixes/freehosting-me-uk-001
```

**Fix:**
- Verify widget script is installed
- Check browser console for errors
- Verify fixes are in database

---

## Monitoring & Maintenance

### Daily Checks:
```bash
# Check logs
tail -n 50 /var/log/seo-monitor.log

# Check last run
ls -lh /var/log/seo-monitor.log
```

### Weekly Checks:
- Review email reports
- Check user feedback
- Monitor API costs

### Monthly Checks:
- Review DataForSEO usage
- Check Resend email quota
- Optimize cron schedule if needed

---

## Cost Summary

### Monthly Costs:

| Service | Cost | Usage |
|---------|------|-------|
| **OpenAI (ChatGPT)** | $10-20 | AI content generation |
| **DataForSEO** | $5-10 | SERP analysis |
| **Resend** | $0 | Email reports (free tier) |
| **Server** | $0 | Existing VPS |
| **Total** | **$15-30** | Full automation |

### Cost Optimization:

**DataForSEO:**
- Start with 5 keywords per site
- Increase as needed
- Use mock data for testing

**OpenAI:**
- Only generate AI fixes when requested
- Widget fixes are free
- Cache common fixes

**Resend:**
- Free tier: 3,000 emails/month
- Enough for 100 users with weekly reports

---

## Success Metrics

### After 1 Week:
- ✅ Cron jobs running successfully
- ✅ Email reports being sent
- ✅ Fixes being applied automatically
- ✅ Users receiving reports

### After 1 Month:
- ✅ 4+ automated scans per site
- ✅ 20+ issues auto-fixed per site
- ✅ Ranking improvements visible
- ✅ User engagement high

### After 3 Months:
- ✅ 12+ scans per site
- ✅ 50+ issues fixed per site
- ✅ Significant ranking gains
- ✅ Clear ROI demonstrated

---

## Next Steps

1. ✅ Get API keys (DataForSEO, Resend)
2. ✅ Update .env file
3. ✅ Deploy backend files
4. ✅ Setup cron jobs
5. ✅ Test email sending
6. ✅ Test SERP API
7. ✅ Deploy frontend
8. ✅ Enable monitoring for test site
9. ✅ Wait for first automated run
10. ✅ Verify email received

---

## Support

**Issues?**
- Check logs: `/var/log/seo-monitor.log`
- Test manually: `node automated-seo-monitor.js`
- Verify cron: `crontab -l`

**Questions?**
- Review documentation
- Check API dashboards
- Test individual components

---

**Status:** ✅ Ready to deploy
**Time to deploy:** 30 minutes
**Difficulty:** Easy (follow steps)

🚀 **Let's deploy this system!**
