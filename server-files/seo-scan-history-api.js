// server-files/seo-scan-history-api.js
// API endpoints for saving and loading SEO scan history

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * POST /api/seo/save-scan
 * Save scan results to database
 */
router.post('/save-scan', async (req, res) => {
  try {
    const { userId, url, score, issues, summary, pageData } = req.body;

    if (!userId || !url) {
      return res.status(400).json({
        success: false,
        error: 'userId and url are required'
      });
    }

    // Save scan to database
    const result = await pool.query(
      `INSERT INTO seo_scan_history 
       (user_id, url, score, issues, summary, page_data, scanned_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, scanned_at`,
      [userId, url, score, JSON.stringify(issues), JSON.stringify(summary), JSON.stringify(pageData)]
    );

    res.json({
      success: true,
      scanId: result.rows[0].id,
      scannedAt: result.rows[0].scanned_at
    });

  } catch (error) {
    console.error('Error saving scan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save scan'
    });
  }
});

/**
 * GET /api/seo/scan-history
 * Get scan history for a user and URL
 */
router.get('/scan-history', async (req, res) => {
  try {
    const { userId, url } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    let query = `
      SELECT id, url, score, issues, summary, page_data, scanned_at
      FROM seo_scan_history
      WHERE user_id = $1
    `;
    
    const params = [userId];

    if (url) {
      query += ` AND url = $2`;
      params.push(url);
    }

    query += ` ORDER BY scanned_at DESC LIMIT 10`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      scans: result.rows
    });

  } catch (error) {
    console.error('Error fetching scan history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scan history'
    });
  }
});

/**
 * GET /api/seo/scan/:scanId
 * Get specific scan by ID
 */
router.get('/scan/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;

    const result = await pool.query(
      `SELECT * FROM seo_scan_history WHERE id = $1`,
      [scanId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found'
      });
    }

    res.json({
      success: true,
      scan: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching scan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scan'
    });
  }
});

module.exports = router;
