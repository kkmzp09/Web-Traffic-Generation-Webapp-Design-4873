#!/bin/bash
cd /root/relay

echo "Creating clean server.js..."

# Backup
cp server.js server.js.broken-backup

# Remove all the broken async blocks at the end
# Find the line with "Widget API routes initialized"
LINE=$(grep -n "Widget API routes initialized" server.js | cut -d: -f1)

# Keep everything up to and including that line + 1 (the })();)
head -$((LINE + 1)) server.js > server.js.tmp

# Now add the checkout block cleanly
cat >> server.js.tmp << 'EOF'

// Setup Checkout API routes
(async () => {
  const checkoutApiRoutes = require('./checkout-api.js');
  app.use('/api', checkoutApiRoutes);
  console.log('✅ Checkout API routes initialized');
})();

// Bind to localhost only (Nginx proxies HTTPS -> here)
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Relay listening on http://127.0.0.1:${PORT} (upstream ${API_BASE})`);
  console.log(`Allowed CORS: ${allowedOrigins.join(', ') || '(none set)'}`);
  console.log(`Campaign tracking: ENABLED`);
  console.log(`SEO Traffic: ENABLED`);
  console.log(`High-CPM Cookies: ENABLED - Auto-injecting into all campaigns`);
  console.log(`SEO Automation: ENABLED`);
  console.log(`Widget Auto-Fix: ENABLED`);
});
EOF

# Replace the file
mv server.js.tmp server.js

echo "✅ Server.js cleaned and fixed"
echo ""
echo "Last 30 lines:"
tail -30 server.js

pm2 restart relay-api
sleep 3

echo ""
echo "Testing..."
curl -X POST http://localhost:3000/api/subscriptions/create \
  -H "Content-Type: application/json" \
  -d '{"userId":"test123","planType":"seo_professional","amount":0}' \
  -w "\nStatus: %{http_code}\n" 2>/dev/null
