# VPS Performance Analysis for 1000 Visitor Campaign
$VPS_IP = "67.217.60.57"
$VPS_USER = "root"
$VPS_PASS = "4@N7m4&g"

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "VPS PERFORMANCE ANALYSIS FOR HIGH-LOAD CAMPAIGNS" -ForegroundColor Yellow
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

function Invoke-SSHCommand {
    param($Command)
    $plink = "plink"
    $args = @("-ssh", "$VPS_USER@$VPS_IP", "-pw", $VPS_PASS, "-batch", $Command)
    & $plink $args 2>&1
}

# 1. System Resources
Write-Host "[1] System Resources:" -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "echo 'CPU Cores:' && nproc && echo '' && echo 'Total RAM:' && free -h | grep Mem && echo '' && echo 'Disk Space:' && df -h / | tail -1"
Write-Host ""

# 2. Current Load
Write-Host "[2] Current System Load:" -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "uptime && echo '' && top -bn1 | head -5"
Write-Host ""

# 3. Memory Usage Details
Write-Host "[3] Memory Usage Breakdown:" -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "free -h && echo '' && echo 'Memory by Process:' && ps aux --sort=-%mem | head -10"
Write-Host ""

# 4. Browser Processes
Write-Host "[4] Current Browser Processes:" -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "echo 'Chrome/Chromium Processes:' && ps aux | grep -E 'chrome|chromium' | grep -v grep | wc -l && echo '' && echo 'Playwright Processes:' && ps aux | grep playwright | grep -v grep | wc -l"
Write-Host ""

# 5. Network Connections
Write-Host "[5] Network Connections:" -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "echo 'Active Connections:' && netstat -an | grep ESTABLISHED | wc -l && echo '' && echo 'Listening Ports:' && netstat -tuln | grep LISTEN"
Write-Host ""

# 6. PM2 Process Details
Write-Host "[6] PM2 Process Memory Usage:" -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "pm2 list"
Write-Host ""

# 7. Recent Campaign Performance
Write-Host "[7] Recent Campaign Performance:" -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "curl -s http://localhost:3001/campaigns | head -200"
Write-Host ""

# 8. System Limits
Write-Host "[8] System Limits & Capabilities:" -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Invoke-SSHCommand "echo 'Max Open Files:' && ulimit -n && echo '' && echo 'Max Processes:' && ulimit -u && echo '' && echo 'CPU Info:' && lscpu | grep -E 'Model name|CPU\(s\)|Thread|Core'"
Write-Host ""

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "Analysis Complete - Calculating Recommendations..." -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Cyan
