@echo off
curl -X POST https://api.organitrafficboost.com/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"test\"}"
pause
