@echo off
git commit -m "Improve widget status button with better visual feedback"
git push origin dev
git checkout main
git merge dev
git push origin main
git checkout dev
