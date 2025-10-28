// Checkout API for subscription purchases with discount codes
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Validate discount code
router.post('/validate-discount', async (req, res) => {
  try {
    const { code, planType } = req.body;

    if (!code) {
      return res.json({ success: false, error: 'Discount code is required' });
    }

    // Check if discount code exists and is valid
    const result = await pool.query(
      `SELECT * FROM discount_codes 
       WHERE code = $1 
       AND active = true 
       AND (expires_at IS NULL OR expires_at > NOW())
       AND (max_uses IS NULL OR uses < max_uses)`,
      [code.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, error: 'Invalid or expired discount code' });
    }

    const discount = result.rows[0];

    // Check if discount applies to this plan type
    if (discount.applicable_plans && !discount.applicable_plans.includes(planType)) {
      return res.json({ success: false, error: 'Discount code not applicable to this plan' });
    }

    res.json({
      success: true,
      discount: {
        code: discount.code,
        type: discount.discount_type, // 'percentage' or 'fixed'
        value: discount.discount_value,
        description: discount.description
      }
    });

  } catch (error) {
    console.error('Validate discount error:', error);
    res.status(500).json({ success: false, error: 'Failed to validate discount code' });
  }
});

// Create subscription
router.post('/subscriptions/create', async (req, res) => {
  try {
    const { userId, planType, discountCode, amount } = req.body;

    if (!userId || !planType || !amount) {
      return res.json({ success: false, error: 'Missing required fields' });
    }

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if user already has an active subscription
      const existingResult = await client.query(
        `SELECT * FROM subscriptions 
         WHERE user_id = $1 AND status = 'active' AND plan_type LIKE 'seo_%'`,
        [userId]
      );

      if (existingResult.rows.length > 0) {
        // Update existing subscription
        await client.query(
          `UPDATE subscriptions 
           SET plan_type = $1, 
               updated_at = NOW(),
               next_billing_date = NOW() + INTERVAL '1 month'
           WHERE user_id = $2 AND status = 'active' AND plan_type LIKE 'seo_%'`,
          [planType, userId]
        );
      } else {
        // Create new subscription
        await client.query(
          `INSERT INTO subscriptions 
           (user_id, plan_type, status, start_date, next_billing_date)
           VALUES ($1, $2, 'active', NOW(), NOW() + INTERVAL '1 month')`,
          [userId, planType]
        );
      }

      // If discount code was used, increment usage
      if (discountCode) {
        await client.query(
          `UPDATE discount_codes 
           SET uses = uses + 1, last_used_at = NOW()
           WHERE code = $1`,
          [discountCode.toUpperCase()]
        );

        // Log discount usage
        await client.query(
          `INSERT INTO discount_usage 
           (user_id, discount_code, plan_type, amount_saved)
           VALUES ($1, $2, $3, $4)`,
          [userId, discountCode.toUpperCase(), planType, 0] // Calculate amount saved if needed
        );
      }

      // Reset monthly page count
      await client.query(
        `INSERT INTO seo_monitoring (user_id, pages_scanned_this_month, last_reset)
         VALUES ($1, 0, NOW())
         ON CONFLICT (user_id) 
         DO UPDATE SET pages_scanned_this_month = 0, last_reset = NOW()`,
        [userId]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Subscription activated successfully',
        subscription: {
          planType,
          status: 'active',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ success: false, error: 'Failed to create subscription' });
  }
});

module.exports = router;
