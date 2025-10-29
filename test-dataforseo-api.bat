@echo off
echo Testing DataForSEO On-Page API...
echo.

curl -X POST https://api.organitrafficboost.com/api/dataforseo/onpage/scan ^
  -H "Content-Type: application/json" ^
  -d "{\"url\":\"https://example.com\",\"maxPages\":1}"

echo.
echo.
pause
