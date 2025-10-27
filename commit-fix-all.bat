@echo off
git commit -m "Add Auto-Fix All Issues button with comprehensive results"
git push origin dev
git checkout main
git merge dev
git push origin main
git checkout dev
