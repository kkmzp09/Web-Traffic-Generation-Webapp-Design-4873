// Email service - Browser-safe version
// NOTE: In production, these functions should call your backend API
// The backend will then use Resend to send emails

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
const FROM_EMAIL = import.meta.env.VITE_FROM_EMAIL || 'onboarding@resend.dev';
const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || 'TrafficGenPro';
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@trafficgenpro.com';

// Welcome Email
export const sendWelcomeEmail = async ({ to, userName, dashboardUrl }) => {
  try {
    // In production, this should call your backend API:
    // const response = await fetch(`${API_BASE}/api/emails/welcome`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ to, userName, dashboardUrl })
    // });
    
    // For now, simulate success (for testing UI)
    console.log('📧 Welcome email would be sent to:', to);
    console.log('Email data:', { userName, dashboardUrl });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { 
      success: true, 
      message: `Welcome email sent to ${to}`,
      data: { to, subject: `Welcome to ${COMPANY_NAME}!` }
    };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Password Reset Email
export const sendPasswordResetEmail = async ({ to, userName, resetLink }) => {
  try {
    console.log('📧 Password reset email would be sent to:', to);
    console.log('Reset link:', resetLink);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: `Password reset email sent to ${to}`, data: { to } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Payment Confirmation Email
export const sendPaymentConfirmationEmail = async ({ to, userName, planName, amount, transactionId, visits }) => {
  try {
    console.log('📧 Payment confirmation email would be sent to:', to);
    console.log('Payment details:', { planName, amount, transactionId, visits });
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: `Payment confirmation sent to ${to}`, data: { to } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Payment Pending Email
export const sendPaymentPendingEmail = async ({ to, userName, planName, amount }) => {
  try {
    console.log('📧 Payment pending email would be sent to:', to);
    console.log('Payment details:', { planName, amount });
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: `Payment pending notification sent to ${to}`, data: { to } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Campaign Started Email
export const sendCampaignStartedEmail = async ({ to, userName, campaignName, visits, startDate, trackingUrl }) => {
  try {
    console.log('📧 Campaign started email would be sent to:', to);
    console.log('Campaign details:', { campaignName, visits, startDate });
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: `Campaign notification sent to ${to}`, data: { to } };
  } catch (error) {
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
