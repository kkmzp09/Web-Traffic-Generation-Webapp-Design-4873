# Campaign Analysis Instructions
## Job ID: 1762494336711

Since we need to check the VPS server directly, here are the manual steps:

---

## 🔐 SSH into VPS

```bash
ssh root@67.217.60.57
```

Once connected, run these commands:

---

## 📊 Step 1: Check PM2 Status

```bash
pm2 status
```

This shows all running processes. Look for:
- `relay-api` - Main traffic generation API
- `playwright-server` - Browser automation server

---

## 📝 Step 2: Check Campaign Logs

```bash
# Search for campaign in relay-api logs
pm2 logs relay-api --lines 200 --nostream | grep -i "1762494336711"

# If no results, check all recent logs
pm2 logs relay-api --lines 100 --nostream
```

---

## 📁 Step 3: Check Campaign Tracker File

```bash
# Check if campaigns.json exists
ls -la /root/relay/campaigns.json

# View the file
cat /root/relay/campaigns.json

# Search for specific campaign
cat /root/relay/campaigns.json | grep -A 30 "1762494336711"

# Pretty print with jq (if installed)
cat /root/relay/campaigns.json | jq '.campaigns[] | select(.jobId == "1762494336711" or .id == "1762494336711")'
```

---

## 🌐 Step 4: Query API Endpoints

```bash
# Get campaign results
curl -s http://localhost:3001/results/1762494336711 | jq .

# Get campaign status
curl -s http://localhost:3001/status/1762494336711 | jq .

# List all recent campaigns
curl -s http://localhost:3001/campaigns | jq '.campaigns[:10]'

# Check server health
curl -s http://localhost:3001/health
```

---

## 🎭 Step 5: Check Playwright Server

```bash
# Check if Playwright server is running
pm2 list | grep playwright

# Check Playwright logs
pm2 logs playwright-server --lines 100 --nostream | grep -i "1762494336711"
```

---

## ⚠️ Step 6: Check for Errors

```bash
# Check relay-api errors
pm2 logs relay-api --err --lines 50 --nostream

# Check all PM2 errors
pm2 logs --err --lines 100 --nostream
```

---

## 💻 Step 7: System Resources

```bash
# Check CPU and memory
top -bn1 | head -10

# Check disk space
df -h

# Check memory usage
free -h
```

---

## 🔍 Step 8: Search All Logs

```bash
# Search all PM2 logs for campaign
pm2 logs --lines 500 --nostream | grep -i "1762494336711"

# Check system logs
journalctl -u pm2-root --since "1 hour ago" | grep -i "1762494336711"
```

---

## 📦 Expected Campaign Data Structure

When you find the campaign, it should look like:

```json
{
  "id": "1762494336711",
  "jobId": "1762494336711",
  "targetUrl": "https://...",
  "visitors": 100,
  "dwellMs": 15000,
  "status": "running|completed|failed",
  "completed": 75,
  "failed": 5,
  "pagesVisited": 150,
  "createdAt": "2026-01-16T...",
  "updatedAt": "2026-01-16T..."
}
```

---

## 🔧 Troubleshooting

### If Campaign Not Found:

1. **Check if campaign tracker is installed:**
   ```bash
   ls -la /root/relay/vps-campaign-tracker.js
   grep -r "campaignTrackingMiddleware" /root/relay/
   ```

2. **Check relay server code:**
   ```bash
   cat /root/relay/server.js | grep -A 5 "campaign"
   ```

3. **Restart relay-api:**
   ```bash
   pm2 restart relay-api
   pm2 logs relay-api --lines 50
   ```

### If API Not Responding:

1. **Check if port 3001 is listening:**
   ```bash
   netstat -tulpn | grep 3001
   ```

2. **Check relay-api process:**
   ```bash
   pm2 describe relay-api
   ```

3. **Check recent errors:**
   ```bash
   pm2 logs relay-api --err --lines 100
   ```

---

## 📊 Alternative: Check Database Directly

If the campaign data is stored in Neon PostgreSQL:

```bash
# You would need to query the database
# But campaigns are typically stored in campaigns.json on VPS
# Or in localStorage on the frontend
```

---

## 🎯 Quick Analysis Commands

Copy and paste this entire block:

```bash
echo "=== CAMPAIGN ANALYSIS: 1762494336711 ==="
echo ""
echo "PM2 Status:"
pm2 status
echo ""
echo "Campaign in campaigns.json:"
cat /root/relay/campaigns.json 2>/dev/null | grep -A 30 "1762494336711" || echo "Not found"
echo ""
echo "API Results:"
curl -s http://localhost:3001/results/1762494336711
echo ""
echo "API Status:"
curl -s http://localhost:3001/status/1762494336711
echo ""
echo "Recent Logs:"
pm2 logs relay-api --lines 100 --nostream | grep -i "1762494336711" | tail -20
echo ""
echo "=== END ANALYSIS ==="
```

---

## 📞 What to Look For

After running the commands, you should find:

✅ **Campaign Status:** running/completed/failed  
✅ **Total Visitors:** How many visits were requested  
✅ **Completed:** How many finished successfully  
✅ **Failed:** How many failed  
✅ **Pages Visited:** Total pages accessed  
✅ **Target URL:** Which website was targeted  
✅ **Created At:** When campaign started  
✅ **Duration:** How long it ran  

---

**Next Steps:** SSH into your VPS and run the commands above to analyze campaign 1762494336711.
