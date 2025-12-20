@echo off
echo ================================================
echo Quick VPS Check for Campaign: 1762420823354
echo ================================================
echo.

echo Connecting to VPS: 67.217.60.57...
echo.

ssh root@67.217.60.57 "bash -s" << 'EOF'
#!/bin/bash

echo "=== PM2 STATUS ==="
pm2 status
echo ""

echo "=== SEARCHING FOR CAMPAIGN ID: 1762420823354 ==="
pm2 logs --lines 1000 --nostream 2>/dev/null | grep -i "1762420823354" | tail -20
echo ""

echo "=== RECENT RELAY API LOGS (Last 30 lines) ==="
pm2 logs relay-api --lines 100 --nostream 2>/dev/null | tail -30
echo ""

echo "=== PROXY USAGE CHECK ==="
pm2 logs --lines 1000 --nostream 2>/dev/null | grep -iE "smartproxy|3120|proxy.*assign" | tail -15
echo ""

echo "=== CAMPAIGN/VISITOR ACTIVITY ==="
pm2 logs relay-api --lines 500 --nostream 2>/dev/null | grep -iE "campaign|visitor|job.*id|urls.*length" | tail -20
echo ""

echo "=== PLAYWRIGHT/BROWSER ACTIVITY ==="
pm2 logs --lines 500 --nostream 2>/dev/null | grep -iE "playwright|browser|chromium|session" | tail -15
echo ""

echo "================================================"
echo "Check Complete!"
echo "================================================"
echo ""
echo "If you need more details, SSH into the server:"
echo "  ssh root@67.217.60.57"
echo "  pm2 logs relay-api"
echo ""
EOF

pause
