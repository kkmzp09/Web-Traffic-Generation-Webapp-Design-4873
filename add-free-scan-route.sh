#!/bin/bash
cd /root/relay
cp server.js server.js.backup-freescan
sed -i '/const keywordTrackerAPI/a const freeScanAPI = require('"'"'./server-files/free-scan-api'"'"');' server.js
sed -i '/app.use.*keyword-tracker-api.*);/a app.use('"'"'/api/seo'"'"', freeScanAPI);' server.js
pm2 restart relay-api
pm2 logs relay-api --lines 20
