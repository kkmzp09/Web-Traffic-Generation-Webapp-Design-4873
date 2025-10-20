import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCheckCircle, FiUpload, FiAlertCircle, FiCreditCard, FiClock, FiTag, FiX } from 'react-icons/fi';
import { useSubscription } from '../lib/subscriptionContext';
import { useAuth } from '../lib/authContext';
import { validateDiscountCode, calculateDiscount } from '../lib/discountCodes';

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { activateSubscription } = useSubscription();
  
  const [selectedPlan, setSelectedPlan] = useState(location.state?.selectedPlan || 'professional');
  const [paymentStep, setPaymentStep] = useState('select'); // select, qr, upload, processing, success
  const [screenshot, setScreenshot] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [error, setError] = useState('');
  
  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState('');

  const plans = {
    starter: {
      id: 'starter',
      name: 'Starter Plan',
      price: 1250,
      visits: '500',
      features: [
        '500 high-quality visits per month',
        'Basic geo-targeting',
        'Real-time analytics',
        'Email support',
        'Campaign management'
      ]
    },
    growth: {
      id: 'growth',
      name: 'Growth Plan',
      price: 2900,
      visits: '2,000',
      features: [
        '2,000 high-quality visits per month',
        'Advanced geo-targeting',
        'Priority email support',
        'Multiple campaigns',
        'Traffic scheduling'
      ]
    },
    professional: {
      id: 'professional',
      name: 'Professional Plan',
      price: 4900,
      visits: '5,000',
      features: [
        '5,000 high-quality visits per month',
        'Priority traffic delivery',
        'Advanced analytics & reporting',
        'Priority 24/7 support',
        'Custom traffic sources'
      ]
    },
    business: {
      id: 'business',
      name: 'Business Plan',
      price: 8200,
      visits: '15,000',
      features: [
        '15,000 high-quality visits per month',
        'Fastest traffic delivery',
        'Dedicated account manager',
        'Unlimited campaigns',
        'API access'
      ]
    }
  };

  const currentPlan = plans[selectedPlan];
  
  // Calculate final price with discount
  const priceInfo = appliedDiscount 
    ? calculateDiscount(currentPlan.price, appliedDiscount.discount)
    : { originalPrice: currentPlan.price, finalPrice: currentPlan.price, discountAmount: 0, isFree: false };

  // Your actual UPI QR code
  const upiQRCode = '/images/upi-qr-code.jpeg';
  const upiId = 'kkmzp09@okhdfcbank'; // HDFC Bank UPI ID

  const handleApplyDiscount = () => {
    setDiscountError('');
    const discount = validateDiscountCode(discountCode);
    
    if (!discount) {
      setDiscountError('Invalid discount code');
      return;
    }
    
    setAppliedDiscount(discount);
    setDiscountError('');
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError('');
  };

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
      // Activate subscription
      if (user) {
        activateSubscription(currentPlan, {
          method: 'UPI',
          transactionId: transactionId,
          screenshot: screenshot.name
        });
      }
      setPaymentStep('success');
    }, 2000);
  };

  // Plan Selection Step
  if (paymentStep === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
            <p className="text-gray-600">Select the perfect plan for your traffic generation needs</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Object.entries(plans).map(([key, plan]) => (
              <div
                key={key}
                className={`bg-white rounded-2xl shadow-lg p-6 border-2 transition-all cursor-pointer hover:shadow-xl ${
                  selectedPlan === key ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'
                }`}
                onClick={() => setSelectedPlan(key)}
              >
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-blue-600">₹{plan.price}</div>
                  <div className="text-sm text-gray-600">/month</div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">{plan.visits}</div>
                    <div className="text-xs text-blue-700">visits/month</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {plan.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0 text-sm" />
                      <span className="text-xs text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {selectedPlan === key && (
                  <div className="bg-blue-600 text-white text-center py-2 rounded-lg text-sm font-medium">
                    Selected
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Discount Code Section */}
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <FiTag className="text-blue-600" />
                <h3 className="font-semibold text-gray-900">Have a discount code?</h3>
              </div>
              
              {!appliedDiscount ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g., SAVE10)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FiCheckCircle className="text-green-600" />
                        <span className="font-semibold text-green-900">Code Applied!</span>
                      </div>
                      <p className="text-sm text-green-700">{appliedDiscount.description}</p>
                      <p className="text-lg font-bold text-green-900 mt-2">
                        {appliedDiscount.discount}% OFF
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveDiscount}
                      className="text-red-600 hover:text-red-700 p-2"
                      title="Remove discount"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
              
              {discountError && (
                <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  {discountError}
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setPaymentStep('qr')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => setPaymentStep('select')}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center gap-2"
          >
            ← Change Plan
          </button>
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
                  {appliedDiscount && priceInfo.discountAmount > 0 ? (
                    <>
                      <div className="text-lg text-gray-400 line-through">₹{priceInfo.originalPrice}</div>
                      <div className="text-3xl font-bold text-green-600">₹{priceInfo.finalPrice}</div>
                      <div className="text-xs text-green-600 font-medium">{appliedDiscount.discount}% OFF</div>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-blue-600">₹{currentPlan.price}</div>
                      <div className="text-sm text-gray-600">/month</div>
                    </>
                  )}
                </div>
              </div>
              
              {appliedDiscount && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <FiTag className="text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">{appliedDiscount.description}</p>
                      <p className="text-xs text-green-700">You save ₹{priceInfo.discountAmount}</p>
                    </div>
                  </div>
                </div>
              )}
              
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

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              {appliedDiscount && priceInfo.discountAmount > 0 && (
                <>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Original Price:</span>
                    <span className="line-through">₹{priceInfo.originalPrice}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-green-600">
                    <span>Discount ({appliedDiscount.discount}%):</span>
                    <span>-₹{priceInfo.discountAmount}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span className={appliedDiscount ? "text-green-600" : "text-blue-600"}>
                  {priceInfo.isFree ? 'FREE' : `₹${priceInfo.finalPrice}`}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Payment Process */}
          <div className="space-y-6">
            {/* Free Subscription - Skip Payment */}
            {paymentStep === 'qr' && priceInfo.isFree && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">100% Discount Applied!</h3>
                  <p className="text-gray-600 mb-6">Your subscription is completely free with this code</p>
                  <button
                    onClick={() => {
                      if (user) {
                        activateSubscription(currentPlan, {
                          method: 'Discount Code',
                          transactionId: `FREE-${Date.now()}`,
                          discountCode: discountCode
                        });
                      }
                      setPaymentStep('success');
                    }}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all"
                  >
                    Activate Free Subscription
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 1: QR Code */}
            {paymentStep === 'qr' && !priceInfo.isFree && (
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
