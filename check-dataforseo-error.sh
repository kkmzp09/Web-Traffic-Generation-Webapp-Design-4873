#!/bin/bash
cd /root/relay

echo "Checking recent DataForSEO errors..."
pm2 logs relay-api --lines 50 --nostream | grep -A 5 -B 2 "DataForSEO\|dataforseo" | tail -30
