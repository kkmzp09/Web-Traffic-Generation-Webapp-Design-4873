#!/bin/bash
cd /root/relay

echo "=== Showing server.js structure ==="
echo ""
echo "Lines 1-50:"
head -50 server.js | cat -n

echo ""
echo "=== Lines with 'require' ==="
grep -n "require" server.js | head -20

echo ""
echo "=== Lines with 'app.use' ==="
grep -n "app.use" server.js

echo ""
echo "=== Lines 295-310 (where routes are) ==="
sed -n '295,310p' server.js | cat -n
