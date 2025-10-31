#!/bin/bash
cd /root/relay

# Backup
cp seo-automation-api.js seo-automation-api.js.backup-email-$(date +%s)

# Add endpoint before module.exports
sed -i '/module.exports = router;/i\
router.post('\''/send-scan-email'\'', async (req, res) => {\
  try {\
    const { email, scanId, url } = req.body;\
    const scanQuery = await pool.query('\''SELECT * FROM seo_scans WHERE id = $1'\'', [scanId]);\
    const scan = scanQuery.rows[0];\
    const scanData = { scanId: scan.id, domain: url, seoScore: scan.seo_score || 0, criticalIssues: scan.critical_issues || 0, warnings: scan.warnings || 0, passedChecks: scan.passed_checks || 0, pagesScanned: 1, scanDuration: 0, topIssues: [] };\
    const result = await sendScanEmail(scanData, email);\
    res.json({ success: result.success });\
  } catch (error) { res.json({ success: false, error: error.message }); }\
});\
\
' seo-automation-api.js

echo "Endpoint added. Restarting relay-api..."
pm2 restart relay-api
sleep 2
pm2 logs relay-api --lines 20
