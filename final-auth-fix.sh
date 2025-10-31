#!/bin/bash
cd /var/www/auth-api

# Restore clean backup
cp server-auth.js.backup-password-reset server-auth.js

# Add crypto import at the top
sed -i '1a import crypto from '"'"'crypto'"'"';' server-auth.js

# Create password reset endpoints file
cat > /tmp/pwd-reset.txt << 'EOF'

// Password Reset Endpoints
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
    const userResult = await pool.query('SELECT id, email, name FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.json({ success: true, message: 'If an account exists, a reset email has been sent' });
    const user = userResult.rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);
    await pool.query('UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3', [resetToken, resetTokenExpiry, user.id]);
    const resetLink = `${process.env.FRONTEND_BASE_URL || 'https://organitrafficboost.com'}/reset-password?token=${resetToken}`;
    const emailResponse = await fetch('http://localhost:3000/api/email/password-reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: user.email, userName: user.name || user.email.split('@')[0], resetLink: resetLink }) });
    if (!emailResponse.ok) return res.status(500).json({ success: false, error: 'Failed to send reset email' });
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) { console.error('Forgot password error:', error); res.status(500).json({ success: false, error: 'Internal server error' }); }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ success: false, error: 'Token and new password are required' });
    if (newPassword.length < 8) return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
    const userResult = await pool.query('SELECT id, email FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()', [token]);
    if (userResult.rows.length === 0) return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    const user = userResult.rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2', [hashedPassword, user.id]);
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) { console.error('Reset password error:', error); res.status(500).json({ success: false, error: 'Internal server error' }); }
});

EOF

# Insert before app.listen
sed -i '/app.listen/r /tmp/pwd-reset.txt' server-auth.js

echo "✅ Fixed with crypto import"
pm2 restart auth-api
sleep 2
pm2 logs auth-api --lines 15
