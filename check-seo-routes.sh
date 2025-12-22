#!/bin/bash
echo "Checking SEO routes in server.js..."
cd /root/relay
grep "seo" server.js | head -30
