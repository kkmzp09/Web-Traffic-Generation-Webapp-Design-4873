// Email service - Uses backend API
const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.organitrafficboost.com';

// Welcome Email
export const sendWelcomeEmail = async ({ to, userName, dashboardUrl }) => {
  try {
    const response = await fetch(`${API_BASE}/api/email/welcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, userName, dashboardUrl })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email');
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Password Reset Email
export const sendPasswordResetEmail = async ({ to, userName, resetLink }) => {
  try {
    const response = await fetch(`${API_BASE}/api/email/password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, userName, resetLink })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email');
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Payment Confirmation Email
export const sendPaymentConfirmationEmail = async ({ to, userName, planName, amount, transactionId, visits }) => {
  try {
    const response = await fetch(`${API_BASE}/api/email/payment-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, userName, planName, amount, transactionId, visits })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email');
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Payment Pending Email
export const sendPaymentPendingEmail = async ({ to, userName, planName, amount }) => {
  try {
    const response = await fetch(`${API_BASE}/api/email/payment-pending`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, userName, planName, amount })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email');
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Campaign Started Email
export const sendCampaignStartedEmail = async ({ to, userName, campaignName, visits, startDate, trackingUrl }) => {
  try {
    const response = await fetch(`${API_BASE}/api/email/campaign-started`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, userName, campaignName, visits, startDate, trackingUrl })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email');
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPaymentConfirmationEmail,
  sendPaymentPendingEmail,
  sendCampaignStartedEmail
};
