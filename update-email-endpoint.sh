#!/bin/bash
cd /root/relay

# Backup
cp seo-automation-api.js seo-automation-api.js.backup-uuid-fix

# Find and replace the send-scan-email endpoint
# First, remove all existing send-scan-email endpoints
sed -i '/router.post.*send-scan-email/,/^});$/d' seo-automation-api.js

# Add the fixed endpoint before module.exports
sed -i '/module.exports = router;/i\
router.post('\''/send-scan-email'\'', async (req, res) => {\
  try {\
    const { email, scanId, url } = req.body;\
    console.log('\''📧 Free scan email request:'\''  , { email, scanId, url });\
    const scanQuery = await pool.query('\''SELECT * FROM seo_scans WHERE task_id = $1 OR id::text = $1'\'', [scanId]);\
    if (scanQuery.rows.length === 0) {\
      console.log('\''⚠️ Scan not found for ID:'\'' , scanId);\
      return res.json({ success: false, error: '\''Scan not found'\'' });\
    }\
    const scan = scanQuery.rows[0];\
    const scanData = { scanId: scan.id, domain: url, seoScore: scan.seo_score || 0, criticalIssues: scan.critical_issues || 0, warnings: scan.warnings || 0, passedChecks: scan.passed_checks || 0, pagesScanned: 1, scanDuration: 0, topIssues: [] };\
    const result = await sendScanEmail(scanData, email);\
    if (result.success) {\
      console.log('\''✅ Email sent successfully to:'\'' , email);\
      res.json({ success: true });\
    } else {\
      console.log('\''❌ Email send failed:'\'' , result.error);\
      res.json({ success: false, error: result.error });\
    }\
  } catch (error) {\
    console.error('\''❌ Send scan email error:'\'' , error);\
    res.json({ success: false, error: error.message });\
  }\
});\
\
' seo-automation-api.js

echo "✅ Endpoint updated. Restarting relay-api..."
pm2 restart relay-api
sleep 2
pm2 logs relay-api --lines 20
