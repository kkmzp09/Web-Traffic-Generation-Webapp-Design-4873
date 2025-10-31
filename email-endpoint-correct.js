// Correct send-scan-email endpoint
// Add this to seo-automation-api.js before module.exports

router.post('/send-scan-email', async (req, res) => {
  try {
    const { email, scanId, url } = req.body;
    console.log('📧 Free scan email request:', { email, scanId, url });
    
    // Query using dataforseo_task_id column
    const scanQuery = await pool.query(
      'SELECT * FROM seo_scans WHERE dataforseo_task_id = $1 OR id::text = $1',
      [scanId]
    );
    
    if (scanQuery.rows.length === 0) {
      console.log('⚠️ Scan not found for ID:', scanId);
      return res.json({ success: false, error: 'Scan not found' });
    }
    
    const scan = scanQuery.rows[0];
    
    const scanData = {
      scanId: scan.id,
      domain: url,
      seoScore: scan.seo_score || 0,
      criticalIssues: scan.critical_issues || 0,
      warnings: scan.warnings || 0,
      passedChecks: scan.passed_checks || 0,
      pagesScanned: scan.pages_scanned || 1,
      scanDuration: scan.scan_duration_ms || 0,
      topIssues: []
    };
    
    const result = await sendScanEmail(scanData, email);
    
    if (result.success) {
      console.log('✅ Email sent successfully to:', email);
      res.json({ success: true });
    } else {
      console.log('❌ Email send failed:', result.error);
      res.json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('❌ Send scan email error:', error);
    res.json({ success: false, error: error.message });
  }
});
