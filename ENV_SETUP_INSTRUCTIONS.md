# Environment Variables Setup

## 🔒 SECURITY: Never commit API keys to Git!

### Create .env file manually:

1. Create a file named `.env` in the project root
2. Add these variables (replace with your actual values):

```env
VITE_RESEND_API_KEY=your_resend_api_key_here
VITE_FROM_EMAIL=onboarding@resend.dev
VITE_SUPPORT_EMAIL=support@trafficgenpro.com
VITE_COMPANY_NAME=TrafficGenPro
VITE_API_BASE=https://api.organitrafficboost.com
VITE_REQUEST_TIMEOUT_MS=30000
```

### Get Your Resend API Key:

1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Copy the key (starts with `re_`)
4. Paste it in your `.env` file

### For Netlify Deployment:

Add these environment variables in:
Netlify Dashboard → Site Settings → Environment Variables

**IMPORTANT:** 
- Never share your API keys
- Never commit `.env` to Git
- The `.env` file is already in `.gitignore`

### Security Best Practices:

✅ Use environment variables
✅ Add `.env` to `.gitignore`
✅ Rotate keys regularly
✅ Use different keys for dev/prod
❌ Never commit keys to Git
❌ Never share keys publicly
