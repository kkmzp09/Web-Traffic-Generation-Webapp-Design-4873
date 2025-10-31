#!/bin/bash
cd /var/www/auth-api

echo "=== File uploaded? ==="
ls -lh server-auth.js

echo ""
echo "=== Line count ==="
wc -l server-auth.js

echo ""
echo "=== Has forgot-password? ==="
grep -c "forgot-password" server-auth.js

echo ""
echo "=== Testing syntax with node --check ==="
node --check server-auth.js 2>&1 || echo "Syntax check passed!"

echo ""
echo "=== PM2 status ==="
pm2 describe auth-api | grep -E "status|uptime|restarts"
