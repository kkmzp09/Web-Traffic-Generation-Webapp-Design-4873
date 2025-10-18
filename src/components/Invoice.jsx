import React, { useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiFileText, FiDownload, FiEye, FiCreditCard, FiCalendar, FiDollarSign } = FiIcons;

const Invoice = () => {
  const [invoices] = useState([
    {
      id: 'INV-2024-010',
      date: '2024-10-18',
      amount: 100.00,
      status: 'paid',
      description: 'Professional Plan - 5,000 visits'
    },
    {
      id: 'INV-2024-009',
      date: '2024-09-18',
      amount: 100.00,
      status: 'paid',
      description: 'Professional Plan - 5,000 visits'
    },
    {
      id: 'INV-2024-008',
      date: '2024-08-18',
      amount: 100.00,
      status: 'paid',
      description: 'Professional Plan - 5,000 visits'
    },
    {
      id: 'INV-2024-007',
      date: '2024-07-18',
      amount: 50.00,
      status: 'paid',
      description: 'Starter Plan - 2,000 visits'
    }
  ]);

  const [billingInfo] = useState({
    nextBilling: '2024-11-18',
    plan: 'Professional Plan',
    amount: 100.00,
    currency: 'USD',
    visits: '5,000'
  });

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
                <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-900">{billingInfo.plan}</span>
                    <span className="text-lg font-bold text-blue-900">
                      ${billingInfo.amount}/{billingInfo.currency === 'USD' ? 'month' : 'mo'}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">{billingInfo.visits} visits per month</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Next billing date:</span>
                    <span className="font-medium text-gray-900">{billingInfo.nextBilling}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-gray-900">${billingInfo.amount}</span>
                  </div>
                </div>

                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  Manage Subscription
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiDollarSign} className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Paid</p>
                    <p className="font-semibold text-gray-900">$350.00</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiCalendar} className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-semibold text-gray-900">July 2024</p>
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
                          <p className="font-medium text-gray-900">{invoice.date}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Amount</p>
                          <p className="font-medium text-gray-900">${invoice.amount.toFixed(2)}</p>
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
    </div>
  );
};

export default Invoice;