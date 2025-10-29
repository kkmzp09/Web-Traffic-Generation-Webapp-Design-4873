#!/bin/bash
cd /root/relay

echo "Fixing Widget API block closure..."

# Find the line with "Widget API routes initialized" and add })(); after it
sed -i '/Widget API routes initialized/a\
})();' server.js

echo "✅ Fixed"
echo ""
echo "Showing Widget and Checkout blocks:"
grep -A 3 "Widget API routes initialized" server.js
echo ""
grep -A 3 "Checkout API routes initialized" server.js

pm2 restart relay-api
sleep 3

echo ""
echo "Final test..."
curl -X POST http://localhost:3000/api/subscriptions/create \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","planType":"seo_professional","amount":0}' \
  -w "\nStatus: %{http_code}\n" 2>/dev/null | head -5
