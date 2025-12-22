// Auto-Fix Widget API
// Serves auto-generated SEO fixes to the widget script
// Each website gets ONLY its own fixes (filtered by domain)

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/**
 * GET /api/widget/auto-fixes
 * Get auto-fixes for a specific domain
 * Called by the widget script on the live website
 */
router.get('/auto-fixes', async (req, res) => {
  try {
    const { domain, siteId } = req.query;
    
    if (!domain && !siteId) {
      return res.status(400).json({
        success: false,
        error: 'domain or siteId parameter required'
      });
    }
    
    console.log(`📦 Widget requesting fixes for: ${domain || siteId}`);
    
    // Get the latest scan for this domain
    let scanQuery;
    let scanParams;
    
    if (siteId) {
      // If siteId provided, use it directly
      scanQuery = `
        SELECT id, url, domain 
        FROM seo_scans 
        WHERE id = $1 
        LIMIT 1
      `;
      scanParams = [siteId];
    } else {
      // Otherwise, find latest scan by domain
      scanQuery = `
        SELECT id, url, domain 
        FROM seo_scans 
        WHERE domain = $1 OR url LIKE $2
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      scanParams = [domain, `%${domain}%`];
    }
    
    const scanResult = await pool.query(scanQuery, scanParams);
    
    if (scanResult.rows.length === 0) {
      return res.json({
        success: true,
        fixes: [],
        message: 'No scans found for this domain. Run a scan first.',
        domain: domain
      });
    }
    
    const scan = scanResult.rows[0];
    const scanId = scan.id;
    
    // Get all applied fixes for this scan (changed from 'pending' to 'applied')
    const fixesResult = await pool.query(
      `SELECT 
        f.id,
        f.fix_type,
        f.fix_code,
        f.status,
        f.created_at,
        i.title as issue_title,
        i.severity,
        i.category,
        i.page_url
       FROM seo_fixes f
       JOIN seo_issues i ON f.issue_id = i.id
       WHERE f.scan_id = $1 
       AND f.status = 'applied'
       AND f.fix_code IS NOT NULL
       ORDER BY 
         CASE i.severity 
           WHEN 'critical' THEN 1 
           WHEN 'high' THEN 2 
           WHEN 'warning' THEN 3 
           ELSE 4 
         END,
         f.created_at DESC`,
      [scanId]
    );
    
    const fixes = fixesResult.rows;
    
    console.log(`✅ Found ${fixes.length} fixes for ${scan.domain}`);
    
    // Generate combined script
    const combinedScript = generateCombinedScript(fixes, scan);
    
    // Return as JavaScript (not JSON) so browser can execute it
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(combinedScript);
    
  } catch (error) {
    console.error('❌ Error serving auto-fixes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generate combined JavaScript from all fixes
 */
function generateCombinedScript(fixes, scan) {
  if (fixes.length === 0) {
    return `
// No SEO fixes needed for ${scan.domain}
console.log('✅ No SEO fixes to apply');
`;
  }
  
  const script = `
// SEO Auto-Fix Script
// Domain: ${scan.domain}
// Scan ID: ${scan.id}
// Total Fixes: ${fixes.length}
// Generated: ${new Date().toISOString()}

(function() {
  'use strict';
  
  // Only run on matching domain
  const currentDomain = window.location.hostname.replace('www.', '');
  const targetDomain = '${scan.domain}'.replace('www.', '');
  
  if (!currentDomain.includes(targetDomain)) {
    console.log('⏭️  SEO fixes skipped (domain mismatch)');
    return;
  }
  
  console.log('🚀 OrganiTrafficBoost: Applying ${fixes.length} SEO fixes...');
  
  let appliedCount = 0;
  let errorCount = 0;
  
  ${fixes.map((fix, idx) => `
  // Fix ${idx + 1}: ${fix.issue_title}
  // Severity: ${fix.severity} | Category: ${fix.category}
  try {
    ${fix.fix_code}
    console.log('✅ SEO Fix Applied: ${fix.issue_title}');
    appliedCount++;
  } catch (error) {
    console.error('❌ Fix ${idx + 1} failed:', error);
    errorCount++;
  }
  `).join('\n')}
  
  console.log(\`✅ SEO Fixes Applied: \${appliedCount}/${fixes.length}\`);
  if (errorCount > 0) {
    console.warn(\`⚠️  \${errorCount} fixes failed\`);
  }
  
  // Track fix application
  if (window.gtag) {
    gtag('event', 'seo_fixes_applied', {
      'domain': '${scan.domain}',
      'fixes_count': appliedCount,
      'scan_id': ${scan.id}
    });
  }
  
})();
`;
  
  return script;
}

/**
 * POST /api/widget/mark-applied
 * Mark a fix as applied (called by widget after successful application)
 */
router.post('/mark-applied', async (req, res) => {
  try {
    const { fixId, scanId } = req.body;
    
    if (fixId) {
      await pool.query(
        `UPDATE seo_fixes 
         SET status = 'applied', applied_at = NOW()
         WHERE id = $1`,
        [fixId]
      );
    } else if (scanId) {
      await pool.query(
        `UPDATE seo_fixes 
         SET status = 'applied', applied_at = NOW()
         WHERE scan_id = $1 AND status = 'pending'`,
        [scanId]
      );
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Error marking fix as applied:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
