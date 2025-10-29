#!/bin/bash
# Fix checkout API routes in server.js

cd /root/relay

echo "Current server.js app.use statements:"
grep -n "app.use" server.js | head -20

echo ""
echo "Checking for checkout-api..."
if grep -q "checkoutApi" server.js; then
    echo "✅ checkoutApi is imported"
    
    # Check if it's being used
    if grep -q "app.use.*checkoutApi" server.js; then
        echo "✅ checkoutApi route is registered"
    else
        echo "❌ checkoutApi is imported but not used"
        echo "Adding route..."
        # Find the last app.use line and add after it
        sed -i "/app.use.*Api/a app.use('/api', checkoutApi);" server.js
        pm2 restart relay-api
        echo "✅ Route added and API restarted"
    fi
else
    echo "❌ checkoutApi not found"
    echo "Adding import and route..."
    
    # Add require at the top with other requires
    sed -i "/const express = require/a const checkoutApi = require('./checkout-api');" server.js
    
    # Add route
    sed -i "/app.use.*Api/a app.use('/api', checkoutApi);" server.js
    
    pm2 restart relay-api
    echo "✅ Import and route added, API restarted"
fi

echo ""
echo "Testing the endpoint..."
sleep 2
curl -X POST http://localhost:3000/api/validate-discount \
  -H "Content-Type: application/json" \
  -d '{"code":"FREE100","planType":"seo_professional"}' \
  2>/dev/null | head -5
