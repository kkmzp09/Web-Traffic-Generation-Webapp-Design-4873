// src/lib/subscriptionContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './authContext';
import { sendPaymentConfirmationEmail } from '../utils/emailService';

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load subscription from localStorage or API
  useEffect(() => {
    if (isAuthenticated && user) {
      loadSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadSubscription = () => {
    try {
      // Try to load from localStorage first
      const stored = localStorage.getItem(`subscription_${user.id}`);
      if (stored) {
        const sub = JSON.parse(stored);
        setSubscription(sub);
      } else {
        // No subscription found
        setSubscription(null);
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const activateSubscription = async (plan, paymentDetails) => {
    const timestamp = Date.now();
    const invoiceId = `INV-${new Date().getFullYear()}-${String(timestamp).slice(-6)}`;
    
    const newSubscription = {
      id: `sub_${timestamp}`,
      userId: user.id,
      plan: plan.name,
      planId: plan.id,
      totalVisits: parseInt(plan.visits.replace(/,/g, '')),
      usedVisits: 0,
      remainingVisits: parseInt(plan.visits.replace(/,/g, '')),
      price: plan.price,
      finalPrice: paymentDetails.finalPrice || plan.price,
      discount: paymentDetails.discount || 0,
      discountCode: paymentDetails.discountCode || null,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      paymentMethod: paymentDetails.method,
      transactionId: paymentDetails.transactionId,
      invoiceId: invoiceId,
      autoRenew: true
    };

    // Generate invoice
    const invoice = {
      id: invoiceId,
      subscriptionId: newSubscription.id,
      userId: user.id,
      date: new Date().toISOString(),
      amount: newSubscription.finalPrice,
      originalAmount: plan.price,
      discount: paymentDetails.discount || 0,
      discountCode: paymentDetails.discountCode || null,
      status: 'paid',
      description: `${plan.name} - ${plan.visits} visits`,
      paymentMethod: paymentDetails.method,
      transactionId: paymentDetails.transactionId
    };

    // Save subscription to localStorage
    localStorage.setItem(`subscription_${user.id}`, JSON.stringify(newSubscription));
    setSubscription(newSubscription);

    // Save invoice to localStorage
    const existingInvoices = JSON.parse(localStorage.getItem(`invoices_${user.id}`) || '[]');
    existingInvoices.unshift(invoice); // Add to beginning
    localStorage.setItem(`invoices_${user.id}`, JSON.stringify(existingInvoices));

    // Send confirmation email
    try {
      await sendPaymentConfirmationEmail({
        to: user.email,
        userName: user.name,
        planName: plan.name,
        amount: `₹${newSubscription.finalPrice}`,
        transactionId: paymentDetails.transactionId,
        visits: plan.visits
      });
      console.log('✅ Subscription confirmation email sent');
    } catch (error) {
      console.error('❌ Failed to send confirmation email:', error);
    }

    return newSubscription;
  };

  const useVisits = (visitCount) => {
    if (!subscription) return false;
    
    if (subscription.remainingVisits < visitCount) {
      return false; // Not enough visits
    }

    const updated = {
      ...subscription,
      usedVisits: subscription.usedVisits + visitCount,
      remainingVisits: subscription.remainingVisits - visitCount
    };

    localStorage.setItem(`subscription_${user.id}`, JSON.stringify(updated));
    setSubscription(updated);
    return true;
  };

  const cancelSubscription = () => {
    if (!subscription) return;

    const updated = {
      ...subscription,
      status: 'cancelled',
      autoRenew: false
    };

    localStorage.setItem(`subscription_${user.id}`, JSON.stringify(updated));
    setSubscription(updated);
  };

  const renewSubscription = () => {
    if (!subscription) return;

    const renewed = {
      ...subscription,
      status: 'active',
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: true
    };

    localStorage.setItem(`subscription_${user.id}`, JSON.stringify(renewed));
    setSubscription(renewed);
  };

  const hasActiveSubscription = () => {
    if (!subscription) return false;
    if (subscription.status !== 'active') return false;
    if (new Date(subscription.endDate) < new Date()) return false;
    return true;
  };

  const hasAvailableVisits = (requiredVisits = 1) => {
    if (!hasActiveSubscription()) return false;
    return subscription.remainingVisits >= requiredVisits;
  };

  const value = {
    subscription,
    loading,
    hasActiveSubscription,
    hasAvailableVisits,
    activateSubscription,
    useVisits,
    cancelSubscription,
    renewSubscription,
    loadSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within a SubscriptionProvider');
  return ctx;
};
