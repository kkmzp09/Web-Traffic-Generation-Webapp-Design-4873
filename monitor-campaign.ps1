# Real-time Campaign Monitoring Script
param(
    [string]$JobId = ""
)

$VPS_IP = "67.217.60.57"
$VPS_USER = "root"
$VPS_PASS = "4@N7m4&g"

function Invoke-SSHCommand {
    param($Command)
    $plink = "plink"
    $args = @("-ssh", "$VPS_USER@$VPS_IP", "-pw", $VPS_PASS, "-batch", $Command)
    & $plink $args 2>&1
}

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 CAMPAIGN MONITORING DASHBOARD" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($JobId) {
    Write-Host "Monitoring Campaign: $JobId" -ForegroundColor Green
    Write-Host ""
    
    while ($true) {
        Clear-Host
        Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host "📊 CAMPAIGN: $JobId" -ForegroundColor Yellow
        Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host ""
        
        # Get campaign results
        Write-Host "[Campaign Progress]" -ForegroundColor Green
        Write-Host "---------------------------------------------------------------"
        Invoke-SSHCommand "curl -s http://localhost:3001/results/$JobId"
        Write-Host ""
        Write-Host ""
        
        # System resources
        Write-Host "[System Resources]" -ForegroundColor Green
        Write-Host "---------------------------------------------------------------"
        Invoke-SSHCommand "free -h | grep Mem"
        Write-Host ""
        Invoke-SSHCommand "ps aux | grep chrome | grep -v grep | wc -l | xargs echo 'Active Browsers:'"
        Write-Host ""
        Write-Host ""
        
        # Recent logs
        Write-Host "[Recent Logs (Last 10 lines)]" -ForegroundColor Green
        Write-Host "---------------------------------------------------------------"
        Invoke-SSHCommand "pm2 logs playwright-api --lines 10 --nostream | tail -10"
        Write-Host ""
        
        Write-Host "Refreshing in 10 seconds... (Press Ctrl+C to stop)" -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    }
} else {
    # Show all campaigns
    Write-Host "[Active Campaigns]" -ForegroundColor Green
    Write-Host "---------------------------------------------------------------"
    Invoke-SSHCommand "curl -s http://localhost:3001/campaigns | head -100"
    Write-Host ""
    Write-Host ""
    
    Write-Host "[System Status]" -ForegroundColor Green
    Write-Host "---------------------------------------------------------------"
    Invoke-SSHCommand "pm2 list"
    Write-Host ""
    
    Write-Host "[Memory Usage]" -ForegroundColor Green
    Write-Host "---------------------------------------------------------------"
    Invoke-SSHCommand "free -h"
    Write-Host ""
    
    Write-Host "[Active Browsers]" -ForegroundColor Green
    Write-Host "---------------------------------------------------------------"
    Invoke-SSHCommand "ps aux | grep chrome | grep -v grep | wc -l"
    Write-Host ""
    
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To monitor a specific campaign, run:" -ForegroundColor Yellow
    Write-Host ".\monitor-campaign.ps1 -JobId YOUR_JOB_ID" -ForegroundColor White
    Write-Host ""
}
