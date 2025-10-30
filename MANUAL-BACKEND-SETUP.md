# Manual Backend Setup for Free Scan Feature

Since SSH password authentication is having issues, here's the manual setup:

## Option 1: Use PuTTY/SSH Client

### Step 1: Connect to VPS
```
Open PuTTY or your SSH client
Host: 165.232.177.47
Username: root
Enter your password when prompted
```

### Step 2: Upload free-scan-api.js

**Using WinSCP or FileZilla:**
1. Connect to: 165.232.177.47
2. Username: root
3. Password: [your password]
4. Navigate to: `/root/traffic-app/server-files/`
5. Upload: `server-files/free-scan-api.js`

**OR using command in SSH session:**
```bash
cd /root/traffic-app/server-files/
nano free-scan-api.js
```
Then paste the contents from your local `server-files/free-scan-api.js`

### Step 3: Update server.js

```bash
cd /root/traffic-app
nano server.js
```

Find the line with `keyword-tracker-api` and add these lines after it:

```javascript
// Free Scan API
const freeScanAPI = require('./server-files/free-scan-api');
app.use('/api/seo', freeScanAPI);
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 4: Verify Resend API Key

```bash
cat .env | grep RESEND
```

You should see:
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

If not, add it:
```bash
nano .env
```

Add this line:
```
RESEND_API_KEY=your_resend_api_key_here
```

### Step 5: Restart API Server

```bash
pm2 restart traffic-api
pm2 logs traffic-api --lines 50
```

### Step 6: Test the Endpoint

```bash
curl -X POST https://api.organitrafficboost.com/api/seo/free-scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","email":"test@example.com"}'
```

---

## Option 2: Copy-Paste Method

If you can't upload files, here's the complete `free-scan-api.js` content to copy-paste:

### SSH into your server:
```bash
ssh root@165.232.177.47
cd /root/traffic-app/server-files/
nano free-scan-api.js
```

### Paste this entire content:

```javascript
// server-files/free-scan-api.js
// Free SEO Scan API - 10 pages free for lead generation

const express = require('express');
const router = express.Router();
const dataforSEOOnPage = require('./dataforseo-onpage-service');
const { Resend } = require('resend');

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// POST /api/seo/free-scan
// Free 10-page SEO scan with email delivery
// ============================================
router.post('/free-scan', async (req, res) => {
  try {
    const { url, email } = req.body;

    if (!url || !email) {
      return res.json({ success: false, error: 'URL and email required' });
    }

    console.log(`🎁 Free scan requested for: ${url} by ${email}`);

    // Start the scan (limit to 10 pages)
    const scanResult = await dataforSEOOnPage.startOnPageScan(url, 10);

    if (!scanResult.success) {
      return res.json({ success: false, error: scanResult.error });
    }

    const taskId = scanResult.taskId;

    // Wait for scan to complete (poll every 10 seconds, max 2 minutes)
    let attempts = 0;
    const maxAttempts = 12;
    let scanData = null;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      
      const statusResult = await dataforSEOOnPage.getOnPageResults(taskId);
      
      if (statusResult.success && statusResult.status === 'ready') {
        scanData = statusResult;
        break;
      }
      
      attempts++;
    }

    if (!scanData) {
      return res.json({ 
        success: false, 
        error: 'Scan is taking longer than expected. We will email you the results shortly.' 
      });
    }

    // Generate email report
    const emailHtml = generateEmailReport(url, scanData);

    // Send email using Resend
    const emailResult = await resend.emails.send({
      from: 'OrganiTraffic SEO <noreply@organitrafficboost.com>',
      to: email,
      subject: `Your Free SEO Scan Results for ${url}`,
      html: emailHtml
    });

    console.log(`✅ Free scan report sent to: ${email}`, emailResult);

    res.json({
      success: true,
      message: 'Scan complete! Check your email for the detailed report.',
      summary: {
        totalPages: scanData.pages?.length || 0,
        totalIssues: scanData.totalIssues || 0,
        score: scanData.score || 0
      }
    });

  } catch (error) {
    console.error('Free Scan Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate HTML email report
function generateEmailReport(url, scanData) {
  const score = scanData.score || 0;
  const totalIssues = scanData.totalIssues || 0;
  const pages = scanData.pages || [];

  let scoreColor = '#ef4444'; // red
  if (score >= 80) scoreColor = '#10b981'; // green
  else if (score >= 60) scoreColor = '#f59e0b'; // yellow

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your SEO Scan Results</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Your Free SEO Scan Results</h1>
      <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">${url}</p>
    </div>

    <!-- Score Card -->
    <div style="padding: 30px 20px; text-align: center; background-color: #f9fafb;">
      <div style="background-color: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Overall SEO Score</h2>
        <div style="font-size: 72px; font-weight: bold; color: ${scoreColor}; margin: 20px 0;">
          ${score}
        </div>
        <p style="color: #6b7280; font-size: 16px; margin: 10px 0;">
          ${totalIssues} issues found across ${pages.length} pages
        </p>
      </div>
    </div>

    <!-- Issues Summary -->
    <div style="padding: 30px 20px;">
      <h2 style="color: #1f2937; font-size: 22px; margin: 0 0 20px 0;">Top Issues Found</h2>
      
      ${generateIssuesList(scanData)}
    </div>

    <!-- CTA -->
    <div style="padding: 30px 20px; background-color: #f9fafb; text-align: center;">
      <h3 style="color: #1f2937; margin: 0 0 15px 0;">Want to Fix These Issues Automatically?</h3>
      <p style="color: #6b7280; margin: 0 0 20px 0;">
        Upgrade to our SEO Tools Suite and get AI-powered fixes, automatic optimization, and ongoing monitoring.
      </p>
      <a href="https://organitrafficboost.com/pricing" 
         style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        View Pricing Plans
      </a>
    </div>

    <!-- Footer -->
    <div style="padding: 30px 20px; text-align: center; background-color: #1f2937; color: #9ca3af;">
      <p style="margin: 0 0 10px 0; font-size: 14px;">
        © 2025 OrganiTraffic. All rights reserved.
      </p>
      <p style="margin: 0; font-size: 12px;">
        <a href="https://organitrafficboost.com" style="color: #60a5fa; text-decoration: none;">Visit Website</a> | 
        <a href="https://organitrafficboost.com/pricing" style="color: #60a5fa; text-decoration: none;">Pricing</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateIssuesList(scanData) {
  const issues = [];
  
  // Collect top issues from pages
  if (scanData.pages && scanData.pages.length > 0) {
    scanData.pages.forEach(page => {
      if (page.issues) {
        Object.keys(page.issues).forEach(category => {
          if (page.issues[category] && page.issues[category].length > 0) {
            issues.push({
              category: category,
              count: page.issues[category].length,
              page: page.url
            });
          }
        });
      }
    });
  }

  // Group by category
  const grouped = {};
  issues.forEach(issue => {
    if (!grouped[issue.category]) {
      grouped[issue.category] = 0;
    }
    grouped[issue.category] += issue.count;
  });

  // Sort by count
  const sorted = Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (sorted.length === 0) {
    return '<p style="color: #10b981; text-align: center;">✓ No major issues found! Your site is in great shape.</p>';
  }

  return sorted.map(([category, count]) => `
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 15px; border-radius: 4px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #92400e; font-weight: bold; text-transform: capitalize;">${category.replace(/_/g, ' ')}</span>
        <span style="background-color: #f59e0b; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: bold;">${count}</span>
      </div>
    </div>
  `).join('');
}

module.exports = router;
```

Save and exit (Ctrl+X, then Y, then Enter)

### Then continue with Steps 3-6 above.

---

## Verification

After setup, check:

1. **API is running:**
   ```bash
   pm2 status
   ```

2. **No errors in logs:**
   ```bash
   pm2 logs traffic-api --lines 20
   ```

3. **Test endpoint:**
   ```bash
   curl -X POST https://api.organitrafficboost.com/api/seo/free-scan \
     -H "Content-Type: application/json" \
     -d '{"url":"https://example.com","email":"your-email@example.com"}'
   ```

4. **Check your email** for the scan report!

---

## Troubleshooting

**If email doesn't send:**
- Check RESEND_API_KEY is set correctly
- Check pm2 logs for errors
- Verify your Resend account is active
- Check email isn't in spam folder

**If scan fails:**
- Check DataForSEO API credits
- Check pm2 logs for specific errors
- Verify dataforseo-onpage-service.js exists
