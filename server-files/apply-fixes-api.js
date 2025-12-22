// API for applying SEO fixes
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * POST /api/seo/apply-fix
 * Apply a single auto-fix
 */
router.post('/apply-fix', async (req, res) => {
  try {
    const { userId, scanId, issueId, pageUrl, fixType } = req.body;

    if (!userId || !scanId || !issueId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    // Get the issue details
    const issueResult = await pool.query(
      'SELECT * FROM seo_issues WHERE id = $1 AND scan_id = $2',
      [issueId, scanId]
    );

    if (issueResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    const issue = issueResult.rows[0];

    // Check if fix already exists
    const existingFix = await pool.query(
      'SELECT * FROM seo_fixes WHERE issue_id = $1',
      [issueId]
    );

    if (existingFix.rows.length > 0) {
      // Update existing fix status
      await pool.query(
        `UPDATE seo_fixes 
         SET status = 'applied', applied_at = NOW()
         WHERE issue_id = $1`,
        [issueId]
      );
    } else {
      // Generate and store the fix
      const fixCode = generateFixCode(issue);

      await pool.query(
        `INSERT INTO seo_fixes 
         (scan_id, issue_id, user_id, fix_type, fix_code, status, applied_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [scanId, issueId, userId, 'javascript', fixCode, 'applied']
      );
    }

    res.json({
      success: true,
      message: 'Fix applied successfully'
    });

  } catch (error) {
    console.error('Error applying fix:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/seo/apply-all-fixes
 * Apply all safe fixes for a scan
 */
router.post('/apply-all-fixes', async (req, res) => {
  try {
    const { userId, scanId } = req.body;

    if (!userId || !scanId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    // Get all issues for this scan
    const issuesResult = await pool.query(
      `SELECT * FROM seo_issues 
       WHERE scan_id = $1 
       AND severity IN ('critical', 'high', 'warning')
       ORDER BY 
         CASE severity 
           WHEN 'critical' THEN 1 
           WHEN 'high' THEN 2 
           WHEN 'warning' THEN 3 
           ELSE 4 
         END`,
      [scanId]
    );

    let appliedCount = 0;
    let skippedCount = 0;

    for (const issue of issuesResult.rows) {
      // Skip issues that can't be auto-fixed
      if (issue.title === 'No Internal Links') {
        skippedCount++;
        continue;
      }

      // Check if fix already exists
      const existingFix = await pool.query(
        'SELECT * FROM seo_fixes WHERE issue_id = $1',
        [issue.id]
      );

      if (existingFix.rows.length > 0) {
        // Update status
        await pool.query(
          `UPDATE seo_fixes 
           SET status = 'applied', applied_at = NOW()
           WHERE issue_id = $1`,
          [issue.id]
        );
      } else {
        // Generate and store fix
        const fixCode = generateFixCode(issue);

        await pool.query(
          `INSERT INTO seo_fixes 
           (scan_id, issue_id, user_id, fix_type, fix_code, status, applied_at, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [scanId, issue.id, userId, 'javascript', fixCode, 'applied']
        );
      }

      appliedCount++;
    }

    res.json({
      success: true,
      appliedCount,
      skippedCount,
      message: `Applied ${appliedCount} fixes, skipped ${skippedCount}`
    });

  } catch (error) {
    console.error('Error applying all fixes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generate fix code for an issue
 */
function generateFixCode(issue) {
  const { title, category, current_value, page_url } = issue;

  switch (title) {
    case 'Missing H1 Heading':
      return `
// Auto-fix: Add H1 heading
(function() {
  if (!document.querySelector('h1')) {
    const h1 = document.createElement('h1');
    h1.textContent = document.title || 'Welcome';
    h1.style.cssText = 'font-size: 2em; font-weight: bold; margin: 20px 0;';
    const main = document.querySelector('main') || document.querySelector('.content') || document.body;
    main.insertBefore(h1, main.firstChild);
  }
})();
`;

    case 'Missing Meta Description':
      return `
// Auto-fix: Add meta description
(function() {
  const meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    const newMeta = document.createElement('meta');
    newMeta.name = 'description';
    newMeta.content = document.title + ' - Discover more about our services and offerings.';
    document.head.appendChild(newMeta);
  }
})();
`;

    case 'Meta Description Too Short':
      return `
// Auto-fix: Expand meta description
(function() {
  const meta = document.querySelector('meta[name="description"]');
  if (meta && meta.content.length < 120) {
    meta.content = meta.content + ' Learn more about our comprehensive services, expert solutions, and how we can help you achieve your goals.';
  }
})();
`;

    case 'Meta Description Too Long':
      return `
// Auto-fix: Shorten meta description
(function() {
  const meta = document.querySelector('meta[name="description"]');
  if (meta && meta.content.length > 160) {
    meta.content = meta.content.substring(0, 157) + '...';
  }
})();
`;

    case 'Title Too Short':
      return `
// Auto-fix: Expand title
(function() {
  if (document.title.length < 50) {
    document.title = document.title + ' | Professional Services';
  }
})();
`;

    case 'Title Too Long':
      return `
// Auto-fix: Shorten title
(function() {
  if (document.title.length > 60) {
    document.title = document.title.substring(0, 57) + '...';
  }
})();
`;

    case 'Missing Canonical Tag':
      return `
// Auto-fix: Add canonical tag
(function() {
  if (!document.querySelector('link[rel="canonical"]')) {
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = window.location.href.split('?')[0];
    document.head.appendChild(canonical);
  }
})();
`;

    case 'Incomplete Open Graph Tags':
      return `
// Auto-fix: Add Open Graph tags
(function() {
  const ogTags = {
    'og:title': document.title,
    'og:description': document.querySelector('meta[name="description"]')?.content || document.title,
    'og:url': window.location.href,
    'og:type': 'website'
  };
  
  Object.entries(ogTags).forEach(([property, content]) => {
    if (!document.querySelector(\`meta[property="\${property}"]\`)) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', property);
      meta.content = content;
      document.head.appendChild(meta);
    }
  });
})();
`;

    case 'No Schema Markup':
      return `
// Auto-fix: Add basic Schema.org markup
(function() {
  if (!document.querySelector('script[type="application/ld+json"]')) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": document.title,
      "description": document.querySelector('meta[name="description"]')?.content || document.title,
      "url": window.location.href
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }
})();
`;

    default:
      return `// No auto-fix available for: ${title}`;
  }
}

module.exports = router;
