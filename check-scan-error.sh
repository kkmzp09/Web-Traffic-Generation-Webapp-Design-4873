#!/bin/bash
echo "Checking PM2 logs for scan errors..."
pm2 logs relay-api --lines 100 --nostream | tail -100
