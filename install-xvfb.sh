#!/bin/bash
# Install Xvfb for non-headless browser support on VPS

echo "═══════════════════════════════════════════════════════════"
echo "🖥️  INSTALLING XVFB (Virtual Display Server)"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Update package list
echo "[1/4] Updating package list..."
apt-get update -qq

# Install Xvfb
echo "[2/4] Installing Xvfb..."
apt-get install -y xvfb

# Install additional dependencies
echo "[3/4] Installing additional dependencies..."
apt-get install -y x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic x11-apps

# Create startup script for PM2
echo "[4/4] Creating PM2 startup script..."
cat > /root/relay/start-playwright-xvfb.sh << 'EOF'
#!/bin/bash
# Start Playwright with Xvfb

export DISPLAY=:99
Xvfb :99 -screen 0 1920x1080x24 > /dev/null 2>&1 &
sleep 2
node /root/relay/playwright-server.js
EOF

chmod +x /root/relay/start-playwright-xvfb.sh

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ XVFB INSTALLED SUCCESSFULLY"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "1. Update PM2 to use the new startup script"
echo "2. Restart playwright-api"
echo ""
echo "Commands:"
echo "  pm2 delete playwright-api"
echo "  pm2 start /root/relay/start-playwright-xvfb.sh --name playwright-api"
echo "  pm2 save"
echo ""
