@echo off
echo ========================================
echo Deploying DataForSEO to PRODUCTION
echo ========================================
echo.

echo Switching to main branch...
git checkout main

echo.
echo Merging dev into main...
git merge dev

echo.
echo Pushing to production...
git push origin main

echo.
echo Switching back to dev...
git checkout dev

echo.
echo ========================================
echo Production Deployment Complete!
echo ========================================
echo.
echo Netlify will deploy to organitrafficboost.com in 1-2 minutes
echo.
pause
