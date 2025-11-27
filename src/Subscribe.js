import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './App';

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

    // Load PayPal SDK script
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&vault=true&intent=subscription`;
    script.async = true;
    
    script.onload = () => {
      // Initialize Monthly button
      if (window.paypal) {
        window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: function(data, actions) {
            return actions.subscription.create({
              plan_id: monthlyPlanId
            });
          },
          onApprove: async function(data, actions) {
            try {
              const response = await fetch('http://localhost:5001/api/subscription/create', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  user_id: user.id,
                  subscription_id: data.subscriptionID,
                  plan_id: monthlyPlanId,
                  subscription_type: 'monthly'
                })
              });

              const result = await response.json();
              if (result.success) {
                alert('Subscription activated! You now have unlimited vocabulary access.');
                navigate('/browse');
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
        }).render('#paypal-button-monthly');

        // Initialize Annual button
        window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: function(data, actions) {
            return actions.subscription.create({
              plan_id: annualPlanId
            });
          },
          onApprove: async function(data, actions) {
            try {
              const response = await fetch('http://localhost:5001/api/subscription/create', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  user_id: user.id,
                  subscription_id: data.subscriptionID,
                  plan_id: annualPlanId,
                  subscription_type: 'annual'
                })
              });

              const result = await response.json();
              if (result.success) {
                alert('Subscription activated! You now have unlimited vocabulary access.');
                navigate('/browse');
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
        }).render('#paypal-button-annual');
      }
    };

    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector(`script[src*="paypal.com/sdk/js"]`);
      if (existingScript) {
        existingScript.remove();
      }
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

        {/* Free vs Premium Comparison */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px',
          marginBottom: '50px'
        }}>
          {/* Free Tier */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            border: '2px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              color: '#2c3e50',
              marginBottom: '10px'
            }}>Free</h3>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#2c3e50',
              marginBottom: '20px'
            }}>$0</div>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ padding: '10px 0', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>
                ✓ Access to 2000+ texts
              </li>
              <li style={{ padding: '10px 0', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>
                ✓ Smart dictionary
              </li>
              <li style={{ padding: '10px 0', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>
                ✓ 5 vocabulary words
              </li>
              <li style={{ padding: '10px 0', color: '#d1d5db' }}>
                ✗ Unlimited vocabulary
              </li>
              <li style={{ padding: '10px 0', color: '#d1d5db' }}>
                ✗ Spaced repetition flashcards
              </li>
            </ul>
          </div>

          {/* Premium Tier */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '30px',
            color: 'white',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              right: '20px',
              background: '#f59e0b',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}>RECOMMENDED</div>
            <h3 style={{
              fontSize: '1.5rem',
              marginBottom: '10px'
            }}>Premium</h3>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '20px'
            }}>$4.99<span style={{ fontSize: '1rem', fontWeight: '400' }}>/month</span></div>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              <li style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                ✓ Everything in Free
              </li>
              <li style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                ✓ Unlimited vocabulary words
              </li>
              <li style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                ✓ Spaced repetition flashcards
              </li>
              <li style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                ✓ Progress tracking
              </li>
              <li style={{ padding: '10px 0' }}>
                ✓ Priority support
              </li>
            </ul>
          </div>
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
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#667eea', marginBottom: '5px' }}>
                $4.99
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '25px' }}>
                per month
              </div>
              <div id="paypal-button-monthly"></div>
            </div>

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
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#667eea', marginBottom: '5px' }}>
                $49.99
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '5px' }}>
                per year
              </div>
              <div style={{ fontSize: '0.85rem', color: '#10b981', marginBottom: '20px', fontWeight: '600' }}>
                ($4.16/month)
              </div>
              <div id="paypal-button-annual"></div>
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
