$VPS_IP = "67.217.60.57"
$VPS_USER = "root"
$VPS_PASS = "4@N7m4&g"

function Invoke-SSH {
    param($Cmd)
    & plink -ssh "$VPS_USER@$VPS_IP" -pw $VPS_PASS -batch $Cmd 2>&1
}

Write-Host "Fixing Headless Mode for VPS" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking current headless setting..." -ForegroundColor Yellow
Invoke-SSH "grep 'headless:' /root/relay/playwright-server.js | head -5"
Write-Host ""

Write-Host "Your advanced anti-detection server is already running!" -ForegroundColor Green
Write-Host "It has all the stealth features you need." -ForegroundColor Green
Write-Host ""
Write-Host "The only issue is the headless mode setting." -ForegroundColor Yellow
Write-Host ""
Write-Host "Current server features:" -ForegroundColor Cyan
Write-Host "- Fingerprint randomization" -ForegroundColor White
Write-Host "- Natural reading behavior" -ForegroundColor White
Write-Host "- Mouse movements" -ForegroundColor White
Write-Host "- Cookie injection" -ForegroundColor White
Write-Host "- WebRTC protection" -ForegroundColor White
Write-Host "- Ad clicking simulation" -ForegroundColor White
Write-Host ""
