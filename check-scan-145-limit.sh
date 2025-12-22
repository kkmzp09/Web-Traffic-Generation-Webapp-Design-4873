#!/bin/bash
echo "Checking Scan 145 page limit..."
pm2 logs relay-api --lines 300 --nostream | grep "Starting multi-page scan" | tail -1
echo ""
echo "Crawl progress:"
pm2 logs relay-api --lines 300 --nostream | grep "Scan 145" | grep "Crawling" | tail -5
