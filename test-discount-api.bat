@echo off
echo Testing discount validation API...
curl -X POST https://api.organitrafficboost.com/api/validate-discount ^
  -H "Content-Type: application/json" ^
  -d "{\"code\":\"FREE100\",\"planType\":\"seo_professional\"}"
echo.
echo.
pause
