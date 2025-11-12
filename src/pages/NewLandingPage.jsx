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
              <span>Real Traffic • Real Results • Real Growth</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Drive Quality Traffic
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                To Your Website
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto">
              Get <strong>real, high-quality visitors</strong> to boost your rankings, test campaigns, and increase visibility. 
              Start from just <strong>₹1,245/month</strong> for 500 visits.
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
                <div className="text-4xl font-bold text-blue-600 mb-2">500-15K</div>
                <div className="text-gray-600 font-medium">Visits Per Month</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl font-bold text-indigo-600 mb-2">100%</div>
                <div className="text-gray-600 font-medium">Real Visitors</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-gray-600 font-medium">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started with quality traffic in just 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Plan</h3>
              <p className="text-gray-600 text-lg">
                Select from 500 to 15,000 visits per month based on your needs. All plans include geo-targeting and real-time analytics.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Set Up Campaign</h3>
              <p className="text-gray-600 text-lg">
                Enter your website URL, choose your target locations, and configure your traffic preferences in minutes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Watch Traffic Grow</h3>
              <p className="text-gray-600 text-lg">
                Monitor your traffic in real-time with our analytics dashboard. See immediate results and track your growth.
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose OrganiTraffic?</h3>
              <div className="grid md:grid-cols-4 gap-6 mt-8">
                <div>
                  <FaCheckCircle className="text-blue-600 text-3xl mx-auto mb-3" />
                  <p className="font-semibold text-gray-900">100% Real Traffic</p>
                  <p className="text-gray-600 text-sm">No bots or fake visitors</p>
                </div>
                <div>
                  <FaCheckCircle className="text-indigo-600 text-3xl mx-auto mb-3" />
                  <p className="font-semibold text-gray-900">Geo-Targeting</p>
                  <p className="text-gray-600 text-sm">Target specific countries</p>
                </div>
                <div>
                  <FaCheckCircle className="text-purple-600 text-3xl mx-auto mb-3" />
                  <p className="font-semibold text-gray-900">Fast Delivery</p>
                  <p className="text-gray-600 text-sm">Traffic starts within 24h</p>
                </div>
                <div>
                  <FaCheckCircle className="text-pink-600 text-3xl mx-auto mb-3" />
                  <p className="font-semibold text-gray-900">24/7 Support</p>
                  <p className="text-gray-600 text-sm">Always here to help</p>
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Traffic Generation Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to drive quality traffic and grow your online presence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FaTachometerAlt className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Analytics</h3>
              <p className="text-gray-600">
                Monitor your traffic performance with live dashboards and detailed reports showing visitor behavior.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <FaChartLine className="text-indigo-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Geo-Targeting</h3>
              <p className="text-gray-600">
                Target visitors from specific countries and regions to match your audience demographics.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FaShieldAlt className="text-green-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Safe & Compliant</h3>
              <p className="text-gray-600">
                All traffic is real and compliant with search engine guidelines. No bots or fake visitors.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FaBolt className="text-purple-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Delivery</h3>
              <p className="text-gray-600">
                Traffic starts flowing to your website within 24 hours of campaign activation.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <FaRocket className="text-yellow-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multiple Campaigns</h3>
              <p className="text-gray-600">
                Run multiple traffic campaigns simultaneously for different pages or websites.
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
