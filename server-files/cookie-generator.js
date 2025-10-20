// cookie-generator.js - High-CPM Cookie Generator for Premium Advertising
import crypto from 'crypto';

// High-value interest categories for premium CPM
const HIGH_VALUE_INTERESTS = [
  'finance', 'insurance', 'legal', 'real-estate', 'automotive',
  'luxury-goods', 'technology', 'business-software', 'healthcare',
  'education', 'travel', 'home-improvement', 'investment', 'crypto'
];

// Demographics for rotation (high-value audiences)
const DEMOGRAPHICS = [
  { age: '25-34', income: 'high', gender: 'M', location: 'US-CA', zip: '94102' },
  { age: '35-44', income: 'high', gender: 'F', location: 'US-NY', zip: '10001' },
  { age: '45-54', income: 'premium', gender: 'M', location: 'US-TX', zip: '75201' },
  { age: '25-34', income: 'premium', gender: 'F', location: 'US-FL', zip: '33101' },
  { age: '35-44', income: 'high', gender: 'M', location: 'US-WA', zip: '98101' },
  { age: '30-40', income: 'premium', gender: 'F', location: 'US-MA', zip: '02101' },
  { age: '40-50', income: 'high', gender: 'M', location: 'US-IL', zip: '60601' },
];

// Used cookie tracker to avoid repetition
const usedCookieSets = new Set();
const MAX_COOKIE_SETS = 10000;

function generateUniqueId() {
  return crypto.randomBytes(16).toString('hex');
}

function generateShortId() {
  return crypto.randomBytes(8).toString('hex');
}

function generateTimestamp() {
  return Math.floor(Date.now() / 1000);
}

function selectRandomInterests(count = 3) {
  const shuffled = [...HIGH_VALUE_INTERESTS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function selectDemographic() {
  return DEMOGRAPHICS[Math.floor(Math.random() * DEMOGRAPHICS.length)];
}

function generateGoogleAdsCookies(demographic, interests) {
  const userId = generateUniqueId();
  const timestamp = generateTimestamp();
  
  return [
    {
      name: '__gads',
      value: `ID=${userId}:T=${timestamp}:S=ALNI_${generateShortId()}`,
      domain: '.google.com',
      path: '/',
      expires: timestamp + 31536000, // 1 year
      httpOnly: false,
      secure: true,
      sameSite: 'None'
    },
    {
      name: 'IDE',
      value: generateUniqueId(),
      domain: '.doubleclick.net',
      path: '/',
      expires: timestamp + 31536000,
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    },
    {
      name: '__gac',
      value: `1.${timestamp}.${interests.join('.')}.${demographic.age}.${demographic.income}`,
      domain: '.google.com',
      path: '/',
      expires: timestamp + 7776000, // 90 days
      httpOnly: false,
      secure: true,
      sameSite: 'Lax'
    },
    {
      name: 'DSID',
      value: generateShortId(),
      domain: '.doubleclick.net',
      path: '/',
      expires: timestamp + 1209600, // 14 days
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    }
  ];
}

function generateFacebookCookies(demographic) {
  const timestamp = generateTimestamp();
  const userId = generateShortId();
  
  return [
    {
      name: 'fr',
      value: `${generateShortId()}.${generateShortId()}.${timestamp}.${demographic.location}`,
      domain: '.facebook.com',
      path: '/',
      expires: timestamp + 7776000,
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    },
    {
      name: 'datr',
      value: generateUniqueId(),
      domain: '.facebook.com',
      path: '/',
      expires: timestamp + 63072000, // 2 years
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    },
    {
      name: 'sb',
      value: generateShortId(),
      domain: '.facebook.com',
      path: '/',
      expires: timestamp + 63072000,
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    }
  ];
}

function generateAmazonCookies(interests) {
  const timestamp = generateTimestamp();
  
  return [
    {
      name: 'ad-id',
      value: generateUniqueId(),
      domain: '.amazon.com',
      path: '/',
      expires: timestamp + 31536000,
      httpOnly: false,
      secure: true,
      sameSite: 'Lax'
    },
    {
      name: 'session-id',
      value: `${timestamp}-${generateUniqueId()}`,
      domain: '.amazon.com',
      path: '/',
      expires: timestamp + 86400, // 1 day
      httpOnly: false,
      secure: false,
      sameSite: 'Lax'
    },
    {
      name: 'ad-privacy',
      value: '1',
      domain: '.amazon.com',
      path: '/',
      expires: timestamp + 31536000,
      httpOnly: false,
      secure: true,
      sameSite: 'Lax'
    }
  ];
}

function generateCriteoCookies(demographic) {
  const timestamp = generateTimestamp();
  
  return [
    {
      name: 'uid',
      value: generateUniqueId(),
      domain: '.criteo.com',
      path: '/',
      expires: timestamp + 31536000,
      httpOnly: false,
      secure: true,
      sameSite: 'None'
    },
    {
      name: 'optout',
      value: '0',
      domain: '.criteo.com',
      path: '/',
      expires: timestamp + 157680000, // 5 years
      httpOnly: false,
      secure: true,
      sameSite: 'None'
    }
  ];
}

function generateTaboolaCookies() {
  const timestamp = generateTimestamp();
  
  return [
    {
      name: 't_gid',
      value: generateUniqueId(),
      domain: '.taboola.com',
      path: '/',
      expires: timestamp + 31536000,
      httpOnly: false,
      secure: true,
      sameSite: 'None'
    },
    {
      name: 'taboola_select',
      value: 'true',
      domain: '.taboola.com',
      path: '/',
      expires: timestamp + 31536000,
      httpOnly: false,
      secure: true,
      sameSite: 'None'
    }
  ];
}

function generateMediaNetCookies() {
  const timestamp = generateTimestamp();
  
  return [
    {
      name: 'visitor-id',
      value: generateUniqueId(),
      domain: '.media.net',
      path: '/',
      expires: timestamp + 31536000,
      httpOnly: false,
      secure: true,
      sameSite: 'None'
    }
  ];
}

function generateOutbrainCookies() {
  const timestamp = generateTimestamp();
  
  return [
    {
      name: 'obuid',
      value: generateUniqueId(),
      domain: '.outbrain.com',
      path: '/',
      expires: timestamp + 31536000,
      httpOnly: false,
      secure: true,
      sameSite: 'None'
    }
  ];
}

export function generateHighCPMCookies() {
  const demographic = selectDemographic();
  const interests = selectRandomInterests(3);
  
  // Generate unique cookie set ID
  let cookieSetId;
  let attempts = 0;
  
  do {
    cookieSetId = `${demographic.age}-${demographic.income}-${interests.join('-')}-${crypto.randomBytes(4).toString('hex')}`;
    attempts++;
    
    if (attempts > 100) {
      // Clear old sets if we've generated too many
      usedCookieSets.clear();
      break;
    }
  } while (usedCookieSets.has(cookieSetId));
  
  usedCookieSets.add(cookieSetId);
  
  // Limit memory usage
  if (usedCookieSets.size > MAX_COOKIE_SETS) {
    const firstKey = usedCookieSets.values().next().value;
    usedCookieSets.delete(firstKey);
  }
  
  // Combine all cookies from premium ad networks
  const allCookies = [
    ...generateGoogleAdsCookies(demographic, interests),
    ...generateFacebookCookies(demographic),
    ...generateAmazonCookies(interests),
    ...generateCriteoCookies(demographic),
    ...generateTaboolaCookies(),
    ...generateMediaNetCookies(),
    ...generateOutbrainCookies()
  ];
  
  return {
    cookies: allCookies,
    metadata: {
      cookieSetId,
      demographic,
      interests,
      generatedAt: new Date().toISOString(),
      cpmCategory: 'premium',
      estimatedCPM: calculateEstimatedCPM(demographic, interests),
      adNetworks: ['Google Ads', 'Facebook', 'Amazon', 'Criteo', 'Taboola', 'Media.net', 'Outbrain']
    }
  };
}

function calculateEstimatedCPM(demographic, interests) {
  let baseCPM = 5.0; // Base CPM for standard traffic
  
  // Premium demographics boost
  if (demographic.income === 'premium') baseCPM += 4.0;
  if (demographic.income === 'high') baseCPM += 2.5;
  
  // Age group premiums
  if (demographic.age === '35-44' || demographic.age === '45-54') baseCPM += 1.5;
  
  // High-value interests
  const premiumInterests = ['finance', 'insurance', 'legal', 'real-estate', 'investment', 'crypto'];
  const hasPremiumInterest = interests.some(i => premiumInterests.includes(i));
  if (hasPremiumInterest) baseCPM += 3.5;
  
  // Location premium (major metro areas)
  const premiumLocations = ['US-CA', 'US-NY', 'US-WA', 'US-MA'];
  if (premiumLocations.includes(demographic.location)) baseCPM += 2.0;
  
  return parseFloat(baseCPM.toFixed(2));
}

export function getCookieStats() {
  return {
    totalUniqueSets: usedCookieSets.size,
    maxSets: MAX_COOKIE_SETS,
    availableSlots: MAX_COOKIE_SETS - usedCookieSets.size,
    utilizationPercent: ((usedCookieSets.size / MAX_COOKIE_SETS) * 100).toFixed(2)
  };
}

export function clearCookieCache() {
  const previousSize = usedCookieSets.size;
  usedCookieSets.clear();
  return {
    success: true,
    clearedSets: previousSize,
    message: `Cleared ${previousSize} cookie sets from cache`
  };
}
