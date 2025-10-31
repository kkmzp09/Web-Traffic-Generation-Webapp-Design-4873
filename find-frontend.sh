#!/bin/bash
echo "=== Finding frontend deployment ==="
find /var/www /usr/share/nginx /home /root -name "index.html" -type f 2>/dev/null | xargs grep -l "OrganiTraffic\|TrafficGen" 2>/dev/null | head -5
