#!/bin/bash
# Setup cron jobs for automated SEO monitoring

echo "⏰ Setting up cron jobs..."

# Add daily scan at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * cd /root/relay && node automated-seo-monitor.js >> /var/log/seo-monitor.log 2>&1") | crontab -

# Add weekly comprehensive report (Sunday 3 AM)
(crontab -l 2>/dev/null; echo "0 3 * * 0 cd /root/relay && node automated-seo-monitor.js --comprehensive >> /var/log/seo-monitor-weekly.log 2>&1") | crontab -

echo "✅ Cron jobs configured:"
echo "  - Daily scans: 2:00 AM"
echo "  - Weekly reports: Sunday 3:00 AM"

# Create log files
mkdir -p /var/log
touch /var/log/seo-monitor.log
touch /var/log/seo-monitor-weekly.log

echo ""
echo "📋 Current cron schedule:"
crontab -l

echo ""
echo "🎉 Cron setup complete!"
