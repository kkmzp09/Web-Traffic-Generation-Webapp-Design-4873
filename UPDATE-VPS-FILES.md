# Update VPS Files - AI Suggestions for All Issue Types

Run these commands on your VPS to update the backend files:

```bash
cd /root/relay

# Backup current files
cp seo-ai-fixer.js seo-ai-fixer.js.backup
cp seo-automation-api.js seo-automation-api.js.backup
cp seo-scanner-service.js seo-scanner-service.js.backup

# Update seo-ai-fixer.js
# (Copy the new content from server-files/seo-ai-fixer.js)

# Update seo-automation-api.js
# (Copy the new content from server-files/seo-automation-api.js)

# Update seo-scanner-service.js
# (Copy the new content from server-files/seo-scanner-service.js)

# Restart the server
pm2 restart relay-api --update-env

# Check logs
pm2 logs relay-api --lines 20
```

## What Changed:

### seo-ai-fixer.js:
- Added `generateH1Fix()` - Generates optimized H1 headings
- Added `generateContentFix()` - Provides content expansion suggestions
- Added `generateLinksFix()` - Suggests internal linking opportunities
- Updated switch statement to handle new categories

### seo-automation-api.js:
- Updated fix generation query to include: 'headings', 'content', 'links'

### seo-scanner-service.js:
- Changed H1 issue category from 'content' to 'headings'

## Quick Copy Commands:

You can use these commands to update files directly:

```bash
# On your local machine, copy files to VPS
scp server-files/seo-ai-fixer.js root@67.217.60.57:/root/relay/
scp server-files/seo-automation-api.js root@67.217.60.57:/root/relay/
scp server-files/seo-scanner-service.js root@67.217.60.57:/root/relay/

# Then on VPS
ssh root@67.217.60.57
cd /root/relay
pm2 restart relay-api --update-env
```

## Test After Update:

1. Scan a page with missing H1
2. Click "Generate Fixes"
3. You should now see AI suggestions for:
   - H1 heading
   - Content expansion
   - Internal linking

The suggestions will be displayed differently from direct fixes (like title/meta), with a "Mark as Reviewed" button instead of "Apply Fix".
