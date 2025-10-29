@echo off
echo ========================================
echo Testing Automated SEO System
echo ========================================
echo.
echo Test 1: Testing DataForSEO API
echo ========================================
ssh root@67.217.60.57 "cd /root/relay && node -e \"require('dotenv').config(); const axios = require('axios'); const auth = Buffer.from(process.env.DATAFORSEO_LOGIN + ':' + process.env.DATAFORSEO_PASSWORD).toString('base64'); axios.post('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', [{ keyword: 'seo services', language_code: 'en', location_code: 2840, device: 'desktop', depth: 10 }], { headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' } }).then(res => { console.log('✅ DataForSEO API working!'); console.log('Found', res.data.tasks[0].result[0].items.length, 'SERP results'); }).catch(err => console.error('❌ Error:', err.response?.data || err.message));\""
echo.
echo.
echo Test 2: Testing Resend Email API
echo ========================================
ssh root@67.217.60.57 "cd /root/relay && node -e \"require('dotenv').config(); const nodemailer = require('nodemailer'); const transporter = nodemailer.createTransporter({ host: 'smtp.resend.com', port: 587, auth: { user: 'resend', pass: process.env.RESEND_API_KEY } }); transporter.sendMail({ from: 'seo@organitrafficboost.com', to: 'kk@jobmakers.in', subject: 'Test Email - Automated SEO System', html: '<h1>✅ Email System Working!</h1><p>Your automated SEO monitoring is ready!</p>' }).then(() => console.log('✅ Email sent! Check your inbox at kk@jobmakers.in')).catch(err => console.error('❌ Error:', err.message));\""
echo.
echo.
echo ========================================
echo Tests Complete!
echo ========================================
pause
