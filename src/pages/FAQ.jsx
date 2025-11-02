import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqCategories = [
    {
      category: 'General Questions',
      questions: [
        {
          question: 'What is OrganiTraffic?',
          answer: 'OrganiTraffic is a comprehensive platform offering two main services: (1) SEO Tools & Analysis - automated website audits, keyword tracking, and optimization recommendations, and (2) Traffic Generation - high-quality, organic-looking traffic to boost your website visibility and engagement.'
        },
        {
          question: 'How does your service work?',
          answer: 'Our platform uses advanced automation and AI-powered tools to analyze your website\'s SEO performance and generate targeted traffic. For SEO tools, we scan your website and provide detailed reports with actionable insights. For traffic generation, we deliver real visits from diverse sources that mimic organic user behavior.'
        },
        {
          question: 'Is this service safe for my website?',
          answer: 'Yes, absolutely! Our traffic generation uses natural browsing patterns with varied dwell times, scroll behavior, and click patterns. Our SEO tools only read and analyze your website without making any changes. All our services comply with industry best practices.'
        },
        {
          question: 'Do you offer a free trial?',
          answer: 'Yes! We offer a free SEO scan for any website. You can analyze up to 100 pages per month on our Starter plan. For traffic generation, we recommend starting with our Starter plan (500 visits) to see the quality of our service.'
        }
      ]
    },
    {
      category: 'Pricing & Plans',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept cryptocurrency payments (USDT via Binance Smart Chain BEP-20). This ensures secure, fast, and private transactions for our global customers.'
        },
        {
          question: 'Can I upgrade or downgrade my plan?',
          answer: 'Yes! You can upgrade your plan at any time from your dashboard. If you need to downgrade, please contact our support team at support@organitrafficboost.com and we\'ll assist you.'
        },
        {
          question: 'What happens if I exceed my plan limits?',
          answer: 'For SEO tools, scanning will pause when you reach your page limit. You can either upgrade your plan or purchase additional page credits. For traffic generation, you can buy extra visit packages or upgrade to a higher tier plan.'
        },
        {
          question: 'Do you offer refunds?',
          answer: 'Yes, we offer refunds within 7 days of purchase if the service was not delivered as promised. Please review our Refund Policy for complete details. Refund credits typically take 7-14 business days to process.'
        },
        {
          question: 'Are there any hidden fees?',
          answer: 'No! All our pricing is transparent. The price you see is what you pay. Network fees for cryptocurrency transactions may apply based on blockchain conditions, but these are minimal and not controlled by us.'
        }
      ]
    },
    {
      category: 'SEO Tools & Analysis',
      questions: [
        {
          question: 'What does the SEO scan include?',
          answer: 'Our SEO scan analyzes: page speed, mobile responsiveness, meta tags, heading structure, image optimization, internal/external links, content quality, keyword usage, technical SEO issues, and provides an overall SEO score with actionable recommendations.'
        },
        {
          question: 'How long does a scan take?',
          answer: 'A typical scan takes 2-5 minutes depending on your website size. You\'ll receive a detailed report via email once the scan is complete.'
        },
        {
          question: 'Can I scan multiple websites?',
          answer: 'Yes! You can add and scan multiple websites under your account. Each website\'s pages count toward your monthly page limit.'
        },
        {
          question: 'Do you provide keyword tracking?',
          answer: 'Yes! Our Professional and Business plans include keyword tracking features where you can monitor your rankings for specific keywords over time.'
        },
        {
          question: 'Will you fix the issues found in my website?',
          answer: 'Our tool provides detailed recommendations and guidance on how to fix issues. We don\'t make direct changes to your website, but our reports give you clear, actionable steps to improve your SEO.'
        }
      ]
    },
    {
      category: 'Traffic Generation',
      questions: [
        {
          question: 'What type of traffic do you provide?',
          answer: 'We provide high-quality, organic-looking traffic that mimics real user behavior. Traffic comes from diverse geographic locations, uses different devices and browsers, and includes natural engagement patterns like scrolling, clicking, and varied dwell times.'
        },
        {
          question: 'How quickly will I receive traffic?',
          answer: 'Traffic delivery begins within 24-48 hours of purchase and is distributed evenly throughout your billing period to maintain natural patterns. You can track all visits in real-time through your dashboard.'
        },
        {
          question: 'Can I target specific countries or regions?',
          answer: 'Yes! Our Growth, Professional, and Business plans include geo-targeting options. You can specify which countries or regions you want your traffic to come from.'
        },
        {
          question: 'Will this traffic improve my SEO rankings?',
          answer: 'While our traffic mimics organic behavior and can improve engagement metrics, SEO rankings depend on many factors including content quality, backlinks, and technical optimization. Our traffic can complement your SEO efforts but should be part of a comprehensive strategy.'
        },
        {
          question: 'Can I track the traffic you send?',
          answer: 'Yes! You can track all traffic through your Google Analytics, website analytics, or our built-in dashboard. You\'ll see detailed metrics including visit duration, pages viewed, bounce rate, and geographic distribution.'
        },
        {
          question: 'Is the traffic from real people or bots?',
          answer: 'Our traffic uses advanced automation that simulates real user behavior patterns. While automated, it\'s designed to appear organic with natural browsing characteristics, varied session times, and authentic engagement.'
        }
      ]
    },
    {
      category: 'Technical & Support',
      questions: [
        {
          question: 'What are your business hours?',
          answer: 'Our support team is available Monday - Friday, 9:00 AM - 6:00 PM IST (Indian Standard Time). We typically respond to all inquiries within 24 hours during business days.'
        },
        {
          question: 'How can I contact support?',
          answer: 'You can reach us via: Email: support@organitrafficboost.com, Phone: 6394370783, or through our Contact Form on the website. We also offer live chat Monday - Friday, 9:00 AM - 6:00 PM IST.'
        },
        {
          question: 'Do you provide API access?',
          answer: 'Yes! API access is available on our Professional and Business plans. You can integrate our SEO scanning and traffic generation services directly into your applications.'
        },
        {
          question: 'Is my data secure?',
          answer: 'Absolutely! We use industry-standard encryption for all data transmission and storage. We never share your data with third parties. Read our Privacy Policy for complete details on how we protect your information.'
        },
        {
          question: 'Can I cancel my subscription anytime?',
          answer: 'Yes, you can cancel your subscription at any time. Your service will remain active until the end of your current billing period. No refunds are provided for partial months.'
        }
      ]
    },
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'How do I get started?',
          answer: 'Simply: (1) Create a free account, (2) Choose your plan (SEO Tools, Traffic Generation, or both), (3) Complete payment via cryptocurrency, (4) Start using our services immediately. For SEO tools, enter your website URL to begin scanning. For traffic, configure your campaign settings.'
        },
        {
          question: 'Do I need technical knowledge to use your service?',
          answer: 'No! Our platform is designed to be user-friendly. The SEO reports are easy to understand with clear recommendations. Traffic campaigns can be set up in minutes with simple configuration options.'
        },
        {
          question: 'Can I use both SEO tools and traffic generation?',
          answer: 'Yes! Many customers use both services together. You can subscribe to both independently or contact us for custom bundle pricing for enterprise needs.'
        },
        {
          question: 'What if I need help setting up?',
          answer: 'Our support team is here to help! Contact us at support@organitrafficboost.com or call 6394370783. We can guide you through the setup process and answer any questions.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back to Home */}
        <div className="mb-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-all"
          >
            <span>←</span> Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about our services, pricing, and features
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
                {category.category}
              </h2>
              
              <div className="space-y-4">
                {category.questions.map((faq, faqIndex) => {
                  const globalIndex = `${categoryIndex}-${faqIndex}`;
                  const isOpen = openIndex === globalIndex;
                  
                  return (
                    <div
                      key={faqIndex}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(globalIndex)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 pr-4">
                          {faq.question}
                        </span>
                        {isOpen ? (
                          <FiChevronUp className="text-indigo-600 flex-shrink-0" />
                        ) : (
                          <FiChevronDown className="text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      
                      {isOpen && (
                        <div className="px-4 pb-4 pt-2 text-gray-700 bg-gray-50">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-indigo-100 mb-6">
            Can't find the answer you're looking for? Our support team is here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-all font-semibold"
            >
              Contact Support
            </Link>
            <Link
              to="/pricing"
              className="px-8 py-3 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition-all font-semibold border-2 border-white"
            >
              View Pricing Plans
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Helpful Resources:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/terms-of-service" className="text-indigo-600 hover:underline">
              Terms of Service
            </Link>
            <Link to="/privacy-policy" className="text-indigo-600 hover:underline">
              Privacy Policy
            </Link>
            <Link to="/refund-policy" className="text-indigo-600 hover:underline">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
