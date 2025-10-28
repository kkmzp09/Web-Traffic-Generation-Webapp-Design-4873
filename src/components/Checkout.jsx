import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import { FiCheckCircle, FiX, FiTag, FiCreditCard, FiShield } from 'react-icons/fi';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get plan and discount from navigation state
    const state = location.state || {};
    
    if (state.plan) {
      setSelectedPlan(state.plan);
    }
    
    if (state.discountCode) {
      setDiscountCode(state.discountCode);
      validateDiscount(state.discountCode, state.plan);
    }
    
    // If no plan selected, redirect to pricing
    if (!state.plan) {
      navigate('/pricing');
    }
  }, [location.state]);

  const validateDiscount = async (code, plan) => {
    if (!code) return;
    
    try {
      const response = await fetch('https://api.organitrafficboost.com/api/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, planType: plan.type })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAppliedDiscount(data.discount);
        setError('');
      } else {
        setError(data.error || 'Invalid discount code');
        setAppliedDiscount(null);
      }
    } catch (err) {
      console.error('Discount validation error:', err);
      setError('Failed to validate discount code');
    }
  };

  const applyDiscount = () => {
    validateDiscount(discountCode, selectedPlan);
  };

  const calculateTotal = () => {
    if (!selectedPlan) return 0;
    
    let total = selectedPlan.price;
    
    if (appliedDiscount) {
      if (appliedDiscount.type === 'percentage') {
        total = total * (1 - appliedDiscount.value / 100);
      } else if (appliedDiscount.type === 'fixed') {
        total = Math.max(0, total - appliedDiscount.value);
      }
    }
    
    return total.toFixed(2);
  };

  const handleCheckout = async () => {
    setProcessing(true);
    setError('');
    
    try {
      const response = await fetch('https://api.organitrafficboost.com/api/subscriptions/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          userId: user.id,
          planType: selectedPlan.type,
          discountCode: appliedDiscount ? discountCode : null,
          amount: calculateTotal()
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Show success and redirect
        alert('🎉 Subscription activated successfully!');
        navigate('/seo-dashboard');
      } else {
        setError(data.error || 'Failed to activate subscription');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to process checkout. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Purchase</h1>
          <p className="text-gray-600">Secure checkout powered by cryptocurrency</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedPlan.name}</h3>
                    <p className="text-sm text-gray-600">{selectedPlan.pages} pages/month</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${selectedPlan.price}</p>
                    <p className="text-xs text-gray-500">per month</p>
                  </div>
                </div>
                
                <div className="mt-3 space-y-2">
                  {selectedPlan.features?.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <FiCheckCircle className="w-4 h-4 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiTag className="inline w-4 h-4 mr-1" />
                  Discount Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Enter discount code"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    onClick={applyDiscount}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Apply
                  </button>
                </div>
                
                {appliedDiscount && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <FiCheckCircle className="w-4 h-4" />
                    <span>Discount applied: {appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}% off` : `$${appliedDiscount.value} off`}</span>
                  </div>
                )}
                
                {error && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <FiX className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${selectedPlan.price}</span>
                </div>
                
                {appliedDiscount && (
                  <div className="flex items-center justify-between mb-2 text-green-600">
                    <span>Discount</span>
                    <span>-${(selectedPlan.price - calculateTotal()).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xl font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-indigo-600">${calculateTotal()}/mo</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                <FiCreditCard className="inline w-5 h-5 mr-2" />
                Payment Method
              </h2>
              
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <FiShield className="inline w-4 h-4 mr-1 text-green-600" />
                  Secure cryptocurrency payment
                </p>
                <p className="text-xs text-gray-600">
                  Your subscription will be activated immediately after payment confirmation.
                </p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-all shadow-lg"
              >
                {processing ? 'Processing...' : `Pay $${calculateTotal()} & Activate Subscription`}
              </button>
            </div>
          </div>

          {/* Security Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                <FiShield className="inline w-5 h-5 mr-2 text-green-600" />
                Secure Checkout
              </h3>
              
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Instant Activation</p>
                    <p>Your subscription activates immediately after payment</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Secure Payment</p>
                    <p>Cryptocurrency payments are encrypted and secure</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Cancel Anytime</p>
                    <p>No long-term commitment required</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">24/7 Support</p>
                    <p>Our team is here to help you succeed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
