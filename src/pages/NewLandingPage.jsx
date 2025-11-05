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
  const [scanUrl, setScanUrl] = useState('');
  const [scanEmail, setScanEmail] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
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

  const handleFreeScan = async () => {
    if (!scanUrl.trim()) return;
    
    setScanning(true);
    setShowEmailCapture(false);
    
    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'https://api.organitrafficboost.com';
      
      // Use SEO Automation scan for immediate results
      const response = await fetch(`${apiBase}/api/seo/scan-page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: scanUrl,
          userId: 'free-scan-user'
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.scanId) {
        // Store scan ID for email
        localStorage.setItem('freeScanId', data.scanId);
        setScanning(false);
        setShowEmailCapture(true);
      } else {
        alert('Scan failed: ' + (data.error || 'Unknown error'));
        setScanning(false);
      }
    } catch (error) {
      console.error('Free scan error:', error);
      alert('Failed to start scan. Please try again.');
      setScanning(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!scanEmail.trim()) return;
    
    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'https://api.organitrafficboost.com';
      const scanId = localStorage.getItem('freeScanId');
      
      console.log('Sending email with:', { email: scanEmail, scanId, url: scanUrl });
      
      // Send email with scan results
      const response = await fetch(`${apiBase}/api/seo/send-scan-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: scanEmail,
          scanId: scanId,
          url: scanUrl
        })
      });
      
      const data = await response.json();
      console.log('Email API response:', data);
      
      if (data.success) {
        setScanComplete(true);
        localStorage.removeItem('freeScanId');
        // Reset after 5 seconds
        setTimeout(() => {
          setScanUrl('');
          setScanEmail('');
          setScanComplete(false);
          setShowEmailCapture(false);
        }, 5000);
      } else {
        console.error('Email send failed:', data.error);
        alert('Failed to send email: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Email send error:', error);
      alert('Failed to send email. Please try again.');
    }
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

      {/* Hero Section - Brilliant Directories Style */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            {/* Temporarily disabled free scan badge
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <FaStar className="text-yellow-500" />
              <span>Free SEO Scan - No Credit Card Required</span>
            </div>
            */}
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              Boost Your Website's
              <span className="block text-orange-400">
                Traffic & SEO Rankings
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Get real traffic, professional SEO tools, and AI-powered optimization to grow your online presence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => navigate('/pricing')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <FaRocket />
                Get Started Now
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="bg-white hover:bg-gray-100 text-blue-900 px-10 py-5 rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
              >
                <FaChartLine />
                View Pricing
              </button>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center justify-center gap-2 text-blue-200">
              <FaCheckCircle className="text-green-400" />
              <span className="text-lg">Trusted by 1000+ websites worldwide</span>
            </div>

            {/* Free Scan Widget - TEMPORARILY DISABLED */}
            {false && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <FaSearch className="text-white text-xl" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-gray-900">Free SEO Scan</h3>
                    <p className="text-gray-600">Analyze 10 pages instantly - No signup required</p>
                  </div>
                </div>

                {!showEmailCapture && !scanComplete && (
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="Enter your website URL (e.g., https://example.com)"
                        value={scanUrl}
                        onChange={(e) => setScanUrl(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleFreeScan()}
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg"
                        disabled={scanning}
                      />
                    </div>
                    <button
                      onClick={handleFreeScan}
                      disabled={scanning || !scanUrl.trim()}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:shadow-lg transition font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {scanning ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Scanning Your Website...
                        </>
                      ) : (
                        <>
                          <FaRocket />
                          Scan My Website for Free
                        </>
                      )}
                    </button>
                    <p className="text-sm text-gray-500">
                      ✓ Instant results • ✓ 18 SEO categories • ✓ AI-powered recommendations
                    </p>
                  </div>
                )}

                {showEmailCapture && !scanComplete && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-green-800 font-medium">✓ Scan Complete! Enter your email to get the full report.</p>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={scanEmail}
                        onChange={(e) => setScanEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit()}
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg"
                      />
                    </div>
                    <button
                      onClick={handleEmailSubmit}
                      disabled={!scanEmail.trim()}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg hover:shadow-lg transition font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <FaEnvelope />
                      Send Me the Report
                    </button>
                    <p className="text-sm text-gray-500">
                      We'll email you a detailed SEO report with actionable recommendations
                    </p>
                  </div>
                )}

                {scanComplete && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaCheckCircle className="text-green-600 text-3xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Report Sent!</h3>
                    <p className="text-gray-600 mb-6">Check your email for the detailed SEO analysis.</p>
                    <button
                      onClick={() => navigate('/pricing')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition font-semibold"
                    >
                      View Pricing Plans
                    </button>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-extrabold text-blue-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to boost your website's traffic and SEO rankings
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Traffic Generation Service */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 hover:shadow-xl transition">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <FaBolt className="text-white text-2xl" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Traffic Generation</h3>
              <p className="text-gray-700 mb-6 text-lg">
                Get real, high-quality visitors to your website. Boost rankings, test campaigns, and increase visibility.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheckCircle className="text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700">500 to 15,000 quality visits per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheckCircle className="text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700">Advanced geo-targeting</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheckCircle className="text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700">Real-time analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheckCircle className="text-blue-600 flex-shrink-0" />
                  <span className="text-gray-700">Multiple campaigns</span>
                </li>
              </ul>
              <button
                onClick={() => {
                  navigate('/pricing');
                  setTimeout(() => {
                    const element = document.querySelector('[data-service="traffic"]');
                    element?.click();
                  }, 100);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-semibold flex items-center justify-center gap-2"
              >
                View Traffic Plans <FaArrowRight />
              </button>
            </div>

            {/* SEO Tools Service */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200 hover:shadow-xl transition">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <FaRobot className="text-white text-2xl" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">SEO Tools Suite</h3>
              <p className="text-gray-700 mb-6 text-lg">
                Professional SEO tools with AI-powered optimization. Track keywords, analyze pages, and fix issues automatically.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheckCircle className="text-purple-600 flex-shrink-0" />
                  <span className="text-gray-700">On-page SEO analysis & auto-fix</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheckCircle className="text-purple-600 flex-shrink-0" />
                  <span className="text-gray-700">Keyword tracking & rankings</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheckCircle className="text-purple-600 flex-shrink-0" />
                  <span className="text-gray-700">Keyword research & SERP analysis</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheckCircle className="text-purple-600 flex-shrink-0" />
                  <span className="text-gray-700">AI-powered recommendations (GPT-4)</span>
                </li>
              </ul>
              <button
                onClick={() => {
                  navigate('/pricing');
                  setTimeout(() => {
                    const element = document.querySelector('[data-service="seo"]');
                    element?.click();
                  }, 100);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-semibold flex items-center justify-center gap-2"
              >
                View SEO Plans <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to dominate search rankings and drive quality traffic
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FaTachometerAlt className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Analytics</h3>
              <p className="text-gray-600">
                Monitor your traffic and SEO performance with live dashboards and detailed reports.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FaRobot className="text-purple-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Optimization</h3>
              <p className="text-gray-600">
                GPT-4 generates optimized content and fixes SEO issues automatically.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FaShieldAlt className="text-green-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Safe & Compliant</h3>
              <p className="text-gray-600">
                All traffic is real and compliant with search engine guidelines.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <FaSearch className="text-yellow-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Keyword Tracking</h3>
              <p className="text-gray-600">
                Track unlimited keywords and monitor your rankings across all major search engines.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <FaKeyboard className="text-red-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">SERP Analysis</h3>
              <p className="text-gray-600">
                Discover which sites rank for any keyword and analyze competitor strategies.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <FaBolt className="text-indigo-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Auto-Apply Fixes</h3>
              <p className="text-gray-600">
                Automatically apply SEO fixes to your website with our JavaScript widget.
              </p>
            </div>
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
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition font-semibold text-lg"
            >
              Try Free Scan
            </button>
          </div>
        </div>
      </section>

      {/* Footer - Brilliant Directories Style */}
      <footer className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div>
              <div className="mb-6">
                <Logo className="h-10" />
              </div>
              <p className="text-blue-200 mb-6 leading-relaxed">
                Professional traffic generation and SEO tools to grow your online presence.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-blue-300 hover:text-orange-400 transition transform hover:scale-110">
                  <FaTwitter size={24} />
                </a>
                <a href="#" className="text-blue-300 hover:text-orange-400 transition transform hover:scale-110">
                  <FaLinkedin size={24} />
                </a>
                <a href="#" className="text-blue-300 hover:text-orange-400 transition transform hover:scale-110">
                  <FaFacebook size={24} />
                </a>
                <a href="#" className="text-blue-300 hover:text-orange-400 transition transform hover:scale-110">
                  <FaGithub size={24} />
                </a>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-orange-400">Features</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#services" className="text-blue-200 hover:text-white transition hover:translate-x-1 inline-block">
                    Traffic Generation
                  </a>
                </li>
                <li>
                  <a href="#services" className="text-blue-200 hover:text-white transition hover:translate-x-1 inline-block">
                    SEO Tools Suite
                  </a>
                </li>
                <li>
                  <a href="#services" className="text-blue-200 hover:text-white transition hover:translate-x-1 inline-block">
                    AI-Powered Optimization
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-blue-200 hover:text-white transition hover:translate-x-1 inline-block">
                    Pricing Plans
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-orange-400">Company</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#about" className="text-blue-200 hover:text-white transition hover:translate-x-1 inline-block">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-blue-200 hover:text-white transition hover:translate-x-1 inline-block">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-200 hover:text-white transition hover:translate-x-1 inline-block">
                    Success Stories
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-200 hover:text-white transition hover:translate-x-1 inline-block">
                    Blog & Resources
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-orange-400">Support</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-blue-200 hover:text-white transition">
                  <FaEnvelope className="text-orange-400" />
                  <a href="mailto:support@organitrafficboost.com">support@organitrafficboost.com</a>
                </li>
                <li className="flex items-center gap-3 text-blue-200 hover:text-white transition">
                  <FaPhone className="text-orange-400" />
                  <a href="tel:+18001234567">+1 (800) 123-4567</a>
                </li>
                <li className="flex items-center gap-3 text-blue-200">
                  <FaMapMarkerAlt className="text-orange-400" />
                  <span>San Francisco, CA</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-blue-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-blue-200">
                &copy; {new Date().getFullYear()} OrganiTraffic. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-blue-200 hover:text-white transition">Privacy Policy</a>
                <a href="#" className="text-blue-200 hover:text-white transition">Terms of Service</a>
                <a href="#" className="text-blue-200 hover:text-white transition">Cookie Policy</a>
              </div>
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
