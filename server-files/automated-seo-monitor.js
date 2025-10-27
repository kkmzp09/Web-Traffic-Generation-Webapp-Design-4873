// server-files/automated-seo-monitor.js
// Automated SEO Monitoring, Competitor Analysis, and Auto-Fix System

require('dotenv').config();
const { Pool } = require('pg');
const axios = require('axios');
const nodemailer = require('nodemailer');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Email configuration
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: 587,
  secure: false,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY
  }
});

/**
 * Main automated monitoring function
 */
async function runAutomatedMonitoring() {
  console.log('🤖 Starting Automated SEO Monitoring...');
  
  try {
    // Get all sites with monitoring enabled
    const sites = await getMonitoredSites();
    console.log(`📊 Found ${sites.length} site(s) to monitor`);

    for (const site of sites) {
      console.log(`\n🔍 Processing: ${site.domain}`);
      
      // 1. Run SEO scan
      const scanResults = await runSEOScan(site);
      
      // 2. Analyze competitors
      const competitorAnalysis = await analyzeCompetitors(site);
      
      // 3. Auto-apply fixes
      const appliedFixes = await autoApplyFixes(site, scanResults, competitorAnalysis);
      
      // 4. Track ranking changes
      const rankingData = await trackRankings(site);
      
      // 5. Send email report
      await sendEmailReport(site, {
        scanResults,
        competitorAnalysis,
        appliedFixes,
        rankingData
      });
      
      console.log(`✅ Completed monitoring for ${site.domain}`);
    }

    console.log('\n🎉 Automated monitoring complete!');
  } catch (error) {
    console.error('❌ Error in automated monitoring:', error);
    throw error;
  }
}

/**
 * Get all sites with automated monitoring enabled
 * Uses user's profile email automatically
 */
async function getMonitoredSites() {
  const result = await pool.query(`
    SELECT DISTINCT
      s.user_id,
      s.url,
      REGEXP_REPLACE(s.url, 'https?://(www\.)?', '') as domain,
      s.target_keywords,
      s.monitoring_enabled,
      s.auto_fix_enabled,
      s.scan_frequency,
      u.email as user_email,
      u.name as user_name
    FROM seo_scans s
    JOIN users u ON s.user_id = u.id
    WHERE s.monitoring_enabled = true
    AND s.auto_fix_enabled = true
    ORDER BY s.last_scan_at ASC NULLS FIRST
    LIMIT 10
  `);
  
  return result.rows;
}

/**
 * Run comprehensive SEO scan
 */
async function runSEOScan(site) {
  console.log(`  📈 Running SEO scan...`);
  
  try {
    const response = await axios.post('http://localhost:3001/api/seo/scan', {
      url: site.url,
      userId: site.user_id
    });

    const scanId = response.data.scanId;
    
    // Wait for scan to complete
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds
    
    // Get scan results
    const scanResponse = await axios.get(`http://localhost:3001/api/seo/scan/${scanId}`);
    
    return {
      scanId,
      score: scanResponse.data.scan.seo_score,
      issues: scanResponse.data.issues,
      criticalCount: scanResponse.data.scan.critical_issues,
      warningCount: scanResponse.data.scan.warnings
    };
  } catch (error) {
    console.error('  ❌ Scan error:', error.message);
    return null;
  }
}

/**
 * Analyze competitor websites from SERP
 */
async function analyzeCompetitors(site) {
  console.log(`  🔎 Analyzing competitors...`);
  
  const keywords = site.target_keywords || ['business', 'services'];
  const competitors = [];
  
  try {
    // Simulate SERP analysis (in production, use Google Search API or SerpAPI)
    for (const keyword of keywords.slice(0, 3)) {
      // Get top 5 competitors for this keyword
      const serpResults = await getSERPResults(keyword, site.domain);
      
      for (const competitor of serpResults) {
        // Scan competitor
        const competitorScan = await quickScan(competitor.url);
        
        competitors.push({
          keyword,
          url: competitor.url,
          position: competitor.position,
          seoScore: competitorScan.score,
          strengths: competitorScan.strengths,
          weaknesses: competitorScan.weaknesses
        });
      }
    }

    // Compare with own site
    const comparison = compareWithCompetitors(site, competitors);
    
    return {
      competitors,
      comparison,
      recommendations: generateRecommendations(comparison)
    };
  } catch (error) {
    console.error('  ❌ Competitor analysis error:', error.message);
    return { competitors: [], comparison: {}, recommendations: [] };
  }
}

/**
 * Get SERP results for keyword using DataForSEO API
 * Requires DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in .env
 */
async function getSERPResults(keyword, excludeDomain) {
  // Check if DataForSEO credentials are available
  if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
    console.log('  ⚠️  DataForSEO credentials not found, using mock data');
    // Fallback to mock data
    const mockResults = [
      { url: 'https://competitor1.com', position: 1 },
      { url: 'https://competitor2.com', position: 2 },
      { url: 'https://competitor3.com', position: 3 },
      { url: 'https://competitor4.com', position: 4 },
      { url: 'https://competitor5.com', position: 5 }
    ];
    return mockResults.filter(r => !r.url.includes(excludeDomain));
  }

  try {
    // DataForSEO API request
    const auth = Buffer.from(
      `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`
    ).toString('base64');

    const response = await axios.post(
      'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
      [{
        keyword: keyword,
        language_code: 'en',
        location_code: 2840, // United States
        device: 'desktop',
        depth: 10 // Get top 10 results
      }],
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.tasks && response.data.tasks[0].result) {
      const items = response.data.tasks[0].result[0].items || [];
      const results = items
        .filter(item => item.type === 'organic')
        .map(item => ({
          url: item.url,
          position: item.rank_group,
          title: item.title,
          description: item.description
        }))
        .filter(r => !r.url.includes(excludeDomain));

      console.log(`  ✅ Found ${results.length} SERP results for "${keyword}"`);
      return results;
    }

    // Fallback if no results
    return [];
  } catch (error) {
    console.error(`  ❌ DataForSEO API error for "${keyword}":`, error.message);
    // Return empty array on error
    return [];
  }
}

/**
 * Quick scan of competitor site
 */
async function quickScan(url) {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const html = response.data;
    
    // Analyze key SEO factors
    const hasTitle = /<title>(.+?)<\/title>/i.test(html);
    const hasMeta = /<meta\s+name=["']description["']/i.test(html);
    const hasH1 = /<h1[^>]*>(.+?)<\/h1>/i.test(html);
    const hasSchema = /application\/ld\+json/i.test(html);
    
    const score = [hasTitle, hasMeta, hasH1, hasSchema].filter(Boolean).length * 25;
    
    return {
      score,
      strengths: [
        hasTitle && 'Optimized title tag',
        hasMeta && 'Meta description present',
        hasH1 && 'Proper heading structure',
        hasSchema && 'Schema markup implemented'
      ].filter(Boolean),
      weaknesses: [
        !hasTitle && 'Missing title tag',
        !hasMeta && 'No meta description',
        !hasH1 && 'Missing H1 tag',
        !hasSchema && 'No schema markup'
      ].filter(Boolean)
    };
  } catch (error) {
    return { score: 0, strengths: [], weaknesses: ['Site unreachable'] };
  }
}

/**
 * Compare site with competitors
 */
function compareWithCompetitors(site, competitors) {
  const avgCompetitorScore = competitors.reduce((sum, c) => sum + c.seoScore, 0) / competitors.length;
  
  return {
    yourScore: site.current_score || 0,
    avgCompetitorScore,
    gap: avgCompetitorScore - (site.current_score || 0),
    position: competitors.findIndex(c => c.url === site.url) + 1 || 'Not in top 10'
  };
}

/**
 * Generate recommendations based on competitor analysis
 */
function generateRecommendations(comparison) {
  const recommendations = [];
  
  if (comparison.gap > 20) {
    recommendations.push({
      priority: 'high',
      action: 'Improve meta descriptions',
      reason: 'Competitors have better optimized meta tags',
      impact: 'High'
    });
  }
  
  if (comparison.gap > 10) {
    recommendations.push({
      priority: 'medium',
      action: 'Add schema markup',
      reason: 'Most competitors use structured data',
      impact: 'Medium'
    });
  }
  
  recommendations.push({
    priority: 'low',
    action: 'Optimize heading structure',
    reason: 'Improve content hierarchy',
    impact: 'Low'
  });
  
  return recommendations;
}

/**
 * Automatically apply fixes based on scan and competitor analysis
 */
async function autoApplyFixes(site, scanResults, competitorAnalysis) {
  console.log(`  ⚡ Auto-applying fixes...`);
  
  if (!scanResults || !scanResults.issues) {
    return [];
  }

  const appliedFixes = [];
  const siteId = site.domain.replace(/\./g, '-') + '-001';
  
  // Filter auto-fixable issues
  const autoFixableCategories = ['title', 'meta', 'headings', 'images', 'schema', 'technical'];
  const fixableIssues = scanResults.issues.filter(issue => 
    autoFixableCategories.includes(issue.category)
  );

  console.log(`  📋 Found ${fixableIssues.length} auto-fixable issue(s)`);

  for (const issue of fixableIssues) {
    try {
      const fixData = prepareFix(issue, site, competitorAnalysis);
      
      // Apply fix via widget API
      const response = await axios.post('http://localhost:3001/api/seo/widget/fixes/apply', {
        siteId,
        domain: site.domain,
        scanId: scanResults.scanId,
        fixType: issue.category,
        fixData,
        priority: issue.severity === 'critical' ? 80 : 50
      });

      if (response.data.success) {
        appliedFixes.push({
          issue: issue.title,
          category: issue.category,
          before: issue.current_value || 'Not set',
          after: fixData.optimized_content || 'Schema markup',
          status: 'applied'
        });
        console.log(`    ✅ Applied: ${issue.title}`);
      }
    } catch (error) {
      console.error(`    ❌ Failed to apply fix for ${issue.title}:`, error.message);
      appliedFixes.push({
        issue: issue.title,
        status: 'failed',
        error: error.message
      });
    }
  }

  return appliedFixes;
}

/**
 * Prepare fix data based on issue and competitor insights
 */
function prepareFix(issue, site, competitorAnalysis) {
  const domain = site.domain;
  
  if (issue.category === 'title') {
    return {
      optimized_content: `${domain} - Professional Services | Top Rated`
    };
  } else if (issue.category === 'meta') {
    return {
      optimized_content: `Discover quality services at ${domain}. Professional solutions tailored to your needs. Contact us today for expert assistance.`
    };
  } else if (issue.category === 'headings') {
    return {
      optimized_content: `Welcome to ${domain} - Your Trusted Partner`
    };
  } else if (issue.category === 'images') {
    return {
      optimized_content: 'Professional service image',
      selector: 'img:not([alt])'
    };
  } else if (issue.category === 'schema') {
    return {
      schema: {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": domain,
        "url": site.url,
        "description": `Professional services by ${domain}`
      }
    };
  }
  
  return { optimized_content: issue.recommendation || 'Optimized content' };
}

/**
 * Track ranking changes over time
 */
async function trackRankings(site) {
  console.log(`  📊 Tracking rankings...`);
  
  try {
    // Get historical ranking data
    const result = await pool.query(`
      SELECT 
        keyword,
        position,
        recorded_at
      FROM ranking_history
      WHERE domain = $1
      ORDER BY recorded_at DESC
      LIMIT 30
    `, [site.domain]);

    const rankings = result.rows;
    
    // Calculate trends
    const trends = calculateRankingTrends(rankings);
    
    return {
      current: rankings.slice(0, 5),
      trends,
      improvement: trends.avgChange > 0
    };
  } catch (error) {
    console.error('  ❌ Ranking tracking error:', error.message);
    return { current: [], trends: {}, improvement: false };
  }
}

/**
 * Calculate ranking trends
 */
function calculateRankingTrends(rankings) {
  if (rankings.length < 2) {
    return { avgChange: 0, direction: 'stable' };
  }

  const changes = [];
  for (let i = 0; i < rankings.length - 1; i++) {
    changes.push(rankings[i].position - rankings[i + 1].position);
  }

  const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;
  
  return {
    avgChange: avgChange.toFixed(2),
    direction: avgChange > 0 ? 'improving' : avgChange < 0 ? 'declining' : 'stable',
    totalChange: rankings[0].position - rankings[rankings.length - 1].position
  };
}

/**
 * Send comprehensive email report
 * Uses user's profile email automatically
 */
async function sendEmailReport(site, data) {
  console.log(`  📧 Sending email report to ${site.user_email}...`);
  
  const { scanResults, competitorAnalysis, appliedFixes, rankingData } = data;
  const userName = site.user_name || 'there';
  
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
    .fix-item { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 3px solid #10b981; }
    .success { color: #10b981; }
    .warning { color: #f59e0b; }
    .error { color: #ef4444; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Automated SEO Report</h1>
      <p>${site.domain}</p>
      <p>${new Date().toLocaleDateString()}</p>
    </div>

    <div class="greeting">
      <p>Hi ${userName},</p>
      <p>Your website was automatically scanned and optimized. Here's what happened:</p>
    </div>

    <div class="section">
      <h2>📊 Scan Results</h2>
      <div class="metric">
        <div class="metric-value">${scanResults?.score || 0}</div>
        <div class="metric-label">SEO Score</div>
      </div>
      <div class="metric">
        <div class="metric-value error">${scanResults?.criticalCount || 0}</div>
        <div class="metric-label">Critical Issues</div>
      </div>
      <div class="metric">
        <div class="metric-value warning">${scanResults?.warningCount || 0}</div>
        <div class="metric-label">Warnings</div>
      </div>
    </div>

    <div class="section">
      <h2>🔍 Competitor Analysis</h2>
      <p><strong>Your Score:</strong> ${competitorAnalysis?.comparison?.yourScore || 0}</p>
      <p><strong>Avg Competitor Score:</strong> ${competitorAnalysis?.comparison?.avgCompetitorScore?.toFixed(1) || 0}</p>
      <p><strong>Gap:</strong> <span class="${competitorAnalysis?.comparison?.gap > 0 ? 'error' : 'success'}">${competitorAnalysis?.comparison?.gap?.toFixed(1) || 0} points</span></p>
      
      <h3>Top Recommendations:</h3>
      ${competitorAnalysis?.recommendations?.map(rec => `
        <div style="margin: 10px 0;">
          <strong>${rec.action}</strong><br>
          <small>${rec.reason} (Impact: ${rec.impact})</small>
        </div>
      `).join('') || '<p>No recommendations</p>'}
    </div>

    <div class="section">
      <h2>⚡ Auto-Applied Fixes (${appliedFixes?.length || 0})</h2>
      ${appliedFixes?.map(fix => `
        <div class="fix-item">
          <strong class="success">✓ ${fix.issue}</strong><br>
          <small><strong>Before:</strong> ${fix.before}</small><br>
          <small><strong>After:</strong> ${fix.after}</small>
        </div>
      `).join('') || '<p>No fixes applied</p>'}
    </div>

    <div class="section">
      <h2>📈 Ranking Impact</h2>
      <p><strong>Trend:</strong> <span class="${rankingData?.trends?.direction === 'improving' ? 'success' : 'warning'}">${rankingData?.trends?.direction || 'stable'}</span></p>
      <p><strong>Average Change:</strong> ${rankingData?.trends?.avgChange || 0} positions</p>
      <p><strong>Status:</strong> ${rankingData?.improvement ? '✅ Improving' : '⚠️ Needs attention'}</p>
    </div>

    <div class="footer">
      <p>This is an automated report from OrganiTraffic SEO Monitoring</p>
      <p><a href="${process.env.APP_URL || 'https://organitrafficboost.com'}/seo-dashboard">View Full Dashboard</a></p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: '"OrganiTraffic SEO" <seo@organitrafficboost.com>',
      to: site.user_email, // Uses user's profile email automatically
      subject: `🚀 SEO Report: ${appliedFixes?.length || 0} Fixes Applied | ${site.domain}`,
      html: emailHtml
    });

    console.log(`  ✅ Email sent to ${site.user_email}`);
    
    // Log email in database
    await pool.query(`
      INSERT INTO email_reports (user_id, domain, report_type, email_to, subject, fixes_count, issues_found, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      site.user_id,
      site.domain,
      'automated_scan',
      site.user_email,
      `SEO Report: ${appliedFixes?.length || 0} Fixes Applied`,
      appliedFixes?.length || 0,
      (scanResults?.criticalCount || 0) + (scanResults?.warningCount || 0),
      'sent'
    ]);
  } catch (error) {
    console.error('  ❌ Email error:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  runAutomatedMonitoring()
    .then(() => {
      console.log('\n✅ Monitoring complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Monitoring failed:', error);
      process.exit(1);
    });
}

module.exports = { runAutomatedMonitoring };
