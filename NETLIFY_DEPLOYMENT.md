# Netlify Deployment Guide for OrganiTrafficBoost

## ✅ Pre-Deployment Checklist

Your project is **almost ready** for Netlify deployment. Follow these steps:

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Test Build Locally**
```bash
npm run build
```
This should create a `dist/` folder with your production build.

### 3. **Preview Build Locally (Optional)**
```bash
npm run preview
```
Visit http://localhost:4173 to test the production build.

---

## 🚀 Deploying to Netlify

### Option A: Deploy via Netlify CLI (Recommended)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Initialize and Deploy:**
   ```bash
   netlify init
   ```
   Follow the prompts:
   - Create a new site or link to existing
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

### Option B: Deploy via Netlify Dashboard

1. **Push to Git:**
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
   - Configure build settings:
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`
     - **Node version:** 18

3. **Set Environment Variables:**
   Go to Site settings → Environment variables and add:
   ```
   VITE_API_BASE=https://api.organitrafficboost.com
   ```

4. **Deploy:**
   Click "Deploy site"

---

## ⚙️ Environment Variables

Add these in Netlify Dashboard (Site settings → Environment variables):

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_BASE` | `https://api.organitrafficboost.com` | API endpoint for backend |
| `NODE_VERSION` | `18` | Node.js version (optional, set in netlify.toml) |

---

## 🔧 Configuration Files Created

✅ **netlify.toml** - Build and redirect configuration
✅ **public/_redirects** - SPA routing fallback
✅ **vite.config.js** - Updated base path to `/`

---

## ⚠️ Important Notes

### Backend Server (`server.js`)
**The `server.js` file will NOT run on Netlify** because Netlify only hosts static files. Your app is configured to call the external API at `https://api.organitrafficboost.com` directly from the browser.

**Solutions:**
1. **Keep current setup** - Frontend calls API directly (CORS must be enabled on API)
2. **Use Netlify Functions** - Create serverless functions to proxy API calls
3. **Deploy backend separately** - Use Render, Railway, or Heroku for `server.js`

### Current Routing (HashRouter)
Your app uses `HashRouter` which creates URLs like:
- `https://yoursite.netlify.app/#/dashboard`
- `https://yoursite.netlify.app/#/seo-traffic`

**To use clean URLs** (optional):
1. Change `HashRouter` to `BrowserRouter` in `src/App.jsx`
2. The `_redirects` file will handle routing

### API CORS Requirements
Since your frontend will call `https://api.organitrafficboost.com` directly from the browser, ensure:
- CORS is enabled on the API server
- Your Netlify domain is added to allowed origins

---

## 🧪 Testing After Deployment

1. **Check homepage loads**
2. **Test navigation** (all routes work)
3. **Test API calls** (check browser console for CORS errors)
4. **Test authentication flow**
5. **Verify analytics tracking**

---

## 🐛 Common Issues & Solutions

### Issue: "Page Not Found" on refresh
**Solution:** Already fixed with `_redirects` file and `netlify.toml`

### Issue: CORS errors when calling API
**Solution:** 
- Add your Netlify domain to API's CORS allowed origins
- Or use Netlify Functions as a proxy

### Issue: Environment variables not working
**Solution:** 
- Ensure variables start with `VITE_` prefix
- Rebuild site after adding variables

### Issue: Build fails
**Solution:**
- Check build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Test `npm run build` locally first

---

## 📊 Post-Deployment

### Custom Domain (Optional)
1. Go to Site settings → Domain management
2. Add your custom domain
3. Update DNS records as instructed

### Performance Optimization
- Enable Netlify's asset optimization
- Enable Netlify's image optimization (if using images)
- Monitor Core Web Vitals

### Monitoring
- Set up Netlify Analytics (optional, paid)
- Monitor build logs for errors
- Set up error tracking (Sentry, LogRocket, etc.)

---

## 🎉 You're Ready!

Your project now has all the necessary configuration files for Netlify deployment. Choose your deployment method above and follow the steps.

**Quick Deploy Command:**
```bash
npm run build && netlify deploy --prod
```

Need help? Check Netlify docs: https://docs.netlify.com
