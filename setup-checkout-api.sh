#!/bin/bash
# Add checkout API to relay server

cd /root/relay

# Backup server.js
cp server.js server.js.backup

# Check if checkout-api is already added
if grep -q "checkout-api" server.js; then
    echo "✅ Checkout API already added"
else
    # Find the line with other API requires and add checkout-api after it
    sed -i "/const.*Api = require/a const checkoutApi = require('./checkout-api');" server.js
    
    # Find the line with app.use and add checkout API route
    sed -i "/app.use('\/api'/a app.use('/api', checkoutApi);" server.js
    
    echo "✅ Checkout API routes added to server.js"
fi

# Restart the API
pm2 restart relay-api

echo "✅ Server restarted"
echo ""
echo "📋 Checkout API is now active!"
echo "   - POST /api/validate-discount"
echo "   - POST /api/subscriptions/create"
