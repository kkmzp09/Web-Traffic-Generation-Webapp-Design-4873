#!/bin/bash

echo "Adding auth routes to Nginx..."

# Backup the current config
cp /etc/nginx/sites-enabled/api.organitrafficboost.com /etc/nginx/sites-enabled/api.organitrafficboost.com.backup-$(date +%s)

# Add auth routes BEFORE the widget routes (so they match first)
sed -i '/# Widget JavaScript file/i\    # Auth API endpoints (port 8080)\n    location /api/auth/ {\n        proxy_pass http://127.0.0.1:8080;\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection '"'"'upgrade'"'"';\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n        proxy_cache_bypass $http_upgrade;\n    }\n\n    # Auth endpoints without /api prefix (for backward compatibility)\n    location /auth/ {\n        proxy_pass http://127.0.0.1:8080;\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection '"'"'upgrade'"'"';\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n        proxy_cache_bypass $http_upgrade;\n    }\n\n' /etc/nginx/sites-enabled/api.organitrafficboost.com

echo "✅ Auth routes added to Nginx config"

# Test the configuration
echo ""
echo "Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Configuration is valid. Reloading Nginx..."
    systemctl reload nginx
    echo "✅ Nginx reloaded successfully"
else
    echo ""
    echo "❌ Configuration has errors. Restoring backup..."
    cp /etc/nginx/sites-enabled/api.organitrafficboost.com.backup-* /etc/nginx/sites-enabled/api.organitrafficboost.com
    echo "Backup restored. Please check the errors above."
fi
