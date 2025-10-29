@echo off
echo Testing results for scan 104...
curl https://api.organitrafficboost.com/api/dataforseo/onpage/results/104 > results-104.json

echo.
echo Results saved to results-104.json
echo.
type results-104.json

echo.
echo.
pause
