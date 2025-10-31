#!/bin/bash
cd /root/relay
# Remove the unused free-scan-api.js that's causing errors
rm -f server-files/free-scan-api.js
# Restore the backup if the endpoint addition failed
if [ -f seo-automation-api.js.backup-email ]; then
    cp seo-automation-api.js.backup-email seo-automation-api.js
fi
# Add the endpoint properly
cat server-files/add-email-endpoint.js >> seo-automation-api.js
pm2 restart relay-api
sleep 2
pm2 logs relay-api --lines 30
