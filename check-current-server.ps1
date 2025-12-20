$VPS_IP = "67.217.60.57"
$VPS_USER = "root"
$VPS_PASS = "4@N7m4&g"

function Invoke-SSH {
    param($Cmd)
    & plink -ssh "$VPS_USER@$VPS_IP" -pw $VPS_PASS -batch $Cmd 2>&1
}

Write-Host "Checking Current Server Anti-Detection Features" -ForegroundColor Cyan
Write-Host ""

Write-Host "Current playwright-server.js:" -ForegroundColor Yellow
Invoke-SSH "head -50 /root/relay/playwright-server.js"
Write-Host ""

Write-Host "Checking for stealth features:" -ForegroundColor Yellow
Invoke-SSH "grep -E 'USER_AGENTS|fingerprint|stealth|mouse.move' /root/relay/playwright-server.js | head -20"
Write-Host ""

Write-Host "PM2 logs (last 30 lines):" -ForegroundColor Yellow
Invoke-SSH "pm2 logs playwright-api --lines 30 --nostream"
