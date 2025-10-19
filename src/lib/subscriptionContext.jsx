// src/lib/subscriptionContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './authContext';

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

  const activateSubscription = (plan, paymentDetails) => {
    const newSubscription = {
      id: `sub_${Date.now()}`,
      userId: user.id,
      plan: plan.name,
      planId: plan.id,
      totalVisits: parseInt(plan.visits.replace(/,/g, '')),
      usedVisits: 0,
      remainingVisits: parseInt(plan.visits.replace(/,/g, '')),
      price: plan.price,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      paymentMethod: paymentDetails.method,
      transactionId: paymentDetails.transactionId,
      autoRenew: true
    };

    // Save to localStorage
    localStorage.setItem(`subscription_${user.id}`, JSON.stringify(newSubscription));
    setSubscription(newSubscription);

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
