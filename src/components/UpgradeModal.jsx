import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Zap, TrendingUp, Star, X } from 'lucide-react';
import PhonePeCheckout from './PhonePeCheckout';

const UpgradeModal = ({ limitData, onClose }) => {
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);

  if (!limitData) return null;

  const { currentPlan, pagesScanned, pageLimit, upgradeOptions, addOnOptions } = limitData;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '32px',
          borderRadius: '16px 16px 0 0',
          color: 'white',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <X size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertCircle size={32} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
                Monthly Limit Reached
              </h2>
              <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
                You've scanned {pagesScanned}/{pageLimit} pages this month
              </p>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '16px',
            borderRadius: '8px',
            marginTop: '16px'
          }}>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Current Plan: <strong style={{ textTransform: 'capitalize' }}>{currentPlan}</strong>
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Upgrade Options */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
              🚀 Upgrade Your Plan
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {upgradeOptions.map((option) => (
                <div
                  key={option.plan}
                  style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onClick={() => {
                    setSelectedPlanForCheckout({
                      name: option.plan,
                      price: option.price,
                      billingCycle: 'monthly',
                      serviceType: 'seo'
                    });
                    setShowCheckout(true);
                  }}
                >
                  {option.plan === 'Professional' && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Star size={12} /> Popular
                    </div>
                  )}

                  <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                    {option.plan}
                  </h4>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea', marginBottom: '8px' }}>
                    ₹{option.price}<span style={{ fontSize: '16px', color: '#6b7280' }}>/mo</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                    {option.limit.toLocaleString()} pages/month
                  </div>
                  <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
                    {option.features}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add-on Credits */}
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
              ⚡ Or Buy Extra Credits
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {addOnOptions.map((addon) => (
                <div
                  key={addon.name}
                  style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.backgroundColor = '#f0fdf4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                  onClick={() => {
                    setSelectedPlanForCheckout({
                      name: addon.name,
                      price: addon.price,
                      billingCycle: 'one-time',
                      serviceType: 'seo-credits'
                    });
                    setShowCheckout(true);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                      {addon.name}
                    </span>
                    <Zap size={16} style={{ color: '#10b981' }} />
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                    ₹{addon.price}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    One-time purchase
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: '32px',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              💡 Your limit resets on the 1st of each month
            </p>
          </div>
        </div>
      </div>

      {/* PhonePe Checkout Modal */}
      {showCheckout && selectedPlanForCheckout && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <PhonePeCheckout
              plan={selectedPlanForCheckout}
              onSuccess={() => {
                setShowCheckout(false);
                onClose();
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
};

export default UpgradeModal;
