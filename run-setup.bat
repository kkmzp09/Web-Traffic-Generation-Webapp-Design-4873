@echo off
echo Running database setup...
ssh root@67.217.60.57 "bash /root/relay/setup-db-and-routes.sh"
pause
