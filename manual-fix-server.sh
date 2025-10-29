#!/bin/bash
cd /root/relay

echo "Creating clean checkout API block..."

# Backup
cp server.js server.js.backup-$(date +%s)

# Remove ALL checkout-related lines
sed -i '/Setup Checkout API/d' server.js
sed -i '/checkoutApiRoutes/d' server.js
sed -i '/Checkout API routes initialized/d' server.js

# Find the line number after Widget API block ends
WIDGET_END=$(grep -n "Widget API routes initialized" server.js | tail -1 | cut -d: -f1)
WIDGET_END=$((WIDGET_END + 2))  # Skip the })(); line

echo "Inserting checkout block after line $WIDGET_END..."

# Insert the checkout block
sed -i "${WIDGET_END}a\\
\\
// Setup Checkout API routes\\
(async () => {\\
  const checkoutApiRoutes = require('./checkout-api.js');\\
  app.use('/api', checkoutApiRoutes);\\
  console.log('✅ Checkout API routes initialized');\\
})();" server.js

echo "✅ Server.js updated"
echo ""
echo "Showing the new block:"
sed -n "$((WIDGET_END)),$(($WIDGET_END+8))p" server.js

pm2 restart relay-api
sleep 2

echo ""
echo "Testing endpoint..."
curl -X POST http://localhost:3000/api/subscriptions/create \
  -H "Content-Type: application/json" \
  -d '{"userId":"123","planType":"seo_professional","amount":0}' \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null | head -10
