$VPS_IP = "67.217.60.57"
$VPS_USER = "root"
$VPS_PASS = "4@N7m4&g"

function Invoke-SSH {
    param($Cmd)
    & plink -ssh "$VPS_USER@$VPS_IP" -pw $VPS_PASS -batch $Cmd 2>&1
}

Write-Host "Fixing Playwright Module Path" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking current setup..." -ForegroundColor Yellow
Invoke-SSH "ls -la /root/playwright-server/"
Invoke-SSH "ls -la /root/relay/"
Write-Host ""

Write-Host "Updating PM2 to use correct directory..." -ForegroundColor Green
Invoke-SSH "pm2 delete playwright-api"
Invoke-SSH "cd /root/playwright-server && pm2 start server.js --name playwright-api"
Invoke-SSH "pm2 save"
Start-Sleep -Seconds 3
Write-Host "Done" -ForegroundColor Green
Write-Host ""

Write-Host "Checking status..." -ForegroundColor Yellow
Invoke-SSH "pm2 list"
Write-Host ""

Write-Host "Checking logs..." -ForegroundColor Yellow
Invoke-SSH "pm2 logs playwright-api --lines 30 --nostream"
