$VPS_IP = "67.217.60.57"
$VPS_USER = "root"
$VPS_PASS = "4@N7m4&g"

function Invoke-SSH {
    param($Cmd)
    & plink -ssh "$VPS_USER@$VPS_IP" -pw $VPS_PASS -batch $Cmd 2>&1
}

function Copy-ToVPS {
    param($LocalFile, $RemoteFile)
    & pscp -pw $VPS_PASS $LocalFile "${VPS_USER}@${VPS_IP}:${RemoteFile}" 2>&1
}

Write-Host "Installing Xvfb for Non-Headless Browser Support" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Uploading Xvfb installation script..." -ForegroundColor Green
Copy-ToVPS "install-xvfb.sh" "/root/install-xvfb.sh"
Invoke-SSH "chmod +x /root/install-xvfb.sh"
Write-Host "Done" -ForegroundColor Green
Write-Host ""

Write-Host "[2/3] Installing Xvfb (this may take 2-3 minutes)..." -ForegroundColor Green
Invoke-SSH "bash /root/install-xvfb.sh"
Write-Host "Done" -ForegroundColor Green
Write-Host ""

Write-Host "[3/3] Updating PM2 to use Xvfb..." -ForegroundColor Green
Invoke-SSH "pm2 delete playwright-api"
Invoke-SSH "pm2 start /root/relay/start-playwright-xvfb.sh --name playwright-api"
Invoke-SSH "pm2 save"
Start-Sleep -Seconds 3
Invoke-SSH "pm2 list"
Write-Host "Done" -ForegroundColor Green
Write-Host ""

Write-Host "XVFB DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host ""
Write-Host "Your non-headless browsers will now work!" -ForegroundColor Yellow
Write-Host "Testing in 5 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Checking PM2 logs..." -ForegroundColor Yellow
Invoke-SSH "pm2 logs playwright-api --lines 20 --nostream"
