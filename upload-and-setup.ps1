# PowerShell script to upload and setup free-scan backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Uploading Free Scan API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Upload free-scan-api.js
Write-Host "Uploading free-scan-api.js..." -ForegroundColor Yellow
scp server-files/free-scan-api.js root@165.232.177.47:/root/traffic-app/server-files/

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Uploaded successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Upload failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Now updating server.js..." -ForegroundColor Yellow

# Create the commands to run on server
$commands = @"
cd /root/traffic-app
if ! grep -q 'free-scan-api' server.js; then
    sed -i '/keyword-tracker-api/a const freeScanAPI = require('"'"'./server-files/free-scan-api'"'"');\napp.use('"'"'/api/seo'"'"', freeScanAPI);' server.js
    echo 'Added free-scan route'
else
    echo 'Route already exists'
fi
pm2 restart traffic-api
pm2 logs traffic-api --lines 20
"@

# Execute commands on server
ssh root@165.232.177.47 $commands

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Test at: https://organitrafficboost.com" -ForegroundColor Cyan
Write-Host ""
