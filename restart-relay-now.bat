@echo off
ssh root@67.217.60.57 "pm2 restart relay-api && pm2 logs relay-api --lines 10 --nostream"
pause
