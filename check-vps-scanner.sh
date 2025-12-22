#!/bin/bash
echo "=== Checking VPS Scanner Code ==="
echo ""
echo "1. MultiPageScanner constructor:"
grep -A 2 "constructor(" /root/relay/multi-page-scanner.js | head -3
echo ""
echo "2. How it's called in seo-automation-api.js:"
grep "new MultiPageScanner" /root/relay/seo-automation-api.js
echo ""
echo "3. pageLimit parameter:"
grep "pageLimit" /root/relay/seo-automation-api.js | head -5
