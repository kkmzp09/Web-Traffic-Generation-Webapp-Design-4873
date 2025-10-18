import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaUsers, FaRocket, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = (plan, paymentMethod = 'upi') => {
    // Navigate to payment page with selected plan
    if (paymentMethod === 'crypto') {
      navigate('/crypto-payment', { state: { selectedPlan: plan } });
    } else {
      navigate('/payment', { state: { selectedPlan: plan } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <FaChartLine className="text-blue-600 text-2xl" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TrafficGen Pro
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Boost Your Website Traffic
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Organically & Effectively
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Generate high-quality, targeted traffic to your website with our advanced traffic generation platform. 
            Increase visibility, improve SEO rankings, and grow your online presence.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg flex items-center gap-2"
            >
              View Pricing <FaArrowRight />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition font-semibold text-lg border-2 border-blue-600"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose TrafficGen Pro?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaChartLine className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real Traffic</h3>
              <p className="text-gray-600">
                Generate authentic, human-like traffic that behaves naturally on your website, improving engagement metrics.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Targeted Visitors</h3>
              <p className="text-gray-600">
                Reach your ideal audience with geo-targeted traffic from specific countries and regions.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRocket className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Results</h3>
              <p className="text-gray-600">
                See immediate results with our high-speed traffic delivery system. Start getting visitors within minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your needs. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200 hover:border-blue-500 transition transform hover:scale-105">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-blue-600">$15</span>
                  <span className="text-gray-600">/mo</span>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-center text-xl font-bold text-blue-600">500 Visits</p>
                  <p className="text-center text-xs text-gray-600 mt-1">per month</p>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">500 quality visits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Basic geo-targeting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Real-time analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Email support</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleGetStarted('starter', 'upi')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                >
                  Pay with UPI
                </button>
                <button
                  onClick={() => handleGetStarted('starter', 'crypto')}
                  className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white py-3 rounded-lg hover:from-orange-600 hover:to-purple-700 transition font-semibold text-sm"
                >
                  Pay with Crypto
                </button>
              </div>
            </div>

            {/* Growth Plan */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-6 text-white relative transform hover:scale-105 transition">
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-3 py-1 rounded-bl-lg rounded-tr-lg font-bold text-xs">
                POPULAR
              </div>
              
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold mb-2">Growth</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold">$35</span>
                  <span className="text-blue-100">/mo</span>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="bg-white/20 backdrop-blur rounded-lg p-3 mb-4">
                  <p className="text-center text-xl font-bold">2,000 Visits</p>
                  <p className="text-center text-xs text-blue-100 mt-1">per month</p>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-yellow-300 mt-0.5 flex-shrink-0" />
                    <span>2,000 quality visits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-yellow-300 mt-0.5 flex-shrink-0" />
                    <span>Advanced geo-targeting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-yellow-300 mt-0.5 flex-shrink-0" />
                    <span>Priority email support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-yellow-300 mt-0.5 flex-shrink-0" />
                    <span>Multiple campaigns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-yellow-300 mt-0.5 flex-shrink-0" />
                    <span>Traffic scheduling</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleGetStarted('growth', 'upi')}
                  className="w-full bg-white text-blue-600 py-3 rounded-lg hover:bg-gray-100 transition font-semibold text-sm"
                >
                  Pay with UPI
                </button>
                <button
                  onClick={() => handleGetStarted('growth', 'crypto')}
                  className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white py-3 rounded-lg hover:from-orange-600 hover:to-purple-700 transition font-semibold text-sm border-2 border-white"
                >
                  Pay with Crypto
                </button>
              </div>
            </div>

            {/* Professional Plan */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200 hover:border-blue-500 transition transform hover:scale-105">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Professional</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-blue-600">$59</span>
                  <span className="text-gray-600">/mo</span>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-center text-xl font-bold text-blue-600">5,000 Visits</p>
                  <p className="text-center text-xs text-gray-600 mt-1">per month</p>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">5,000 quality visits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Priority delivery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Advanced analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Priority 24/7 support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Custom sources</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleGetStarted('professional', 'upi')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                >
                  Pay with UPI
                </button>
                <button
                  onClick={() => handleGetStarted('professional', 'crypto')}
                  className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white py-3 rounded-lg hover:from-orange-600 hover:to-purple-700 transition font-semibold text-sm"
                >
                  Pay with Crypto
                </button>
              </div>
            </div>

            {/* Business Plan */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-300 hover:border-purple-500 transition transform hover:scale-105 relative">
              <div className="absolute top-0 right-0 bg-purple-600 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg font-bold text-xs">
                BEST VALUE
              </div>
              
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Business</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-purple-600">$99</span>
                  <span className="text-gray-600">/mo</span>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="bg-purple-50 rounded-lg p-3 mb-4">
                  <p className="text-center text-xl font-bold text-purple-600">15,000 Visits</p>
                  <p className="text-center text-xs text-gray-600 mt-1">per month</p>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">15,000 quality visits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Fastest delivery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Dedicated manager</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited campaigns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">API access</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleGetStarted('business', 'upi')}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold text-sm"
                >
                  Pay with UPI
                </button>
                <button
                  onClick={() => handleGetStarted('business', 'crypto')}
                  className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white py-3 rounded-lg hover:from-orange-600 hover:to-purple-700 transition font-semibold text-sm"
                >
                  Pay with Crypto
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-600 mt-8">
            All plans include a 7-day money-back guarantee. No questions asked.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Boost Your Traffic?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who have grown their online presence with TrafficGen Pro.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-blue-600 px-10 py-4 rounded-lg hover:bg-gray-100 transition font-semibold text-lg inline-flex items-center gap-2"
          >
            Start Your Free Trial <FaArrowRight />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FaChartLine className="text-blue-400 text-2xl" />
                <span className="text-xl font-bold">TrafficGen Pro</span>
              </div>
              <p className="text-gray-400">
                The most reliable traffic generation platform for growing your online presence.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TrafficGen Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
