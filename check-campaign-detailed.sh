#!/bin/bash
# Detailed Campaign Check for Job ID: 1762420823354
# Run on VPS: 67.217.60.57

echo "================================================"
echo "Campaign Investigation: 1762420823354"
echo "Server: $(hostname)"
echo "Date: $(date)"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}[1/8] PM2 Process Status${NC}"
echo "================================================"
pm2 status
echo ""

echo -e "${YELLOW}[2/8] Searching for Campaign ID in All Logs${NC}"
echo "================================================"
CAMPAIGN_LOGS=$(pm2 logs --lines 1000 --nostream 2>/dev/null | grep -i "1762420823354")
if [ -n "$CAMPAIGN_LOGS" ]; then
    echo -e "${GREEN}✅ Found campaign logs:${NC}"
    echo "$CAMPAIGN_LOGS"
else
    echo -e "${RED}❌ No logs found for campaign ID: 1762420823354${NC}"
fi
echo ""

echo -e "${YELLOW}[3/8] Checking Relay API Logs (Last 200 lines)${NC}"
echo "================================================"
pm2 logs relay-api --lines 200 --nostream 2>/dev/null | tail -50
echo ""

echo -e "${YELLOW}[4/8] Searching for Proxy Usage${NC}"
echo "================================================"
PROXY_LOGS=$(pm2 logs --lines 1000 --nostream 2>/dev/null | grep -iE "proxy|smartproxy|3120")
if [ -n "$PROXY_LOGS" ]; then
    echo -e "${GREEN}✅ Found proxy-related logs:${NC}"
    echo "$PROXY_LOGS" | tail -20
else
    echo -e "${RED}❌ No proxy usage detected in logs${NC}"
fi
echo ""

echo -e "${YELLOW}[5/8] Checking for SmartProxy Configuration${NC}"
echo "================================================"
SMARTPROXY_LOGS=$(pm2 logs --lines 2000 --nostream 2>/dev/null | grep -i "smartproxy.net")
if [ -n "$SMARTPROXY_LOGS" ]; then
    echo -e "${GREEN}✅ SmartProxy detected:${NC}"
    echo "$SMARTPROXY_LOGS"
else
    echo -e "${RED}❌ No SmartProxy usage found${NC}"
fi
echo ""

echo -e "${YELLOW}[6/8] Checking Worker Logs (Playwright)${NC}"
echo "================================================"
if pm2 list | grep -q "worker"; then
    echo -e "${GREEN}Worker process is running${NC}"
    pm2 logs worker --lines 100 --nostream 2>/dev/null | tail -30
else
    echo -e "${RED}❌ Worker process not found${NC}"
fi
echo ""

echo -e "${YELLOW}[7/8] Checking Recent Campaign Activity${NC}"
echo "================================================"
RECENT_CAMPAIGNS=$(pm2 logs relay-api --lines 500 --nostream 2>/dev/null | grep -iE "campaign|job.*id|visitors|urls")
if [ -n "$RECENT_CAMPAIGNS" ]; then
    echo -e "${GREEN}Recent campaign activity:${NC}"
    echo "$RECENT_CAMPAIGNS" | tail -30
else
    echo -e "${RED}No recent campaign activity found${NC}"
fi
echo ""

echo -e "${YELLOW}[8/8] Checking for Visit/Session Logs${NC}"
echo "================================================"
VISIT_LOGS=$(pm2 logs --lines 1000 --nostream 2>/dev/null | grep -iE "visit|session|browser|playwright")
if [ -n "$VISIT_LOGS" ]; then
    echo -e "${GREEN}Visit/Session logs:${NC}"
    echo "$VISIT_LOGS" | tail -30
else
    echo -e "${RED}No visit/session logs found${NC}"
fi
echo ""

echo "================================================"
echo -e "${GREEN}Investigation Complete!${NC}"
echo "================================================"
echo ""
echo "Summary:"
echo "--------"
echo "Campaign ID: 1762420823354"
echo "Timestamp: $(date -d @1762420823 2>/dev/null || echo 'Invalid timestamp format')"
echo ""
echo "To see live logs, run:"
echo "  pm2 logs relay-api"
echo "  pm2 logs worker"
echo ""
echo "To search for specific terms:"
echo "  pm2 logs --lines 2000 | grep -i 'your-search-term'"
echo ""
