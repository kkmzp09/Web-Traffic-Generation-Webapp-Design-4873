@echo off
git commit -m "Add dual pricing with service selector"
git push origin dev
git checkout main
git merge dev
git push origin main
git checkout dev
echo.
echo Deployed! Check https://organitrafficboost.com/pricing
pause
