@echo off
echo Installing nodemailer...
ssh root@67.217.60.57 "chmod +x /root/relay/install-nodemailer.sh && /root/relay/install-nodemailer.sh"
pause
