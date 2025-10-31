@echo off
echo Testing login endpoint...
curl -X POST https://api.organitrafficboost.com/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"test\"}" 2>&1 | findstr /C:"error" /C:"Invalid" /C:"Missing" /C:"Cannot"
echo.
echo.
echo Checking PM2 processes...
ssh root@67.217.60.57 "pm2 list"
pause
