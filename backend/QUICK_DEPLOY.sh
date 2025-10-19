#!/bin/bash

# Quick Deploy Script for OrganiTrafficBoost Email API
# Run this script on your Linux server

echo "🚀 Starting deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "${YELLOW}Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "${GREEN}✓ Node.js version: $(node --version)${NC}"

# Step 2: Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "${YELLOW}Installing PM2...${NC}"
    sudo npm install -g pm2
fi

echo "${GREEN}✓ PM2 installed${NC}"

# Step 3: Install dependencies
echo "${YELLOW}Installing dependencies...${NC}"
npm install

echo "${GREEN}✓ Dependencies installed${NC}"

# Step 4: Create .env file
if [ ! -f .env ]; then
    echo "${YELLOW}Creating .env file...${NC}"
    echo "Please enter your Resend API key:"
    read -r RESEND_KEY
    
    cat > .env << EOF
RESEND_API_KEY=${RESEND_KEY}
FROM_EMAIL=onboarding@resend.dev
COMPANY_NAME=OrganiTrafficBoost
SUPPORT_EMAIL=support@organitrafficboost.com
PORT=3000
NODE_ENV=production
EOF
    echo "${GREEN}✓ .env file created${NC}"
else
    echo "${GREEN}✓ .env file already exists${NC}"
fi

# Step 5: Create logs directory
mkdir -p logs

# Step 6: Start with PM2
echo "${YELLOW}Starting API server with PM2...${NC}"
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "${GREEN}✓ API server started${NC}"

# Step 7: Test the server
sleep 2
if curl -s http://localhost:3000/health > /dev/null; then
    echo "${GREEN}✓ Server is running!${NC}"
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "Next steps:"
    echo "1. Configure Nginx reverse proxy (see DEPLOYMENT.md)"
    echo "2. Setup SSL with Let's Encrypt"
    echo "3. Test your API at https://api.organitrafficboost.com"
else
    echo "${YELLOW}⚠ Server might not be running. Check logs:${NC}"
    echo "pm2 logs organitrafficboost-email-api"
fi

echo ""
echo "Useful commands:"
echo "  pm2 status                    - Check server status"
echo "  pm2 logs                      - View logs"
echo "  pm2 restart all               - Restart server"
echo "  pm2 stop all                  - Stop server"
