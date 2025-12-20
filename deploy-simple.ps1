$VPS_IP = "67.217.60.57"
$VPS_USER = "root"
$VPS_PASS = "4@N7m4&g"

Write-Host "Deploying 1000 Visitor Optimization" -ForegroundColor Cyan
Write-Host ""

function Invoke-SSH {
    param($Cmd)
    & plink -ssh "$VPS_USER@$VPS_IP" -pw $VPS_PASS -batch $Cmd 2>&1
}

function Copy-ToVPS {
    param($LocalFile, $RemoteFile)
    & pscp -pw $VPS_PASS $LocalFile "${VPS_USER}@${VPS_IP}:${RemoteFile}" 2>&1
}

Write-Host "[1/5] Uploading optimization script..." -ForegroundColor Green
Copy-ToVPS "optimize-vps-for-1000-visitors.sh" "/root/optimize-vps-for-1000-visitors.sh"
Invoke-SSH "chmod +x /root/optimize-vps-for-1000-visitors.sh"
Write-Host "Done" -ForegroundColor Green
Write-Host ""

Write-Host "[2/5] Running VPS optimization..." -ForegroundColor Green
Invoke-SSH "bash /root/optimize-vps-for-1000-visitors.sh"
Write-Host "Done" -ForegroundColor Green
Write-Host ""

Write-Host "[3/5] Backing up current server..." -ForegroundColor Green
Invoke-SSH "cp /root/relay/playwright-server.js /root/relay/playwright-server.js.backup"
Write-Host "Done" -ForegroundColor Green
Write-Host ""

Write-Host "[4/5] Uploading optimized server..." -ForegroundColor Green
Copy-ToVPS "server-files\playwright-server-optimized-1000.js" "/root/relay/playwright-server.js"
Write-Host "Done" -ForegroundColor Green
Write-Host ""

Write-Host "[5/5] Restarting PM2..." -ForegroundColor Green
Invoke-SSH "pm2 restart playwright-api"
Start-Sleep -Seconds 3
Invoke-SSH "pm2 list"
Write-Host "Done" -ForegroundColor Green
Write-Host ""

Write-Host "DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host ""
Write-Host "Verification:" -ForegroundColor Yellow
Invoke-SSH "ulimit -n"
Invoke-SSH "free -h | grep -E 'Mem|Swap'"
Write-Host ""
Write-Host "Your VPS is ready for 1000 visitor campaigns" -ForegroundColor Green
