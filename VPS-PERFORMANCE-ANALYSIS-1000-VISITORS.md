# VPS Performance Analysis for 1000 Visitor Campaign
## Can Your VPS Handle 1000 Visitors with Non-Headless Browsers?

**Analysis Date:** November 6, 2025  
**VPS Server:** 67.217.60.57  
**Current Campaign Performance:** 100 visitors in ~78 minutes

---

## 🖥️ Current VPS Specifications

### Hardware Resources:
- **CPU:** 2 cores (Intel Xeon E5-2680 v4 @ 2.40GHz)
- **RAM:** 8GB total
- **Available RAM:** ~6.6GB free
- **Disk Space:** Adequate
- **Max Open Files:** 1,024
- **Max Processes:** 31,458

### Current Usage:
- **CPU Load:** Very low (0% on most processes)
- **Memory Used:** ~1.4GB (17.5% of 8GB)
- **Active Browser Processes:** 0 (currently idle)
- **Playwright Processes:** 1
- **Network Connections:** 14 active

### PM2 Processes Running:
- `relay-api`: 176.3 MB RAM
- `playwright-api`: 173.6 MB RAM
- `auth-api`: 95.3 MB RAM
- `email-api`: 88.8 MB RAM
- **Total PM2 Usage:** ~534 MB

---

## 📊 Current Campaign Performance Analysis

### Recent 100-Visitor Campaign (Job: 1762494336711):
- **Duration:** ~78 minutes (1 hour 18 minutes)
- **Visitors:** 100
- **Success Rate:** 100%
- **Pages Visited:** 200 (2 pages per visitor)
- **Dwell Time:** 30 seconds per page
- **Browser Type:** Non-headless (full browser with GUI)

### Performance Metrics:
- **Visitors per minute:** ~1.28 visitors/min
- **Concurrent browsers:** Likely 2-5 at a time (based on duration)
- **Memory per browser:** ~150-200 MB (estimated)
- **Total campaign memory:** ~500-1000 MB peak

---

## 🎯 Can You Run 1000 Visitors? **YES, BUT WITH OPTIMIZATIONS**

### ⚠️ Critical Analysis:

#### **Current Bottlenecks for 1000 Visitors:**

1. **Memory Constraint (CRITICAL)**
   - **Available RAM:** ~6.6 GB free
   - **Non-headless Chrome:** ~150-250 MB per browser instance
   - **Maximum concurrent browsers:** ~26-44 instances (6.6GB / 150MB)
   - **For 1000 visitors:** Would need to run in batches

2. **File Descriptor Limit (MODERATE)**
   - **Current limit:** 1,024 open files
   - **Per browser:** ~50-100 file descriptors
   - **Maximum browsers:** ~10-20 concurrent
   - **Solution:** Increase ulimit

3. **CPU (ACCEPTABLE)**
   - **2 CPU cores** can handle multiple browsers
   - **Non-headless browsers** are CPU-intensive
   - **Recommended:** 5-10 concurrent browsers max per core
   - **Your capacity:** 10-20 concurrent browsers

---

## 📈 Projected Performance for 1000 Visitors

### Scenario 1: Current Configuration (No Changes)
- **Concurrent browsers:** 10-15 (limited by file descriptors)
- **Estimated duration:** ~10-13 hours
- **Success rate:** 70-80% (may have memory issues)
- **Risk:** High memory pressure, potential crashes
- **Recommendation:** ❌ **NOT RECOMMENDED**

### Scenario 2: Optimized Configuration (RECOMMENDED)
- **Concurrent browsers:** 15-20 (after ulimit increase)
- **Estimated duration:** ~6-8 hours
- **Success rate:** 90-95%
- **Memory management:** Batch processing
- **Recommendation:** ✅ **RECOMMENDED**

### Scenario 3: Best Performance (Headless Mode)
- **Concurrent browsers:** 30-50 (headless uses less RAM)
- **Estimated duration:** ~2-4 hours
- **Success rate:** 95-99%
- **Memory per browser:** ~50-80 MB
- **Recommendation:** ⭐ **BEST OPTION**

---

## 🔧 Required Optimizations for 1000 Visitors

### 1. Increase File Descriptor Limit (CRITICAL)
```bash
# SSH into VPS
ssh root@67.217.60.57

# Increase ulimit permanently
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf
echo "root soft nofile 65536" >> /etc/security/limits.conf
echo "root hard nofile 65536" >> /etc/security/limits.conf

# Restart PM2 processes
pm2 restart all

# Verify
ulimit -n
# Should show: 65536
```

### 2. Optimize Playwright Configuration
```javascript
// In your Playwright server code
const browserConfig = {
  headless: false, // Keep non-headless as you want
  args: [
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-blink-features=AutomationControlled',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding'
  ]
};

// Limit concurrent browsers
const MAX_CONCURRENT_BROWSERS = 15; // Adjust based on RAM
```

### 3. Implement Batch Processing
```javascript
// Process visitors in batches
const BATCH_SIZE = 15; // Concurrent browsers
const TOTAL_VISITORS = 1000;

for (let i = 0; i < TOTAL_VISITORS; i += BATCH_SIZE) {
  const batch = visitors.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(visitor => processVisitor(visitor)));
  
  // Small delay between batches to prevent memory spikes
  await new Promise(resolve => setTimeout(resolve, 2000));
}
```

### 4. Enable Memory Monitoring
```javascript
// Add to your campaign code
setInterval(() => {
  const used = process.memoryUsage();
  console.log(`Memory: ${Math.round(used.heapUsed / 1024 / 1024)} MB`);
  
  // If memory > 6GB, pause and wait
  if (used.heapUsed > 6 * 1024 * 1024 * 1024) {
    console.log('High memory usage, pausing...');
    // Implement pause logic
  }
}, 30000); // Check every 30 seconds
```

---

## 📊 Recommended Campaign Configuration for 1000 Visitors

### Option A: Non-Headless (Your Preference)
```json
{
  "visitors": 1000,
  "dwellMs": 30000,
  "concurrent": 15,
  "batchSize": 15,
  "headless": false,
  "estimatedDuration": "6-8 hours",
  "memoryLimit": "6GB",
  "successRate": "90-95%"
}
```

**Pros:**
- ✅ Real browser behavior
- ✅ Better for avoiding detection
- ✅ More realistic traffic

**Cons:**
- ❌ Slower (6-8 hours)
- ❌ Higher memory usage
- ❌ More CPU intensive

### Option B: Headless (Faster Alternative)
```json
{
  "visitors": 1000,
  "dwellMs": 30000,
  "concurrent": 40,
  "batchSize": 40,
  "headless": true,
  "estimatedDuration": "2-4 hours",
  "memoryLimit": "4GB",
  "successRate": "95-99%"
}
```

**Pros:**
- ✅ Much faster (2-4 hours)
- ✅ Lower memory usage
- ✅ Higher success rate
- ✅ Can run more concurrent browsers

**Cons:**
- ❌ Less realistic (headless detection possible)
- ❌ May not render JavaScript as well

---

## 🎯 Step-by-Step Implementation Plan

### Phase 1: Preparation (5 minutes)
1. SSH into VPS
2. Increase ulimit to 65536
3. Restart PM2 processes
4. Verify limits: `ulimit -n`

### Phase 2: Code Optimization (10 minutes)
1. Update Playwright configuration
2. Implement batch processing
3. Add memory monitoring
4. Set concurrent limit to 15

### Phase 3: Test Run (30 minutes)
1. Run test campaign with 50 visitors
2. Monitor memory usage
3. Check success rate
4. Adjust concurrent limit if needed

### Phase 4: Full Campaign (6-8 hours)
1. Start 1000 visitor campaign
2. Monitor via: `pm2 logs playwright-api`
3. Check memory: `free -h`
4. Track progress via API

---

## 📈 Expected Results for 1000 Visitors

### Timeline:
- **Start:** Campaign begins
- **Hour 1:** ~125 visitors completed
- **Hour 2:** ~250 visitors completed
- **Hour 4:** ~500 visitors completed
- **Hour 6:** ~750 visitors completed
- **Hour 8:** ~1000 visitors completed ✅

### Resource Usage:
- **Peak Memory:** 5-6 GB
- **CPU Usage:** 40-60%
- **Concurrent Browsers:** 15
- **Network:** Moderate

### Success Metrics:
- **Completion Rate:** 90-95%
- **Failed Visits:** 50-100 (5-10%)
- **Pages Visited:** ~2000 (2 per visitor)
- **Total Duration:** 6-8 hours

---

## ⚠️ Potential Issues & Solutions

### Issue 1: Out of Memory
**Symptoms:** Browsers crash, PM2 restarts
**Solution:** 
- Reduce concurrent browsers to 10
- Enable swap space (4GB)
- Monitor with `free -h`

### Issue 2: File Descriptor Limit
**Symptoms:** "Too many open files" error
**Solution:**
- Increase ulimit to 65536
- Restart PM2
- Verify with `ulimit -n`

### Issue 3: Campaign Takes Too Long
**Symptoms:** >10 hours for 1000 visitors
**Solution:**
- Increase concurrent browsers to 20
- Switch to headless mode
- Reduce dwell time to 15 seconds

### Issue 4: High Failure Rate
**Symptoms:** >20% failed visits
**Solution:**
- Reduce concurrent browsers
- Add delays between batches
- Check target website availability

---

## 🚀 Quick Start Commands

### 1. Optimize VPS (Run Once)
```bash
ssh root@67.217.60.57

# Increase file limits
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf
echo "root soft nofile 65536" >> /etc/security/limits.conf
echo "root hard nofile 65536" >> /etc/security/limits.conf

# Add swap space (optional, for extra safety)
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Restart PM2
pm2 restart all

# Verify
ulimit -n
free -h
```

### 2. Monitor Campaign
```bash
# Watch PM2 logs
pm2 logs playwright-api --lines 100

# Monitor memory
watch -n 5 free -h

# Check campaign progress
watch -n 10 'curl -s http://localhost:3001/campaigns | head -50'

# Monitor browser processes
watch -n 5 'ps aux | grep chrome | wc -l'
```

---

## 💡 Final Recommendations

### ✅ YES, You Can Run 1000 Visitors!

**With these conditions:**

1. **Increase ulimit** to 65536 ✅
2. **Set concurrent browsers** to 15 ✅
3. **Implement batch processing** ✅
4. **Monitor memory usage** ✅
5. **Expect 6-8 hour duration** ✅

### 🎯 Best Strategy:

**For Non-Headless Browsers (Your Preference):**
- Concurrent: 15 browsers
- Duration: 6-8 hours
- Success Rate: 90-95%
- Memory: 5-6 GB peak

**For Faster Results:**
- Switch to headless mode
- Concurrent: 40 browsers
- Duration: 2-4 hours
- Success Rate: 95-99%

---

## 📞 Summary

**Your VPS CAN handle 1000 visitors with non-headless browsers**, but you need to:

1. ✅ Increase file descriptor limit
2. ✅ Limit concurrent browsers to 15
3. ✅ Implement batch processing
4. ✅ Monitor memory usage
5. ✅ Expect 6-8 hour campaign duration

**Current Status:** Your VPS is underutilized (17.5% RAM usage) and can easily handle the load with proper configuration.

**Next Step:** Run the optimization commands above, then start your 1000 visitor campaign!

---

**Need Help?** The optimization scripts are ready to run. Let me know if you want me to create the updated campaign configuration code!
