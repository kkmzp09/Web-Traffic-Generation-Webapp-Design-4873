#!/bin/bash

# Check user in database
echo "=== Checking user vintrip03@gmail.com ==="
cd /var/www/auth-api

node -e "
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, email, name, created_at, is_active FROM users WHERE email = \$1',
      ['vintrip03@gmail.com']
    );
    
    console.log('User found:', userResult.rows.length > 0 ? 'YES' : 'NO');
    if (userResult.rows.length > 0) {
      console.log('User details:', JSON.stringify(userResult.rows[0], null, 2));
      
      // Check recent sessions
      const sessionsResult = await pool.query(
        'SELECT session_token, created_at, expires_at, is_active FROM user_sessions WHERE user_id = \$1 ORDER BY created_at DESC LIMIT 5',
        [userResult.rows[0].id]
      );
      
      console.log('\\nRecent sessions:', sessionsResult.rows.length);
      sessionsResult.rows.forEach((session, i) => {
        console.log(\`Session \${i+1}:\`, JSON.stringify(session, null, 2));
      });
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
"
