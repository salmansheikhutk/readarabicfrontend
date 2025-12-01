import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './App';
import { Helmet } from 'react-helmet-async';

// API URL - use environment variable or default to current domain in production
const API_URL = process.env.REACT_APP_API_URL || '';

function Subscribe() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // Handle success banner display and auto-hide
  useEffect(() => {
    if (subscriptionSuccess) {
      setShowSuccessBanner(true);
      // Hide banner and redirect after 2 seconds
      const timer = setTimeout(() => {
        setShowSuccessBanner(false);
        window.location.href = '/browse';
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [subscriptionSuccess]);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const monthlyPlanId = process.env.REACT_APP_PAYPAL_MONTHLY_PLAN_ID || 'P-5H129344VM498321MNEUKYEA';
  const annualPlanId = process.env.REACT_APP_PAYPAL_ANNUAL_PLAN_ID || 'P-62M64848DL867651NNEUKYZQ';
  const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID || 'AaS-8VYzJBNHxRGP98A6J8X_eGSJwIKMJgZT0M4lEXR2k6hV-DfsCJeEUY6IWgN71uZp7wPlT-isMBCA';

  // Load PayPal SDK and initialize buttons
  useEffect(() => {
    if (!user) return;

    // Check if PayPal script already exists
    let script = document.querySelector(`script[src*="paypal.com/sdk/js"]`);
    
    const initializeButtons = () => {
      if (!window.paypal) {
        console.error('PayPal SDK not loaded');
        return;
      }

      // Wait for DOM elements to be ready
      const checkElementsReady = () => {
        const monthlyContainer = document.getElementById('paypal-button-monthly');
        
        if (!monthlyContainer) {
          console.log('PayPal containers not ready, waiting...');
          setTimeout(checkElementsReady, 100);
          return;
        }

        console.log('Initializing PayPal buttons...');
        
        // Clear any existing buttons
        monthlyContainer.innerHTML = '';

        // Initialize Monthly button
        window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: function(data, actions) {
            console.log('Creating monthly subscription...');
            return actions.subscription.create({
              plan_id: monthlyPlanId
            });
          },
          onApprove: async function(data, actions) {
            console.log('Subscription approved:', data);
            try {
              const response = await fetch(`${API_URL}/api/subscription/create`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  user_id: user.id,
                  paypal_subscription_id: data.subscriptionID,
                  paypal_plan_id: monthlyPlanId,
                  subscription_type: 'monthly'
                })
              });

              const result = await response.json();
              if (result.success) {
                setSuccessMessage('🎉 Subscription activated! You now have unlimited vocabulary access.');
                setSubscriptionSuccess(true);
              } else {
                alert('Error activating subscription. Please contact support.');
              }
            } catch (error) {
              console.error('Error creating subscription:', error);
              alert('Error activating subscription. Please contact support.');
            }
          },
          onError: function(err) {
            console.error('PayPal error:', err);
            alert('Payment failed. Please try again.');
          }
        }).render('#paypal-button-monthly').catch(err => {
          console.error('Error rendering monthly button:', err);
        });
      };

      // Start checking for elements
      checkElementsReady();
    };

    if (!script) {
      // Load PayPal SDK script
      script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&vault=true&intent=subscription`;
      script.async = true;
      
      script.onload = () => {
        console.log('PayPal SDK loaded');
        initializeButtons();
      };

      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
      };

      document.head.appendChild(script);
    } else if (window.paypal) {
      // Script already loaded, just initialize buttons
      initializeButtons();
    }

    return () => {
      // Don't remove the script on unmount to avoid reload issues
    };
  }, [user, monthlyPlanId, annualPlanId, paypalClientId, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      padding: '40px 20px'
    }}>
      <Helmet>
        <title>Premium Subscription - Unlimited Arabic Vocabulary | ReadArabic</title>
        <meta name="description" content="Upgrade to premium for unlimited vocabulary words, full access to 2000+ Arabic texts, and advanced learning features. Only $4.99/month." />
        <meta name="keywords" content="Arabic premium subscription, unlimited vocabulary, Arabic learning premium, Arabic texts subscription, Arabic spaced repetition premium" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://www.readarabic.io/subscribe" />
      </Helmet>
      <style>{`
        @keyframes bannerSlideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `}</style>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{
            fontSize: '2.5rem',
            color: '#2c3e50',
            marginBottom: '15px',
            fontWeight: '700'
          }}>Upgrade to Premium</h1>
          <p style={{
            fontSize: '1.15rem',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Unlock unlimited vocabulary words and accelerate your Arabic learning
          </p>
        </div>

        <>
        {/* Success Banner */}
        {showSuccessBanner && (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            zIndex: 1000,
            animation: 'bannerSlideDown 0.3s ease-out',
            fontSize: '0.95rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Payment Options */}
        {!subscriptionSuccess && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          {/* Features List */}
          <div style={{
            maxWidth: '450px',
            margin: '0 auto 40px',
            padding: '30px',
            background: '#f9fafb',
            borderRadius: '12px'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#10b981', marginRight: '12px', fontSize: '1.3rem', fontWeight: 'bold' }}>✓</span>
              <span style={{ color: '#1f2937', fontSize: '1.05rem', lineHeight: '1.5' }}>Full access to 2000+ Classical Islamic Texts</span>
            </div>
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#10b981', marginRight: '12px', fontSize: '1.3rem', fontWeight: 'bold' }}>✓</span>
              <span style={{ color: '#1f2937', fontSize: '1.05rem', lineHeight: '1.5' }}>Intelligent Dictionary</span>
            </div>
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#10b981', marginRight: '12px', fontSize: '1.3rem', fontWeight: 'bold' }}>✓</span>
              <span style={{ color: '#1f2937', fontSize: '1.05rem', lineHeight: '1.5' }}>Intelligent Sentence Translation</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#10b981', marginRight: '12px', fontSize: '1.3rem', fontWeight: 'bold' }}>✓</span>
              <span style={{ color: '#1f2937', fontSize: '1.05rem', lineHeight: '1.5' }}>Flashcards with Spaced Repetition</span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            {/* Monthly Plan */}
            <div style={{
              border: '2px solid #667eea',
              borderRadius: '12px',
              padding: '30px',
              minWidth: '320px',
              maxWidth: '400px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2c3e50', marginBottom: '10px' }}>
                Monthly Subscription
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#667eea', marginBottom: '5px' }}>
                $4.99
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '20px' }}>
                per month • cancel anytime
              </div>
              <div id="paypal-button-monthly"></div>
            </div>
          </div>

          <div style={{
            marginTop: '40px',
            padding: '20px',
            background: '#f9fafb',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>
              💳 Secure payment powered by PayPal • Cancel anytime • No hidden fees
            </p>
          </div>
        </div>
        )}

        {/* Back Button */}
        {!subscriptionSuccess && (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            onClick={() => navigate('/browse')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#667eea',
              fontSize: '1rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            ← Back to Books
          </button>
        </div>
        )}
        </>
      </div>
    </div>
  );
}

export default Subscribe;
