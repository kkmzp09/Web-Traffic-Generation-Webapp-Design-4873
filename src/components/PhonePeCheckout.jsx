import React, { useState } from 'react';
import { useAuth } from '../lib/authContext';
import * as FiIcons from 'react-icons/fi';

const { FiCreditCard, FiCheck, FiX, FiLoader } = FiIcons;

const PLAN_PRICES = {
  starter: 499,
  professional: 1499,
  business: 4999
};

const PLAN_NAMES = {
  starter: 'Starter Plan',
  professional: 'Professional Plan',
  business: 'Business Plan'
};

export default function PhonePeCheckout({ planType, onSuccess, onCancel }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');

  const amount = PLAN_PRICES[planType] || 0;
  const planName = PLAN_NAMES[planType] || planType;

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
          <span className="text-gray-600">Duration</span>
          <span className="font-semibold text-gray-900">1 Month</span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-purple-600">₹{amount}</span>
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
            <span className="text-sm text-gray-600">Instant activation after payment</span>
          </li>
          <li className="flex items-start">
            <FiCheck className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">Full access to all plan features</span>
          </li>
          <li className="flex items-start">
            <FiCheck className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">Secure payment via PhonePe</span>
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
