$VPS_IP = "67.217.60.57"
$VPS_USER = "root"
$VPS_PASS = "4@N7m4&g"

function Invoke-SSH {
    param($Cmd)
    & plink -ssh "$VPS_USER@$VPS_IP" -pw $VPS_PASS -batch $Cmd 2>&1
}

Write-Host "VPS STABILITY CHECK" -ForegroundColor Cyan
Write-Host ""

Write-Host "System Load Average:" -ForegroundColor Yellow
Invoke-SSH "uptime"
Write-Host ""

Write-Host "Memory Pressure:" -ForegroundColor Yellow
Invoke-SSH "free -h && echo '' && cat /proc/meminfo | grep -E 'MemAvailable|SwapFree'"
Write-Host ""

Write-Host "CPU Usage:" -ForegroundColor Yellow
Invoke-SSH "top -bn1 | grep 'Cpu(s)' && echo '' && nproc && echo 'CPU cores available'"
Write-Host ""

Write-Host "Process Limits:" -ForegroundColor Yellow
Invoke-SSH "ulimit -a | grep -E 'open files|max user processes'"
Write-Host ""

Write-Host "Current Browser Processes:" -ForegroundColor Yellow
Invoke-SSH "ps aux | grep -E 'chrome|chromium' | grep -v grep | wc -l"
Write-Host ""

Write-Host "System Responsiveness Test:" -ForegroundColor Yellow
Invoke-SSH "time ls -la /root > /dev/null"
Write-Host ""
