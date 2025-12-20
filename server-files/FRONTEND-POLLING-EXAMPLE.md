# Frontend Polling Implementation (Optional)

## Overview
This is an **OPTIONAL** frontend enhancement to automatically poll scan status instead of requiring manual refresh.

## Implementation

### Option 1: Simple Polling in SEOAuditDashboard.jsx

Add this function to `SEOAuditDashboard.jsx`:

```javascript
// Add to component state
const [pollingScanId, setPollingScanId] = useState(null);

// Polling function
const pollScanStatus = async (scanId) => {
  try {
    const response = await fetch(`${API_BASE}/api/seo/scan-status/${scanId}`);
    const data = await response.json();
    
    if (data.success) {
      if (data.status === 'completed') {
        // Scan finished - update UI
        setAuditData({
          success: true,
          url: data.url,
          hostname: data.hostname,
          scannedAt: data.scannedAt,
          analysis: {
            score: data.score,
            issues: data.issues,
            summary: data.summary,
            pageData: data.pageData
          }
        });
        setScanning(false);
        setPollingScanId(null);
        
        // Reload scan history
        loadScanHistory();
        
        console.log('✅ Scan completed:', data);
      } else if (data.status === 'failed') {
        // Scan failed
        alert('Scan failed: ' + (data.errorMessage || 'Unknown error'));
        setScanning(false);
        setPollingScanId(null);
      } else if (data.status === 'running' || data.status === 'queued') {
        // Still running - poll again in 5 seconds
        console.log('⏳ Scan still running, checking again in 5s...');
        setTimeout(() => pollScanStatus(scanId), 5000);
      }
    }
  } catch (error) {
    console.error('Error polling scan status:', error);
    // Retry after 5 seconds
    setTimeout(() => pollScanStatus(scanId), 5000);
  }
};

// Update runAudit function
const runAudit = async (url = websiteUrl) => {
  if (!url) return;

  try {
    setScanning(true);
    console.log('🔍 Starting audit for:', url);

    const response = await fetch(`${API_BASE}/api/seo/comprehensive-audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, userId: user?.id })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Scan started:', data);
      
      // Start polling for status
      if (data.scanId) {
        setPollingScanId(data.scanId);
        pollScanStatus(data.scanId);
      }
      
      // Show initial "running" state
      setAuditData({
        success: true,
        url: data.url,
        hostname: data.hostname,
        scannedAt: data.scannedAt,
        status: 'running',
        analysis: {
          score: 0,
          issues: [],
          summary: { total: 0, critical: 0, high: 0, medium: 0 },
          pageData: {}
        }
      });
    } else {
      alert('Failed to start scan: ' + (data.error || 'Unknown error'));
      setScanning(false);
    }
  } catch (error) {
    console.error('Audit error:', error);
    alert('Failed to start audit. Please try again.');
    setScanning(false);
  }
};
```

### Option 2: Show Progress Indicator

Add a loading state in the UI:

```javascript
{scanning && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
    <div className="flex items-center gap-3">
      <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
      <div>
        <p className="font-medium text-blue-900">Scan in Progress</p>
        <p className="text-sm text-blue-700">
          Running comprehensive SEO analysis. This may take 30-60 seconds...
        </p>
      </div>
    </div>
  </div>
)}
```

### Option 3: Add Cancel Button (Advanced)

```javascript
const cancelScan = () => {
  setPollingScanId(null);
  setScanning(false);
  console.log('❌ Scan polling cancelled by user');
};

// In UI
{scanning && (
  <button
    onClick={cancelScan}
    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
  >
    Cancel Scan
  </button>
)}
```

## When to Implement

### Implement Now If:
- ✅ You want automatic scan status updates
- ✅ You want better UX (no manual refresh)
- ✅ You're comfortable with frontend changes

### Implement Later If:
- ⏸️ You want to test backend first
- ⏸️ You prefer manual refresh for now
- ⏸️ You want to freeze all frontend changes

## Testing

After implementing polling:

1. Click "Run New Audit"
2. See "Scan in Progress" message
3. Wait 30-60 seconds
4. Results automatically appear (no refresh needed)

## Notes

- Polling interval: 5 seconds (adjustable)
- Stops automatically when scan completes
- Handles errors gracefully
- No impact on backend
- Optional enhancement only
