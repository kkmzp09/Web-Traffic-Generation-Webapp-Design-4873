#!/bin/bash
cd /root/relay

echo "Showing server.js structure around SEO routes..."
echo ""

grep -n "seo" server.js | grep -i "require\|app.use" | head -20
