import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../lib/authContext';
import { useSubscription } from '../lib/subscriptionContext';
import PhonePeCheckout from './PhonePeCheckout';

const { FiFileText, FiDownload, FiEye, FiCreditCard, FiCalendar, FiDollarSign, FiRefreshCw } = FiIcons;

const Invoice = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [invoices, setInvoices] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Load invoices from localStorage
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`invoices_${user.id}`);
      if (stored) {
        const loadedInvoices = JSON.parse(stored);
        setInvoices(loadedInvoices);
        
        // Calculate total paid
        const total = loadedInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        setTotalPaid(total);
      }
    }
  }, [user]);

  // Get billing info from subscription
  const billingInfo = subscription ? {
    nextBilling: new Date(subscription.endDate).toLocaleDateString(),
    plan: subscription.plan,
    amount: subscription.finalPrice,
    currency: 'INR',
    visits: subscription.totalVisits.toLocaleString()
  } : null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleDownloadInvoice = (invoiceId) => {
    // Mock download functionality
    alert(`Downloading invoice ${invoiceId}...`);
  };

  const handleViewInvoice = (invoiceId) => {
    // Mock view functionality
    alert(`Viewing invoice ${invoiceId}...`);
  };

  const handleManageSubscription = () => {
    // Determine next tier based on current plan
    const upgradePlans = {
      'Starter Plan': { name: 'Growth', price: 2905 },
      'Growth Plan': { name: 'Professional', price: 4897 },
      'Professional Plan': { name: 'Business', price: 8217 },
      'Business Plan': { name: 'Business', price: 8217 }
    };
    const nextPlan = upgradePlans[subscription?.plan] || { name: 'Professional', price: 4897 };
    setSelectedPlan({
      name: nextPlan.name,
      price: nextPlan.price,
      billingCycle: 'monthly',
      serviceType: 'seo'
    });
    setShowCheckout(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <SafeIcon icon={FiFileText} className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
              <p className="text-gray-600 mt-1">
                Manage your billing history and download invoices
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Billing Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center space-x-2 mb-6">
                <SafeIcon icon={FiCreditCard} className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">SEO Subscription</h2>
              </div>

              {billingInfo ? (
                <>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-900">{billingInfo.plan}</span>
                      <span className="text-lg font-bold text-blue-900">
                        ₹{billingInfo.amount}/month
                      </span>
                    </div>
                    <p className="text-sm text-blue-700">SEO Optimization Subscription</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Next billing date:</span>
                      <span className="font-medium text-gray-900">{billingInfo.nextBilling}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-gray-900">₹{billingInfo.amount}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No active subscription
                </div>
              )}

              <button 
                onClick={handleManageSubscription}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 mt-4"
              >
                <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
                <span>Upgrade Plan</span>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiDollarSign} className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Paid</p>
                    <p className="font-semibold text-gray-900">₹{totalPaid.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiCalendar} className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-semibold text-gray-900">
                      {subscription ? new Date(subscription.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiFileText} className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Invoices</p>
                    <p className="font-semibold text-gray-900">{invoices.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiFileText} className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Invoice History</h2>
                </div>
                <div className="text-sm text-gray-500">
                  {invoices.length} invoices
                </div>
              </div>

              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiFileText} className="w-4 h-4 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-gray-900">{invoice.id}</h3>
                          <p className="text-sm text-gray-600">{invoice.description}</p>
                          {invoice.discountCode && (
                            <p className="text-xs text-green-600 mt-1">
                              Discount: {invoice.discount}% ({invoice.discountCode})
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6 text-sm">
                        <div>
                          <p className="text-gray-500">Date</p>
                          <p className="font-medium text-gray-900">{new Date(invoice.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Amount</p>
                          <p className="font-medium text-gray-900">₹{invoice.amount.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewInvoice(invoice.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="View Invoice"
                        >
                          <SafeIcon icon={FiEye} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          title="Download Invoice"
                        >
                          <SafeIcon icon={FiDownload} className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {invoices.length === 0 && (
                <div className="text-center py-8">
                  <SafeIcon icon={FiFileText} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
                  <p className="text-gray-600">Your billing history will appear here once you start using the service</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PhonePe Checkout Modal */}
      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PhonePeCheckout
              plan={selectedPlan}
              onSuccess={() => {
                setShowCheckout(false);
                navigate('/payment-success');
              }}
              onCancel={() => {
                setShowCheckout(false);
                setSelectedPlan(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;