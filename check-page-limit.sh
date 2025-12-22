#!/bin/bash
echo "Checking page limit for Scan 143..."
pm2 logs relay-api --lines 500 --nostream | grep "multi-page scan" | tail -5
