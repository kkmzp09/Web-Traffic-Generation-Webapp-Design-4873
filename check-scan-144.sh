#!/bin/bash
echo "=== Checking Scan 144 Status ==="
echo ""
echo "1. Scan initialization:"
pm2 logs relay-api --lines 500 --nostream | grep "Scan 144" | grep -E "Starting|limit|Found" | head -10
echo ""
echo "2. Crawling progress:"
pm2 logs relay-api --lines 500 --nostream | grep "Scan 144" | grep "Crawling" | tail -15
echo ""
echo "3. Scanning progress:"
pm2 logs relay-api --lines 500 --nostream | grep "Scan 144" | grep -E "Scanning page|Error scanning" | tail -15
echo ""
echo "4. Current status:"
pm2 logs relay-api --lines 100 --nostream | grep "Scan 144" | tail -5
