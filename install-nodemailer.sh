#!/bin/bash
cd /root/relay

echo "Checking if nodemailer is installed..."
npm list nodemailer

if [ $? -ne 0 ]; then
    echo ""
    echo "Installing nodemailer..."
    npm install nodemailer
    echo "✅ Nodemailer installed"
else
    echo "✅ Nodemailer is already installed"
fi

echo ""
echo "Restarting API..."
pm2 restart relay-api

echo ""
echo "Testing checkout API..."
sleep 2
curl -X POST http://localhost:3000/api/validate-discount \
  -H "Content-Type: application/json" \
  -d '{"code":"FREE100","planType":"seo_professional"}' \
  2>/dev/null | python3 -m json.tool 2>/dev/null || cat
