# Automated Deployment Script
$VPS_IP = "67.217.60.57"
$VPS_USER = "root"
$VPS_PASS = "4@N7m4&g"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 DEPLOYING 1000 VISITOR OPTIMIZATION" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

function Invoke-SSH {
    param($Cmd)
    $plink = "plink"
    $sshArgs = @("-ssh", "$VPS_USER@$VPS_IP", "-pw", $VPS_PASS, "-batch", $Cmd)
    & $plink $sshArgs 2>&1
}

function Copy-ToVPS {
    param($LocalFile, $RemoteFile)
    $pscp = "pscp"
    $scpArgs = @("-pw", $VPS_PASS, $LocalFile, "${VPS_USER}@${VPS_IP}:${RemoteFile}")
    & $pscp $scpArgs 2>&1
}

# Step 1: Upload optimization script
Write-Host "[1/5] Uploading VPS optimization script..." -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Copy-ToVPS "optimize-vps-for-1000-visitors.sh" "/root/optimize-vps-for-1000-visitors.sh"
Invoke-SSH "chmod +x /root/optimize-vps-for-1000-visitors.sh"
Write-Host "✅ Script uploaded" -ForegroundColor Green
Write-Host ""

# Step 2: Run optimization
Write-Host "[2/5] Running VPS optimization (this may take 2-3 minutes)..." -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSH "bash /root/optimize-vps-for-1000-visitors.sh"
Write-Host "✅ VPS optimized" -ForegroundColor Green
Write-Host ""

# Step 3: Backup current server
Write-Host "[3/5] Backing up current Playwright server..." -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSH "cp /root/relay/playwright-server.js /root/relay/playwright-server.js.backup"
Write-Host "✅ Backup created" -ForegroundColor Green
Write-Host ""

# Step 4: Upload optimized server
Write-Host "[4/5] Uploading optimized Playwright server..." -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Copy-ToVPS "server-files\playwright-server-optimized-1000.js" "/root/relay/playwright-server.js"
Write-Host "✅ Optimized server uploaded" -ForegroundColor Green
Write-Host ""

# Step 5: Restart PM2
Write-Host "[5/5] Restarting PM2 processes..." -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSH "pm2 restart playwright-api"
Start-Sleep -Seconds 3
Invoke-SSH "pm2 list"
Write-Host "✅ PM2 restarted" -ForegroundColor Green
Write-Host ""

# Verification
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 VERIFICATION" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "File Descriptor Limit:" -ForegroundColor Yellow
Invoke-SSH "ulimit -n"
Write-Host ""

Write-Host "Memory Status:" -ForegroundColor Yellow
Invoke-SSH "free -h | grep -E 'Mem|Swap'"
Write-Host ""

Write-Host "PM2 Status:" -ForegroundColor Yellow
Invoke-SSH "pm2 list"
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your VPS is now ready for 1000 visitor campaigns" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps" -ForegroundColor Yellow
Write-Host "1. Test with small campaign first" -ForegroundColor White
Write-Host "2. Monitor campaign progress" -ForegroundColor White
Write-Host "3. Run 1000 visitor campaign" -ForegroundColor White
Write-Host ""
