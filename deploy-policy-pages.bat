@echo off
git commit -m "Add policy pages for payment gateway approval"
git push origin dev
git checkout main
git merge dev
git push origin main
git checkout dev
pause
