@echo off
echo ========================================
echo   Deploying Subscription Plans
echo ========================================
echo.

echo Committing changes...
git add -A
git commit -m "Add subscription plans for keyword tracking and research features"

echo.
echo Pushing to dev...
git push origin dev

echo.
echo Merging to main...
git checkout main
git merge dev
git push origin main
git checkout dev

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Frontend will deploy in 1-2 minutes
echo.
echo Test at: https://organitrafficboost.com/pricing
echo.
pause
