# 🚀 Deploy 1000 Visitor Optimization - Manual Steps

## Copy and Paste These Commands

### Step 1: Upload Optimization Script

Open your terminal and run:

```bash
scp c:\Users\Administrator\OrrganiTraffic\Web-Traffic-Generation-Webapp-Design-4873\optimize-vps-for-1000-visitors.sh root@67.217.60.57:/root/
```

Password: `4@N7m4&g`

---

### Step 2: Run Optimization on VPS

```bash
ssh root@67.217.60.57
```

Password: `4@N7m4&g`

Then run:

```bash
chmod +x /root/optimize-vps-for-1000-visitors.sh
bash /root/optimize-vps-for-1000-visitors.sh
```

Wait for it to complete (~2 minutes). You'll see:
- ✅ File descriptor limits increased
- ✅ Swap space added
- ✅ Kernel optimized
- ✅ PM2 configured

---

### Step 3: Upload Optimized Server

Exit SSH (type `exit`), then run:

```bash
# Backup current server
ssh root@67.217.60.57 "cp /root/relay/playwright-server.js /root/relay/playwright-server.js.backup"

# Upload optimized version
scp c:\Users\Administrator\OrrganiTraffic\Web-Traffic-Generation-Webapp-Design-4873\server-files\playwright-server-optimized-1000.js root@67.217.60.57:/root/relay/playwright-server.js
```

---

### Step 4: Restart PM2

```bash
ssh root@67.217.60.57 "pm2 restart playwright-api && pm2 list"
```

---

## ✅ Verification

Check if everything is working:

```bash
ssh root@67.217.60.57 "ulimit -n && free -h && pm2 list"
```

You should see:
- File limit: **65536**
- Swap space: **4.0G**
- PM2 processes: **online**

---

## 🎯 You're Done!

Your VPS is now optimized for 1000 visitor campaigns!

**Next:** Run a test campaign with 50-100 visitors to verify everything works.

**Monitor:** Use `.\monitor-campaign.ps1 -JobId YOUR_JOB_ID`
