import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);
const FROM_EMAIL = import.meta.env.VITE_FROM_EMAIL || 'onboarding@resend.dev';
const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || 'TrafficGenPro';
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@trafficgenpro.com';

// Welcome Email
export const sendWelcomeEmail = async ({ to, userName, dashboardUrl }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: `Welcome to ${COMPANY_NAME}! 🎉`,
      html: `<h1>Welcome ${userName}!</h1><p>Your account is ready. <a href="${dashboardUrl}">Go to Dashboard</a></p>`
    });
    return error ? { success: false, error } : { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Password Reset Email
export const sendPasswordResetEmail = async ({ to, userName, resetLink }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: 'Reset Your Password',
      html: `<h1>Password Reset</h1><p>Hi ${userName}, <a href="${resetLink}">Click here to reset</a>. Link expires in 1 hour.</p>`
    });
    return error ? { success: false, error } : { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Payment Confirmation Email
export const sendPaymentConfirmationEmail = async ({ to, userName, planName, amount, transactionId, visits }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: 'Payment Confirmed! 🎉',
      html: `<h1>Payment Confirmed!</h1><p>Hi ${userName}, your ${planName} (${visits} visits) for ${amount} is active. Transaction: ${transactionId}</p>`
    });
    return error ? { success: false, error } : { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Payment Pending Email
export const sendPaymentPendingEmail = async ({ to, userName, planName, amount }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: 'Payment Under Verification',
      html: `<h1>Payment Received!</h1><p>Hi ${userName}, your payment for ${planName} (${amount}) is being verified. You'll hear from us in 24-48 hours.</p>`
    });
    return error ? { success: false, error } : { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Campaign Started Email
export const sendCampaignStartedEmail = async ({ to, userName, campaignName, visits, startDate, trackingUrl }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${COMPANY_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: `Campaign "${campaignName}" Started! 🚀`,
      html: `<h1>Campaign Started!</h1><p>Hi ${userName}, your campaign "${campaignName}" (${visits} visits) started on ${startDate}. <a href="${trackingUrl}">View Analytics</a></p>`
    });
    return error ? { success: false, error } : { success: true, data };
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
