// Device Fingerprinting for Traffic Generation
// Generates realistic browser fingerprints to simulate different devices

const BROWSER_VERSIONS = {
  chrome: ['120.0.0.0', '119.0.0.0', '118.0.0.0', '117.0.0.0'],
  firefox: ['120.0', '119.0', '118.0', '117.0'],
  safari: ['17.1', '17.0', '16.6', '16.5'],
  edge: ['120.0.0.0', '119.0.0.0', '118.0.0.0', '117.0.0.0']
};

const OPERATING_SYSTEMS = {
  windows: {
    name: 'Windows NT',
    versions: ['10.0', '11.0'],
    platform: 'Win32',
    architectures: ['x86_64', 'x86']
  },
  macos: {
    name: 'Macintosh',
    versions: ['14.1', '13.6', '12.7', '11.7'],
    platform: 'MacIntel',
    architectures: ['x86_64', 'arm64']
  },
  linux: {
    name: 'Linux',
    versions: ['Ubuntu', 'Debian', 'CentOS', 'Fedora'],
    platform: 'Linux x86_64',
    architectures: ['x86_64', 'i686']
  },
  android: {
    name: 'Android',
    versions: ['14', '13', '12', '11'],
    platform: 'Linux armv8l',
    architectures: ['arm64', 'armv7l']
  },
  ios: {
    name: 'iPhone OS',
    versions: ['17_1', '16_7', '15_8', '14_8'],
    platform: 'iPhone',
    architectures: ['arm64']
  }
};

const SCREEN_RESOLUTIONS = {
  desktop: [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1536, height: 864 },
    { width: 2560, height: 1440 },
    { width: 1280, height: 720 }
  ],
  mobile: [
    { width: 375, height: 812 }, // iPhone X/11/12/13
    { width: 414, height: 896 }, // iPhone 11 Pro Max
    { width: 390, height: 844 }, // iPhone 12/13 Pro
    { width: 360, height: 640 }, // Galaxy S series
    { width: 412, height: 915 }, // Pixel series
    { width: 320, height: 568 }  // iPhone SE
  ],
  tablet: [
    { width: 768, height: 1024 }, // iPad
    { width: 1024, height: 1366 }, // iPad Pro
    { width: 800, height: 1280 }, // Android tablet
    { width: 601, height: 962 }   // Surface
  ]
};

const DEVICE_TYPES = ['desktop', 'mobile', 'tablet'];

// Generate random element from array
const randomChoice = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Generate random number between min and max
const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate User Agent string
const generateUserAgent = (browser, browserVersion, os, osVersion, deviceType) => {
  const isDesktop = deviceType === 'desktop';
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';

  switch (browser) {
    case 'chrome':
      if (isMobile || isTablet) {
        if (os.name === 'Android') {
          return `Mozilla/5.0 (Linux; Android ${osVersion}; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion} Mobile Safari/537.36`;
        } else if (os.name === 'iPhone OS') {
          return `Mozilla/5.0 (iPhone; CPU iPhone OS ${osVersion.replace(/\./g, '_')} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/${browserVersion} Mobile/15E148 Safari/604.1`;
        }
      }
      return `Mozilla/5.0 (${os.platform}; ${os.name} ${osVersion}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion} Safari/537.36`;

    case 'firefox':
      if (isMobile) {
        if (os.name === 'Android') {
          return `Mozilla/5.0 (Mobile; rv:${browserVersion}) Gecko/${browserVersion} Firefox/${browserVersion}`;
        }
      }
      return `Mozilla/5.0 (${os.platform}; rv:${browserVersion}) Gecko/20100101 Firefox/${browserVersion}`;

    case 'safari':
      if (isMobile || isTablet) {
        return `Mozilla/5.0 (iPhone; CPU iPhone OS ${osVersion.replace(/\./g, '_')} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${browserVersion} Mobile/15E148 Safari/604.1`;
      }
      return `Mozilla/5.0 (Macintosh; Intel Mac OS X ${osVersion.replace(/\./g, '_')}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${browserVersion} Safari/605.1.15`;

    case 'edge':
      return `Mozilla/5.0 (${os.platform}; ${os.name} ${osVersion}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion} Safari/537.36 Edg/${browserVersion}`;

    default:
      return `Mozilla/5.0 (${os.platform}; ${os.name} ${osVersion}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion} Safari/537.36`;
  }
};

// Generate WebGL renderer
const generateWebGLRenderer = (deviceType, os) => {
  const renderers = {
    desktop: [
      'ANGLE (NVIDIA GeForce RTX 3070 Direct3D11 vs_5_0 ps_5_0)',
      'ANGLE (AMD Radeon RX 6700 XT Direct3D11 vs_5_0 ps_5_0)',
      'ANGLE (Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0)',
      'Apple GPU',
      'Mesa DRI Intel(R) UHD Graphics 620'
    ],
    mobile: [
      'Adreno (TM) 640',
      'Mali-G76 MP12',
      'Apple A15 GPU',
      'PowerVR Rogue GE8320',
      'Adreno (TM) 530'
    ],
    tablet: [
      'Apple A12X GPU',
      'Adreno (TM) 640',
      'Mali-G76 MP12',
      'PowerVR Series 6'
    ]
  };

  return randomChoice(renderers[deviceType] || renderers.desktop);
};

// Generate canvas fingerprint
const generateCanvasFingerprint = () => {
  // Simulate canvas fingerprinting result
  const canvasData = Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');
  
  return canvasData.substring(0, 32);
};

// Generate audio fingerprint
const generateAudioFingerprint = () => {
  // Simulate audio context fingerprinting
  return (Math.random() * 1000000).toFixed(6);
};

// Generate timezone
const generateTimezone = () => {
  const timezones = [
    'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Denver',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome',
    'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Mumbai', 'Asia/Seoul',
    'Australia/Sydney', 'Australia/Melbourne', 'Pacific/Auckland'
  ];
  
  return randomChoice(timezones);
};

// Generate language preferences
const generateLanguages = (timezone) => {
  const languageMap = {
    'America/New_York': ['en-US', 'en'],
    'America/Los_Angeles': ['en-US', 'en', 'es-US'],
    'Europe/London': ['en-GB', 'en'],
    'Europe/Paris': ['fr-FR', 'fr', 'en'],
    'Europe/Berlin': ['de-DE', 'de', 'en'],
    'Asia/Tokyo': ['ja-JP', 'ja', 'en'],
    'Asia/Shanghai': ['zh-CN', 'zh', 'en']
  };
  
  return languageMap[timezone] || ['en-US', 'en'];
};

// Main fingerprint generation function
export const generateDeviceFingerprint = async (deviceType = null) => {
  // Randomly select device type if not specified
  const selectedDeviceType = deviceType || randomChoice(DEVICE_TYPES);
  
  // Select appropriate OS for device type
  let availableOS = Object.keys(OPERATING_SYSTEMS);
  if (selectedDeviceType === 'mobile') {
    availableOS = ['android', 'ios'];
  } else if (selectedDeviceType === 'tablet') {
    availableOS = ['android', 'ios', 'windows'];
  } else {
    availableOS = ['windows', 'macos', 'linux'];
  }
  
  const osKey = randomChoice(availableOS);
  const os = OPERATING_SYSTEMS[osKey];
  const osVersion = randomChoice(os.versions);
  
  // Select browser based on OS
  let availableBrowsers = Object.keys(BROWSER_VERSIONS);
  if (osKey === 'ios') {
    availableBrowsers = ['safari', 'chrome']; // iOS Chrome is actually Safari WebKit
  } else if (osKey === 'android') {
    availableBrowsers = ['chrome', 'firefox'];
  }
  
  const browser = randomChoice(availableBrowsers);
  const browserVersion = randomChoice(BROWSER_VERSIONS[browser]);
  
  // Generate screen resolution
  const resolutions = SCREEN_RESOLUTIONS[selectedDeviceType];
  const screen = randomChoice(resolutions);
  
  // Generate other properties
  const timezone = generateTimezone();
  const languages = generateLanguages(timezone);
  const webglRenderer = generateWebGLRenderer(selectedDeviceType, os);
  const canvasFingerprint = generateCanvasFingerprint();
  const audioFingerprint = generateAudioFingerprint();
  
  // Generate unique fingerprint ID
  const fingerprintId = `fp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  
  const fingerprint = {
    id: fingerprintId,
    timestamp: Date.now(),
    deviceType: selectedDeviceType,
    
    // System information
    system: {
      platform: os.platform,
      os: os.name,
      osVersion: osVersion,
      architecture: randomChoice(os.architectures)
    },
    
    // Browser information
    browser: {
      name: browser,
      version: browserVersion,
      userAgent: generateUserAgent(browser, browserVersion, os, osVersion, selectedDeviceType)
    },
    
    // Screen and display
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: randomChoice([24, 32]),
      pixelRatio: selectedDeviceType === 'mobile' ? randomChoice([2, 3]) : randomChoice([1, 2])
    },
    
    // Localization
    locale: {
      timezone: timezone,
      languages: languages,
      language: languages[0]
    },
    
    // Hardware fingerprinting
    hardware: {
      webglRenderer: webglRenderer,
      canvasFingerprint: canvasFingerprint,
      audioFingerprint: audioFingerprint,
      hardwareConcurrency: randomBetween(2, 16),
      deviceMemory: randomChoice([2, 4, 8, 16, 32])
    },
    
    // Network and connection
    network: {
      connectionType: selectedDeviceType === 'mobile' ? randomChoice(['4g', '5g', 'wifi']) : 'wifi',
      downlink: randomBetween(1, 100),
      rtt: randomBetween(50, 300)
    },
    
    // Additional browser features
    features: {
      cookieEnabled: true,
      doNotTrack: randomChoice([null, '1']),
      webdriver: false,
      plugins: generatePlugins(browser, selectedDeviceType),
      mimeTypes: generateMimeTypes(browser)
    }
  };
  
  return fingerprint;
};

// Generate browser plugins
const generatePlugins = (browser, deviceType) => {
  const commonPlugins = {
    chrome: [
      'Chrome PDF Plugin',
      'Chrome PDF Viewer',
      'Native Client'
    ],
    firefox: [
      'PDF.js',
      'OpenH264 Video Codec'
    ],
    safari: [
      'PDF',
      'QuickTime Plugin'
    ]
  };
  
  if (deviceType === 'mobile') {
    return []; // Mobile browsers typically have no plugins
  }
  
  return commonPlugins[browser] || commonPlugins.chrome;
};

// Generate MIME types
const generateMimeTypes = (browser) => {
  const baseMimeTypes = [
    'application/pdf',
    'text/pdf',
    'video/mp4',
    'audio/mpeg',
    'image/jpeg',
    'image/png',
    'text/html',
    'text/css',
    'application/javascript'
  ];
  
  if (browser === 'chrome') {
    baseMimeTypes.push('application/x-google-chrome-pdf');
  }
  
  return baseMimeTypes;
};

// Generate multiple fingerprints for a session
export const generateFingerprintSession = async (deviceType = null, count = 5) => {
  const fingerprints = [];
  
  for (let i = 0; i < count; i++) {
    const fingerprint = await generateDeviceFingerprint(deviceType);
    fingerprints.push(fingerprint);
    
    // Add small delay between generations
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return fingerprints;
};

// Rotate fingerprint (modify existing fingerprint slightly)
export const rotateFingerprintSession = (originalFingerprint) => {
  const rotated = { ...originalFingerprint };
  
  // Update timestamp
  rotated.timestamp = Date.now();
  
  // Slightly modify some properties to simulate natural variation
  rotated.screen.width += randomBetween(-10, 10);
  rotated.screen.height += randomBetween(-10, 10);
  rotated.hardware.canvasFingerprint = generateCanvasFingerprint();
  rotated.hardware.audioFingerprint = generateAudioFingerprint();
  rotated.network.downlink = randomBetween(1, 100);
  rotated.network.rtt = randomBetween(50, 300);
  
  // Generate new ID for rotated fingerprint
  rotated.id = `fp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  
  return rotated;
};

// Validate fingerprint integrity
export const validateFingerprint = (fingerprint) => {
  const requiredFields = [
    'id', 'deviceType', 'system', 'browser', 'screen', 
    'locale', 'hardware', 'network', 'features'
  ];
  
  for (const field of requiredFields) {
    if (!fingerprint[field]) {
      return { valid: false, missing: field };
    }
  }
  
  return { valid: true };
};

// Get fingerprint summary for display
export const getFingerprintSummary = (fingerprint) => {
  if (!fingerprint) return 'No fingerprint';
  
  const { system, browser, deviceType } = fingerprint;
  return `${deviceType} | ${browser.name} ${browser.version} | ${system.os} ${system.osVersion}`;
};

export default {
  generateDeviceFingerprint,
  generateFingerprintSession,
  rotateFingerprintSession,
  validateFingerprint,
  getFingerprintSummary
};