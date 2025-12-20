$VPS_IP = "67.217.60.57"
$VPS_USER = "root"
$VPS_PASS = "4@N7m4&g"

Write-Host "Deploying Anti-Detection Stealth Server" -ForegroundColor Cyan
Write-Host ""

function Invoke-SSH {
    param($Cmd)
    & plink -ssh "$VPS_USER@$VPS_IP" -pw $VPS_PASS -batch $Cmd 2>&1
}

function Copy-ToVPS {
    param($LocalFile, $RemoteFile)
    & pscp -pw $VPS_PASS $LocalFile "${VPS_USER}@${VPS_IP}:${RemoteFile}" 2>&1
}

Write-Host "[1/3] Backing up current server..." -ForegroundColor Green
Invoke-SSH "cp /root/relay/playwright-server.js /root/relay/playwright-server.js.backup-$(date +%s)"
Write-Host "Done" -ForegroundColor Green
Write-Host ""

Write-Host "[2/3] Uploading stealth server..." -ForegroundColor Green
Copy-ToVPS "server-files\playwright-server-1000-stealth.js" "/root/relay/playwright-server.js"
Write-Host "Done" -ForegroundColor Green
Write-Host ""

Write-Host "[3/3] Restarting PM2..." -ForegroundColor Green
Invoke-SSH "pm2 restart playwright-api"
Start-Sleep -Seconds 3
Invoke-SSH "pm2 logs playwright-api --lines 20 --nostream"
Write-Host "Done" -ForegroundColor Green
Write-Host ""

Write-Host "STEALTH SERVER DEPLOYED" -ForegroundColor Green
Write-Host "Anti-detection features enabled" -ForegroundColor Yellow
