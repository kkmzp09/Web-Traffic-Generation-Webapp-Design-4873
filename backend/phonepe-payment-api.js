const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const router = express.Router();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// PhonePe Configuration
const PHONEPE_CONFIG = {
  merchantId: process.env.PHONEPE_MERCHANT_ID,
  saltKey: process.env.PHONEPE_SALT_KEY,
  saltIndex: process.env.PHONEPE_SALT_INDEX || '1',
  // Use production API for production merchant IDs
  apiUrl: 'https://api.phonepe.com/apis/hermes',
  redirectUrl: process.env.PHONEPE_REDIRECT_URL || 'https://organitrafficboost.com/payment-success',
  callbackUrl: process.env.PHONEPE_CALLBACK_URL || 'https://api.organitrafficboost.com/api/payment/phonepe/callback'
};

console.log('🔐 PhonePe Config:', {
  merchantId: PHONEPE_CONFIG.merchantId,
  apiUrl: PHONEPE_CONFIG.apiUrl,
  saltIndex: PHONEPE_CONFIG.saltIndex,
  env: process.env.PHONEPE_ENV
});

// Generate PhonePe checksum
function generateChecksum(payload, endpoint) {
  const string = payload + endpoint + PHONEPE_CONFIG.saltKey;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  return sha256 + '###' + PHONEPE_CONFIG.saltIndex;
}

// Verify PhonePe callback checksum
function verifyChecksum(xVerify, response) {
  const string = response + PHONEPE_CONFIG.saltKey;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  return xVerify === sha256 + '###' + PHONEPE_CONFIG.saltIndex;
}

/**
 * POST /api/payment/phonepe/initiate
 * Initiate PhonePe payment
 */
router.post('/initiate', async (req, res) => {
  try {
    const { userId, planType, amount, email, name } = req.body;

    if (!userId || !planType || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Generate unique transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    const merchantTransactionId = `MT${transactionId}`;

    // Check if user is a guest user (starts with 'guest_')
    const isGuest = userId.startsWith('guest_');
    
    // For guest users, store userId as text instead of UUID
    // Create payment record in database
    await pool.query(
      `INSERT INTO payments 
       (user_id, transaction_id, merchant_transaction_id, plan_type, amount, status, payment_method, guest_email, guest_name, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT DO NOTHING`,
      [isGuest ? null : userId, transactionId, merchantTransactionId, planType, amount, 'pending', 'phonepe', email, name]
    );

    // PhonePe payment request payload
    const paymentPayload = {
      merchantId: PHONEPE_CONFIG.merchantId,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: `USER${userId}`,
      amount: amount * 100, // Convert to paise
      redirectUrl: `${PHONEPE_CONFIG.redirectUrl}?transactionId=${transactionId}`,
      redirectMode: 'POST',
      callbackUrl: PHONEPE_CONFIG.callbackUrl,
      mobileNumber: req.body.phone || '',
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    // Base64 encode the payload
    const base64Payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
    
    // Generate checksum
    const checksum = generateChecksum(base64Payload, '/pg/v1/pay');

    console.log('📤 PhonePe Request:', {
      url: `${PHONEPE_CONFIG.apiUrl}/pg/v1/pay`,
      merchantId: PHONEPE_CONFIG.merchantId,
      transactionId: merchantTransactionId,
      amount: paymentPayload.amount
    });

    // Make request to PhonePe
    const response = await axios.post(
      `${PHONEPE_CONFIG.apiUrl}/pg/v1/pay`,
      {
        request: base64Payload
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum
        }
      }
    );

    console.log('📥 PhonePe Response:', response.data);

    if (response.data.success) {
      // Update payment record with PhonePe response
      await pool.query(
        `UPDATE payments 
         SET phonepe_response = $1, updated_at = NOW()
         WHERE transaction_id = $2`,
        [JSON.stringify(response.data), transactionId]
      );

      return res.json({
        success: true,
        transactionId,
        paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
        message: 'Payment initiated successfully'
      });
    } else {
      throw new Error('PhonePe payment initiation failed');
    }

  } catch (error) {
    console.error('PhonePe initiate error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
});

/**
 * POST /api/payment/phonepe/callback
 * PhonePe payment callback webhook
 */
router.post('/callback', async (req, res) => {
  try {
    const { response } = req.body;
    const xVerify = req.headers['x-verify'];

    // Verify checksum
    if (!verifyChecksum(xVerify, response)) {
      console.error('Invalid checksum in callback');
      return res.status(400).json({ success: false, error: 'Invalid checksum' });
    }

    // Decode response
    const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString());
    const { merchantTransactionId, transactionId, amount, state, responseCode } = decodedResponse.data;

    console.log('PhonePe callback received:', decodedResponse);

    // Get payment record
    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE merchant_transaction_id = $1',
      [merchantTransactionId]
    );

    if (paymentResult.rows.length === 0) {
      console.error('Payment not found:', merchantTransactionId);
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    // Update payment status
    if (state === 'COMPLETED' && responseCode === 'SUCCESS') {
      // Payment successful
      await pool.query(
        `UPDATE payments 
         SET status = $1, phonepe_transaction_id = $2, phonepe_response = $3, completed_at = NOW(), updated_at = NOW()
         WHERE merchant_transaction_id = $4`,
        ['completed', transactionId, JSON.stringify(decodedResponse), merchantTransactionId]
      );

      // Activate subscription
      const planDurations = {
        'starter': 30,
        'professional': 30,
        'business': 30
      };

      const durationDays = planDurations[payment.plan_type] || 30;
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + durationDays);

      // Check if user has existing subscription
      const existingSubResult = await pool.query(
        'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2',
        [payment.user_id, 'active']
      );

      if (existingSubResult.rows.length > 0) {
        // Update existing subscription
        await pool.query(
          `UPDATE subscriptions 
           SET plan_type = $1, end_date = $2, updated_at = NOW()
           WHERE user_id = $3 AND status = $4`,
          [payment.plan_type, endDate, payment.user_id, 'active']
        );
      } else {
        // Create new subscription
        await pool.query(
          `INSERT INTO subscriptions 
           (user_id, plan_type, status, start_date, end_date, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [payment.user_id, payment.plan_type, 'active', startDate, endDate]
        );
      }

      console.log(`✅ Payment successful for user ${payment.user_id}, plan: ${payment.plan_type}`);

    } else if (state === 'FAILED') {
      // Payment failed
      await pool.query(
        `UPDATE payments 
         SET status = $1, phonepe_response = $2, updated_at = NOW()
         WHERE merchant_transaction_id = $3`,
        ['failed', JSON.stringify(decodedResponse), merchantTransactionId]
      );

      console.log(`❌ Payment failed for transaction ${merchantTransactionId}`);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('PhonePe callback error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/payment/phonepe/status/:transactionId
 * Check payment status
 */
router.get('/status/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Get payment from database
    const result = await pool.query(
      'SELECT * FROM payments WHERE transaction_id = $1',
      [transactionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    const payment = result.rows[0];

    // If payment is pending, check with PhonePe
    if (payment.status === 'pending' && payment.merchant_transaction_id) {
      const endpoint = `/pg/v1/status/${PHONEPE_CONFIG.merchantId}/${payment.merchant_transaction_id}`;
      const checksum = generateChecksum('', endpoint);

      try {
        const response = await axios.get(
          `${PHONEPE_CONFIG.apiUrl}${endpoint}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-VERIFY': checksum,
              'X-MERCHANT-ID': PHONEPE_CONFIG.merchantId
            }
          }
        );

        if (response.data.success && response.data.data.state === 'COMPLETED') {
          // Update payment status
          await pool.query(
            `UPDATE payments 
             SET status = $1, phonepe_response = $2, updated_at = NOW()
             WHERE transaction_id = $3`,
            ['completed', JSON.stringify(response.data), transactionId]
          );

          payment.status = 'completed';
        }
      } catch (error) {
        console.error('Status check error:', error.response?.data || error.message);
      }
    }

    res.json({
      success: true,
      payment: {
        transactionId: payment.transaction_id,
        status: payment.status,
        amount: payment.amount,
        planType: payment.plan_type,
        createdAt: payment.created_at,
        completedAt: payment.completed_at
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/payment/phonepe/user-payments/:userId
 * Get user's payment history
 */
router.get('/user-payments/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT transaction_id, plan_type, amount, status, payment_method, created_at, completed_at
       FROM payments 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );

    res.json({
      success: true,
      payments: result.rows
    });

  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
