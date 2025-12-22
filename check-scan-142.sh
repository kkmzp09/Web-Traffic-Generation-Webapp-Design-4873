#!/bin/bash
echo "=== Checking Scan 142 Status ==="
echo ""
pm2 logs relay-api --lines 300 --nostream | tail -150
