#!/bin/bash

# VPS Campaign Analysis Script for Job ID: 1762494336711
# Run this on your VPS server at 67.217.60.57

JOB_ID="1762494336711"

echo "═══════════════════════════════════════════════════════════"
echo "🔍 VPS CAMPAIGN ANALYSIS"
echo "═══════════════════════════════════════════════════════════"
echo "Job ID: $JOB_ID"
echo "Server: $(hostname)"
echo "Time: $(date)"
echo "═══════════════════════════════════════════════════════════"
echo ""

# 1. Check if PM2 is running
echo "📊 PM2 STATUS"
echo "─────────────────────────────────────────────────────────────"
pm2 status
echo ""

# 2. Check relay-api logs for this campaign
echo "📝 RELAY API LOGS (Last 100 lines, filtered for campaign)"
echo "─────────────────────────────────────────────────────────────"
pm2 logs relay-api --lines 100 --nostream | grep -i "$JOB_ID" || echo "No logs found for this campaign ID"
echo ""

# 3. Check if campaigns.json exists
echo "📁 CAMPAIGN TRACKER FILE"
echo "─────────────────────────────────────────────────────────────"
if [ -f /root/relay/campaigns.json ]; then
  echo "✅ campaigns.json found"
  echo ""
  echo "Searching for campaign $JOB_ID:"
  cat /root/relay/campaigns.json | jq ".campaigns[] | select(.jobId == \"$JOB_ID\" or .id == \"$JOB_ID\")" 2>/dev/null || \
  grep -A 20 "$JOB_ID" /root/relay/campaigns.json || \
  echo "Campaign not found in campaigns.json"
else
  echo "❌ campaigns.json not found at /root/relay/campaigns.json"
  echo "Campaign tracker may not be installed"
fi
echo ""

# 4. Try to query the API directly
echo "🌐 API QUERY RESULTS"
echo "─────────────────────────────────────────────────────────────"
echo "Checking campaign results endpoint:"
curl -s "http://localhost:3001/results/$JOB_ID" | jq . 2>/dev/null || \
curl -s "http://localhost:3001/results/$JOB_ID" || \
echo "API endpoint not responding"
echo ""

echo "Checking campaign status endpoint:"
curl -s "http://localhost:3001/status/$JOB_ID" | jq . 2>/dev/null || \
curl -s "http://localhost:3001/status/$JOB_ID" || \
echo "API endpoint not responding"
echo ""

# 5. Check recent campaigns
echo "📋 RECENT CAMPAIGNS"
echo "─────────────────────────────────────────────────────────────"
curl -s "http://localhost:3001/campaigns" | jq '.campaigns[:5]' 2>/dev/null || \
curl -s "http://localhost:3001/campaigns" || \
echo "Cannot retrieve campaigns list"
echo ""

# 6. Check Playwright server logs
echo "🎭 PLAYWRIGHT SERVER LOGS"
echo "─────────────────────────────────────────────────────────────"
if pm2 list | grep -q "playwright-server"; then
  pm2 logs playwright-server --lines 50 --nostream | grep -i "$JOB_ID" || echo "No Playwright logs for this campaign"
else
  echo "Playwright server not running in PM2"
fi
echo ""

# 7. Check system resources
echo "💻 SYSTEM RESOURCES"
echo "─────────────────────────────────────────────────────────────"
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}'
echo ""
echo "Memory Usage:"
free -h | grep Mem | awk '{print "Used: " $3 " / " $2 " (" $3/$2*100 "%)"}'
echo ""
echo "Disk Usage:"
df -h / | tail -1 | awk '{print "Used: " $3 " / " $2 " (" $5 ")"}'
echo ""

# 8. Check for any error logs
echo "⚠️ ERROR LOGS"
echo "─────────────────────────────────────────────────────────────"
pm2 logs relay-api --lines 50 --nostream --err | tail -20 || echo "No recent errors"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "📝 ANALYSIS COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "To run this script:"
echo "1. Upload to VPS: scp check-vps-campaign-1762494336711.sh root@67.217.60.57:/root/"
echo "2. Make executable: chmod +x /root/check-vps-campaign-1762494336711.sh"
echo "3. Run: /root/check-vps-campaign-1762494336711.sh"
echo ""
