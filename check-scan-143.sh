#!/bin/bash
echo "Checking Scan 143..."
pm2 logs relay-api --lines 500 --nostream | grep "Scan 143" | head -30
