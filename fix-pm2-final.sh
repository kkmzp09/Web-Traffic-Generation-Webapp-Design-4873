#!/bin/bash
cd /var/www/auth-api

# Create PM2 ecosystem file with .cjs extension
cat > ecosystem.config.cjs << 'EOF'
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

echo "✅ Created ecosystem.config.cjs"

# Start with ecosystem file
pm2 start ecosystem.config.cjs

# Save PM2 list
pm2 save

echo ""
echo "✅ Auth-API started with .env loaded"
sleep 3
pm2 logs auth-api --lines 20
