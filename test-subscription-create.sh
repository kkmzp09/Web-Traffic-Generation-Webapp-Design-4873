#!/bin/bash
cd /root/relay

echo "Testing subscription creation API..."
echo ""

# Test with a sample user ID (replace with actual user ID from your database)
curl -X POST http://localhost:3000/api/subscriptions/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "planType": "seo_professional",
    "discountCode": "FREE100",
    "amount": 0
  }' \
  2>/dev/null | python3 -m json.tool 2>/dev/null || cat

echo ""
echo ""
echo "Checking if subscriptions table exists..."
node -e "
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const result = await pool.query(\"SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='subscriptions'\");
    if (result.rows.length > 0) {
      console.log('✅ subscriptions table exists');
      
      // Show table structure
      const cols = await pool.query(\"SELECT column_name, data_type FROM information_schema.columns WHERE table_name='subscriptions'\");
      console.log('Columns:', cols.rows.map(r => r.column_name).join(', '));
    } else {
      console.log('❌ subscriptions table does NOT exist');
    }
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
})();
"
