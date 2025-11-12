import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, TrendingUp, Star } from 'lucide-react';
import PhonePeCheckout from './PhonePeCheckout';

export default function PricingPlans() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly or yearly
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);

  // Traffic Generation Plans
  const trafficPlans = [
    {
      name: 'Starter',
      price: {
        monthly: 1245,
        yearly: 12450
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
        monthly: 2905,
        yearly: 29050
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
        monthly: 4897,
        yearly: 48970
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
        monthly: 8217,
        yearly: 82170
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

  const handleSelectPlan = (plan) => {
    // Show PhonePe checkout modal
    setSelectedPlanForCheckout({
      name: plan.name,
      price: plan.price[billingCycle],
      billingCycle,
      serviceType: 'traffic'
    });
    setShowCheckout(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back to Home Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-all"
          >
            <span>←</span> Back to Home
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Website Traffic Plans
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get real, high-quality visitors to boost your rankings. No hidden fees, cancel anytime.
          </p>

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {trafficPlans.map((plan) => (
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
                      ₹{plan.price[billingCycle].toLocaleString('en-IN')}
                    </span>
                    <span className="text-gray-600 ml-2">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-green-600 mt-1">
                      ₹{Math.round(plan.price.yearly / 12).toLocaleString('en-IN')}/month billed annually
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
                100% Real Traffic
              </h3>
              <p className="text-gray-600">
                All visitors are real people, not bots. Fully compliant with search engine guidelines.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Real-Time Analytics
              </h3>
              <p className="text-gray-600">
                Monitor your traffic with live dashboards showing visitor behavior and engagement.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Geo-Targeting
              </h3>
              <p className="text-gray-600">
                Target visitors from specific countries and regions to match your audience.
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

      {/* PhonePe Checkout Modal */}
      {showCheckout && selectedPlanForCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PhonePeCheckout
              plan={selectedPlanForCheckout}
              onSuccess={() => {
                setShowCheckout(false);
                navigate('/payment-success');
              }}
              onCancel={() => {
                setShowCheckout(false);
                setSelectedPlanForCheckout(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
