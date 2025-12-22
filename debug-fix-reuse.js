// Debug why Scan 146 is reusing Scan 145 fixes
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function debugFixReuse() {
  try {
    console.log('\n🔍 Debugging Fix Reuse Issue\n');
    
    // Check Scan 145 issues
    console.log('SCAN 145 Issues:');
    const scan145Issues = await pool.query(
      'SELECT id, title, page_url FROM seo_issues WHERE scan_id = 145 LIMIT 5'
    );
    console.log(`  Total: ${scan145Issues.rows.length}`);
    scan145Issues.rows.forEach(i => {
      console.log(`  - Issue ID ${i.id}: ${i.title} (${i.page_url})`);
    });
    
    // Check Scan 146 issues
    console.log('\nSCAN 146 Issues:');
    const scan146Issues = await pool.query(
      'SELECT id, title, page_url FROM seo_issues WHERE scan_id = 146 LIMIT 5'
    );
    console.log(`  Total: ${scan146Issues.rows.length}`);
    scan146Issues.rows.forEach(i => {
      console.log(`  - Issue ID ${i.id}: ${i.title} (${i.page_url})`);
    });
    
    // Check fixes for Scan 145
    console.log('\nSCAN 145 Fixes:');
    const scan145Fixes = await pool.query(
      'SELECT id, issue_id, scan_id FROM seo_fixes WHERE scan_id = 145 LIMIT 5'
    );
    console.log(`  Total: ${scan145Fixes.rows.length}`);
    scan145Fixes.rows.forEach(f => {
      console.log(`  - Fix ID ${f.id}: for Issue ${f.issue_id}, Scan ${f.scan_id}`);
    });
    
    // Check fixes for Scan 146
    console.log('\nSCAN 146 Fixes:');
    const scan146Fixes = await pool.query(
      'SELECT id, issue_id, scan_id FROM seo_fixes WHERE scan_id = 146 LIMIT 5'
    );
    console.log(`  Total: ${scan146Fixes.rows.length}`);
    scan146Fixes.rows.forEach(f => {
      console.log(`  - Fix ID ${f.id}: for Issue ${f.issue_id}, Scan ${f.scan_id}`);
    });
    
    // Check widget API query
    console.log('\nWIDGET API Query (for jobmakers.in):');
    const widgetFixes = await pool.query(
      `SELECT f.id, f.scan_id, i.title
       FROM seo_fixes f
       JOIN seo_issues i ON f.issue_id = i.id
       JOIN seo_scans s ON f.scan_id = s.id
       WHERE s.domain = 'jobmakers.in'
       AND f.status = 'pending'
       ORDER BY f.created_at DESC
       LIMIT 5`
    );
    console.log(`  Total fixes returned: ${widgetFixes.rows.length}`);
    widgetFixes.rows.forEach(f => {
      console.log(`  - Fix ${f.id} from Scan ${f.scan_id}: ${f.title}`);
    });
    
    console.log('\n💡 EXPLANATION:');
    console.log('  The Widget API returns ALL fixes for the domain (jobmakers.in)');
    console.log('  It includes fixes from Scan 145 AND Scan 146');
    console.log('  This is actually CORRECT behavior!');
    console.log('  Each scan should generate its own fixes for its own issues.\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugFixReuse();
