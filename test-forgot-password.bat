@echo off
echo Testing forgot-password endpoint...
curl -X POST https://api.organitrafficboost.com/api/auth/forgot-password -H "Content-Type: application/json" -d "{\"email\":\"krishnakant.tripathi@gmail.com\"}"
pause
