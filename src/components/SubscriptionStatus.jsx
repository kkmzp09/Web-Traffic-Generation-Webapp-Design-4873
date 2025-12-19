// src/components/SubscriptionStatus.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useSubscription } from '../lib/subscriptionContext';
import PhonePeCheckout from './PhonePeCheckout';

const { FiZap, FiCalendar, FiTrendingUp, FiAlertCircle, FiCheckCircle } = FiIcons;

export default function SubscriptionStatus() {
  const navigate = useNavigate();
  const { subscription, hasActiveSubscription } = useSubscription();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  if (!hasActiveSubscription()) {
    return (
      <>
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <SafeIcon icon={FiAlertCircle} className="w-5 h-5" />
                <h3 className="text-lg font-semibold">No Active Subscription</h3>
              </div>
              <p className="text-white/90 text-sm mb-4">
                Subscribe now to start generating traffic for your websites
              </p>
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
                className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Subscribe Now
              </button>
            </div>
            <SafeIcon icon={FiZap} className="w-12 h-12 opacity-20" />
          </div>
        </div>

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

  const usagePercentage = (subscription.usedVisits / subscription.totalVisits) * 100;
  const isLowOnVisits = subscription.remainingVisits < subscription.totalVisits * 0.2;
  const daysRemaining = Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <>
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <SafeIcon icon={FiCheckCircle} className="w-5 h-5" />
            <h3 className="text-lg font-semibold">{subscription.plan}</h3>
          </div>
          <p className="text-white/80 text-sm">Active Subscription</p>
        </div>
        <SafeIcon icon={FiZap} className="w-10 h-10 opacity-20" />
      </div>

      {/* Visit Usage */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-white/90">Visits Used</span>
          <span className="text-sm font-semibold">
            {subscription.usedVisits.toLocaleString()} / {subscription.totalVisits.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isLowOnVisits ? 'bg-orange-400' : 'bg-white'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-white/70">
            {subscription.remainingVisits.toLocaleString()} visits remaining
          </span>
          {isLowOnVisits && (
            <span className="text-xs bg-orange-500/30 px-2 py-1 rounded">
              Low on visits
            </span>
          )}
        </div>
      </div>

      {/* Renewal Date */}
      <div className="flex items-center justify-between pt-4 border-t border-white/20">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiCalendar} className="w-4 h-4 text-white/70" />
          <span className="text-sm text-white/90">
            Renews in {daysRemaining} days
          </span>
        </div>
        <button
          onClick={() => {
            // Determine next tier based on current plan
            const upgradePlans = {
              'Starter Plan': { name: 'Growth', price: 2905 },
              'Growth Plan': { name: 'Professional', price: 4897 },
              'Professional Plan': { name: 'Business', price: 8217 },
              'Business Plan': { name: 'Business', price: 8217 } // Already max
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
          className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
        >
          Upgrade
        </button>
      </div>

      {isLowOnVisits && (
        <div className="mt-4 bg-orange-500/20 border border-orange-400/30 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <SafeIcon icon={FiTrendingUp} className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium mb-1">Running low on visits?</p>
              <p className="text-white/80">Upgrade your plan to get more traffic capacity</p>
            </div>
          </div>
        </div>
      )}
    </div>

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
