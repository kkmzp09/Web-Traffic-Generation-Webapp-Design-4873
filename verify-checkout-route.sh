#!/bin/bash
# Verify checkout API is registered in server.js

cd /root/relay

echo "Checking if checkout-api is registered in server.js..."
grep -n "checkout-api" server.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Checkout API is registered"
else
    echo ""
    echo "❌ Checkout API is NOT registered"
    echo "Adding it now..."
    
    # Add the require statement
    sed -i "/const.*Api = require/a const checkoutApi = require('./checkout-api');" server.js
    
    # Add the route
    sed -i "/app.use('\/api'/a app.use('/api', checkoutApi);" server.js
    
    echo "✅ Added checkout API to server.js"
    
    # Restart
    pm2 restart relay-api
    echo "✅ API restarted"
fi
