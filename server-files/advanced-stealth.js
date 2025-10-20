// advanced-stealth.js - Advanced Anti-Detection & Stealth System
// Bypasses sophisticated bot detection: Cloudflare, PerimeterX, DataDome, FingerprintJS

import crypto from 'crypto';

// ============================================
// WEBRTC LEAK PROTECTION
// ============================================

export function getWebRTCProtection() {
  return `
    // Disable WebRTC to prevent IP leaks
    if (window.RTCPeerConnection) {
      const originalRTC = window.RTCPeerConnection;
      window.RTCPeerConnection = function(...args) {
        const pc = new originalRTC(...args);
        const originalCreateDataChannel = pc.createDataChannel;
        pc.createDataChannel = function() {
          return null;
        };
        return pc;
      };
    }
    
    // Override getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia = function() {
        return Promise.reject(new Error('Permission denied'));
      };
    }
  `;
}

// ============================================
// FONT FINGERPRINT RANDOMIZATION
// ============================================

export function getFontRandomization() {
  const fonts = [
    'Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New',
    'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS', 'Trebuchet MS',
    'Arial Black', 'Impact', 'Lucida Sans', 'Tahoma', 'Calibri'
  ];
  
  const randomFonts = fonts.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 5) + 8);
  
  return `
    // Randomize font detection
    const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      get: function() {
        const width = originalOffsetWidth.get.call(this);
        return width + (Math.random() * 0.01 - 0.005);
      }
    });
    
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      get: function() {
        const height = originalOffsetHeight.get.call(this);
        return height + (Math.random() * 0.01 - 0.005);
      }
    });
    
    // Spoof available fonts
    const availableFonts = ${JSON.stringify(randomFonts)};
  `;
}

// ============================================
// BATTERY API SPOOFING
// ============================================

export function getBatterySpoofing() {
  const level = (Math.random() * 0.6 + 0.3).toFixed(2); // 30-90%
  const charging = Math.random() > 0.5;
  const chargingTime = charging ? Math.floor(Math.random() * 3600) : Infinity;
  const dischargingTime = !charging ? Math.floor(Math.random() * 7200 + 3600) : Infinity;
  
  return `
    // Spoof Battery API
    if (navigator.getBattery) {
      navigator.getBattery = async function() {
        return {
          charging: ${charging},
          chargingTime: ${chargingTime},
          dischargingTime: ${dischargingTime},
          level: ${level},
          addEventListener: function() {},
          removeEventListener: function() {}
        };
      };
    }
  `;
}

// ============================================
// SCREEN RESOLUTION NOISE
// ============================================

export function getScreenNoise(viewport) {
  const widthNoise = Math.floor(Math.random() * 3 - 1);
  const heightNoise = Math.floor(Math.random() * 3 - 1);
  
  return `
    // Add noise to screen dimensions
    Object.defineProperty(screen, 'width', {
      get: () => ${viewport.width + widthNoise}
    });
    Object.defineProperty(screen, 'height', {
      get: () => ${viewport.height + heightNoise}
    });
    Object.defineProperty(screen, 'availWidth', {
      get: () => ${viewport.width + widthNoise}
    });
    Object.defineProperty(screen, 'availHeight', {
      get: () => ${viewport.height + heightNoise - 40}
    });
  `;
}

// ============================================
// TIMEZONE/LOCALE CONSISTENCY
// ============================================

export function getTimezoneConsistency(timezone, locale) {
  const timezoneOffset = getTimezoneOffset(timezone);
  
  return `
    // Ensure timezone consistency
    Date.prototype.getTimezoneOffset = function() {
      return ${timezoneOffset};
    };
    
    // Consistent Intl API
    const originalDateTimeFormat = Intl.DateTimeFormat;
    Intl.DateTimeFormat = function(...args) {
      if (!args[0]) args[0] = '${locale}';
      return new originalDateTimeFormat(...args);
    };
    
    // Consistent locale
    Object.defineProperty(navigator, 'language', {
      get: () => '${locale}'
    });
    Object.defineProperty(navigator, 'languages', {
      get: () => ['${locale}', '${locale.split('-')[0]}', 'en-US', 'en']
    });
  `;
}

function getTimezoneOffset(timezone) {
  const offsets = {
    'America/New_York': 300,
    'America/Chicago': 360,
    'America/Los_Angeles': 420,
    'America/Denver': 420,
    'Europe/London': 0,
    'Europe/Paris': -60,
    'Asia/Tokyo': -540,
    'Asia/Shanghai': -480,
    'Australia/Sydney': -660
  };
  return offsets[timezone] || 0;
}

// ============================================
// PLUGIN ENUMERATION RANDOMIZATION
// ============================================

export function getPluginRandomization() {
  const pluginSets = [
    [
      { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
      { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: 'Portable Document Format' },
      { name: 'Native Client', filename: 'internal-nacl-plugin', description: 'Native Client Executable' }
    ],
    [
      { name: 'PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
      { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: 'Portable Document Format' }
    ],
    []
  ];
  
  const selectedPlugins = pluginSets[Math.floor(Math.random() * pluginSets.length)];
  
  return `
    // Randomize plugin enumeration
    Object.defineProperty(navigator, 'plugins', {
      get: () => {
        const plugins = ${JSON.stringify(selectedPlugins)};
        return {
          length: plugins.length,
          item: (i) => plugins[i],
          namedItem: (name) => plugins.find(p => p.name === name),
          refresh: () => {},
          [Symbol.iterator]: function* () {
            for (let i = 0; i < plugins.length; i++) {
              yield plugins[i];
            }
          }
        };
      }
    });
  `;
}

// ============================================
// HTTP HEADER FINGERPRINTING
// ============================================

export function getHTTPHeaders(locale, platform) {
  const acceptLanguage = getAcceptLanguage(locale);
  const secChUa = getSecChUa(platform);
  
  return {
    'Accept-Language': acceptLanguage,
    'Sec-CH-UA': secChUa,
    'Sec-CH-UA-Mobile': platform.includes('Mobile') ? '?1' : '?0',
    'Sec-CH-UA-Platform': `"${getPlatformName(platform)}"`,
    'DNT': Math.random() > 0.7 ? '1' : null,
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-User': '?1',
    'Sec-Fetch-Dest': 'document'
  };
}

function getAcceptLanguage(locale) {
  const lang = locale.split('-')[0];
  return `${locale},${lang};q=0.9,en-US;q=0.8,en;q=0.7`;
}

function getSecChUa(platform) {
  if (platform.includes('Win')) {
    return '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
  } else if (platform.includes('Mac')) {
    return '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
  }
  return '"Not_A Brand";v="8", "Chromium";v="120"';
}

function getPlatformName(platform) {
  if (platform.includes('Win')) return 'Windows';
  if (platform.includes('Mac')) return 'macOS';
  if (platform.includes('Linux')) return 'Linux';
  if (platform.includes('Android')) return 'Android';
  if (platform.includes('iPhone') || platform.includes('iPad')) return 'iOS';
  return 'Unknown';
}

// ============================================
// BEHAVIORAL BIOMETRICS
// ============================================

export function getBehavioralBiometrics() {
  return {
    mouseMovement: {
      enabled: true,
      variance: 0.15, // 15% variance in movement patterns
      naturalCurves: true
    },
    typingSpeed: {
      wpm: Math.floor(Math.random() * 40) + 40, // 40-80 WPM
      variance: 0.2
    },
    scrollVelocity: {
      min: 100,
      max: 800,
      acceleration: true
    },
    clickTiming: {
      minDelay: 150,
      maxDelay: 450,
      doubleClickThreshold: 500
    }
  };
}

// ============================================
// PERMISSION API SPOOFING
// ============================================

export function getPermissionSpoofing() {
  return `
    // Spoof Permissions API
    if (navigator.permissions && navigator.permissions.query) {
      const originalQuery = navigator.permissions.query;
      navigator.permissions.query = function(params) {
        if (params.name === 'notifications') {
          return Promise.resolve({ state: 'denied', onchange: null });
        }
        if (params.name === 'geolocation') {
          return Promise.resolve({ state: 'prompt', onchange: null });
        }
        return originalQuery.call(navigator.permissions, params);
      };
    }
  `;
}

// ============================================
// CHROME RUNTIME DETECTION BYPASS
// ============================================

export function getChromeRuntimeBypass() {
  return `
    // Remove chrome.runtime detection
    if (window.chrome && window.chrome.runtime) {
      delete window.chrome.runtime;
    }
    
    // Add realistic chrome object
    if (!window.chrome) {
      window.chrome = {};
    }
    
    window.chrome.app = {
      isInstalled: false,
      InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
      RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' }
    };
    
    window.chrome.csi = function() {
      return {
        startE: Date.now(),
        onloadT: Date.now() + Math.random() * 1000,
        pageT: Math.random() * 2000,
        tran: 15
      };
    };
    
    window.chrome.loadTimes = function() {
      return {
        requestTime: Date.now() / 1000 - Math.random() * 10,
        startLoadTime: Date.now() / 1000 - Math.random() * 5,
        commitLoadTime: Date.now() / 1000 - Math.random() * 2,
        finishDocumentLoadTime: Date.now() / 1000 - Math.random(),
        finishLoadTime: Date.now() / 1000,
        firstPaintTime: Date.now() / 1000 - Math.random() * 3,
        firstPaintAfterLoadTime: 0,
        navigationType: 'Other',
        wasFetchedViaSpdy: false,
        wasNpnNegotiated: true,
        npnNegotiatedProtocol: 'h2',
        wasAlternateProtocolAvailable: false,
        connectionInfo: 'h2'
      };
    };
  `;
}

// ============================================
// IFRAME DETECTION BYPASS
// ============================================

export function getIframeBypass() {
  return `
    // Bypass iframe detection
    Object.defineProperty(window, 'top', {
      get: function() { return window; }
    });
    Object.defineProperty(window, 'frameElement', {
      get: function() { return null; }
    });
  `;
}

// ============================================
// NOTIFICATION API SPOOFING
// ============================================

export function getNotificationSpoofing() {
  return `
    // Spoof Notification API
    if (window.Notification) {
      Object.defineProperty(Notification, 'permission', {
        get: () => 'default'
      });
      
      Notification.requestPermission = function() {
        return Promise.resolve('default');
      };
    }
  `;
}

// ============================================
// MAIN STEALTH INJECTION FUNCTION
// ============================================

export function generateStealthScript(profile) {
  const scripts = [
    getWebRTCProtection(),
    getFontRandomization(),
    getBatterySpoofing(),
    getScreenNoise(profile.viewport),
    getTimezoneConsistency(profile.timezone, profile.locale),
    getPluginRandomization(),
    getPermissionSpoofing(),
    getChromeRuntimeBypass(),
    getIframeBypass(),
    getNotificationSpoofing()
  ];
  
  return scripts.join('\n\n');
}

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================

export default {
  generateStealthScript,
  getHTTPHeaders,
  getBehavioralBiometrics,
  getWebRTCProtection,
  getFontRandomization,
  getBatterySpoofing,
  getScreenNoise,
  getTimezoneConsistency,
  getPluginRandomization,
  getPermissionSpoofing,
  getChromeRuntimeBypass,
  getIframeBypass,
  getNotificationSpoofing
};
