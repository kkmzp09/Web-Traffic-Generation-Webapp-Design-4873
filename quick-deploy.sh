#!/bin/bash

# 🚀 Quick Ubuntu Server Deployment Script for Playwright Automation
# Run this script on your Ubuntu server after uploading your project

set -e

echo "🐧 Starting Ubuntu Server Setup for Playwright Automation..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Playwright system dependencies
echo "🎭 Installing Playwright dependencies..."
sudo apt-get install -y \
  libnss3 libnspr4 libatk-bridge2.0-0 libdrm2 libxkbcommon0 \
  libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 \
  libasound2 libatspi2.0-0 libgtk-3-0 libgdk-pixbuf2.0-0 \
  libxshmfence1 xvfb x11vnc fluxbox wget unzip

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install chromium
npx playwright install-deps chromium

# Setup virtual display
echo "🖥️ Setting up virtual display..."
sudo tee /etc/systemd/system/xvfb.service > /dev/null <<EOF
[Unit]
Description=X Virtual Frame Buffer Service
After=network.target

[Service]
ExecStart=/usr/bin/Xvfb :1 -screen 0 1920x1080x24
Restart=on-abort
User=root

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable xvfb
sudo systemctl start xvfb

# Set display environment variable
echo "export DISPLAY=:1" >> ~/.bashrc
export DISPLAY=:1

# Install PM2
echo "⚙️ Installing PM2 process manager..."
sudo npm install -g pm2

# Create PM2 ecosystem config
echo "📝 Creating PM2 configuration..."
tee ecosystem.config.js > /dev/null <<EOF
module.exports = {
  apps: [
    {
      name: 'playwright-worker',
      script: 'worker.js',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        DISPLAY: ':1'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'react-app',
      script: 'npm',
      args: 'run preview',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false
    }
  ]
};
EOF

# Build React app
echo "🏗️ Building React application..."
npm run build

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 3000/tcp
sudo ufw allow 4000/tcp
sudo ufw --force enable

# Start services
echo "🚀 Starting services with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Setup complete!"
echo ""
echo "🎯 Your Playwright automation system is now running:"
echo "   📱 React App: http://$(curl -s ifconfig.me):3000"
echo "   🎭 Playwright Worker: http://$(curl -s ifconfig.me):4000"
echo ""
echo "📊 Monitor with: pm2 status"
echo "📝 View logs with: pm2 logs"
echo ""
echo "🎉 Google Search automation is ready to use!"