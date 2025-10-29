@echo off
ssh root@67.217.60.57 "pm2 logs relay-api --lines 30 --nostream | tail -50"
pause
