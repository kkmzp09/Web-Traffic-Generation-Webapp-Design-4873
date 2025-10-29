@echo off
echo ========================================
echo Adding API Keys to Server
echo ========================================
ssh root@67.217.60.57 "cd /root/relay && echo '' >> .env && echo '# DataForSEO API (for SERP competitor analysis)' >> .env && echo 'DATAFORSEO_LOGIN=kk@jobmakers.in' >> .env && echo 'DATAFORSEO_PASSWORD=d0ffa7da132e2819' >> .env && echo '' >> .env && echo '# Resend API (for email reports)' >> .env && echo 'RESEND_API_KEY=re_PbaP5rtj_GdSSq8egjk2scNLkCqqBDhrx' >> .env && echo '' >> .env && echo '# Email configuration' >> .env && echo 'SMTP_HOST=smtp.resend.com' >> .env && echo 'SMTP_PORT=587' >> .env && echo '' >> .env && echo '# App URL' >> .env && echo 'APP_URL=https://organitrafficboost.com' >> .env && echo '✅ API keys added successfully!'"
echo.
echo ========================================
echo Verifying .env file
echo ========================================
ssh root@67.217.60.57 "cd /root/relay && tail -15 .env"
echo.
pause
