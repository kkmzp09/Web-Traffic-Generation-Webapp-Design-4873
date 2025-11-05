const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const router = express.Router();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// PhonePe NEW API Configuration
const PHONEPE_CONFIG = {
  clientId: process.env.PHONEPE_CLIENT_ID || process.env.PHONEPE_MERCHANT_ID,
  clientSecret: process.env.PHONEPE_CLIENT_SECRET || process.env.PHONEPE_SALT_KEY,
  clientVersion: process.env.PHONEPE_CLIENT_VERSION || '1',
  // Use sandbox for test mode, production for live
  apiUrl: process.env.PHONEPE_ENV === 'production' 
    ? 'https://api.phonepe.com/apis/pg'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox',
  // OAuth endpoint is different for production
  oauthUrl: process.env.PHONEPE_ENV === 'production'
    ? 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
  redirectUrl: process.env.PHONEPE_REDIRECT_URL || 'https://organitrafficboost.com/payment-success',
  callbackUrl: process.env.PHONEPE_CALLBACK_URL || 'https://api.organitrafficboost.com/api/payment/phonepe/callback'
};

console.log('🔐 PhonePe NEW API Config:', {
  clientId: PHONEPE_CONFIG.clientId,
  apiUrl: PHONEPE_CONFIG.apiUrl,
  env: process.env.PHONEPE_ENV
});

// Cache for access token
let accessToken = null;
let tokenExpiresAt = 0;

/**
 * Get OAuth Access Token
 */
async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiresAt - 60000) { // Refresh 1 min before expiry
    return accessToken;
  }

  try {
    const tokenUrl = PHONEPE_CONFIG.oauthUrl;
    console.log('🔑 Requesting new access token...');
    console.log('📍 Token URL:', tokenUrl);
    console.log('📋 Credentials:', {
      client_id: PHONEPE_CONFIG.clientId,
      client_version: PHONEPE_CONFIG.clientVersion,
      client_secret: PHONEPE_CONFIG.clientSecret ? '***' : 'MISSING'
    });
    
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        client_id: PHONEPE_CONFIG.clientId,
        client_version: PHONEPE_CONFIG.clientVersion,
        client_secret: PHONEPE_CONFIG.clientSecret,
        grant_type: 'client_credentials'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (response.data.access_token) {
      accessToken = response.data.access_token;
      tokenExpiresAt = response.data.expires_at * 1000; // Convert to milliseconds
      
      console.log('✅ Access token obtained, expires at:', new Date(tokenExpiresAt));
      return accessToken;
    } else {
      throw new Error('No access token in response');
    }
  } catch (error) {
    console.error('❌ Token error - Full details:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Request URL:', error.config?.url);
    console.error('Request Data:', error.config?.data);
    throw new Error('Failed to get access token: ' + JSON.stringify(error.response?.data || error.message));
  }
}

/**
 * POST /api/payment/phonepe/initiate
 * Initiate PhonePe payment using NEW API
 */
router.post('/initiate', async (req, res) => {
  try {
    const { userId, planType, amount, email, name, phone } = req.body;

    if (!userId || !planType || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Generate unique transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    const merchantTransactionId = `MT${transactionId}`;

    // Check if user is a guest user
    const isGuest = userId.startsWith('guest_');
    
    // Create payment record in database
    await pool.query(
      `INSERT INTO payments 
       (user_id, transaction_id, merchant_transaction_id, plan_type, amount, status, payment_method, guest_email, guest_name, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT DO NOTHING`,
      [isGuest ? null : userId, transactionId, merchantTransactionId, planType, amount, 'pending', 'phonepe', email, name]
    );

    // Get OAuth token
    const token = await getAccessToken();

    // Create payment request payload according to PhonePe v2 API
    const paymentPayload = {
      merchantOrderId: merchantTransactionId,
      amount: amount * 100, // Convert to paise
      paymentFlow: {
        type: 'PG_CHECKOUT',
        message: `Payment for ${planType} plan`,
        merchantUrls: {
          redirectUrl: `${PHONEPE_CONFIG.redirectUrl}?transactionId=${transactionId}`
        }
      }
    };

    console.log('📤 PhonePe Payment Request:', {
      url: `${PHONEPE_CONFIG.apiUrl}/v1/payment`,
      transactionId: merchantTransactionId,
      amount: paymentPayload.amount
    });

    // Make payment request with OAuth token
    const response = await axios.post(
      `${PHONEPE_CONFIG.apiUrl}/checkout/v2/pay`,
      paymentPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${token}`
        }
      }
    );

    console.log('📥 PhonePe Response:', response.data);

    // Check if redirectUrl exists (successful payment initiation)
    if (response.data.redirectUrl) {
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
        paymentUrl: response.data.redirectUrl,
        orderId: response.data.orderId,
        message: 'Payment initiated successfully'
      });
    } else {
      throw new Error('PhonePe payment initiation failed');
    }

  } catch (error) {
    console.error('PhonePe initiate error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

/**
 * POST /api/payment/phonepe/callback
 * PhonePe payment callback webhook
 */
router.post('/callback', async (req, res) => {
  try {
    console.log('📞 PhonePe Callback received:', req.body);

    const { merchantOrderId } = req.body;

    if (!merchantOrderId) {
      return res.status(400).json({ success: false, error: 'Missing merchantOrderId' });
    }

    // Verify payment status with PhonePe API
    const token = await getAccessToken();
    const statusResponse = await axios.get(
      `${PHONEPE_CONFIG.apiUrl}/checkout/v2/order/${merchantOrderId}/status`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${token}`
        }
      }
    );

    console.log('📥 PhonePe Status Response:', statusResponse.data);

    const { state, orderId } = statusResponse.data;
    const paymentStatus = state === 'COMPLETED' ? 'completed' : state === 'FAILED' ? 'failed' : 'pending';

    // Update payment status
    await pool.query(
      `UPDATE payments 
       SET status = $1, phonepe_response = $2, completed_at = NOW(), updated_at = NOW()
       WHERE merchant_transaction_id = $3`,
      [paymentStatus, JSON.stringify(statusResponse.data), merchantOrderId]
    );

    // If payment successful, activate subscription
    if (state === 'COMPLETED') {
      const payment = await pool.query(
        'SELECT * FROM payments WHERE merchant_transaction_id = $1',
        [merchantOrderId]
      );

      if (payment.rows.length > 0 && payment.rows[0].user_id) {
        await pool.query(
          `INSERT INTO subscriptions (user_id, plan_type, status, start_date, end_date, payment_id)
           VALUES ($1, $2, 'active', NOW(), NOW() + INTERVAL '1 month', $3)
           ON CONFLICT (user_id) DO UPDATE SET
           plan_type = $2, status = 'active', start_date = NOW(), end_date = NOW() + INTERVAL '1 month', payment_id = $3`,
          [payment.rows[0].user_id, payment.rows[0].plan_type, payment.rows[0].id]
        );
      }
    }

    res.json({ success: true, state });
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/payment/phonepe/status/:transactionId
 * Check payment status from database and verify with PhonePe
 */
router.get('/status/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Get payment from database
    const result = await pool.query(
      'SELECT * FROM payments WHERE transaction_id = $1 OR merchant_transaction_id = $1',
      [transactionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    const payment = result.rows[0];

    // If payment is still pending, verify with PhonePe
    if (payment.status === 'pending') {
      try {
        const token = await getAccessToken();
        const statusResponse = await axios.get(
          `${PHONEPE_CONFIG.apiUrl}/checkout/v2/order/${payment.merchant_transaction_id}/status`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `O-Bearer ${token}`
            }
          }
        );

        const { state } = statusResponse.data;
        const paymentStatus = state === 'COMPLETED' ? 'completed' : state === 'FAILED' ? 'failed' : 'pending';

        // Update payment status if changed
        if (paymentStatus !== payment.status) {
          await pool.query(
            `UPDATE payments 
             SET status = $1, phonepe_response = $2, completed_at = NOW(), updated_at = NOW()
             WHERE id = $3`,
            [paymentStatus, JSON.stringify(statusResponse.data), payment.id]
          );

          // Activate subscription if completed
          if (state === 'COMPLETED' && payment.user_id) {
            await pool.query(
              `INSERT INTO subscriptions (user_id, plan_type, status, start_date, end_date, payment_id)
               VALUES ($1, $2, 'active', NOW(), NOW() + INTERVAL '1 month', $3)
               ON CONFLICT (user_id) DO UPDATE SET
               plan_type = $2, status = 'active', start_date = NOW(), end_date = NOW() + INTERVAL '1 month', payment_id = $3`,
              [payment.user_id, payment.plan_type, payment.id]
            );
          }

          payment.status = paymentStatus;
        }
      } catch (verifyError) {
        console.error('PhonePe verification error:', verifyError.response?.data || verifyError.message);
        // Continue with database status if verification fails
      }
    }

    res.json({
      success: true,
      payment: payment
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
 * Get all payments for a user
 */
router.get('/user-payments/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      success: true,
      payments: result.rows
    });
  } catch (error) {
    console.error('User payments error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
