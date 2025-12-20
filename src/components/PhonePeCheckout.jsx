import React, { useState } from 'react';
import { useAuth } from '../lib/authContext';
import * as FiIcons from 'react-icons/fi';

const { FiCreditCard, FiCheck, FiX, FiLoader } = FiIcons;

export default function PhonePeCheckout({ plan, onSuccess, onCancel }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');

  // Use plan data passed from PricingPlans
  const amount = plan?.price || 0;
  const planName = plan?.name ? `${plan.name} Plan` : 'Plan';
  const planType = plan?.name?.toLowerCase() || 'starter';

  const handlePayment = async () => {
    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Generate guest user ID if not logged in
      const guestUserId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userId = user?.id || guestUserId;
      const userEmail = user?.email || `${phone}@guest.organitrafficboost.com`;
      const userName = user?.name || 'Guest User';

      console.log('Initiating payment:', {
        userId,
        planType,
        amount,
        phone,
        isGuest: !user?.id
      });

      // Initiate payment
      const response = await fetch('https://api.organitrafficboost.com/api/payment/phonepe/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          planType,
          amount,
          email: userEmail,
          name: userName,
          phone
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Payment initiation failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Payment response:', data);

      if (data.success) {
        // Redirect to PhonePe payment page
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data.error || 'Payment initiation failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCreditCard className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h2>
        <p className="text-gray-600">Secure payment via PhonePe</p>
      </div>

      {/* Plan Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Plan</span>
          <span className="font-semibold text-gray-900">{planName}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Service</span>
          <span className="font-semibold text-gray-900">SEO Optimization</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Duration</span>
          <span className="font-semibold text-gray-900">{plan?.billingCycle === 'yearly' ? '1 Year' : '1 Month'}</span>
        </div>
        {plan?.disclaimer && (
          <div className="text-xs text-gray-600 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <strong>Note:</strong> {plan.disclaimer}
          </div>
        )}
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-purple-600">₹{amount}</span>
          </div>
        </div>
      </div>

      {/* SEO Disclaimer */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Important:</strong> This subscription provides SEO analysis, optimization recommendations, and technical monitoring. Rankings are not guaranteed and depend on competition, content quality, and Google's algorithm. Production changes require approval.
            </p>
          </div>
        </div>
      </div>

      {/* Phone Number Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="Enter 10-digit mobile number"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          maxLength="10"
        />
        <p className="text-xs text-gray-500 mt-1">
          Required for PhonePe payment verification
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <FiX className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Features */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">What you'll get:</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <FiCheck className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">Instant dashboard access after payment</span>
          </li>
          <li className="flex items-start">
            <FiCheck className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">SEO audits, keyword tracking, and reports</span>
          </li>
          <li className="flex items-start">
            <FiCheck className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">AI-powered optimization recommendations</span>
          </li>
          <li className="flex items-start">
            <FiCheck className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">Email confirmation & invoice</span>
          </li>
        </ul>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading || !phone || phone.length !== 10}
        className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <FiLoader className="animate-spin mr-2" />
            Processing...
          </>
        ) : (
          <>
            <FiCreditCard className="mr-2" />
            Pay ₹{amount} via PhonePe
          </>
        )}
      </button>

      {/* Cancel Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          disabled={loading}
          className="w-full mt-3 text-gray-600 py-2 px-6 rounded-lg font-medium hover:bg-gray-100 transition disabled:opacity-50"
        >
          Cancel
        </button>
      )}

      {/* Security Note */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          🔒 Secure payment powered by PhonePe
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Your payment information is encrypted and secure
        </p>
      </div>
    </div>
  );
}
