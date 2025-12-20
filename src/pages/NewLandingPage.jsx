import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChartLine, FaRocket, FaCheckCircle, FaArrowRight, FaRobot, 
  FaBolt, FaSearch, FaKeyboard, FaTachometerAlt, FaShieldAlt,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaTwitter, FaLinkedin,
  FaFacebook, FaGithub, FaStar, FaArrowUp
} from 'react-icons/fa';
import Logo from '../components/Logo';

export default function NewLandingPage() {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="cursor-pointer" onClick={() => navigate('/')}>
              <Logo className="w-10 h-10" textClassName="text-2xl" />
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => navigate('/pricing')}
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Pricing
              </button>
              <button
                onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Services
              </button>
              <button
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Features
              </button>
              <button
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Contact
              </button>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Traffic Generation Focus */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <FaBolt className="text-yellow-500" />
              <span>Comprehensive SEO Audits • AI-Powered Optimization • Technical Excellence</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Enterprise SEO Optimization
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Platform for Technical Excellence
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Comprehensive SEO audits, on-page optimization, and technical monitoring powered by DataForSEO and AI. 
              Improve crawlability, fix technical issues, and optimize for search engines with enterprise-grade tools.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <button
                onClick={() => navigate('/pricing')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-xl hover:shadow-2xl transition font-bold text-lg flex items-center justify-center gap-3"
              >
                <FaRocket className="text-xl" />
                View Pricing Plans
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-white text-blue-600 border-2 border-blue-600 px-10 py-5 rounded-xl hover:bg-blue-50 transition font-bold text-lg flex items-center justify-center gap-3"
              >
                <FaChartLine className="text-xl" />
                Start Free Trial
              </button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl font-bold text-blue-600 mb-2">200+</div>
                <div className="text-gray-600 font-medium">Ranking Factors Analyzed</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl font-bold text-indigo-600 mb-2">100%</div>
                <div className="text-gray-600 font-medium">Technical SEO Audits</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-gray-600 font-medium">Monitoring and Alerts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              AI-Powered SEO Recommendations
            </h2>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              Get intelligent optimization suggestions powered by OpenAI GPT-4. Preview changes, then apply to production with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center">Comprehensive SEO Audits</h3>
              <p className="text-indigo-100 text-center">
                Scan your website and get AI-generated recommendations for 18 SEO categories. DataForSEO detects issues, AI suggests optimizations.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center">AI-Powered Analysis</h3>
              <p className="text-indigo-100 text-center">
                Analyze your website's technical SEO and get actionable recommendations for improvement.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center">Preview and Apply Changes</h3>
              <p className="text-indigo-100 text-center">
                Preview changes before applying them to production. Ensure confidence in your SEO optimizations.
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h3>
              <div className="grid md:grid-cols-4 gap-6 mt-8">
                <div>
                  <FaCheckCircle className="text-blue-600 text-3xl mx-auto mb-3" />
                  <p className="font-semibold text-gray-900">Comprehensive SEO Audits</p>
                  <p className="text-gray-600 text-sm">Analyze 200+ ranking factors</p>
                </div>
                <div>
                  <FaCheckCircle className="text-indigo-600 text-3xl mx-auto mb-3" />
                  <p className="font-semibold text-gray-900">AI-Powered Optimization</p>
                  <p className="text-gray-600 text-sm">Get intelligent optimization suggestions</p>
                </div>
                <div>
                  <FaCheckCircle className="text-purple-600 text-3xl mx-auto mb-3" />
                  <p className="font-semibold text-gray-900">Technical SEO Expertise</p>
                  <p className="text-gray-600 text-sm">Improve crawlability and fix technical issues</p>
                </div>
                <div>
                  <FaCheckCircle className="text-pink-600 text-3xl mx-auto mb-3" />
                  <p className="font-semibold text-gray-900">24/7 Monitoring and Alerts</p>
                  <p className="text-gray-600 text-sm">Stay on top of your SEO performance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Enterprise SEO Optimization Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to drive technical SEO excellence and grow your online presence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FaTachometerAlt className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comprehensive SEO Audits</h3>
              <p className="text-gray-600">
                Analyze 200+ ranking factors and get actionable recommendations for improvement.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <FaChartLine className="text-indigo-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Optimization</h3>
              <p className="text-gray-600">
                Get intelligent optimization suggestions powered by OpenAI GPT-4.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FaShieldAlt className="text-green-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Technical SEO Expertise</h3>
              <p className="text-gray-600">
                Improve crawlability, fix technical issues, and optimize for search engines with enterprise-grade tools.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FaBolt className="text-purple-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Continuous Monitoring</h3>
              <p className="text-gray-600">
                Scheduled scans, automated alerts, and historical tracking. Monitor SEO health over time with detailed reports.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <FaRocket className="text-yellow-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Technical SEO Audits</h3>
              <p className="text-gray-600">
                Comprehensive analysis of 200+ ranking factors using DataForSEO. Identify critical issues, warnings, and optimization opportunities.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <FaCheckCircle className="text-red-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Assurance</h3>
              <p className="text-gray-600">
                Every visitor is verified for quality to ensure genuine engagement and traffic value.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">SEO Optimization Plans</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Technical SEO audits, AI-powered recommendations, and monitoring. No ranking guarantees.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Starter Plan */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 hover:shadow-2xl transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <p className="text-gray-600 mb-6">Small websites</p>
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">₹1,245</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
              </div>
              <div className="mb-6">
                <div className="text-sm font-semibold text-blue-600 mb-2">10 pages/scan • 5 scans/month</div>
                <div className="text-gray-600">10 keywords tracked</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-gray-700">Basic SEO audits</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-gray-700">Preview mode only</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-gray-700">Monthly reports</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/pricing')}
                className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition font-semibold"
              >
                Get Started
              </button>
            </div>

            {/* Growth Plan - Popular */}
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-purple-500 p-8 relative hover:scale-105 transition-all">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <FaStar className="w-4 h-4" />
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Growth</h3>
              <p className="text-gray-600 mb-6">Growing websites</p>
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">₹2,905</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
              </div>
              <div className="mb-6">
                <div className="text-sm font-semibold text-purple-600 mb-2">50 pages/scan • 20 scans/month</div>
                <div className="text-gray-600">50 keywords tracked</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-gray-700">Scheduled scans (weekly)</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-gray-700">Server-side deployment</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-gray-700">Weekly reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-gray-700">Priority support</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/pricing')}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:shadow-lg transition font-semibold"
              >
                Get Started
              </button>
            </div>

            {/* Professional Plan */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 hover:shadow-2xl transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
              <p className="text-gray-600 mb-6">Established sites</p>
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">₹4,897</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
              </div>
              <div className="mb-6">
                <div className="text-sm font-semibold text-indigo-600 mb-2">200 pages/scan • Unlimited scans</div>
                <div className="text-gray-600">200 keywords tracked</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-gray-700">Daily monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-gray-700">Production deployment</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-gray-700">Advanced reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-gray-700">24/7 support</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/pricing')}
                className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition font-semibold"
              >
                Get Started
              </button>
            </div>

            {/* Business Plan */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 hover:shadow-2xl transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-gray-600 mb-6">Large sites (30k+ pages)</p>
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">₹8,217</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
              </div>
              <div className="mb-6">
                <div className="text-sm font-semibold text-green-600 mb-2">Custom limits • 30k+ pages</div>
                <div className="text-gray-600">Unlimited keywords</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-gray-700">Batch scanning</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-gray-700">Incremental deployment</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-gray-700">Approval workflows</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-gray-700">Dedicated manager</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/pricing')}
                className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition font-semibold"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* View All Plans Link */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/pricing')}
              className="text-blue-600 hover:text-blue-700 font-semibold text-lg flex items-center gap-2 mx-auto"
            >
              View All Plans & Details <FaArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Boost Your Website?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of websites already growing with OrganiTraffic
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/pricing')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:shadow-xl transition font-semibold text-lg"
            >
              View Pricing
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition font-semibold text-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div>
              <div className="mb-4">
                <Logo className="w-10 h-10" textClassName="text-xl text-white" />
              </div>
              <p className="text-gray-400 mb-4">
                Professional traffic generation service to boost your website visibility and rankings.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <FaTwitter className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <FaLinkedin className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <FaFacebook className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <FaGithub className="text-xl" />
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-white font-bold mb-4">Services</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => navigate('/pricing')} className="text-gray-400 hover:text-white transition">
                    Traffic Generation
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/pricing')} className="text-gray-400 hover:text-white transition">
                    Pricing Plans
                  </button>
                </li>
                <li>
                  <button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white transition">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-white transition">
                    How It Works
                  </button>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => navigate('/pricing')} className="text-gray-400 hover:text-white transition">
                    Pricing
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/contact')} className="text-gray-400 hover:text-white transition">
                    Contact Us
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/privacy-policy')} className="text-gray-400 hover:text-white transition">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/terms-of-service')} className="text-gray-400 hover:text-white transition">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/refund-policy')} className="text-gray-400 hover:text-white transition">
                    Refund Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/faq')} className="text-gray-400 hover:text-white transition">
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <FaEnvelope className="text-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-400">support@organitraffic.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaPhone className="text-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-400">6394370783</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-400">#35 Gangeshvarnath Jooj, Gangeshvarnath Road<br />Chunar, Mirzapur, Uttar Pradesh 231304</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2025 OrganiTraffic. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 z-50 animate-bounce"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
