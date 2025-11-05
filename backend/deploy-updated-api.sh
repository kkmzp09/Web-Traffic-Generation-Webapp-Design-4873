#!/bin/bash
cp /root/relay/phonepe-payment-api-new.js /root/relay/phonepe-payment-api.js
pm2 restart relay-api
echo "✅ PhonePe API updated and restarted!"
