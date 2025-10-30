import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChartLine, FaRocket, FaCheckCircle, FaArrowRight, FaRobot, 
  FaBolt, FaSearch, FaKeyboard, FaTachometerAlt, FaShieldAlt,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaTwitter, FaLinkedin,
  FaFacebook, FaGithub, FaStar
} from 'react-icons/fa';

export default function NewLandingPage() {
  const navigate = useNavigate();
  const [scanUrl, setScanUrl] = useState('');
  const [scanEmail, setScanEmail] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);

  const handleFreeScan = async () => {
    if (!scanUrl.trim()) return;
    
    setScanning(true);
    setShowEmailCapture(false);
    
    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'https://api.organitrafficboost.com';
      
      // Use existing scan API
      const response = await fetch(`${apiBase}/api/dataforseo/onpage/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: scanUrl,
          maxPages: 10,
          userId: 'free-scan-user',
          enableJavaScript: true
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store scan ID for email
        localStorage.setItem('freeScanId', data.taskId);
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
      
      if (response.ok) {
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
        alert('Failed to send email. Please try again.');
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
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FaChartLine className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                OrganiTraffic
              </span>
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

      {/* Hero Section with Free Scan */}
      <section className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <FaStar className="text-yellow-500" />
              <span>Free SEO Scan - No Credit Card Required</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Boost Your Website's
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Traffic & SEO Rankings
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Get real traffic, professional SEO tools, and AI-powered optimization. 
              Start with a <strong>free 10-page SEO scan</strong> and see instant results!
            </p>

            {/* Free Scan Widget */}
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
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Two powerful services to grow your online presence
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

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-white text-xl" />
                </div>
                <span className="text-xl font-bold text-white">
                  OrganiTraffic
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                Professional traffic generation and SEO tools to grow your online presence.
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
                    SEO Tools Suite
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/keyword-tracker')} className="text-gray-400 hover:text-white transition">
                    Keyword Tracker
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/keyword-research')} className="text-gray-400 hover:text-white transition">
                    Keyword Research
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/onpage-seo')} className="text-gray-400 hover:text-white transition">
                    On-Page SEO
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
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    Contact
                  </a>
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
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-400">123 Business St, Suite 100<br />San Francisco, CA 94105</span>
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
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

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
