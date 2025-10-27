#!/bin/bash
# Setup automated SEO monitoring with cron jobs

echo "🚀 Setting up Automated SEO Monitoring System..."

# Create monitoring tables
echo "📊 Creating database tables..."
cd /root/relay
node -e "
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sql = fs.readFileSync('create-monitoring-tables.sql', 'utf8');
pool.query(sql)
  .then(() => {
    console.log('✅ Tables created successfully');
    pool.end();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    pool.end();
    process.exit(1);
  });
"

# Setup cron jobs
echo "⏰ Setting up cron jobs..."

# Daily scan at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * cd /root/relay && node automated-seo-monitor.js >> /var/log/seo-monitor.log 2>&1") | crontab -

# Weekly comprehensive report (Sunday 3 AM)
(crontab -l 2>/dev/null; echo "0 3 * * 0 cd /root/relay && node automated-seo-monitor.js --comprehensive >> /var/log/seo-monitor-weekly.log 2>&1") | crontab -

echo "✅ Cron jobs configured:"
echo "  - Daily scans: 2:00 AM"
echo "  - Weekly reports: Sunday 3:00 AM"

# Create log directory
mkdir -p /var/log
touch /var/log/seo-monitor.log
touch /var/log/seo-monitor-weekly.log

echo ""
echo "📋 Cron schedule:"
crontab -l

echo ""
echo "🎉 Automated monitoring setup complete!"
echo ""
echo "📝 To manually run monitoring:"
echo "   cd /root/relay && node automated-seo-monitor.js"
echo ""
echo "📊 To view logs:"
echo "   tail -f /var/log/seo-monitor.log"
