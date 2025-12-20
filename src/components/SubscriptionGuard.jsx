// src/components/SubscriptionGuard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useSubscription } from '../lib/subscriptionContext';
import PhonePeCheckout from './PhonePeCheckout';

const { FiLock, FiZap, FiAlertCircle, FiArrowRight } = FiIcons;

export default function SubscriptionGuard({ children, requiredVisits = 1 }) {
  const navigate = useNavigate();
  const { subscription, hasActiveSubscription, hasAvailableVisits, loading } = useSubscription();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // No active subscription
  if (!hasActiveSubscription()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiLock} className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Subscription Required
            </h2>
            
            <p className="text-gray-600 mb-6">
              You need an active subscription to run campaigns and generate traffic.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-left text-sm text-blue-900">
                  <p className="font-medium mb-1">Why subscribe?</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Generate high-quality traffic</li>
                    <li>• Access advanced analytics</li>
                    <li>• Priority support</li>
                    <li>• Custom traffic sources</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedPlan({
                  name: 'Starter',
                  price: 1245,
                  billingCycle: 'monthly',
                  serviceType: 'traffic'
                });
                setShowCheckout(true);
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiZap} className="w-5 h-5" />
              <span>Choose a Plan</span>
              <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
            </button>

            <p className="text-sm text-gray-500 mt-4">
              Plans start from just $15/month
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Subscription active but not enough visits
  if (!hasAvailableVisits(requiredVisits)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiAlertCircle} className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Visits Exhausted
            </h2>
            
            <p className="text-gray-600 mb-6">
              You've used all your allocated visits for this billing period.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Current Plan</p>
                  <p className="font-semibold text-gray-900">{subscription.plan}</p>
                </div>
                <div>
                  <p className="text-gray-500">Remaining Visits</p>
                  <p className="font-semibold text-red-600">
                    {subscription.remainingVisits.toLocaleString()} / {subscription.totalVisits.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  // Determine next tier based on current plan
                  const upgradePlans = {
                    'Starter Plan': { name: 'Growth', price: 2905 },
                    'Growth Plan': { name: 'Professional', price: 4897 },
                    'Professional Plan': { name: 'Business', price: 8217 },
                    'Business Plan': { name: 'Business', price: 8217 }
                  };
                  const nextPlan = upgradePlans[subscription.plan] || { name: 'Professional', price: 4897 };
                  setSelectedPlan({
                    name: nextPlan.name,
                    price: nextPlan.price,
                    billingCycle: 'monthly',
                    serviceType: 'traffic'
                  });
                  setShowCheckout(true);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiZap} className="w-5 h-5" />
                <span>Upgrade Plan</span>
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-all"
              >
                Back to Dashboard
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Your subscription renews on {new Date(subscription.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // All checks passed - render children
  return (
    <>
      {children}
      
      {/* PhonePe Checkout Modal */}
      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PhonePeCheckout
              plan={selectedPlan}
              onSuccess={() => {
                setShowCheckout(false);
                navigate('/payment-success');
              }}
              onCancel={() => {
                setShowCheckout(false);
                setSelectedPlan(null);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
