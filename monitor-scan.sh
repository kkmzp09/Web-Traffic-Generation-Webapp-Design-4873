#!/bin/bash
echo "🔍 Monitoring Scan 142 in real-time..."
echo "Press Ctrl+C to stop"
echo ""
pm2 logs relay-api --lines 0 | grep -E "Scan 142|📄|✅|❌|⚠️|ERROR|error"
