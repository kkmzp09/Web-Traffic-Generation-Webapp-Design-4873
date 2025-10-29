@echo off
echo Adding checkout API to server...
ssh root@67.217.60.57 "cd /root/relay && echo \"const checkoutApi = require('./checkout-api');\" >> server-append.txt && echo \"app.use('/api', checkoutApi);\" >> server-append.txt && cat server-append.txt"
echo.
echo Now manually add these lines to /root/relay/server.js:
echo   const checkoutApi = require('./checkout-api');
echo   app.use('/api', checkoutApi);
echo.
echo Then restart: pm2 restart relay-api
pause
