# Backend API Deployment Guide

## 🚀 Deploy to Linux Server (api.organitrafficboost.com)

### Prerequisites:
- Linux server with SSH access
- Node.js installed (v16 or higher)
- PM2 installed globally
- Nginx installed (for reverse proxy)

---

## 📦 Step 1: Upload Backend to Server

### Option A: Using SCP (from your local machine)
```bash
# From your project root directory
scp -r backend/ root@YOUR_SERVER_IP:/var/www/organitrafficboost-api/
```

### Option B: Using Git (recommended)
```bash
# On your server
cd /var/www/
git clone https://github.com/kkmzp09/Web-Traffic-Generation-Webapp-Design-4873.git organitrafficboost-api
cd organitrafficboost-api/backend
```

---

## 🔧 Step 2: Install Dependencies

SSH into your server and run:

```bash
cd /var/www/organitrafficboost-api/backend
npm install
```

---

## 🔐 Step 3: Configure Environment Variables

Create `.env` file:

```bash
nano .env
```

Add this content (replace with your actual values):

```env
RESEND_API_KEY=re_GvsKBzUC_L1rK6DY21xKeTE3ixF9p62dk
FROM_EMAIL=onboarding@resend.dev
COMPANY_NAME=OrganiTrafficBoost
SUPPORT_EMAIL=support@organitrafficboost.com
PORT=3000
NODE_ENV=production
```

Save and exit (Ctrl+X, then Y, then Enter)

---

## 🚀 Step 4: Install PM2 (if not installed)

```bash
npm install -g pm2
```

---

## ▶️ Step 5: Start the API Server

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs
```

---

## 🔍 Step 6: Verify Server is Running

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs organitrafficboost-email-api

# Test health endpoint
curl http://localhost:3000/health
```

You should see: `{"status":"ok","service":"OrganiTrafficBoost Email API"}`

---

## 🌐 Step 7: Configure Nginx Reverse Proxy

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/api.organitrafficboost.com
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name api.organitrafficboost.com;

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
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/api.organitrafficboost.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Step 8: Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.organitrafficboost.com
```

Follow the prompts to setup SSL.

---

## ✅ Step 9: Test the API

```bash
# Test health endpoint
curl https://api.organitrafficboost.com/health

# Test password reset email (replace with your email)
curl -X POST https://api.organitrafficboost.com/api/email/password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your@email.com",
    "userName": "Test User",
    "resetLink": "https://www.organitrafficboost.com/reset-password?token=test123"
  }'
```

---

## 📊 PM2 Management Commands

```bash
# View status
pm2 status

# View logs
pm2 logs

# Restart
pm2 restart organitrafficboost-email-api

# Stop
pm2 stop organitrafficboost-email-api

# Delete
pm2 delete organitrafficboost-email-api
```

---

## 🔥 Firewall Configuration

If you have a firewall, allow port 80 and 443:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

---

## 📝 API Endpoints

Once deployed, your API will have these endpoints:

- `GET /health` - Health check
- `POST /api/email/welcome` - Send welcome email
- `POST /api/email/password-reset` - Send password reset email
- `POST /api/email/payment-confirmation` - Send payment confirmation
- `POST /api/email/payment-pending` - Send payment pending notification
- `POST /api/email/campaign-started` - Send campaign started notification

---

## 🐛 Troubleshooting

### Check if Node.js is installed:
```bash
node --version
npm --version
```

### Check if PM2 is running:
```bash
pm2 list
```

### Check Nginx status:
```bash
sudo systemctl status nginx
```

### View API logs:
```bash
pm2 logs organitrafficboost-email-api --lines 100
```

### Restart everything:
```bash
pm2 restart all
sudo systemctl restart nginx
```

---

## 🎉 You're Done!

Your email API is now running at: **https://api.organitrafficboost.com**

Next step: Update your frontend to use this API instead of the simulation mode.
