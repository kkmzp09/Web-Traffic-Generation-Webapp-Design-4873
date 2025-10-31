// Add this to seo-automation-api.js after the other routes

// ============================================
// POST /api/seo/send-scan-email
// Send scan results via email (for free scans)
// ============================================
router.post('/send-scan-email', async (req, res) => {
  try {
    const { email, scanId, url } = req.body;

    if (!email || !scanId) {
      return res.json({ success: false, error: 'Email and scanId required' });
    }

    console.log(`📧 Sending scan results to ${email} for scan ${scanId}`);

    // Get scan results from database
    const scanQuery = await pool.query(
      'SELECT * FROM seo_scans WHERE id = $1',
      [scanId]
    );

    if (scanQuery.rows.length === 0) {
      return res.json({ success: false, error: 'Scan not found' });
    }

    const scan = scanQuery.rows[0];

    // Prepare scan data for email
    const scanData = {
      scanId: scan.id,
      domain: url || scan.url,
      seoScore: scan.seo_score || 0,
      criticalIssues: scan.critical_issues || 0,
      warnings: scan.warnings || 0,
      passedChecks: scan.passed_checks || 0,
      pagesScanned: scan.pages_scanned || 1,
      scanDuration: scan.scan_duration || 0,
      pagesSkipped: 0,
      topIssues: []
    };

    // Send email
    const emailResult = await sendScanEmail(scanData, email, 'there');

    if (emailResult.success) {
      res.json({ 
        success: true, 
        message: 'Email sent successfully',
        emailId: emailResult.emailId 
      });
    } else {
      res.json({ 
        success: false, 
        error: 'Failed to send email',
        details: emailResult.error 
      });
    }

  } catch (error) {
    console.error('Send scan email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
