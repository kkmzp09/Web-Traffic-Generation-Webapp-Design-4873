$VPS_IP = "67.217.60.57"
$VPS_USER = "root"
$VPS_PASS = "4@N7m4&g"
$JOB_ID = "1762507650156"

function Invoke-SSH {
    param($Cmd)
    & plink -ssh "$VPS_USER@$VPS_IP" -pw $VPS_PASS -batch $Cmd 2>&1
}

Write-Host "Checking Campaign Logs for Job ID: $JOB_ID" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1] Campaign Status:" -ForegroundColor Yellow
Invoke-SSH "curl -s http://localhost:3001/results/$JOB_ID"
Write-Host ""
Write-Host ""

Write-Host "[2] Recent Logs (Ad Detection):" -ForegroundColor Yellow
Invoke-SSH "pm2 logs playwright-api --lines 100 --nostream | grep -E 'Ad|AdSense|ads found|Clicked on ad'"
Write-Host ""

Write-Host "[3] Full Recent Activity:" -ForegroundColor Yellow
Invoke-SSH "pm2 logs playwright-api --lines 50 --nostream"
Write-Host ""

Write-Host "[4] Error Logs:" -ForegroundColor Yellow
Invoke-SSH "pm2 logs playwright-api --err --lines 30 --nostream"
