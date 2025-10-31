#!/bin/bash
echo "Finding web root for organitrafficboost.com..."
find /var/www /usr/share/nginx /home -name "organi*" -type d 2>/dev/null | head -10
echo ""
echo "Checking Nginx config..."
grep -r "organitrafficboost.com" /etc/nginx/sites-enabled/ 2>/dev/null | grep "root" | head -5
