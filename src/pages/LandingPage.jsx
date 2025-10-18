import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaUsers, FaRocket, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = (plan) => {
    // Navigate to payment page with selected plan
    navigate('/payment', { state: { selectedPlan: plan } });
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

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200 hover:border-blue-500 transition transform hover:scale-105">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter Plan</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-5xl font-bold text-blue-600">$50</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-center text-2xl font-bold text-blue-600">2,000 Visits</p>
                  <p className="text-center text-sm text-gray-600 mt-1">per month</p>
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">2,000 high-quality visits per month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Geo-targeting options</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Real-time analytics dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">24/7 customer support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Campaign management tools</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleGetStarted('starter')}
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
              >
                Get Started
              </button>
            </div>

            {/* Professional Plan */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white relative transform hover:scale-105 transition">
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-4 py-1 rounded-bl-lg rounded-tr-lg font-bold text-sm">
                POPULAR
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Professional Plan</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-5xl font-bold">$100</span>
                  <span className="text-blue-100">/month</span>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="bg-white/20 backdrop-blur rounded-lg p-4 mb-6">
                  <p className="text-center text-2xl font-bold">5,000 Visits</p>
                  <p className="text-center text-sm text-blue-100 mt-1">per month</p>
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="text-yellow-300 mt-1 flex-shrink-0" />
                    <span>5,000 high-quality visits per month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="text-yellow-300 mt-1 flex-shrink-0" />
                    <span>Advanced geo-targeting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="text-yellow-300 mt-1 flex-shrink-0" />
                    <span>Priority traffic delivery</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="text-yellow-300 mt-1 flex-shrink-0" />
                    <span>Advanced analytics & reporting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="text-yellow-300 mt-1 flex-shrink-0" />
                    <span>Priority 24/7 support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="text-yellow-300 mt-1 flex-shrink-0" />
                    <span>Multiple campaign management</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="text-yellow-300 mt-1 flex-shrink-0" />
                    <span>Custom traffic sources</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleGetStarted('professional')}
                className="w-full bg-white text-blue-600 py-4 rounded-lg hover:bg-gray-100 transition font-semibold text-lg"
              >
                Get Started
              </button>
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
