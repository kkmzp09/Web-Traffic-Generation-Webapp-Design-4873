# 🐧 Ubuntu Server Setup Guide for Playwright Automation

## 📋 Prerequisites
- Ubuntu 18.04+ server
- Root or sudo access
- Internet connection

## 🚀 Step 1: Initial Server Setup

### Connect to your server:
```bash
ssh username@your-server-ip
```

### Update system packages:
```bash
sudo apt update && sudo apt upgrade -y
```

## 📦 Step 2: Install Node.js and npm

### Install Node.js 18+ (Required for Playwright):
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x+
```

## 🎭 Step 3: Install Playwright Dependencies

### Install system dependencies for Playwright:
```bash
# Install browser dependencies
sudo apt-get install -y \
  libnss3 \
  libnspr4 \
  libatk-bridge2.0-0 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libxss1 \
  libasound2 \
  libatspi2.0-0 \
  libgtk-3-0 \
  libgdk-pixbuf2.0-0 \
  libxshmfence1

# Install additional dependencies
sudo apt-get install -y \
  xvfb \
  x11vnc \
  fluxbox \
  wget \
  unzip
```

## 📁 Step 4: Upload Your Project

### Option A: Upload via SCP (from your local machine):
```bash
# Compress your project locally first
tar -czf playwright-automation.tar.gz /path/to/your/project

# Upload to server
scp playwright-automation.tar.gz username@your-server-ip:~/

# On server, extract:
tar -xzf playwright-automation.tar.gz
cd your-project-folder
```

### Option B: Clone from Git (if you have a repository):
```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

## 🔧 Step 5: Install Project Dependencies

```bash
# Install all npm dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
npx playwright install-deps chromium
```

## 🖥️ Step 6: Setup Virtual Display (For Headless Server)

### Create virtual display service:
```bash
sudo nano /etc/systemd/system/xvfb.service
```

### Add this content:
```ini
[Unit]
Description=X Virtual Frame Buffer Service
After=network.target

[Service]
ExecStart=/usr/bin/Xvfb :1 -screen 0 1920x1080x24
Restart=on-abort
User=root

[Install]
WantedBy=multi-user.target
```

### Start virtual display:
```bash
sudo systemctl enable xvfb
sudo systemctl start xvfb
export DISPLAY=:1
```

## 🔐 Step 7: Setup Environment Variables

### Create .env file:
```bash
nano .env
```

### Add your configuration:
```env
# Database (if using)
DATABASE_URL=your_database_url

# Server configuration
NODE_ENV=production
PORT=3000
WORKER_PORT=4000

# Display for headless server
DISPLAY=:1
```

## 🚀 Step 8: Setup Process Manager (PM2)

### Install PM2:
```bash
sudo npm install -g pm2
```

### Create PM2 ecosystem file:
```bash
nano ecosystem.config.js
```

### Add this configuration:
```javascript
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
```

## 🏃 Step 9: Build and Start Services

### Build the React app:
```bash
npm run build
```

### Start services with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔥 Step 10: Setup Firewall

### Configure UFW firewall:
```bash
sudo ufw allow ssh
sudo ufw allow 3000/tcp  # React app
sudo ufw allow 4000/tcp  # Playwright worker
sudo ufw enable
```

## 🌐 Step 11: Setup Nginx (Optional - for production)

### Install Nginx:
```bash
sudo apt install nginx -y
```

### Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/playwright-automation
```

### Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/playwright-automation /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## ✅ Step 12: Verify Installation

### Check PM2 processes:
```bash
pm2 status
```

### Test Playwright worker:
```bash
curl http://localhost:4000/health
```

### Test React app:
```bash
curl http://localhost:3000
```

### View logs:
```bash
pm2 logs playwright-worker
pm2 logs react-app
```

## 🔧 Step 13: Troubleshooting Commands

### If browsers fail to launch:
```bash
# Check display
echo $DISPLAY

# Test X server
xvfb-run --auto-servernum --server-args="-screen 0 1920x1080x24" google-chrome --version

# Check Playwright installation
npx playwright --version
npx playwright install --dry-run chromium
```

### Monitor system resources:
```bash
htop
df -h
free -h
```

## 🎯 Step 14: Testing Google Search Automation

### Test the automation:
```bash
# Check if worker is responding
curl -X POST http://localhost:4000/run \
  -H "Content-Type: application/json" \
  -d '{"targetUrl": "https://example.com", "profile": "Desktop Chrome"}'
```

## 📱 Step 15: Access Your Application

### Local access:
- React App: `http://your-server-ip:3000`
- Playwright Worker: `http://your-server-ip:4000`

### With Nginx (port 80):
- Application: `http://your-server-ip`

## 🔄 Step 16: Auto-restart on Boot

### Ensure PM2 starts on boot:
```bash
pm2 startup
pm2 save
```

## 📊 Step 17: Monitoring

### Setup log rotation:
```bash
pm2 install pm2-logrotate
```

### Monitor in real-time:
```bash
pm2 monit
```

---

## 🚨 Important Notes for Server Setup

1. **Virtual Display Required**: Headless servers need Xvfb for browser automation
2. **Memory Requirements**: Each browser instance uses ~100-200MB RAM
3. **Security**: Only open necessary ports in firewall
4. **SSL Certificate**: Use Let's Encrypt for HTTPS in production
5. **Backup**: Regular backups of your application and data

## 🎉 Success Indicators

When properly configured, you should see:
- ✅ PM2 showing both services as "online"
- ✅ Playwright worker responding to health checks
- ✅ React app accessible via browser
- ✅ Google Search automation working in browser windows
- ✅ No errors in PM2 logs

Your Ubuntu server is now ready for Playwright browser automation! 🎭🚀