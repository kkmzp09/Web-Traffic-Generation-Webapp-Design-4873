import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCheckCircle, FiUpload, FiAlertCircle, FiClock, FiCopy } from 'react-icons/fi';
import { SiBitcoin, SiEthereum } from 'react-icons/si';

export default function CryptoPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPlan = location.state?.selectedPlan || 'professional';
  
  const [paymentStep, setPaymentStep] = useState('select'); // select, qr, upload, processing, success
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const plans = {
    starter: {
      name: 'Starter Plan',
      priceINR: 50,
      priceUSD: 0.60,
      priceBTC: 0.000009,
      priceETH: 0.00024,
      priceUSDT: 0.60,
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
      priceINR: 100,
      priceUSD: 1.20,
      priceBTC: 0.000018,
      priceETH: 0.00048,
      priceUSDT: 1.20,
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

  // Crypto wallet addresses - Replace with your actual wallet addresses
  const cryptoWallets = {
    bitcoin: {
      name: 'Bitcoin (BTC)',
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // Replace with your BTC address
      qrCode: '/images/crypto-qr-btc.png', // Add your BTC QR code
      icon: SiBitcoin,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
      network: 'Bitcoin Network',
      price: currentPlan.priceBTC
    },
    ethereum: {
      name: 'Ethereum (ETH)',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', // Replace with your ETH address
      qrCode: '/images/crypto-qr-eth.png', // Add your ETH QR code
      icon: SiEthereum,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      network: 'Ethereum Network (ERC-20)',
      price: currentPlan.priceETH
    },
    usdt: {
      name: 'USDT (Tether)',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', // Replace with your USDT address (usually same as ETH)
      qrCode: '/images/crypto-qr-usdt.png', // Add your USDT QR code
      icon: () => <span className="font-bold text-2xl">₮</span>,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      network: 'Ethereum Network (ERC-20)',
      price: currentPlan.priceUSDT
    }
  };

  const currentCrypto = cryptoWallets[selectedCrypto];

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(currentCrypto.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
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
    if (!transactionHash.trim()) {
      setError('Please enter transaction hash');
      return;
    }

    setPaymentStep('processing');
    
    // Simulate API call
    setTimeout(() => {
      setPaymentStep('success');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Crypto Payment</h1>
          <p className="text-gray-600">Secure cryptocurrency payment for your subscription</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Side - Plan Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{currentPlan.name}</h2>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">₹{currentPlan.priceINR}</div>
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

            {selectedCrypto && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Amount to Pay:</span>
                  <span className="text-blue-600">
                    {currentCrypto.price} {selectedCrypto.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1 text-right">
                  ≈ ${currentPlan.priceUSD} USD
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Payment Process */}
          <div className="space-y-6">
            {/* Step 1: Select Cryptocurrency */}
            {paymentStep === 'select' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Select Cryptocurrency</h3>
                </div>

                <div className="space-y-4">
                  {Object.entries(cryptoWallets).map(([key, crypto]) => {
                    const Icon = crypto.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedCrypto(key);
                          setPaymentStep('qr');
                        }}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 ${crypto.bgColor} rounded-full flex items-center justify-center`}>
                            <Icon className={`${crypto.color} text-2xl`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-900">{crypto.name}</div>
                            <div className="text-sm text-gray-600">{crypto.network}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{crypto.price}</div>
                            <div className="text-sm text-gray-600">{key.toUpperCase()}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <FiAlertCircle className="text-blue-600 mt-1 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Important:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Select your preferred cryptocurrency</li>
                        <li>Make sure to send the exact amount</li>
                        <li>Use the correct network to avoid loss of funds</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Show Wallet Address & QR */}
            {paymentStep === 'qr' && currentCrypto && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Send {currentCrypto.name}</h3>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                  <div className="bg-white rounded-lg p-4 inline-block mx-auto block mb-4">
                    <img 
                      src={currentCrypto.qrCode} 
                      alt={`${currentCrypto.name} QR Code`}
                      className="w-64 h-64 mx-auto"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-64 h-64 bg-gray-100 rounded-lg items-center justify-center">
                      <span className="text-gray-500">QR Code Not Available</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Wallet Address:</p>
                    <div className="bg-white rounded-lg p-3 mb-3">
                      <p className="font-mono text-xs break-all text-gray-900 mb-2">
                        {currentCrypto.address}
                      </p>
                      <button
                        onClick={handleCopyAddress}
                        className="flex items-center gap-2 mx-auto text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <FiCopy />
                        {copied ? 'Copied!' : 'Copy Address'}
                      </button>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-yellow-900 mb-1">Amount to Send:</p>
                      <p className="text-lg font-bold text-yellow-900">
                        {currentCrypto.price} {selectedCrypto.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <FiAlertCircle className="text-red-600 mt-1 flex-shrink-0" />
                    <div className="text-sm text-red-800">
                      <p className="font-semibold mb-1">⚠️ Important Instructions:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Send exactly {currentCrypto.price} {selectedCrypto.toUpperCase()}</li>
                        <li>Use {currentCrypto.network}</li>
                        <li>Wait for transaction confirmation</li>
                        <li>Take screenshot of successful transaction</li>
                        <li>Save your transaction hash/ID</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setPaymentStep('select');
                      setSelectedCrypto('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    Change Crypto
                  </button>
                  <button
                    onClick={() => setPaymentStep('upload')}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    I've Sent Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Upload Proof */}
            {paymentStep === 'upload' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">3</span>
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
                  {/* Transaction Hash */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction Hash / TxID *
                    </label>
                    <input
                      type="text"
                      value={transactionHash}
                      onChange={(e) => setTransactionHash(e.target.value)}
                      placeholder="Enter transaction hash (e.g., 0x1234...)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Find this in your wallet's transaction history
                    </p>
                  </div>

                  {/* Screenshot Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction Screenshot *
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

            {/* Step 4: Processing */}
            {paymentStep === 'processing' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <FiClock className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h3>
                  <p className="text-gray-600 mb-6">
                    Please wait while we verify your crypto transaction
                  </p>
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Success */}
            {paymentStep === 'success' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Submitted!</h3>
                  <p className="text-gray-600 mb-6">
                    Your crypto payment is under verification. You'll receive confirmation within 24-48 hours.
                  </p>
                  
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                    <h4 className="font-semibold text-gray-900 mb-3">What's Next?</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <FiCheckCircle className="text-blue-600 mt-1 flex-shrink-0" />
                        <span>We'll verify your transaction on the blockchain</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FiCheckCircle className="text-blue-600 mt-1 flex-shrink-0" />
                        <span>Verification typically takes 24-48 hours</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FiCheckCircle className="text-blue-600 mt-1 flex-shrink-0" />
                        <span>You'll receive an email once approved</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FiCheckCircle className="text-blue-600 mt-1 flex-shrink-0" />
                        <span>Your subscription will be activated immediately after</span>
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
              <p>If you face any issues with crypto payment:</p>
              <p className="font-medium text-blue-600 mt-1">support@trafficgenpro.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
