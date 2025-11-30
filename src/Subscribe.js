import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './App';

// API URL - use environment variable or default to current domain in production
const API_URL = process.env.REACT_APP_API_URL || '';

function Subscribe() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

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

      console.log('Initializing PayPal buttons...');
      
      // Clear any existing buttons
      const monthlyContainer = document.getElementById('paypal-button-monthly');
      const annualContainer = document.getElementById('paypal-button-annual');
      
      if (monthlyContainer) monthlyContainer.innerHTML = '';
      if (annualContainer) annualContainer.innerHTML = '';

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
              alert('Subscription activated! You now have unlimited vocabulary access.');
              window.location.href = '/browse';
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

      // Initialize Annual button
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: function(data, actions) {
          console.log('Creating annual subscription...');
          return actions.subscription.create({
            plan_id: annualPlanId
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
                paypal_plan_id: annualPlanId,
                subscription_type: 'annual'
              })
            });

            const result = await response.json();
            if (result.success) {
              alert('Subscription activated! You now have unlimited vocabulary access.');
              window.location.href = '/browse';
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
      }).render('#paypal-button-annual').catch(err => {
        console.error('Error rendering annual button:', err);
      });
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

        {/* Payment Options */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            color: '#2c3e50',
            marginBottom: '30px'
          }}>Choose Your Plan</h2>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            {/* Annual Plan */}
            <div style={{
              border: '2px solid #667eea',
              borderRadius: '12px',
              padding: '30px',
              minWidth: '280px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                right: '20px',
                background: '#10b981',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>SAVE 17%</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2c3e50', marginBottom: '10px' }}>
                Annual
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#667eea', marginBottom: '20px' }}>
                $49.99
              </div>
              <div id="paypal-button-annual"></div>
            </div>

            {/* Monthly Plan */}
            <div style={{
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '30px',
              minWidth: '280px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2c3e50', marginBottom: '10px' }}>
                Monthly
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#667eea', marginBottom: '20px' }}>
                $4.99
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

        {/* Back Button */}
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
      </div>
    </div>
  );
}

export default Subscribe;
