#!/bin/bash
cd /var/www/auth-api

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'auth-api',
    script: './server-auth.js',
    cwd: '/var/www/auth-api',
    env_file: './.env',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF

echo "✅ Created ecosystem.config.js"

# Delete old PM2 process
pm2 delete auth-api

# Start with ecosystem file
pm2 start ecosystem.config.js

# Save PM2 list
pm2 save

echo ""
echo "✅ Auth-API restarted with .env loaded"
sleep 2
pm2 logs auth-api --lines 15
