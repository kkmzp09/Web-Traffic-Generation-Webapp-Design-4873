# Complete Deployment Script for 1000 Visitor Optimization
$VPS_IP = "67.217.60.57"
$VPS_USER = "root"
$VPS_PASS = "4@N7m4&g"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 DEPLOYING 1000 VISITOR OPTIMIZATION" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

function Invoke-SSHCommand {
    param($Command)
    $plink = "plink"
    $args = @("-ssh", "$VPS_USER@$VPS_IP", "-pw", $VPS_PASS, "-batch", $Command)
    & $plink $args 2>&1
}

function Upload-File {
    param($LocalPath, $RemotePath)
    $pscp = "pscp"
    $args = @("-pw", $VPS_PASS, $LocalPath, "${VPS_USER}@${VPS_IP}:${RemotePath}")
    & $pscp $args 2>&1
}

# Step 1: Upload VPS optimization script
Write-Host "[1/5] Uploading VPS optimization script..." -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Upload-File "optimize-vps-for-1000-visitors.sh" "/root/"
Invoke-SSHCommand "chmod +x /root/optimize-vps-for-1000-visitors.sh"
Write-Host "✅ Optimization script uploaded" -ForegroundColor Green
Write-Host ""

# Step 2: Run VPS optimization
Write-Host "[2/5] Running VPS optimization..." -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "bash /root/optimize-vps-for-1000-visitors.sh"
Write-Host "✅ VPS optimized" -ForegroundColor Green
Write-Host ""

# Step 3: Backup current playwright server
Write-Host "[3/5] Backing up current playwright server..." -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "cp /root/relay/playwright-server.js /root/relay/playwright-server.js.backup"
Write-Host "✅ Backup created" -ForegroundColor Green
Write-Host ""

# Step 4: Upload optimized playwright server
Write-Host "[4/5] Uploading optimized playwright server..." -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Upload-File "server-files\playwright-server-optimized-1000.js" "/root/relay/playwright-server.js"
Write-Host "✅ Optimized server uploaded" -ForegroundColor Green
Write-Host ""

# Step 5: Restart PM2 processes
Write-Host "[5/5] Restarting PM2 processes..." -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "pm2 restart playwright-api"
Start-Sleep -Seconds 3
Invoke-SSHCommand "pm2 logs playwright-api --lines 20 --nostream"
Write-Host "✅ PM2 restarted" -ForegroundColor Green
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verify deployment
Write-Host "📊 VERIFICATION:" -ForegroundColor Yellow
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "ulimit -n"
Invoke-SSHCommand "pm2 list"
Write-Host ""

Write-Host "🎯 YOUR VPS IS NOW READY FOR 1000 VISITOR CAMPAIGNS!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test with a small campaign" -ForegroundColor White
Write-Host "2. Monitor the campaign progress" -ForegroundColor White
Write-Host "3. Run your 1000 visitor campaign" -ForegroundColor White
Write-Host ""
