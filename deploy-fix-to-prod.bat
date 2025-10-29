@echo off
git commit -m "Fix DataForSEO timeout and score conversion"
git checkout main
git merge dev
git push origin main
git checkout dev
echo.
echo Deployed to production!
pause
