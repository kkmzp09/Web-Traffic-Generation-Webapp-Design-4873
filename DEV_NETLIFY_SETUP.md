# Development Environment on Netlify

This guide explains how to run your dev environment on Netlify servers instead of locally.

## 🎯 Setup Options

### Option 1: Branch Deploys (Recommended)

Create a `dev` branch that automatically deploys to Netlify whenever you push.

#### Steps:

1. **Create and push a dev branch:**
   ```bash
   git checkout -b dev
   git push -u origin dev
   ```

2. **Enable Branch Deploys in Netlify:**
   - Go to your Netlify site dashboard
   - Navigate to: **Site settings → Build & deploy → Continuous deployment**
   - Under **Branch deploys**, select **"Let me add individual branches"**
   - Add branch: `dev`
   - Click **Save**

3. **Access your dev site:**
   - Your dev branch will deploy to: `dev--your-site-name.netlify.app`
   - Or: `your-site-name-dev.netlify.app` (depending on Netlify's naming)

4. **Workflow:**
   ```bash
   # Work on dev branch
   git checkout dev
   
   # Make changes
   # ... edit files ...
   
   # Push to trigger Netlify build
   git add .
   git commit -m "Dev changes"
   git push origin dev
   ```

### Option 2: Deploy Previews (Pull Requests)

Every pull request automatically gets its own preview URL.

#### Steps:

1. **Ensure Deploy Previews are enabled:**
   - Go to: **Site settings → Build & deploy → Deploy contexts**
   - Enable **"Deploy previews"**

2. **Create a PR:**
   ```bash
   git checkout -b feature/my-feature
   git add .
   git commit -m "New feature"
   git push origin feature/my-feature
   ```

3. **Create PR on GitHub:**
   - Netlify will automatically build and comment with preview URL
   - Example: `deploy-preview-123--your-site-name.netlify.app`

### Option 3: Manual Deploys

Deploy directly from your local machine to a specific site.

#### Steps:

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Link to your site:**
   ```bash
   netlify link
   ```

4. **Deploy to draft:**
   ```bash
   netlify deploy
   ```
   This creates a draft URL for testing.

5. **Deploy to production:**
   ```bash
   netlify deploy --prod
   ```

## 🔧 Environment Variables for Dev

Set different environment variables for dev vs production:

### In Netlify Dashboard:

1. Go to: **Site settings → Environment variables**
2. Add variables with **Deploy context** scope:

**For Production (main branch):**
- `VITE_API_BASE` = `https://api.organitrafficboost.com`
- `VITE_AUTH_API_BASE` = `https://auth.organitrafficboost.com`

**For Development (dev branch):**
- `VITE_API_BASE` = `https://dev-api.organitrafficboost.com` (if you have a dev API)
- `VITE_AUTH_API_BASE` = `https://dev-auth.organitrafficboost.com`

Or use the same production APIs for both if you don't have separate dev APIs.

## 📊 Monitoring Builds

### View Build Logs:
1. Go to: **Deploys** tab in Netlify dashboard
2. Click on any deploy to see logs
3. Check for errors or warnings

### Build Notifications:
- Enable email notifications for failed builds
- Go to: **Site settings → Build & deploy → Deploy notifications**

## 🚀 Recommended Workflow

### For Development:

```bash
# 1. Work on dev branch
git checkout dev

# 2. Make changes locally and test
npm run dev  # Test locally first

# 3. Push to Netlify when ready
git add .
git commit -m "Description of changes"
git push origin dev

# 4. Check Netlify build at: dev--your-site-name.netlify.app
```

### For Production:

```bash
# 1. Merge dev to main when ready
git checkout main
git merge dev
git push origin main

# 2. Production site auto-deploys
# Check at: your-site-name.netlify.app
```

## 🎯 Current Configuration

Your `netlify.toml` is now configured with:

- ✅ **Production context** - Builds from `main` branch
- ✅ **Dev context** - Builds from `dev` branch  
- ✅ **Branch deploys** - Any branch can be deployed
- ✅ **Deploy previews** - PRs get preview URLs

## 💡 Tips

1. **Faster builds:** Netlify caches `node_modules` between builds
2. **Build time:** Usually 1-3 minutes for React/Vite apps
3. **Concurrent builds:** Free tier allows 1 concurrent build
4. **Build minutes:** Free tier includes 300 build minutes/month

## 🐛 Troubleshooting

### Build fails on Netlify but works locally:
- Check Node version matches (currently set to 18)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### Environment variables not working:
- Ensure variables start with `VITE_` prefix
- Redeploy after adding/changing variables
- Check deploy context matches (production vs dev)

### Site not updating:
- Clear Netlify cache: **Deploys → Trigger deploy → Clear cache and deploy**
- Check if correct branch is being deployed

---

## ✅ Next Steps

1. **Create dev branch** (if not exists)
2. **Enable branch deploys in Netlify dashboard**
3. **Push to dev branch to trigger first deploy**
4. **Bookmark your dev URL** for easy access

Your dev environment will now run entirely on Netlify! 🎉
