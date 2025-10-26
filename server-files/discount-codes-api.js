// server-files/discount-codes-api.js
// Discount code system for testing and promotions

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * POST /api/discount/validate
 * Validate a discount code
 */
router.post('/validate', async (req, res) => {
  try {
    const { code, userId } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Discount code is required'
      });
    }

    // Check if code exists and is active
    const result = await pool.query(
      `SELECT * FROM discount_codes 
       WHERE code = $1 
       AND active = true 
       AND (expires_at IS NULL OR expires_at > NOW())
       AND (max_uses IS NULL OR uses < max_uses)`,
      [code.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: false,
        error: 'Invalid or expired discount code'
      });
    }

    const discount = result.rows[0];

    // Check if user has already used this code
    if (userId) {
      const usageCheck = await pool.query(
        `SELECT * FROM discount_code_usage 
         WHERE discount_code_id = $1 AND user_id = $2`,
        [discount.id, userId]
      );

      if (usageCheck.rows.length > 0 && !discount.allow_multiple_uses) {
        return res.json({
          success: false,
          error: 'You have already used this discount code'
        });
      }
    }

    res.json({
      success: true,
      discount: {
        code: discount.code,
        type: discount.discount_type,
        value: discount.discount_value,
        description: discount.description
      }
    });

  } catch (error) {
    console.error('Validate discount error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/discount/apply
 * Apply a discount code to a purchase
 */
router.post('/apply', async (req, res) => {
  try {
    const { code, userId, amount } = req.body;

    if (!code || !userId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Code, userId, and amount are required'
      });
    }

    // Validate code
    const result = await pool.query(
      `SELECT * FROM discount_codes 
       WHERE code = $1 
       AND active = true 
       AND (expires_at IS NULL OR expires_at > NOW())
       AND (max_uses IS NULL OR uses < max_uses)`,
      [code.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: false,
        error: 'Invalid or expired discount code'
      });
    }

    const discount = result.rows[0];

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.discount_type === 'percentage') {
      discountAmount = (amount * discount.discount_value) / 100;
    } else {
      discountAmount = discount.discount_value;
    }

    const finalAmount = Math.max(0, amount - discountAmount);

    // Record usage
    await pool.query(
      `INSERT INTO discount_code_usage (discount_code_id, user_id, original_amount, discount_amount, final_amount)
       VALUES ($1, $2, $3, $4, $5)`,
      [discount.id, userId, amount, discountAmount, finalAmount]
    );

    // Increment usage count
    await pool.query(
      `UPDATE discount_codes 
       SET uses = uses + 1 
       WHERE id = $1`,
      [discount.id]
    );

    res.json({
      success: true,
      originalAmount: amount,
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      discountType: discount.discount_type,
      discountValue: discount.discount_value
    });

  } catch (error) {
    console.error('Apply discount error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/discount/create
 * Create a new discount code (admin only)
 */
router.post('/create', async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      description,
      expiresAt,
      maxUses,
      allowMultipleUses
    } = req.body;

    if (!code || !discountType || !discountValue) {
      return res.status(400).json({
        success: false,
        error: 'Code, discount type, and value are required'
      });
    }

    // Check if code already exists
    const existing = await pool.query(
      `SELECT * FROM discount_codes WHERE code = $1`,
      [code.toUpperCase()]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Discount code already exists'
      });
    }

    const result = await pool.query(
      `INSERT INTO discount_codes 
       (code, discount_type, discount_value, description, expires_at, max_uses, allow_multiple_uses, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING *`,
      [
        code.toUpperCase(),
        discountType,
        discountValue,
        description || null,
        expiresAt || null,
        maxUses || null,
        allowMultipleUses || false
      ]
    );

    res.json({
      success: true,
      discount: result.rows[0]
    });

  } catch (error) {
    console.error('Create discount error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/discount/list
 * List all discount codes (admin only)
 */
router.get('/list', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM discount_codes ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      discounts: result.rows
    });

  } catch (error) {
    console.error('List discounts error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
