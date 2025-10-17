# VPS Campaign Tracking Setup

## Overview
This guide shows you how to add campaign tracking and history to your relay server on the VPS.

## Step 1: Upload Campaign Tracker to VPS

```bash
# On your local machine, copy the file to VPS
scp vps-campaign-tracker.js root@vps3173361.trouble-free.net:~/relay/
```

## Step 2: Update Relay Server

SSH into your VPS:
```bash
ssh root@vps3173361.trouble-free.net
cd ~/relay
nano server.js
```

Add these lines at the top (after the requires):
```javascript
const { campaignTrackingMiddleware, initCampaignsFile } = require('./vps-campaign-tracker');
```

Add this BEFORE your routes (after `app.use(cors(...))` and before `app.get('/health', ...)`):
```javascript
// Initialize campaign tracking
initCampaignsFile().catch(console.error);

// Add campaign tracking routes
campaignTrackingMiddleware(app);
```

## Step 3: Restart Relay Server

```bash
pm2 restart relay-api
pm2 logs relay-api
```

## Step 4: Test the Endpoints

### Test campaign listing:
```bash
curl -X GET http://127.0.0.1:3001/campaigns \
  -H "x-api-key: m7fB9zQv4kR2sX8nH6pW0tLq3YvZ1uC5gD8eF4rJp"
```

### Test campaign results:
```bash
curl -X GET http://127.0.0.1:3001/results/1760699608097 \
  -H "x-api-key: m7fB9zQv4kR2sX8nH6pW0tLq3YvZ1uC5gD8eF4rJp"
```

## Step 5: Update Playwright Server to Report Progress

Edit `~/playwright-server/server.js` and update the `/run` endpoint to report progress:

Find this section in the `/run` endpoint:
```javascript
runPool(urls, CONCURRENCY, async (url, idx) => {
  try {
    console.log(`[${jobId}] (${idx + 1}/${urls.length}) Starting session: ${url}`);
    await visitOnce(url, dwellMs, scroll, maxDepth);
    console.log(`[${jobId}] (${idx + 1}/${urls.length}) Session complete: ${url}`);
    
    // ADD THIS: Report progress to relay
    try {
      await fetch('http://127.0.0.1:3001/campaigns/${jobId}/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.API_KEY
        },
        body: JSON.stringify({
          completed: idx + 1,
          pagesVisited: (idx + 1) * 2 // Estimate based on maxDepth
        })
      });
    } catch (e) { /* ignore */ }
    
    return { url, ok: true };
  } catch (err) {
    // ADD THIS: Report failure
    try {
      await fetch('http://127.0.0.1:3001/campaigns/${jobId}/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.API_KEY
        },
        body: JSON.stringify({
          failed: (idx + 1)
        })
      });
    } catch (e) { /* ignore */ }
    
    return { url, ok: false, error: String(err) };
  }
}).then(summary => {
  const ok = summary.filter(s => s?.ok).length;
  console.log(`[${jobId}] finished: ${ok}/${urls.length} succeeded`);
  
  // ADD THIS: Mark campaign as completed
  fetch('http://127.0.0.1:3001/campaigns/${jobId}/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.API_KEY
    },
    body: JSON.stringify({
      status: 'completed',
      completed: ok,
      failed: urls.length - ok
    })
  }).catch(() => {});
});
```

Then restart:
```bash
pm2 restart playwright-api
```

## What This Does

1. **Saves campaigns** when they start
2. **Tracks progress** as visits complete
3. **Stores history** for 7 days
4. **Provides API endpoints** for frontend to fetch:
   - `/campaigns` - List all campaigns
   - `/results/:id` - Get campaign results

## Frontend Integration

Your frontend is already configured! The changes made to:
- `DirectTraffic.jsx` - Shows real-time progress
- `CampaignHistory.jsx` - Shows past campaigns
- `api.js` - Already has the API calls

## File Storage

Campaigns are stored in: `~/relay/campaigns.json`

To view:
```bash
cat ~/relay/campaigns.json
```

To backup:
```bash
cp ~/relay/campaigns.json ~/relay/campaigns.backup.json
```

## Troubleshooting

### Campaigns not showing?
```bash
# Check if file exists
ls -la ~/relay/campaigns.json

# Check relay logs
pm2 logs relay-api

# Test manually
curl http://127.0.0.1:3001/campaigns
```

### Progress not updating?
```bash
# Check playwright logs
pm2 logs playwright-api

# Verify fetch calls are working
```

## Next Steps

1. Upload `vps-campaign-tracker.js` to VPS
2. Update relay `server.js`
3. Update playwright `server.js`
4. Restart both services
5. Test from frontend

Your campaign tracking is now complete! 🎉
