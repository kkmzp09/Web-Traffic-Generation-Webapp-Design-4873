// API for managing user websites
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Subscription website limits
const WEBSITE_LIMITS = {
  seo_starter: 3,
  seo_professional: 10,
  seo_business: 50
};

/**
 * GET /api/websites
 * Get all websites for a user
 */
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    // Get user's subscription plan
    const userResult = await pool.query(
      `SELECT subscription_plan FROM users WHERE id = $1`,
      [userId]
    );

    const subscriptionPlan = userResult.rows[0]?.subscription_plan || 'seo_starter';
    const websiteLimit = WEBSITE_LIMITS[subscriptionPlan] || 3;

    // Get user's websites
    const websitesResult = await pool.query(
      `SELECT * FROM user_websites 
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      websites: websitesResult.rows,
      limit: websiteLimit,
      count: websitesResult.rows.length,
      canAddMore: websitesResult.rows.length < websiteLimit
    });

  } catch (error) {
    console.error('Get websites error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/websites
 * Add a new website
 */
router.post('/', async (req, res) => {
  try {
    const { userId, url } = req.body;

    if (!userId || !url) {
      return res.status(400).json({ success: false, error: 'userId and url are required' });
    }

    // Validate URL
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid URL format' });
    }

    const domain = parsedUrl.hostname.replace('www.', '');

    // Check subscription limit
    const userResult = await pool.query(
      `SELECT subscription_plan FROM users WHERE id = $1`,
      [userId]
    );

    const subscriptionPlan = userResult.rows[0]?.subscription_plan || 'seo_starter';
    const websiteLimit = WEBSITE_LIMITS[subscriptionPlan] || 3;

    // Count existing websites
    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM user_websites 
       WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    const currentCount = parseInt(countResult.rows[0].count);

    if (currentCount >= websiteLimit) {
      return res.status(403).json({
        success: false,
        error: 'Website limit reached',
        limit: websiteLimit,
        current: currentCount,
        message: `Your ${subscriptionPlan.replace('seo_', '')} plan allows ${websiteLimit} websites. Upgrade to add more.`
      });
    }

    // Check if website already exists
    const existingResult = await pool.query(
      `SELECT * FROM user_websites WHERE user_id = $1 AND domain = $2`,
      [userId, domain]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Website already exists',
        website: existingResult.rows[0]
      });
    }

    // Add website
    const insertResult = await pool.query(
      `INSERT INTO user_websites (user_id, domain, url, widget_status)
       VALUES ($1, $2, $3, 'checking')
       RETURNING *`,
      [userId, domain, url]
    );

    const website = insertResult.rows[0];

    // Check widget status in background
    checkWidgetStatus(website.id, url);

    res.json({
      success: true,
      website,
      message: 'Website added successfully. Checking widget status...'
    });

  } catch (error) {
    console.error('Add website error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/websites/:id
 * Remove a website
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    // Soft delete
    await pool.query(
      `UPDATE user_websites 
       SET status = 'deleted', updated_at = NOW()
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    res.json({ success: true, message: 'Website removed successfully' });

  } catch (error) {
    console.error('Delete website error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/websites/:id/check-widget
 * Check widget status for a website
 */
router.post('/:id/check-widget', async (req, res) => {
  try {
    const { id } = req.params;

    const websiteResult = await pool.query(
      `SELECT * FROM user_websites WHERE id = $1`,
      [id]
    );

    if (websiteResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Website not found' });
    }

    const website = websiteResult.rows[0];

    // Update status to checking
    await pool.query(
      `UPDATE user_websites SET widget_status = 'checking' WHERE id = $1`,
      [id]
    );

    // Check widget in background
    checkWidgetStatus(id, website.url);

    res.json({ success: true, message: 'Checking widget status...' });

  } catch (error) {
    console.error('Check widget error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Background function to check widget status
 */
async function checkWidgetStatus(websiteId, url) {
  try {
    const response = await fetch('https://api.organitrafficboost.com/api/seo/validate-widget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await response.json();
    const widgetStatus = data.widgetInstalled ? 'connected' : 'not_connected';

    await pool.query(
      `UPDATE user_websites 
       SET widget_status = $1, last_widget_check = NOW(), updated_at = NOW()
       WHERE id = $2`,
      [widgetStatus, websiteId]
    );

    console.log(`✅ Widget check complete for website ${websiteId}: ${widgetStatus}`);

  } catch (error) {
    console.error(`❌ Widget check failed for website ${websiteId}:`, error);
    
    await pool.query(
      `UPDATE user_websites 
       SET widget_status = 'not_connected', last_widget_check = NOW()
       WHERE id = $1`,
      [websiteId]
    );
  }
}

module.exports = router;
