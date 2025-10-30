#!/bin/bash
# Backend Setup Script for Free Scan Feature
# Run this on your VPS: bash setup-backend.sh

echo "========================================="
echo "  Setting up Free Scan Backend"
echo "========================================="
echo ""

# Navigate to app directory
cd /root/traffic-app

# Check if free-scan-api.js exists
if [ ! -f "server-files/free-scan-api.js" ]; then
    echo "❌ Error: free-scan-api.js not found!"
    echo "Please upload it first using:"
    echo "scp server-files/free-scan-api.js root@165.232.177.47:/root/traffic-app/server-files/"
    exit 1
fi

echo "✓ Found free-scan-api.js"
echo ""

# Check if server.js already has the route
if grep -q "free-scan-api" server.js; then
    echo "✓ Free scan route already registered in server.js"
else
    echo "Adding free scan route to server.js..."
    
    # Backup server.js
    cp server.js server.js.backup
    
    # Find the line with keyword-tracker-api and add after it
    sed -i '/keyword-tracker-api/a\
const freeScanAPI = require('\''./server-files/free-scan-api'\'');\
app.use('\''/api/seo'\'', freeScanAPI);' server.js
    
    echo "✓ Added free scan route to server.js"
fi

echo ""
echo "Checking Resend API configuration..."

# Check if RESEND_API_KEY exists in .env
if grep -q "RESEND_API_KEY" .env; then
    echo "✓ RESEND_API_KEY found in .env"
else
    echo "⚠️  RESEND_API_KEY not found in .env"
    echo "Please add it manually:"
    echo "nano .env"
    echo "Add: RESEND_API_KEY=re_xxxxxxxxxxxxx"
fi

echo ""
echo "Restarting API server..."
pm2 restart traffic-api

echo ""
echo "Checking server status..."
pm2 status

echo ""
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "Test the endpoint:"
echo "curl -X POST https://api.organitrafficboost.com/api/seo/free-scan \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"url\":\"https://example.com\",\"email\":\"test@example.com\"}'"
echo ""
echo "View logs:"
echo "pm2 logs traffic-api"
echo ""
