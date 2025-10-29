#!/bin/bash
cd /root/relay

echo "=== Checking SEO Scanner Status ==="
echo ""

# Check if the API is running
echo "1. Checking PM2 processes..."
pm2 list | grep relay-api

echo ""
echo "2. Checking recent SEO scanner logs..."
pm2 logs relay-api --lines 30 --nostream | grep -i "seo\|scan\|error" | tail -20

echo ""
echo "3. Testing SEO scan endpoint..."
curl -X POST http://localhost:3000/api/seo/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","userId":"test"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null | head -20

echo ""
echo "4. Checking if Puppeteer/Playwright is available..."
node -e "
try {
  const puppeteer = require('puppeteer');
  console.log('✅ Puppeteer available');
} catch(e) {
  console.log('❌ Puppeteer not found:', e.message);
}
"
