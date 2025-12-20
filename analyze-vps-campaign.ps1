# VPS Campaign Analysis Script
$VPS_IP = "67.217.60.57"
$VPS_USER = "root"
$VPS_PASS = "4@N7m4&g"
$JOB_ID = "1762494336711"

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "Connecting to VPS: $VPS_IP" -ForegroundColor Yellow
Write-Host "Analyzing Campaign: $JOB_ID" -ForegroundColor Yellow
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# Function to run SSH command
function Invoke-SSHCommand {
    param($Command)
    
    $plink = "plink"
    $args = @(
        "-ssh",
        "$VPS_USER@$VPS_IP",
        "-pw", $VPS_PASS,
        "-batch",
        $Command
    )
    
    & $plink $args 2>&1
}

# 1. Check PM2 Status
Write-Host "[1] PM2 Status:" -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "pm2 status"
Write-Host ""

# 2. Check Campaign in campaigns.json
Write-Host "[2] Campaign Tracker File:" -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "cat /root/relay/campaigns.json 2>/dev/null | grep -A 30 '$JOB_ID' || echo 'Not found in campaigns.json'"
Write-Host ""

# 3. Query Results API
Write-Host "[3] API Results Endpoint:" -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "curl -s http://localhost:3001/results/$JOB_ID"
Write-Host ""

# 4. Query Status API
Write-Host "[4] API Status Endpoint:" -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "curl -s http://localhost:3001/status/$JOB_ID"
Write-Host ""

# 5. List Recent Campaigns
Write-Host "[5] Recent Campaigns:" -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "curl -s http://localhost:3001/campaigns | head -100"
Write-Host ""

# 6. Check Campaign Logs
Write-Host "[6] Campaign Logs:" -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "pm2 logs relay-api --lines 200 --nostream | grep -i '$JOB_ID' | tail -30 || echo 'No logs found'"
Write-Host ""

# 7. Check Playwright Server
Write-Host "[7] Playwright Server:" -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "pm2 list | grep playwright || echo 'Playwright not running'"
Write-Host ""

# 8. Recent Errors
Write-Host "[8] Recent Errors:" -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "pm2 logs relay-api --err --lines 30 --nostream"
Write-Host ""

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "Analysis Complete" -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Cyan
