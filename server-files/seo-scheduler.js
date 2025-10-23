// server-files/seo-scheduler.js
// Automated SEO Scan Scheduler with Cron Jobs

const cron = require('node-cron');
const { Pool } = require('pg');
const seoScanner = require('./seo-scanner-service');
const seoAIFixer = require('./seo-ai-fixer');
const emailService = require('./seo-email-service');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

class SEOScheduler {
  constructor() {
    this.isRunning = false;
    this.cronJob = null;
  }

  /**
   * Start the scheduler
   */
  start() {
    if (this.isRunning) {
      console.log('SEO Scheduler already running');
      return;
    }

    console.log('Starting SEO Scheduler...');

    // Run every hour to check for scheduled scans
    this.cronJob = cron.schedule('0 * * * *', async () => {
      await this.processScheduledScans();
    });

    this.isRunning = true;
    console.log('SEO Scheduler started - checking every hour');

    // Also run immediately on startup
    this.processScheduledScans();
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.isRunning = false;
      console.log('SEO Scheduler stopped');
    }
  }

  /**
   * Process all scheduled scans that are due
   */
  async processScheduledScans() {
    try {
      console.log('Checking for scheduled scans...');

      // Get all active schedules that are due
      const result = await pool.query(
        `SELECT * FROM seo_schedules 
         WHERE active = true 
         AND next_run_at <= NOW()
         ORDER BY next_run_at ASC`
      );

      const schedules = result.rows;

      if (schedules.length === 0) {
        console.log('No scheduled scans due');
        return;
      }

      console.log(`Found ${schedules.length} scheduled scan(s) to process`);

      for (const schedule of schedules) {
        await this.processSchedule(schedule);
      }

    } catch (error) {
      console.error('Error processing scheduled scans:', error);
    }
  }

  /**
   * Process a single schedule
   */
  async processSchedule(schedule) {
    try {
      console.log(`Processing schedule ${schedule.id} for ${schedule.url}`);

      // Create scan record
      const domain = new URL(schedule.url).hostname;
      const scanResult = await pool.query(
        `INSERT INTO seo_scans (user_id, url, domain, status, scan_type) 
         VALUES ($1, $2, $3, 'scanning', 'scheduled') 
         RETURNING id`,
        [schedule.user_id, schedule.url, domain]
      );

      const scanId = scanResult.rows[0].id;

      // Perform the scan
      const scanResults = await seoScanner.scanPage(schedule.url);

      // Count issues
      const criticalIssues = scanResults.issues.filter(i => i.severity === 'critical').length;
      const warnings = scanResults.issues.filter(i => i.severity === 'warning').length;
      const passedChecks = scanResults.passed.length;

      // Update scan record
      await pool.query(
        `UPDATE seo_scans 
         SET status = 'completed', 
             seo_score = $1, 
             critical_issues = $2, 
             warnings = $3, 
             passed_checks = $4,
             scan_duration_ms = $5,
             scanned_at = NOW()
         WHERE id = $6`,
        [scanResults.seoScore, criticalIssues, warnings, passedChecks, scanResults.scanDuration, scanId]
      );

      // Insert issues
      const issueIds = [];
      for (const issue of scanResults.issues) {
        const issueResult = await pool.query(
          `INSERT INTO seo_issues 
           (scan_id, user_id, category, severity, title, description, current_value)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [scanId, schedule.user_id, issue.category, issue.severity, issue.title, 
           issue.description, issue.currentValue]
        );
        issueIds.push(issueResult.rows[0].id);
      }

      // Add to monitoring
      await pool.query(
        `INSERT INTO seo_monitoring 
         (user_id, url, domain, seo_score, total_issues, critical_issues, warnings)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [schedule.user_id, schedule.url, domain, scanResults.seoScore, 
         scanResults.issues.length, criticalIssues, warnings]
      );

      // Auto-fix if enabled
      if (schedule.auto_fix_enabled && schedule.auto_fix_categories.length > 0) {
        await this.applyAutoFixes(scanId, schedule, scanResults.issues);
      }

      // Send email alert if enabled
      if (schedule.email_alerts) {
        await this.sendScanAlert(schedule, scanResults, criticalIssues, warnings);
      }

      // Update schedule for next run
      const nextRunAt = this.calculateNextRun(schedule.frequency);
      await pool.query(
        `UPDATE seo_schedules 
         SET last_run_at = NOW(), 
             next_run_at = $1 
         WHERE id = $2`,
        [nextRunAt, schedule.id]
      );

      console.log(`Schedule ${schedule.id} completed. Next run: ${nextRunAt}`);

    } catch (error) {
      console.error(`Error processing schedule ${schedule.id}:`, error);
      
      // Mark schedule as failed but keep it active
      await pool.query(
        `UPDATE seo_schedules 
         SET last_run_at = NOW() 
         WHERE id = $1`,
        [schedule.id]
      );
    }
  }

  /**
   * Apply auto-fixes for enabled categories
   */
  async applyAutoFixes(scanId, schedule, issues) {
    try {
      // Filter issues by enabled categories
      const fixableIssues = issues.filter(issue => 
        schedule.auto_fix_categories.includes(issue.category) &&
        ['critical', 'warning'].includes(issue.severity)
      );

      if (fixableIssues.length === 0) {
        console.log('No fixable issues for auto-fix');
        return;
      }

      console.log(`Auto-fixing ${fixableIssues.length} issue(s)`);

      // Generate fixes
      const fixes = await seoAIFixer.generateFixes(schedule.url, fixableIssues);

      // Store and apply fixes
      for (const fix of fixes) {
        // Store fix
        const fixResult = await pool.query(
          `INSERT INTO seo_fixes 
           (issue_id, scan_id, user_id, fix_type, original_content, optimized_content, 
            ai_model, confidence_score, keywords_used, applied, applied_method)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, 'auto')
           RETURNING id`,
          [fix.issueId, scanId, schedule.user_id, fix.fixType, fix.originalContent, 
           fix.optimizedContent, fix.aiModel, fix.confidenceScore, fix.keywords]
        );

        // Mark issue as auto-fixed
        await pool.query(
          `UPDATE seo_issues 
           SET fix_status = 'auto_fixed', 
               fixed_at = NOW()
           WHERE id = $1`,
          [fix.issueId]
        );
      }

      console.log(`Auto-applied ${fixes.length} fix(es)`);

    } catch (error) {
      console.error('Error applying auto-fixes:', error);
    }
  }

  /**
   * Send email alert for scan results
   */
  async sendScanAlert(schedule, scanResults, criticalIssues, warnings) {
    try {
      // Get user email
      const userResult = await pool.query(
        `SELECT email, name FROM users WHERE id = $1`,
        [schedule.user_id]
      );

      if (userResult.rows.length === 0) {
        console.log('User not found for email alert');
        return;
      }

      const user = userResult.rows[0];

      // Check if we should send alert
      const shouldAlert = 
        (schedule.alert_on_new_issues && (criticalIssues > 0 || warnings > 0)) ||
        (schedule.alert_on_score_drop && scanResults.seoScore < 70);

      if (!shouldAlert) {
        console.log('No alert conditions met');
        return;
      }

      // Send email
      await emailService.sendScanAlert({
        to: user.email,
        userName: user.name,
        url: schedule.url,
        seoScore: scanResults.seoScore,
        criticalIssues,
        warnings,
        totalIssues: scanResults.issues.length,
        topIssues: scanResults.issues.slice(0, 5)
      });

      console.log(`Email alert sent to ${user.email}`);

    } catch (error) {
      console.error('Error sending email alert:', error);
    }
  }

  /**
   * Calculate next run time based on frequency
   */
  calculateNextRun(frequency) {
    const now = new Date();
    
    switch (frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      default:
        now.setDate(now.getDate() + 7);
    }
    
    return now;
  }

  /**
   * Generate weekly reports for all users
   */
  async generateWeeklyReports() {
    try {
      console.log('Generating weekly reports...');

      // Get all users with active schedules
      const result = await pool.query(
        `SELECT DISTINCT user_id FROM seo_schedules WHERE active = true`
      );

      for (const row of result.rows) {
        await this.generateUserReport(row.user_id, 'weekly');
      }

    } catch (error) {
      console.error('Error generating weekly reports:', error);
    }
  }

  /**
   * Generate report for a specific user
   */
  async generateUserReport(userId, reportType) {
    try {
      const periodStart = new Date();
      const periodEnd = new Date();

      if (reportType === 'weekly') {
        periodStart.setDate(periodStart.getDate() - 7);
      } else if (reportType === 'monthly') {
        periodStart.setMonth(periodStart.getMonth() - 1);
      }

      // Get scans in period
      const scansResult = await pool.query(
        `SELECT * FROM seo_scans 
         WHERE user_id = $1 
         AND scanned_at BETWEEN $2 AND $3
         ORDER BY scanned_at DESC`,
        [userId, periodStart, periodEnd]
      );

      const scans = scansResult.rows;

      if (scans.length === 0) {
        console.log(`No scans for user ${userId} in period`);
        return;
      }

      // Calculate summary
      const summary = {
        totalScans: scans.length,
        avgScore: scans.reduce((sum, s) => sum + s.seo_score, 0) / scans.length,
        totalIssuesFixed: 0,
        topIssues: []
      };

      // Store report
      await pool.query(
        `INSERT INTO seo_reports 
         (user_id, report_type, period_start, period_end, summary_data)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, reportType, periodStart, periodEnd, JSON.stringify(summary)]
      );

      // Send email report
      await emailService.sendWeeklyReport(userId, summary, scans);

      console.log(`${reportType} report generated for user ${userId}`);

    } catch (error) {
      console.error(`Error generating report for user ${userId}:`, error);
    }
  }
}

// Export singleton instance
const scheduler = new SEOScheduler();

// Schedule weekly reports (every Monday at 9 AM)
cron.schedule('0 9 * * 1', () => {
  scheduler.generateWeeklyReports();
});

module.exports = scheduler;
