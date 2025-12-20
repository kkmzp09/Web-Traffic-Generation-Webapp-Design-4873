$VPS_IP = "67.217.60.57"
$VPS_USER = "root"
$VPS_PASS = "4@N7m4&g"
$JOB_ID = "1762507650156"

function Invoke-SSH {
    param($Cmd)
    & plink -ssh "$VPS_USER@$VPS_IP" -pw $VPS_PASS -batch $Cmd 2>&1
}

Write-Host "Analyzing Ad Fill Rate for Campaign: $JOB_ID" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1] Counting Ad Impressions vs No Ads:" -ForegroundColor Yellow
Write-Host "---------------------------------------------------------------"
Invoke-SSH "pm2 logs playwright-api --lines 500 --nostream | grep -E '\[$JOB_ID\]|AdSense' | grep -E 'Ad viewed|No ads found' | head -100"
Write-Host ""

Write-Host "[2] Ad Fill Rate Statistics:" -ForegroundColor Yellow
Write-Host "---------------------------------------------------------------"
$adsFound = Invoke-SSH "pm2 logs playwright-api --lines 1000 --nostream | grep 'Ad viewed' | wc -l"
$noAds = Invoke-SSH "pm2 logs playwright-api --lines 1000 --nostream | grep 'No ads found' | wc -l"
$adClicks = Invoke-SSH "pm2 logs playwright-api --lines 1000 --nostream | grep 'Clicked on ad' | wc -l"

Write-Host "Ads Found (Viewable): $adsFound" -ForegroundColor Green
Write-Host "No Ads Found: $noAds" -ForegroundColor Red
Write-Host "Ad Clicks: $adClicks" -ForegroundColor Cyan
Write-Host ""

if ($adsFound -and $noAds) {
    $total = [int]$adsFound + [int]$noAds
    if ($total -gt 0) {
        $fillRate = ([int]$adsFound / $total) * 100
        Write-Host "Ad Fill Rate: $([math]::Round($fillRate, 2))%" -ForegroundColor Yellow
    }
}
Write-Host ""

Write-Host "[3] Recent Ad Activity (Last 50 sessions):" -ForegroundColor Yellow
Write-Host "---------------------------------------------------------------"
Invoke-SSH "pm2 logs playwright-api --lines 500 --nostream | grep -E 'Starting session|Ad viewed|No ads found|Clicked on ad' | tail -50"
