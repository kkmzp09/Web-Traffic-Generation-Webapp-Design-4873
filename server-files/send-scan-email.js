// Send email notification after manual scan
require('dotenv').config();

async function sendScanEmail(scanData, userEmail, userName = 'there') {
  try {
    console.log(`📧 Sending scan email to ${userEmail}...`);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
    .greeting { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .section { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
    .metric { display: inline-block; margin: 10px 20px 10px 0; }
    .metric-value { font-size: 32px; font-weight: bold; color: #667eea; }
    .metric-label { font-size: 14px; color: #666; }
    .issue-item { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 3px solid #ef4444; }
    .success { color: #10b981; font-weight: bold; }
    .warning { color: #f59e0b; font-weight: bold; }
    .error { color: #ef4444; font-weight: bold; }
    .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔍 SEO Scan Complete</h1>
      <p>${scanData.domain}</p>
      <p>${new Date().toLocaleDateString()}</p>
    </div>

    <div class="greeting">
      <p>Hi ${userName},</p>
      <p>Your manual SEO scan has completed. Here are the results:</p>
    </div>

    <div class="section">
      <h2>📊 Scan Results</h2>
      <div class="metric">
        <div class="metric-value ${scanData.seoScore >= 80 ? 'success' : scanData.seoScore >= 60 ? 'warning' : 'error'}">${scanData.seoScore}</div>
        <div class="metric-label">SEO Score</div>
      </div>
      <div class="metric">
        <div class="metric-value error">${scanData.criticalIssues || 0}</div>
        <div class="metric-label">Critical Issues</div>
      </div>
      <div class="metric">
        <div class="metric-value warning">${scanData.warnings || 0}</div>
        <div class="metric-label">Warnings</div>
      </div>
      <div class="metric">
        <div class="metric-value success">${scanData.passedChecks || 0}</div>
        <div class="metric-label">Passed</div>
      </div>
    </div>

    ${scanData.topIssues && scanData.topIssues.length > 0 ? `
    <div class="section">
      <h2>⚠️ Top Issues Found</h2>
      ${scanData.topIssues.slice(0, 5).map(issue => `
        <div class="issue-item">
          <strong class="${issue.severity === 'critical' ? 'error' : 'warning'}">${issue.severity === 'critical' ? '🔴' : '🟡'} ${issue.title}</strong>
          <p style="margin: 5px 0; color: #666;">${issue.description}</p>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="section">
      <h2>🎯 Quick Actions</h2>
      <p>View your full scan results and apply fixes:</p>
      <a href="${process.env.APP_URL || 'https://organitrafficboost.com'}/seo-scan/${scanData.scanId}" class="button">
        View Full Report & Apply Fixes
      </a>
    </div>

    <div class="section" style="background: #e0f2fe; border-left-color: #0ea5e9;">
      <h3 style="color: #0369a1; margin-top: 0;">💡 Pro Tip</h3>
      <p>Enable <strong>Automated Monitoring</strong> to:</p>
      <ul style="color: #0c4a6e;">
        <li>✅ Get daily/weekly scans automatically</li>
        <li>✅ Auto-fix issues via widget</li>
        <li>✅ Track rankings over time</li>
        <li>✅ Analyze competitors</li>
      </ul>
      <a href="${process.env.APP_URL || 'https://organitrafficboost.com'}/seo-dashboard?tab=automation" class="button" style="background: #0ea5e9;">
        Enable Automation
      </a>
    </div>

    <div class="footer">
      <p>This scan was performed on ${new Date().toLocaleString()}</p>
      <p>Scanned ${scanData.pagesScanned || 1} page(s) in ${Math.round((scanData.scanDuration || 0) / 1000)}s</p>
      ${scanData.pagesSkipped > 0 ? `<p style="color: #0ea5e9;">⏭️ Skipped ${scanData.pagesSkipped} page(s) with pending issues (saved page credits!)</p>` : ''}
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
      <p>OrganiTraffic - Automated SEO Monitoring</p>
      <p><a href="${process.env.APP_URL || 'https://organitrafficboost.com'}/seo-dashboard">Dashboard</a> | <a href="${process.env.APP_URL || 'https://organitrafficboost.com'}/settings">Settings</a></p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'OrganiTraffic SEO <seo@organitrafficboost.com>',
        to: [userEmail],
        subject: `🔍 SEO Scan Complete: ${scanData.seoScore}/100 - ${scanData.domain}`,
        html: emailHtml
      })
    });

    const result = await response.json();

    if (result.id) {
      console.log(`✅ Email sent successfully to ${userEmail} (ID: ${result.id})`);
      return { success: true, emailId: result.id };
    } else {
      console.error('❌ Email send failed:', result);
      return { success: false, error: result };
    }

  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { sendScanEmail };
