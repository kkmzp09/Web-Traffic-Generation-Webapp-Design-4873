#!/bin/bash
cd /root/relay
cp seo-automation-api.js seo-automation-api.js.backup-email
cat server-files/add-email-endpoint.js >> seo-automation-api.js
pm2 restart relay-api
pm2 logs relay-api --lines 20
