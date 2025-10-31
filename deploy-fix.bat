@echo off
git commit -m "Use existing scan API"
git push origin dev
git checkout main
git merge dev
git push origin main
git checkout dev
echo Done!
pause
