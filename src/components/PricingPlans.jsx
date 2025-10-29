import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, TrendingUp, Star } from 'lucide-react';

export default function PricingPlans() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly or yearly
  const [serviceType, setServiceType] = useState('traffic'); // 'traffic' or 'seo'

  // Traffic Generation Plans
  const trafficPlans = [
    {
      name: 'Starter',
      price: {
        monthly: 15,
        yearly: 150
      },
      visits: '500 Visits',
      description: 'Perfect for testing and small campaigns',
      features: [
        '500 quality visits',
        'Basic geo-targeting',
        'Real-time analytics',
        'Email support'
      ],
      popular: false,
      color: 'indigo'
    },
    {
      name: 'Growth',
      price: {
        monthly: 35,
        yearly: 350
      },
      visits: '2,000 Visits',
      description: 'For growing businesses',
      features: [
        '2,000 quality visits',
        'Advanced geo-targeting',
        'Priority email support',
        'Multiple campaigns',
        'Traffic scheduling'
      ],
      popular: true,
      color: 'blue'
    },
    {
      name: 'Professional',
      price: {
        monthly: 59,
        yearly: 590
      },
      visits: '5,000 Visits',
      description: 'For established businesses',
      features: [
        '5,000 quality visits',
        'Priority delivery',
        'Advanced analytics',
        'Priority 24/7 support',
        'Custom sources'
      ],
      popular: false,
      color: 'purple'
    },
    {
      name: 'Business',
      price: {
        monthly: 99,
        yearly: 990
      },
      visits: '15,000 Visits',
      description: 'For large scale operations',
      features: [
        '15,000 quality visits',
        'Fastest delivery',
        'Dedicated manager',
        'Unlimited campaigns',
        'API access'
      ],
      popular: false,
      color: 'green'
    }
  ];

  // SEO Tools Plans
  const seoPlans = [
    {
      name: 'Starter',
      price: {
        monthly: 29,
        yearly: 290 // ~17% discount
      },
      description: 'Perfect for small businesses and startups',
      features: [
        '100 page scans per month',
        'AI-powered SEO fixes (GPT-4)',
        'Auto-apply widget',
        '18 SEO categories',
        '10 tracked keywords',
        '50 keyword research queries/month',
        'Basic support',
        'Email reports',
        'Manual fix option'
      ],
      limits: {
        pageScans: 100,
        trackedKeywords: 10,
        keywordResearch: 50
      },
      popular: false,
      color: 'indigo'
    },
    {
      name: 'Professional',
      price: {
        monthly: 79,
        yearly: 790 // ~17% discount
      },
      description: 'For growing businesses with multiple sites',
      features: [
        '500 page scans per month',
        'AI-powered SEO fixes (GPT-4)',
        'Auto-apply widget',
        '18 SEO categories',
        '50 tracked keywords',
        '200 keyword research queries/month',
        'Priority support',
        'Advanced analytics',
        'Scheduled scans',
        'API access',
        'White-label reports'
      ],
      limits: {
        pageScans: 500,
        trackedKeywords: 50,
        keywordResearch: 200
      },
      popular: true,
      color: 'purple'
    },
    {
      name: 'Business',
      price: {
        monthly: 199,
        yearly: 1990 // ~17% discount
      },
      description: 'For agencies and large enterprises',
      features: [
        '2,500 page scans per month',
        'AI-powered SEO fixes (GPT-4)',
        'Auto-apply widget',
        '18 SEO categories',
        '200 tracked keywords',
        'Unlimited keyword research',
        'Dedicated support',
        'Advanced analytics',
        'Scheduled scans',
        'Full API access',
        'White-label solution',
        'Custom integrations',
        'Team collaboration',
        'Priority processing'
      ],
      limits: {
        pageScans: 2500,
        trackedKeywords: 200,
        keywordResearch: -1 // -1 = unlimited
      },
      popular: false,
      color: 'green'
    }
  ];

  const addOns = [
    { name: 'Extra 100 scans', price: 10 },
    { name: 'Extra 500 scans', price: 40 },
    { name: 'Extra 1,000 scans', price: 70 }
  ];

  // Get current plans based on service type
  const plans = serviceType === 'traffic' ? trafficPlans : seoPlans;

  const handleSelectPlan = (plan) => {
    // Navigate to checkout or subscription page
    navigate('/checkout', { 
      state: { 
        plan: plan.name, 
        price: plan.price[billingCycle],
        billingCycle,
        serviceType
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the plan that fits your needs. No hidden fees, cancel anytime.
          </p>

          {/* Service Type Selector */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-xl shadow-lg p-2 border border-gray-200">
              <button
                onClick={() => setServiceType('traffic')}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  serviceType === 'traffic'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>Traffic Generation</span>
                </div>
              </button>
              <button
                onClick={() => setServiceType('seo')}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  serviceType === 'seo'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>SEO Tools Suite</span>
                </div>
              </button>
            </div>
          </div>

          {/* Service Description */}
          <div className="max-w-3xl mx-auto mb-8">
            {serviceType === 'traffic' ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 font-medium">
                  🚀 <strong>Traffic Generation Service:</strong> Get real, high-quality visitors to your website. 
                  Perfect for boosting rankings, testing campaigns, and increasing visibility.
                </p>
              </div>
            ) : (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-purple-900 font-medium">
                  🔍 <strong>SEO Tools Suite:</strong> Professional SEO tools including keyword tracking, 
                  on-page SEO analysis, keyword research, and automated fixes powered by AI.
                </p>
              </div>
            )}
          </div>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-full p-1 shadow-md">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all hover:scale-105 ${
                plan.popular
                  ? 'border-purple-500 shadow-2xl'
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-gray-900">
                      ${plan.price[billingCycle]}
                    </span>
                    <span className="text-gray-600 ml-2">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-green-600 mt-1">
                      ${Math.round(plan.price.yearly / 12)}/month billed annually
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all mb-6 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  Get Started
                </button>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Add-ons - Only for SEO Plans */}
        {serviceType === 'seo' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Need More Scans? Add Extra Credits
            </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {addOns.map((addon) => (
              <div
                key={addon.name}
                className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-500 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{addon.name}</h3>
                  <Zap className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  ${addon.price}
                </div>
                <p className="text-sm text-gray-600">One-time purchase</p>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Features Comparison */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            All Plans Include
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                AI-Powered Fixes
              </h3>
              <p className="text-gray-600">
                OpenAI GPT-4 generates optimized content for all SEO issues
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Auto-Apply Widget
              </h3>
              <p className="text-gray-600">
                Automatically apply fixes to your website with our JavaScript widget
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                18 SEO Categories
              </h3>
              <p className="text-gray-600">
                Comprehensive coverage from titles to performance optimization
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Contact our sales team for custom enterprise solutions
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold"
          >
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}
