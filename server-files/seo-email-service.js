// server-files/seo-email-service.js
// Email service for SEO alerts and reports

const nodemailer = require('nodemailer');
const { Pool } = require('pg');

// Ensure nodemailer is properly loaded
if (!nodemailer || typeof nodemailer.createTransport !== 'function') {
  throw new Error('Nodemailer not properly loaded');
}

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

class SEOEmailService {
  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Send subscription change notification
   */
  async sendSubscriptionNotification(data) {
    const { to, userName, planType, action, previousPlan, discountCode } = data;
    
    const planNames = {
      'seo_starter': 'Starter',
      'seo_professional': 'Professional',
      'seo_business': 'Business'
    };
    
    const planLimits = {
      'seo_starter': '100 pages/month',
      'seo_professional': '500 pages/month',
      'seo_business': '2,500 pages/month'
    };
    
    const currentPlanName = planNames[planType] || planType;
    const previousPlanName = previousPlan ? planNames[previousPlan] : null;
    
    const isUpgrade = action === 'upgrade';
    const subject = isUpgrade 
      ? `🎉 Subscription Upgraded to ${currentPlanName}!`
      : `✅ Subscription Activated - ${currentPlanName} Plan`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .plan-box { background: white; border-radius: 10px; padding: 25px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .plan-name { font-size: 32px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
    .plan-limit { font-size: 18px; color: #6b7280; }
    .features { margin: 20px 0; }
    .feature { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .feature:last-child { border-bottom: none; }
    .checkmark { color: #10b981; font-weight: bold; margin-right: 10px; }
    .discount-badge { background: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 10px 0; font-weight: bold; }
    .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">${isUpgrade ? '🎉 Subscription Upgraded!' : '✅ Subscription Activated!'}</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome to ${currentPlanName} Plan</p>
    </div>
    
    <div class="content">
      <p>Hi ${userName},</p>
      
      ${previousPlanName ? `
        <p>Great news! Your subscription has been upgraded from <strong>${previousPlanName}</strong> to <strong>${currentPlanName}</strong>.</p>
      ` : `
        <p>Your <strong>${currentPlanName}</strong> subscription is now active!</p>
      `}
      
      ${discountCode ? `
        <div class="discount-badge">
          🎁 Discount Code Applied: ${discountCode}
        </div>
      ` : ''}
      
      <div class="plan-box">
        <div class="plan-name">${currentPlanName}</div>
        <div class="plan-limit">${planLimits[planType]}</div>
        
        <div class="features">
          <div class="feature">
            <span class="checkmark">✓</span>
            Unlimited website scans
          </div>
          <div class="feature">
            <span class="checkmark">✓</span>
            AI-powered SEO fixes
          </div>
          <div class="feature">
            <span class="checkmark">✓</span>
            Auto-fix widget
          </div>
          ${planType !== 'seo_starter' ? `
          <div class="feature">
            <span class="checkmark">✓</span>
            Priority support
          </div>
          <div class="feature">
            <span class="checkmark">✓</span>
            API access
          </div>
          ` : ''}
          ${planType === 'seo_business' ? `
          <div class="feature">
            <span class="checkmark">✓</span>
            White-label options
          </div>
          <div class="feature">
            <span class="checkmark">✓</span>
            Dedicated account manager
          </div>
          ` : ''}
        </div>
      </div>
      
      <p style="text-align: center;">
        <a href="https://www.organitrafficboost.com/seo-dashboard" class="button">
          Start Scanning Now →
        </a>
      </p>
      
      <p><strong>What's Next?</strong></p>
      <ol>
        <li>Add your websites in the Website Manager</li>
        <li>Run your first SEO scan</li>
        <li>Install the auto-fix widget</li>
        <li>Watch your SEO score improve!</li>
      </ol>
      
      <div class="footer">
        <p><strong>Need Help?</strong></p>
        <p>Contact our support team anytime at support@organitrafficboost.com</p>
        <p style="margin-top: 20px; font-size: 12px;">
          This is an automated notification from OrganiTraffic Boost.<br>
          You're receiving this because you upgraded your subscription.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"OrganiTraffic Boost" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
      });
      
      console.log(`✅ Subscription notification sent to ${to}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send subscription notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send scan alert email
   */
  async sendScanAlert(data) {
    const { to, userName, url, seoScore, criticalIssues, warnings, totalIssues, topIssues } = data;

    const subject = `🚨 SEO Alert: ${criticalIssues} Critical Issue(s) Found on ${url}`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; }
    .score-box { background: white; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .score { font-size: 48px; font-weight: bold; color: ${seoScore >= 80 ? '#10b981' : seoScore >= 60 ? '#f59e0b' : '#ef4444'}; }
    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
    .stat { text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; }
    .stat-label { color: #6b7280; font-size: 14px; }
    .critical { color: #ef4444; }
    .warning { color: #f59e0b; }
    .issue { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #ef4444; border-radius: 5px; }
    .issue-title { font-weight: bold; margin-bottom: 5px; }
    .issue-desc { color: #6b7280; font-size: 14px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔍 SEO Scan Alert</h1>
      <p>Automated scan completed for ${url}</p>
    </div>
    
    <div class="content">
      <p>Hi ${userName},</p>
      <p>Your scheduled SEO scan has detected some issues that need attention.</p>
      
      <div class="score-box">
        <div class="score">${seoScore}</div>
        <p>Overall SEO Score</p>
      </div>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-value critical">${criticalIssues}</div>
          <div class="stat-label">Critical Issues</div>
        </div>
        <div class="stat">
          <div class="stat-value warning">${warnings}</div>
          <div class="stat-label">Warnings</div>
        </div>
        <div class="stat">
          <div class="stat-value">${totalIssues}</div>
          <div class="stat-label">Total Issues</div>
        </div>
      </div>
      
      <h3>Top Issues Found:</h3>
      ${topIssues.map(issue => `
        <div class="issue">
          <div class="issue-title">${issue.title}</div>
          <div class="issue-desc">${issue.description}</div>
        </div>
      `).join('')}
      
      <center>
        <a href="https://organitrafficboost.com/seo-dashboard" class="button">
          View Full Report & Fix Issues
        </a>
      </center>
      
      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        💡 <strong>Tip:</strong> Use our AI-powered auto-fix feature to resolve these issues with 1 click!
      </p>
    </div>
    
    <div class="footer">
      <p>This is an automated email from OrganiTraffic SEO Automation</p>
      <p>To manage your scan schedules, visit your dashboard</p>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"OrganiTraffic SEO" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
      });

      console.log(`Scan alert sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Error sending scan alert:', error);
      return false;
    }
  }

  /**
   * Send weekly report email
   */
  async sendWeeklyReport(userId, summary, scans) {
    try {
      // Get user details
      const userResult = await pool.query(
        `SELECT email, name FROM users WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        return false;
      }

      const user = userResult.rows[0];

      const subject = `📊 Your Weekly SEO Report - ${summary.totalScans} Pages Scanned`;
      
      const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; }
    .summary-box { background: white; border-radius: 10px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .metric { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .metric:last-child { border-bottom: none; }
    .metric-label { color: #6b7280; }
    .metric-value { font-weight: bold; font-size: 18px; }
    .scan-item { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Weekly SEO Report</h1>
      <p>${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
    </div>
    
    <div class="content">
      <p>Hi ${user.name},</p>
      <p>Here's your weekly SEO performance summary:</p>
      
      <div class="summary-box">
        <h3>Summary</h3>
        <div class="metric">
          <span class="metric-label">Total Scans</span>
          <span class="metric-value">${summary.totalScans}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Average SEO Score</span>
          <span class="metric-value">${Math.round(summary.avgScore)}/100</span>
        </div>
        <div class="metric">
          <span class="metric-label">Issues Fixed</span>
          <span class="metric-value">${summary.totalIssuesFixed}</span>
        </div>
      </div>
      
      <h3>Recent Scans</h3>
      ${scans.slice(0, 5).map(scan => `
        <div class="scan-item">
          <strong>${scan.url}</strong><br>
          <small>Score: ${scan.seo_score}/100 | ${scan.critical_issues} Critical | ${scan.warnings} Warnings</small>
        </div>
      `).join('')}
      
      <center>
        <a href="https://organitrafficboost.com/seo-dashboard" class="button">
          View Full Dashboard
        </a>
      </center>
      
      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        Keep up the great work! Regular monitoring helps maintain and improve your SEO performance.
      </p>
    </div>
    
    <div class="footer">
      <p>OrganiTraffic - SEO Automation Platform</p>
      <p>To unsubscribe from weekly reports, visit your settings</p>
    </div>
  </div>
</body>
</html>
      `;

      await this.transporter.sendMail({
        from: `"OrganiTraffic SEO" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject,
        html
      });

      console.log(`Weekly report sent to ${user.email}`);
      return true;

    } catch (error) {
      console.error('Error sending weekly report:', error);
      return false;
    }
  }

  /**
   * Send fix applied notification
   */
  async sendFixAppliedNotification(userId, url, fixCount) {
    try {
      const userResult = await pool.query(
        `SELECT email, name FROM users WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        return false;
      }

      const user = userResult.rows[0];

      const subject = `✅ ${fixCount} SEO Fix(es) Applied to ${url}`;
      
      const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; }
    .success-box { background: white; border-radius: 10px; padding: 30px; margin: 20px 0; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .check-icon { font-size: 64px; color: #10b981; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ SEO Fixes Applied</h1>
    </div>
    
    <div class="content">
      <p>Hi ${user.name},</p>
      
      <div class="success-box">
        <div class="check-icon">✓</div>
        <h2>${fixCount} Fix(es) Successfully Applied</h2>
        <p>Your SEO improvements have been applied to:</p>
        <p><strong>${url}</strong></p>
      </div>
      
      <p>The AI-generated optimizations are now live and should improve your search rankings over time.</p>
      
      <center>
        <a href="https://organitrafficboost.com/seo-dashboard" class="button">
          View Results
        </a>
      </center>
    </div>
  </div>
</body>
</html>
      `;

      await this.transporter.sendMail({
        from: `"OrganiTraffic SEO" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject,
        html
      });

      return true;

    } catch (error) {
      console.error('Error sending fix notification:', error);
      return false;
    }
  }

  /**
   * Test email configuration
   */
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service ready');
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }
}

module.exports = new SEOEmailService();
