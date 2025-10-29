#!/bin/bash
cd /root/relay

echo "Fixing server.js checkout API block..."

# Show current checkout block
echo "Current checkout block:"
sed -n '309,315p' server.js

# The issue is the async block is inside the widget block
# Let's fix it by removing the malformed block and adding it correctly

# Remove the incorrectly nested checkout block
sed -i '/Setup Checkout API routes/,/Checkout API routes initialized/d' server.js

# Add it correctly after the widget block ends
cat > /tmp/checkout-fix.txt << 'EOF'

// Setup Checkout API routes
(async () => {
  const checkoutApiRoutes = require('./checkout-api.js');
  app.use('/api', checkoutApiRoutes);
  console.log('✅ Checkout API routes initialized');
})();
EOF

# Find the line with "Widget API routes initialized" and add after its closing })();
sed -i '/Widget API routes initialized/,/^})();/a\
\
// Setup Checkout API routes\
(async () => {\
  const checkoutApiRoutes = require('\''./checkout-api.js'\'');\
  app.use('\''/api'\'', checkoutApiRoutes);\
  console.log('\''✅ Checkout API routes initialized'\'');\
})();' server.js

echo ""
echo "✅ Fixed server.js"
echo ""
echo "New checkout block:"
grep -A 5 "Setup Checkout API" server.js | head -6

pm2 restart relay-api

echo ""
echo "✅ API restarted"
echo ""
echo "Testing..."
sleep 2
timeout 3 curl -X POST http://localhost:3000/api/subscriptions/create \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","planType":"seo_professional","amount":0}' 2>/dev/null | head -3
