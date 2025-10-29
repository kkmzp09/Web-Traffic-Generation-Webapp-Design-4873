@echo off
echo Starting a new scan...
curl -X POST https://api.organitrafficboost.com/api/dataforseo/onpage/scan -H "Content-Type: application/json" -d "{\"url\":\"https://example.com\",\"maxPages\":1}" > scan-result.json

echo.
echo Scan started. Check scan-result.json for scanId
type scan-result.json

echo.
echo.
pause
