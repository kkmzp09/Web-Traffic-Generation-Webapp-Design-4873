@echo off
echo Running database migration...
ssh root@67.217.60.57 "chmod +x /root/relay/run-db-migration-fixed.sh"
ssh root@67.217.60.57 "/root/relay/run-db-migration-fixed.sh"
pause
