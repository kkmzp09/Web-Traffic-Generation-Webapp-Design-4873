// src/lib/discountCodes.js
// Discount code management system

export const DISCOUNT_CODES = {
  // 10% Discount Codes
  'WELCOME10': { discount: 10, description: 'Welcome discount - 10% off' },
  'SAVE10': { discount: 10, description: 'Save 10% on any plan' },
  'FIRST10': { discount: 10, description: 'First-time customer - 10% off' },
  
  // 20% Discount Codes
  'BOOST20': { discount: 20, description: 'Traffic boost - 20% off' },
  'SAVE20': { discount: 20, description: 'Save 20% on any plan' },
  'GROWTH20': { discount: 20, description: 'Growth special - 20% off' },
  
  // 50% Discount Codes
  'MEGA50': { discount: 50, description: 'Mega sale - 50% off' },
  'HALF50': { discount: 50, description: 'Half price special' },
  'LAUNCH50': { discount: 50, description: 'Launch offer - 50% off' },
  
  // 100% Discount Codes (Free)
  'FREE100': { discount: 100, description: 'Completely free - 100% off' },
  'TRIAL100': { discount: 100, description: 'Free trial - 100% off' },
  'PARTNER100': { discount: 100, description: 'Partner program - Free access' },
  'VIP100': { discount: 100, description: 'VIP access - 100% off' }
};

/**
 * Validate a discount code
 * @param {string} code - The discount code to validate
 * @returns {object|null} - Discount info or null if invalid
 */
export const validateDiscountCode = (code) => {
  const upperCode = code.toUpperCase().trim();
  return DISCOUNT_CODES[upperCode] || null;
};

/**
 * Calculate discounted price
 * @param {number} originalPrice - Original price
 * @param {number} discountPercent - Discount percentage (0-100)
 * @returns {object} - Object with original, discount, and final price
 */
export const calculateDiscount = (originalPrice, discountPercent) => {
  const discountAmount = Math.round((originalPrice * discountPercent) / 100);
  const finalPrice = originalPrice - discountAmount;
  
  return {
    originalPrice,
    discountPercent,
    discountAmount,
    finalPrice: Math.max(0, finalPrice), // Ensure non-negative
    isFree: discountPercent >= 100
  };
};

/**
 * Get all discount codes (for admin reference)
 * @returns {array} - Array of all discount codes with details
 */
export const getAllDiscountCodes = () => {
  return Object.entries(DISCOUNT_CODES).map(([code, info]) => ({
    code,
    ...info
  }));
};

/**
 * Get discount codes by percentage
 * @param {number} percent - Discount percentage
 * @returns {array} - Array of codes with that discount
 */
export const getCodesByDiscount = (percent) => {
  return Object.entries(DISCOUNT_CODES)
    .filter(([_, info]) => info.discount === percent)
    .map(([code, info]) => ({ code, ...info }));
};
