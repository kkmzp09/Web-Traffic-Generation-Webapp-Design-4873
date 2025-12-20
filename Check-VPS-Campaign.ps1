# PowerShell Script to Check Campaign on VPS
# Job ID: 1762494336711

$JOB_ID = "1762494336711"
$VPS_IP = "67.217.60.57"

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "VPS CAMPAIGN ANALYSIS - Job ID: $JOB_ID" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "Connecting to VPS: $VPS_IP" -ForegroundColor Yellow
Write-Host ""

# Create the SSH command script
$sshScript = @"
#!/bin/bash
JOB_ID="$JOB_ID"

echo "═══════════════════════════════════════════════════════════"
echo "🔍 VPS CAMPAIGN ANALYSIS"
echo "═══════════════════════════════════════════════════════════"
echo "Job ID: `$JOB_ID"
echo "Server: `$(hostname)"
echo "Time: `$(date)"
echo ""

# Check PM2 status
echo "📊 PM2 PROCESSES:"
echo "─────────────────────────────────────────────────────────────"
pm2 status
echo ""

# Check relay-api logs for this campaign
echo "📝 CAMPAIGN LOGS:"
echo "─────────────────────────────────────────────────────────────"
pm2 logs relay-api --lines 200 --nostream | grep -i "`$JOB_ID" | tail -50 || echo "No logs found for campaign `$JOB_ID"
echo ""

# Check campaigns.json if it exists
echo "📁 CAMPAIGN TRACKER FILE:"
echo "─────────────────────────────────────────────────────────────"
if [ -f /root/relay/campaigns.json ]; then
  echo "✅ campaigns.json found"
  echo ""
  cat /root/relay/campaigns.json | python3 -m json.tool 2>/dev/null | grep -A 30 "`$JOB_ID" || \
  cat /root/relay/campaigns.json | jq ".campaigns[] | select(.jobId == \"`$JOB_ID\" or .id == \"`$JOB_ID\")" 2>/dev/null || \
  grep -A 20 "`$JOB_ID" /root/relay/campaigns.json || \
  echo "Campaign `$JOB_ID not found in campaigns.json"
else
  echo "❌ campaigns.json not found"
fi
echo ""

# Query API endpoints
echo "🌐 API ENDPOINTS:"
echo "─────────────────────────────────────────────────────────────"
echo "Results endpoint:"
curl -s http://localhost:3001/results/`$JOB_ID 2>/dev/null | python3 -m json.tool 2>/dev/null || \
curl -s http://localhost:3001/results/`$JOB_ID || \
echo "No response from results endpoint"
echo ""

echo "Status endpoint:"
curl -s http://localhost:3001/status/`$JOB_ID 2>/dev/null | python3 -m json.tool 2>/dev/null || \
curl -s http://localhost:3001/status/`$JOB_ID || \
echo "No response from status endpoint"
echo ""

# List recent campaigns
echo "📋 RECENT CAMPAIGNS (Last 5):"
echo "─────────────────────────────────────────────────────────────"
curl -s http://localhost:3001/campaigns 2>/dev/null | python3 -m json.tool 2>/dev/null | head -100 || \
curl -s http://localhost:3001/campaigns || \
echo "Cannot retrieve campaigns"
echo ""

# Check Playwright server if running
echo "🎭 PLAYWRIGHT SERVER:"
echo "─────────────────────────────────────────────────────────────"
if pm2 list | grep -q "playwright-server"; then
  echo "✅ Playwright server is running"
  pm2 logs playwright-server --lines 100 --nostream | grep -i "`$JOB_ID" || echo "No Playwright logs for this campaign"
else
  echo "❌ Playwright server not running"
fi
echo ""

# System resources
echo "💻 SYSTEM STATUS:"
echo "─────────────────────────────────────────────────────────────"
echo "CPU & Memory:"
top -bn1 | head -5
echo ""

# Check for recent errors
echo "⚠️ RECENT ERRORS (Last 20 lines):"
echo "─────────────────────────────────────────────────────────────"
pm2 logs relay-api --lines 100 --nostream --err | tail -20
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✅ ANALYSIS COMPLETE"
echo "═══════════════════════════════════════════════════════════"
"@

# Save script to temp file
$tempScript = [System.IO.Path]::GetTempFileName() + ".sh"
$sshScript | Out-File -FilePath $tempScript -Encoding ASCII

Write-Host "Executing analysis on VPS..." -ForegroundColor Green
Write-Host ""

# Execute SSH command
ssh root@$VPS_IP "bash -s" < $tempScript

# Cleanup
Remove-Item $tempScript -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "Analysis Complete" -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Cyan
