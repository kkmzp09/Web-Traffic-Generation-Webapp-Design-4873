# PowerShell Script to Upload and Run VPS Optimization
$VPS_IP = "67.217.60.57"
$VPS_USER = "root"
$VPS_PASS = "4@N7m4&g"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 UPLOADING AND RUNNING VPS OPTIMIZATION" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

function Invoke-SSHCommand {
    param($Command)
    $plink = "plink"
    $args = @("-ssh", "$VPS_USER@$VPS_IP", "-pw", $VPS_PASS, "-batch", $Command)
    & $plink $args 2>&1
}

# Step 1: Upload optimization script
Write-Host "[1/3] Uploading optimization script to VPS..." -ForegroundColor Green
Write-Host "---------------------------------------------------------------"

$pscp = "pscp"
$scriptPath = "optimize-vps-for-1000-visitors.sh"
$args = @("-pw", $VPS_PASS, $scriptPath, "${VPS_USER}@${VPS_IP}:/root/")

& $pscp $args

Write-Host "✅ Script uploaded" -ForegroundColor Green
Write-Host ""

# Step 2: Make script executable
Write-Host "[2/3] Making script executable..." -ForegroundColor Green
Write-Host "---------------------------------------------------------------"

Invoke-SSHCommand "chmod +x /root/optimize-vps-for-1000-visitors.sh"

Write-Host "✅ Script is executable" -ForegroundColor Green
Write-Host ""

# Step 3: Run optimization script
Write-Host "[3/3] Running optimization script..." -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Write-Host ""

Invoke-SSHCommand "bash /root/optimize-vps-for-1000-visitors.sh"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ VPS OPTIMIZATION COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Update your campaign code for 1000 visitors" -ForegroundColor Yellow
Write-Host ""
