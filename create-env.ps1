# Create .env file with Resend configuration
$envContent = @"
VITE_RESEND_API_KEY=re_eE8M7nZN_3WkVKAQ1mdMLSsnma4QjnhQB
VITE_FROM_EMAIL=onboarding@resend.dev
VITE_SUPPORT_EMAIL=support@trafficgenpro.com
VITE_COMPANY_NAME=TrafficGenPro
VITE_API_BASE=https://api.organitrafficboost.com
VITE_REQUEST_TIMEOUT_MS=30000
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline

Write-Host ".env file created successfully!" -ForegroundColor Green
Write-Host "Resend email is now configured!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your dev server" -ForegroundColor White
Write-Host "2. Your email system is ready!" -ForegroundColor White
