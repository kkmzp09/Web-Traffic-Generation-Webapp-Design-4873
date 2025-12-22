// Generate Auto-Fix JavaScript for SEO Issues
// This generates the actual JS code that will fix issues on the live website

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/**
 * Generate auto-fix JavaScript code for an SEO issue
 */
function generateFixCode(issue) {
  const fixes = {
    // H1 Heading Fixes
    'Missing H1 Heading': () => `
// Auto-fix: Add H1 heading
(function() {
  if (!document.querySelector('h1')) {
    const h1 = document.createElement('h1');
    h1.textContent = document.title || 'Welcome';
    h1.style.cssText = 'font-size: 2em; font-weight: bold; margin: 20px 0;';
    const main = document.querySelector('main') || document.querySelector('.content') || document.body;
    main.insertBefore(h1, main.firstChild);
    console.log('✅ SEO Fix Applied: Added H1 heading');
  }
})();`,

    // Meta Description Fixes
    'Missing Meta Description': () => `
// Auto-fix: Add meta description
(function() {
  if (!document.querySelector('meta[name="description"]')) {
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = '${issue.recommended_value || 'Discover our services and solutions. Contact us today for more information.'}';
    document.head.appendChild(meta);
    console.log('✅ SEO Fix Applied: Added meta description');
  }
})();`,

    'Meta Description Too Short': () => `
// Auto-fix: Update meta description
(function() {
  const meta = document.querySelector('meta[name="description"]');
  if (meta && meta.content.length < 120) {
    meta.content = '${issue.recommended_value || issue.current_value + ' - Learn more about our services, products, and solutions. Contact us today for expert assistance.'}';
    console.log('✅ SEO Fix Applied: Updated meta description length');
  }
})();`,

    // Title Fixes
    'Title Too Short': () => `
// Auto-fix: Extend page title
(function() {
  if (document.title.length < 50) {
    document.title = '${issue.current_value} | ${new URL(issue.page_url).hostname}';
    console.log('✅ SEO Fix Applied: Extended page title');
  }
})();`,

    'Title Too Long': () => `
// Auto-fix: Shorten page title
(function() {
  if (document.title.length > 60) {
    document.title = document.title.substring(0, 57) + '...';
    console.log('✅ SEO Fix Applied: Shortened page title');
  }
})();`,

    // Canonical Tag
    'Missing Canonical Tag': () => `
// Auto-fix: Add canonical tag
(function() {
  if (!document.querySelector('link[rel="canonical"]')) {
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = window.location.href.split('?')[0].split('#')[0];
    document.head.appendChild(canonical);
    console.log('✅ SEO Fix Applied: Added canonical tag');
  }
})();`,

    // Open Graph Tags
    'Incomplete Open Graph Tags': () => `
// Auto-fix: Add Open Graph tags
(function() {
  const ogTags = {
    'og:title': document.title,
    'og:description': document.querySelector('meta[name="description"]')?.content || '',
    'og:url': window.location.href,
    'og:type': 'website',
    'og:image': document.querySelector('img')?.src || ''
  };
  
  Object.entries(ogTags).forEach(([property, content]) => {
    if (!document.querySelector(\`meta[property="\${property}"]\`) && content) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', property);
      meta.content = content;
      document.head.appendChild(meta);
    }
  });
  console.log('✅ SEO Fix Applied: Added Open Graph tags');
})();`,

    // Schema Markup
    'No Schema Markup': () => `
// Auto-fix: Add basic Schema.org markup
(function() {
  if (!document.querySelector('script[type="application/ld+json"]')) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": document.title,
      "description": document.querySelector('meta[name="description"]')?.content || '',
      "url": window.location.href
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
    console.log('✅ SEO Fix Applied: Added Schema.org markup');
  }
})();`
  };

  return fixes[issue.title] ? fixes[issue.title]() : null;
}

/**
 * Generate auto-fixes for all issues in a scan
 */
async function generateAutoFixesForScan(scanId) {
  try {
    console.log(`\n🔧 Generating auto-fixes for scan ${scanId}...\n`);
    
    // Get scan info to get user_id
    const scanInfo = await pool.query(
      'SELECT user_id FROM seo_scans WHERE id = $1',
      [scanId]
    );
    
    if (scanInfo.rows.length === 0) {
      throw new Error(`Scan ${scanId} not found`);
    }
    
    const userId = scanInfo.rows[0].user_id;
    
    // Get all issues for this scan
    const issuesResult = await pool.query(
      `SELECT * FROM seo_issues WHERE scan_id = $1 AND severity IN ('critical', 'high', 'warning')`,
      [scanId]
    );
    
    const issues = issuesResult.rows;
    console.log(`Found ${issues.length} issues to fix\n`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const issue of issues) {
      // Check if fix already exists
      const existingFix = await pool.query(
        'SELECT id FROM seo_fixes WHERE issue_id = $1',
        [issue.id]
      );
      
      if (existingFix.rows.length > 0) {
        console.log(`⏭️  Skipping ${issue.title} (fix already exists)`);
        skippedCount++;
        continue;
      }
      
      // Generate fix code
      const fixCode = generateFixCode(issue);
      
      if (!fixCode) {
        console.log(`⚠️  No auto-fix available for: ${issue.title}`);
        skippedCount++;
        continue;
      }
      
      // Store fix in database
      await pool.query(
        `INSERT INTO seo_fixes 
         (scan_id, issue_id, user_id, fix_type, fix_code, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [scanId, issue.id, userId, 'javascript', fixCode, 'pending']
      );
      
      console.log(`✅ Generated fix for: ${issue.title}`);
      fixedCount++;
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Fixes Generated: ${fixedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`\n✅ Auto-fix generation complete!\n`);
    
    return { fixedCount, skippedCount };
    
  } catch (error) {
    console.error('❌ Error generating auto-fixes:', error);
    throw error;
  }
}

/**
 * Get combined fix script for a scan (all fixes in one script)
 */
async function getCombinedFixScript(scanId) {
  try {
    const result = await pool.query(
      `SELECT f.fix_code, i.title, i.page_url
       FROM seo_fixes f
       JOIN seo_issues i ON f.issue_id = i.id
       WHERE f.scan_id = $1 AND f.status = 'pending'
       ORDER BY i.severity DESC`,
      [scanId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Combine all fixes into one script
    const combinedScript = `
// SEO Auto-Fix Script - Generated by OrganiTrafficBoost
// Scan ID: ${scanId}
// Total Fixes: ${result.rows.length}
// Generated: ${new Date().toISOString()}

(function() {
  'use strict';
  
  console.log('🚀 Applying ${result.rows.length} SEO fixes...');
  
  ${result.rows.map((row, idx) => `
  // Fix ${idx + 1}: ${row.title}
  // Page: ${row.page_url}
  ${row.fix_code}
  `).join('\n')}
  
  console.log('✅ All SEO fixes applied successfully!');
})();
`;
    
    return combinedScript;
    
  } catch (error) {
    console.error('Error getting combined fix script:', error);
    throw error;
  }
}

module.exports = {
  generateAutoFixesForScan,
  getCombinedFixScript,
  generateFixCode
};
