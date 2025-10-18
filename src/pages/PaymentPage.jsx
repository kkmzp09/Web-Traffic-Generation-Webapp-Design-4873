import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCheckCircle, FiUpload, FiAlertCircle, FiCreditCard, FiClock } from 'react-icons/fi';

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPlan = location.state?.selectedPlan || 'professional';
  
  const [paymentStep, setPaymentStep] = useState('qr'); // qr, upload, processing, success
  const [screenshot, setScreenshot] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [error, setError] = useState('');

  const plans = {
    starter: {
      name: 'Starter Plan',
      price: 50,
      visits: '2,000',
      features: [
        '2,000 high-quality visits per month',
        'Geo-targeting options',
        'Real-time analytics dashboard',
        '24/7 customer support',
        'Campaign management tools'
      ]
    },
    professional: {
      name: 'Professional Plan',
      price: 100,
      visits: '5,000',
      features: [
        '5,000 high-quality visits per month',
        'Advanced geo-targeting',
        'Priority traffic delivery',
        'Advanced analytics & reporting',
        'Priority 24/7 support',
        'Multiple campaign management',
        'Custom traffic sources'
      ]
    }
  };

  const currentPlan = plans[selectedPlan];

  // Your actual UPI QR code
  const upiQRCode = '/images/upi-qr-code.jpeg';
  const upiId = 'kkmzp09@okhdfcbank'; // HDFC Bank UPI ID

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setError('File size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setError('');
      setScreenshot(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!screenshot) {
      setError('Please upload payment screenshot');
      return;
    }
    if (!transactionId.trim()) {
      setError('Please enter transaction ID');
      return;
    }

    setPaymentStep('processing');
    
    // Simulate API call to submit payment proof
    // In real implementation, this would upload to your backend
    setTimeout(() => {
      setPaymentStep('success');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">Secure UPI payment for your subscription</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Side - Plan Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{currentPlan.name}</h2>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">₹{currentPlan.price}</div>
                  <div className="text-sm text-gray-600">/month</div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">{currentPlan.visits} Visits</div>
                  <div className="text-sm text-blue-700">per month</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">Included Features:</h3>
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-blue-600">₹{currentPlan.price}</span>
              </div>
            </div>
          </div>

          {/* Right Side - Payment Process */}
          <div className="space-y-6">
            {/* Step 1: QR Code */}
            {paymentStep === 'qr' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Scan QR Code</h3>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                  <div className="bg-white rounded-lg p-4 inline-block mx-auto block">
                    <img 
                      src={upiQRCode} 
                      alt="UPI QR Code" 
                      className="w-64 h-64 mx-auto"
                    />
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600 mb-2">UPI ID:</p>
                    <p className="font-mono font-bold text-gray-900 bg-white px-4 py-2 rounded-lg inline-block">
                      {upiId}
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <FiAlertCircle className="text-yellow-600 mt-1 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Important Instructions:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Scan the QR code using any UPI app</li>
                        <li>Pay exactly ₹{currentPlan.price}</li>
                        <li>Take a screenshot of successful payment</li>
                        <li>Note down your transaction ID</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setPaymentStep('upload')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  I've Made the Payment
                </button>
              </div>
            )}

            {/* Step 2: Upload Proof */}
            {paymentStep === 'upload' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Upload Payment Proof</h3>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-2">
                    <FiAlertCircle className="text-red-600" />
                    <span className="text-red-800 text-sm">{error}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Transaction ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID / UTR Number *
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter 12-digit transaction ID"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Screenshot Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Screenshot *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="screenshot-upload"
                      />
                      <label htmlFor="screenshot-upload" className="cursor-pointer">
                        <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        {screenshot ? (
                          <div>
                            <p className="text-green-600 font-medium">{screenshot.name}</p>
                            <p className="text-sm text-gray-500 mt-1">Click to change</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-gray-700 font-medium">Click to upload screenshot</p>
                            <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setPaymentStep('qr')}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmitPayment}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      Submit for Verification
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Processing */}
            {paymentStep === 'processing' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <FiClock className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h3>
                  <p className="text-gray-600 mb-6">
                    Please wait while we verify your payment details
                  </p>
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {paymentStep === 'success' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Submitted!</h3>
                  <p className="text-gray-600 mb-6">
                    Your payment is under verification. You'll receive confirmation within 24 hours.
                  </p>
                  
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                    <h4 className="font-semibold text-gray-900 mb-3">What's Next?</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <FiCheckCircle className="text-blue-600 mt-1 flex-shrink-0" />
                        <span>Our team will verify your payment within 24 hours</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FiCheckCircle className="text-blue-600 mt-1 flex-shrink-0" />
                        <span>You'll receive an email confirmation once approved</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FiCheckCircle className="text-blue-600 mt-1 flex-shrink-0" />
                        <span>Your subscription will be activated immediately after verification</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* Support Info */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-900 mb-2">Need Help?</p>
              <p>If you face any issues, contact us at:</p>
              <p className="font-medium text-blue-600 mt-1">support@trafficgenpro.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
