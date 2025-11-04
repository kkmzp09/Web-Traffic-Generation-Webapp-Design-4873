import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import * as FiIcons from 'react-icons/fi';

const { FiCheckCircle, FiXCircle, FiLoader } = FiIcons;

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState('checking'); // checking, success, failed
  const [paymentDetails, setPaymentDetails] = useState(null);

  const transactionId = searchParams.get('transactionId');

  useEffect(() => {
    if (!transactionId) {
      navigate('/dashboard');
      return;
    }

    checkPaymentStatus();
  }, [transactionId]);

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(
        `https://api.organitrafficboost.com/api/payment/phonepe/status/${transactionId}`
      );
      const data = await response.json();

      if (data.success) {
        setPaymentDetails(data.payment);
        setStatus(data.payment.status === 'completed' ? 'success' : 'failed');
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error('Status check error:', error);
      setStatus('failed');
    }
  };

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <FiLoader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">Your subscription has been activated</p>
          </div>

          {/* Payment Details */}
          {paymentDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="font-mono text-sm text-gray-900">{paymentDetails.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-semibold text-gray-900 capitalize">{paymentDetails.planType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-bold text-green-600">₹{paymentDetails.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="text-gray-900">PhonePe</span>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              ✅ Your subscription is now active! You have full access to all features of your plan.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/seo-dashboard')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Start Using SEO Tools
            </button>
          </div>

          {/* Email Confirmation */}
          <p className="text-center text-sm text-gray-500 mt-6">
            A confirmation email with invoice has been sent to {user?.email}
          </p>
        </div>
      </div>
    );
  }

  // Failed state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {/* Error Icon */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiXCircle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h2>
          <p className="text-gray-600">We couldn't process your payment</p>
        </div>

        {/* Error Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">
            Your payment was not completed. No charges have been made to your account.
          </p>
        </div>

        {/* Transaction ID */}
        {transactionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-mono text-sm text-gray-900">{transactionId}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/pricing')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Contact Support
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full text-gray-600 py-2 px-6 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
