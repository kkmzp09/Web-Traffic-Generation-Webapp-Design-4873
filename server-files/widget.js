/**
 * OrganiTraffic SEO Auto-Fix Widget
 * Enables automatic SEO fix application to customer websites
 * 
 * Installation:
 * <script src="https://api.organitrafficboost.com/widget.js" data-site-id="YOUR_SITE_ID"></script>
 */

(function() {
  'use strict';

  // Configuration
  const API_BASE = 'https://api.organitrafficboost.com';
  const PING_INTERVAL = 30000; // 30 seconds
  const POLL_INTERVAL = 5000; // 5 seconds

  // Widget state
  let siteId = null;
  let widgetKey = null;
  let isActive = false;
  let pollTimer = null;
  let pingTimer = null;

  /**
   * Initialize widget
   */
  function init() {
    // Get site ID from script tag
    const scriptTag = document.querySelector('script[data-site-id]');
    if (!scriptTag) {
      console.error('[OrganiTraffic] Widget script tag missing data-site-id attribute');
      return;
    }

    siteId = scriptTag.getAttribute('data-site-id');
    widgetKey = scriptTag.getAttribute('data-widget-key');

    if (!siteId) {
      console.error('[OrganiTraffic] Site ID is required');
      return;
    }

    console.log('[OrganiTraffic] Widget initializing for site:', siteId);

    // Register widget
    registerWidget();

    // Start polling for fixes
    startPolling();

    // Start ping timer
    startPinging();

    isActive = true;
  }

  /**
   * Register widget with API
   */
  async function registerWidget() {
    try {
      const response = await fetch(`${API_BASE}/api/widget/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          siteId: siteId,
          widgetKey: widgetKey,
          domain: window.location.hostname,
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });

      const data = await response.json();

      if (data.success) {
        widgetKey = data.widgetKey;
        console.log('[OrganiTraffic] Widget registered successfully');
        logActivity('install', { url: window.location.href });
      } else {
        console.error('[OrganiTraffic] Registration failed:', data.error);
      }
    } catch (error) {
      console.error('[OrganiTraffic] Registration error:', error);
    }
  }

  /**
   * Start polling for pending fixes
   */
  function startPolling() {
    pollTimer = setInterval(async () => {
      await checkForFixes();
    }, POLL_INTERVAL);

    // Check immediately
    checkForFixes();
  }

  /**
   * Start pinging to show widget is online
   */
  function startPinging() {
    pingTimer = setInterval(async () => {
      await sendPing();
    }, PING_INTERVAL);
  }

  /**
   * Send ping to API
   */
  async function sendPing() {
    try {
      await fetch(`${API_BASE}/api/widget/ping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Widget-Key': widgetKey
        },
        body: JSON.stringify({
          siteId: siteId,
          url: window.location.href
        })
      });
    } catch (error) {
      // Silent fail for pings
    }
  }

  /**
   * Check for pending fixes
   */
  async function checkForFixes() {
    try {
      const response = await fetch(`${API_BASE}/api/widget/fixes/${siteId}`);

      const data = await response.json();

      if (data.success && data.fixes && data.fixes.length > 0) {
        console.log(`[OrganiTraffic] Found ${data.fixes.length} active fix(es)`);
        
        for (const fix of data.fixes) {
          await applyFix(fix);
        }
      }
    } catch (error) {
      console.error('[OrganiTraffic] Error checking for fixes:', error);
    }
  }

  /**
   * Apply a fix to the page
   */
  async function applyFix(fix) {
    console.log('[OrganiTraffic] Applying fix:', fix.fix_type);

    try {
      let success = false;
      let errorMessage = null;

      switch (fix.fix_type) {
        case 'title':
          success = applyTitleFix(fix.fix_data);
          break;
        case 'meta':
          success = applyMetaFix(fix.fix_data);
          break;
        case 'headings':
        case 'h1':
          success = applyH1Fix(fix.fix_data);
          break;
        case 'images':
          success = applyImageAltFix(fix.fix_data);
          break;
        case 'schema':
          success = applySchemaFix(fix.fix_data);
          break;
        case 'social':
          success = applyOpenGraphFix(fix.fix_data);
          break;
        case 'technical':
          success = applyTechnicalFix(fix.fix_data);
          break;
        case 'mobile':
          success = applyMobileFix(fix.fix_data);
          break;
        default:
          errorMessage = 'Unknown fix type';
      }

      // Report fix status
      await reportFixStatus(fix.id, success, errorMessage);

      if (success) {
        console.log('[OrganiTraffic] Fix applied successfully:', fix.fix_type);
        logActivity('fix_applied', { fixId: fix.id, fixType: fix.fix_type });
      } else {
        console.error('[OrganiTraffic] Fix failed:', errorMessage);
        logActivity('error', { fixId: fix.id, error: errorMessage });
      }
    } catch (error) {
      console.error('[OrganiTraffic] Error applying fix:', error);
      await reportFixStatus(fix.id, false, error.message);
      logActivity('error', { fixId: fix.id, error: error.message });
    }
  }

  /**
   * Apply title tag fix
   */
  function applyTitleFix(data) {
    try {
      document.title = data.optimized_content;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Apply meta description fix
   */
  function applyMetaFix(data) {
    try {
      let metaTag = document.querySelector('meta[name="description"]');
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', 'description');
        document.head.appendChild(metaTag);
      }

      metaTag.setAttribute('content', data.optimized_content);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Apply H1 fix
   */
  function applyH1Fix(data) {
    try {
      let h1 = document.querySelector('h1');
      
      if (!h1) {
        // Create H1 at the beginning of main content
        const main = document.querySelector('main, article, .content, #content, body');
        h1 = document.createElement('h1');
        main.insertBefore(h1, main.firstChild);
      }

      h1.textContent = data.optimized_content;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Apply image alt text fix
   */
  function applyImageAltFix(data) {
    try {
      const selector = data.selector || 'img:not([alt])';
      const images = document.querySelectorAll(selector);
      
      if (images.length > 0) {
        images[0].setAttribute('alt', data.optimized_content);
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Apply schema markup fix
   */
  function applySchemaFix(data) {
    try {
      // Check if schema already exists
      const existingSchema = document.querySelector('script[type="application/ld+json"]');
      
      if (existingSchema) {
        existingSchema.textContent = JSON.stringify(data.schema);
      } else {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data.schema);
        document.head.appendChild(script);
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Report fix status back to API
   */
  async function reportFixStatus(fixId, success, errorMessage) {
    try {
      await fetch(`${API_BASE}/api/widget/fix-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Widget-Key': widgetKey
        },
        body: JSON.stringify({
          siteId: siteId,
          fixId: fixId,
          success: success,
          error: errorMessage
        })
      });
    } catch (error) {
      console.error('[OrganiTraffic] Error reporting fix status:', error);
    }
  }

  /**
   * Apply Open Graph tags fix
   */
  function applyOpenGraphFix(data) {
    try {
      const content = data.optimized_content;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      const metaTags = tempDiv.querySelectorAll('meta');
      metaTags.forEach(tag => {
        const property = tag.getAttribute('property');
        if (property && property.startsWith('og:')) {
          let existing = document.querySelector(`meta[property="${property}"]`);
          if (!existing) {
            existing = document.createElement('meta');
            existing.setAttribute('property', property);
            document.head.appendChild(existing);
          }
          existing.setAttribute('content', tag.getAttribute('content'));
        }
      });
      
      return true;
    } catch (error) {
      console.error('[OrganiTraffic] Error applying Open Graph fix:', error);
      return false;
    }
  }

  /**
   * Apply Technical SEO fix (canonical, robots)
   */
  function applyTechnicalFix(data) {
    try {
      const content = data.optimized_content;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      // Handle canonical tag
      const canonical = tempDiv.querySelector('link[rel="canonical"]');
      if (canonical) {
        let existing = document.querySelector('link[rel="canonical"]');
        if (!existing) {
          existing = document.createElement('link');
          existing.setAttribute('rel', 'canonical');
          document.head.appendChild(existing);
        }
        existing.setAttribute('href', canonical.getAttribute('href'));
        return true;
      }
      
      // Handle robots meta tag
      const robots = tempDiv.querySelector('meta[name="robots"]');
      if (robots) {
        let existing = document.querySelector('meta[name="robots"]');
        if (!existing) {
          existing = document.createElement('meta');
          existing.setAttribute('name', 'robots');
          document.head.appendChild(existing);
        }
        existing.setAttribute('content', robots.getAttribute('content'));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[OrganiTraffic] Error applying technical fix:', error);
      return false;
    }
  }

  /**
   * Apply Mobile/Viewport fix
   */
  function applyMobileFix(data) {
    try {
      const content = data.optimized_content;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      const viewport = tempDiv.querySelector('meta[name="viewport"]');
      if (viewport) {
        let existing = document.querySelector('meta[name="viewport"]');
        if (!existing) {
          existing = document.createElement('meta');
          existing.setAttribute('name', 'viewport');
          document.head.appendChild(existing);
        }
        existing.setAttribute('content', viewport.getAttribute('content'));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[OrganiTraffic] Error applying mobile fix:', error);
      return false;
    }
  }

  /**
   * Log activity
   */
  async function logActivity(type, details) {
    try {
      await fetch(`${API_BASE}/api/widget/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Widget-Key': widgetKey
        },
        body: JSON.stringify({
          siteId: siteId,
          activityType: type,
          details: details,
          url: window.location.href
        })
      });
    } catch (error) {
      // Silent fail for logging
    }
  }

  /**
   * Cleanup on page unload
   */
  window.addEventListener('beforeunload', () => {
    if (pollTimer) clearInterval(pollTimer);
    if (pingTimer) clearInterval(pingTimer);
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose widget API
  window.OrganiTrafficWidget = {
    version: '1.0.0',
    isActive: () => isActive,
    getSiteId: () => siteId,
    checkNow: () => checkForFixes()
  };

})();
