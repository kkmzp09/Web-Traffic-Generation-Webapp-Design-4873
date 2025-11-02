@echo off
git commit -m "Add policy links to footer"
git push origin dev
git checkout main
git merge dev
git push origin main
git checkout dev
pause
