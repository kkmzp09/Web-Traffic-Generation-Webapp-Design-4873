#!/bin/bash
echo "Checking PM2 logs for startup messages..."
pm2 logs relay-api --lines 100 --nostream | grep -E "(Checkout|initialized|Error|error)" | tail -20
