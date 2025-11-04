#!/bin/bash

# PhonePe Integration Deployment Script
# This script deploys the PhonePe payment integration to your VPS

set -e  # Exit on any error

echo "🚀 Starting PhonePe Integration Deployment..."
echo ""

# Configuration
VPS_IP="67.217.60.57"
VPS_USER="root"
VPS_PATH="/root/relay"
PM2_PROCESS="relay-api"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Upload backend files
echo -e "${YELLOW}📤 Step 1: Uploading backend files to VPS...${NC}"
scp server.js ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
scp phonepe-payment-api.js ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
scp setup-phonepe-tables.sql ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
echo -e "${GREEN}✅ Files uploaded successfully${NC}"
echo ""

# Step 2: Create database tables
echo -e "${YELLOW}📊 Step 2: Creating database tables...${NC}"
echo "Please run the following SQL in your Neon PostgreSQL dashboard:"
echo ""
cat setup-phonepe-tables.sql
echo ""
read -p "Press Enter after you've created the tables in Neon..."
echo -e "${GREEN}✅ Database tables created${NC}"
echo ""

# Step 3: Update environment variables
echo -e "${YELLOW}🔑 Step 3: Updating environment variables...${NC}"
echo "Please add these to your VPS .env file at ${VPS_PATH}/.env:"
echo ""
echo "# PhonePe Payment Gateway Configuration"
echo "PHONEPE_MERCHANT_ID=your_merchant_id_here"
echo "PHONEPE_SALT_KEY=your_salt_key_here"
echo "PHONEPE_SALT_INDEX=1"
echo "PHONEPE_ENV=sandbox"
echo "PHONEPE_REDIRECT_URL=https://organitrafficboost.com/payment-success"
echo "PHONEPE_CALLBACK_URL=https://api.organitrafficboost.com/api/payment/phonepe/callback"
echo ""
read -p "Press Enter after you've added the environment variables..."
echo -e "${GREEN}✅ Environment variables configured${NC}"
echo ""

# Step 4: Restart PM2
echo -e "${YELLOW}🔄 Step 4: Restarting PM2 process...${NC}"
ssh ${VPS_USER}@${VPS_IP} "cd ${VPS_PATH} && pm2 restart ${PM2_PROCESS}"
echo -e "${GREEN}✅ PM2 restarted successfully${NC}"
echo ""

# Step 5: Check logs
echo -e "${YELLOW}📋 Step 5: Checking PM2 logs...${NC}"
ssh ${VPS_USER}@${VPS_IP} "pm2 logs ${PM2_PROCESS} --lines 20 --nostream"
echo ""

# Step 6: Test endpoints
echo -e "${YELLOW}🧪 Step 6: Testing endpoints...${NC}"
echo "Testing health endpoint..."
curl -s https://api.organitrafficboost.com/health | jq '.' || echo "Health check endpoint not responding"
echo ""

echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "📝 Next Steps:"
echo "1. Get PhonePe credentials from: https://developer.phonepe.com/"
echo "2. Update the .env file on VPS with real credentials"
echo "3. Test payment flow with sandbox credentials"
echo "4. Switch to production when ready"
echo ""
echo "📚 Documentation: backend/PHONEPE_SETUP.md"
