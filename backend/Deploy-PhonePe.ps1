# PhonePe Integration Deployment Script (PowerShell)
# This script deploys the PhonePe payment integration to your VPS

$VPS_IP = "67.217.60.57"
$VPS_USER = "root"
$VPS_PATH = "/root/relay"
$PM2_PROCESS = "relay-api"

Write-Host "`n🚀 Starting PhonePe Integration Deployment...`n" -ForegroundColor Cyan

# Step 1: Upload backend files
Write-Host "📤 Step 1: Uploading backend files to VPS..." -ForegroundColor Yellow
scp server.js ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
scp phonepe-payment-api.js ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
scp setup-phonepe-tables.sql ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
Write-Host "✅ Files uploaded successfully`n" -ForegroundColor Green

# Step 2: Display database SQL
Write-Host "📊 Step 2: Database Setup" -ForegroundColor Yellow
Write-Host "Copy and run this SQL in your Neon PostgreSQL dashboard:`n" -ForegroundColor White
Get-Content setup-phonepe-tables.sql
Write-Host "`nPress Enter after you've created the tables in Neon..." -ForegroundColor Yellow
Read-Host

# Step 3: Display environment variables
Write-Host "`n🔑 Step 3: Environment Variables" -ForegroundColor Yellow
Write-Host "Add these to your VPS .env file at ${VPS_PATH}/.env:`n" -ForegroundColor White
Write-Host "# PhonePe Payment Gateway Configuration"
Write-Host "PHONEPE_MERCHANT_ID=your_merchant_id_here"
Write-Host "PHONEPE_SALT_KEY=your_salt_key_here"
Write-Host "PHONEPE_SALT_INDEX=1"
Write-Host "PHONEPE_ENV=sandbox"
Write-Host "PHONEPE_REDIRECT_URL=https://organitrafficboost.com/payment-success"
Write-Host "PHONEPE_CALLBACK_URL=https://api.organitrafficboost.com/api/payment/phonepe/callback"
Write-Host "`nPress Enter after you've added the environment variables..." -ForegroundColor Yellow
Read-Host

# Step 4: Restart PM2
Write-Host "`n🔄 Step 4: Restarting PM2 process..." -ForegroundColor Yellow
ssh ${VPS_USER}@${VPS_IP} "cd ${VPS_PATH} && pm2 restart ${PM2_PROCESS}"
Write-Host "✅ PM2 restarted successfully`n" -ForegroundColor Green

# Step 5: Check logs
Write-Host "📋 Step 5: Checking PM2 logs..." -ForegroundColor Yellow
ssh ${VPS_USER}@${VPS_IP} "pm2 logs ${PM2_PROCESS} --lines 20 --nostream"

# Step 6: Test endpoints
Write-Host "`n🧪 Step 6: Testing endpoints..." -ForegroundColor Yellow
Write-Host "Testing health endpoint..."
try {
    $response = Invoke-RestMethod -Uri "https://api.organitrafficboost.com/health" -Method Get
    Write-Host "✅ Health check passed:" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}

Write-Host "`n✅ Deployment Complete!`n" -ForegroundColor Green
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Get PhonePe credentials from: https://developer.phonepe.com/"
Write-Host "2. Update the .env file on VPS with real credentials"
Write-Host "3. Test payment flow with sandbox credentials"
Write-Host "4. Switch to production when ready"
Write-Host "`n📚 Documentation: backend/PHONEPE_SETUP.md`n"
