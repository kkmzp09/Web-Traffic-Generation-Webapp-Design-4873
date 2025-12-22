#!/bin/bash
echo "=== Scan 147 Status ==="
echo ""
echo "Scan Info:"
psql $DATABASE_URL -c "SELECT id, url, status, seo_score, created_at, scanned_at FROM seo_scans WHERE id = 147;"
echo ""
echo "Issues Count:"
psql $DATABASE_URL -c "SELECT COUNT(*) as total_issues FROM seo_issues WHERE scan_id = 147;"
echo ""
echo "Fixes Count:"
psql $DATABASE_URL -c "SELECT COUNT(*) as total_fixes FROM seo_fixes WHERE scan_id = 147;"
echo ""
echo "Recent PM2 Logs:"
pm2 logs relay-api --lines 50 --nostream | grep "Scan 147" | tail -10
