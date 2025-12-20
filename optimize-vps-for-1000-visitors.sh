#!/bin/bash
# VPS Optimization Script for 1000 Visitor Campaigns
# Run this on your VPS: bash optimize-vps-for-1000-visitors.sh

echo "═══════════════════════════════════════════════════════════"
echo "🚀 VPS OPTIMIZATION FOR 1000 VISITOR CAMPAIGNS"
echo "═══════════════════════════════════════════════════════════"
echo ""

# 1. Increase File Descriptor Limits
echo "[1/6] Increasing file descriptor limits..."
echo "---------------------------------------------------------------"

# Backup current limits
cp /etc/security/limits.conf /etc/security/limits.conf.backup

# Add new limits
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf
echo "root soft nofile 65536" >> /etc/security/limits.conf
echo "root hard nofile 65536" >> /etc/security/limits.conf

# Update systemd limits
mkdir -p /etc/systemd/system.conf.d/
cat > /etc/systemd/system.conf.d/limits.conf << 'EOF'
[Manager]
DefaultLimitNOFILE=65536
EOF

echo "✅ File descriptor limits increased to 65536"
echo ""

# 2. Add Swap Space (4GB for safety)
echo "[2/6] Adding swap space..."
echo "---------------------------------------------------------------"

if [ -f /swapfile ]; then
    echo "⚠️ Swap file already exists, skipping..."
else
    echo "Creating 4GB swap file..."
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    
    # Make it permanent
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
    
    echo "✅ 4GB swap space added"
fi
echo ""

# 3. Optimize Kernel Parameters
echo "[3/6] Optimizing kernel parameters..."
echo "---------------------------------------------------------------"

cat > /etc/sysctl.d/99-playwright-optimization.conf << 'EOF'
# Network optimizations
net.core.somaxconn = 4096
net.ipv4.tcp_max_syn_backlog = 4096
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1

# Memory optimizations
vm.swappiness = 10
vm.vfs_cache_pressure = 50

# File system optimizations
fs.file-max = 2097152
fs.inotify.max_user_watches = 524288
EOF

sysctl -p /etc/sysctl.d/99-playwright-optimization.conf

echo "✅ Kernel parameters optimized"
echo ""

# 4. Update PM2 Configuration
echo "[4/6] Updating PM2 configuration..."
echo "---------------------------------------------------------------"

# Set PM2 to use new limits
pm2 startup systemd -u root --hp /root
pm2 save

echo "✅ PM2 configuration updated"
echo ""

# 5. Install Monitoring Tools (if not present)
echo "[5/6] Installing monitoring tools..."
echo "---------------------------------------------------------------"

if ! command -v htop &> /dev/null; then
    apt-get update -qq
    apt-get install -y htop iotop nethogs
    echo "✅ Monitoring tools installed"
else
    echo "✅ Monitoring tools already installed"
fi
echo ""

# 6. Restart PM2 Processes
echo "[6/6] Restarting PM2 processes..."
echo "---------------------------------------------------------------"

pm2 restart all
sleep 3
pm2 list

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ OPTIMIZATION COMPLETE!"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Verify optimizations
echo "📊 VERIFICATION:"
echo "---------------------------------------------------------------"
echo "File descriptor limit: $(ulimit -n)"
echo "Swap space:"
free -h | grep Swap
echo ""
echo "System limits:"
sysctl fs.file-max
echo ""

echo "🎯 NEXT STEPS:"
echo "---------------------------------------------------------------"
echo "1. ✅ VPS is now optimized for 1000 visitor campaigns"
echo "2. 📊 Monitor with: pm2 logs playwright-api"
echo "3. 💾 Check memory: watch -n 5 free -h"
echo "4. 🚀 Start your 1000 visitor campaign!"
echo ""
echo "⚠️ IMPORTANT: You may need to log out and log back in for"
echo "   ulimit changes to take full effect."
echo ""
echo "═══════════════════════════════════════════════════════════"
