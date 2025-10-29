#!/bin/bash
cd /root/relay

echo "Fixing checkout API registration..."

# Remove the incorrectly added line
sed -i '/app.use.*checkoutApi/d' server.js

# Add the checkout API in the correct place (after widget API setup)
cat >> /tmp/checkout-block.txt << 'EOF'

// Setup Checkout API routes
(async () => {
  const checkoutApiRoutes = require('./checkout-api.js');
  app.use('/api', checkoutApiRoutes);
  console.log('✅ Checkout API routes initialized');
})();
EOF

# Insert after the widget API block (around line 315)
sed -i '/Widget API routes initialized/r /tmp/checkout-block.txt' server.js

echo "✅ Checkout API added correctly"

# Restart API
pm2 restart relay-api

echo "✅ API restarted"
echo ""
echo "Testing endpoint..."
sleep 3

curl -X POST http://localhost:3000/api/validate-discount \
  -H "Content-Type: application/json" \
  -d '{"code":"FREE100","planType":"seo_professional"}' \
  2>/dev/null

echo ""
echo ""
echo "If you see success:true above, it's working!"
