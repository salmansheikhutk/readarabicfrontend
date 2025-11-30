import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './App';

// API URL - use environment variable or default to current domain in production
const API_URL = process.env.REACT_APP_API_URL || '';

function Account() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Fetch subscription details
    const fetchSubscription = async () => {
      try {
        const response = await fetch(`${API_URL}/api/subscription/status/${user.id}`);
        const data = await response.json();
        
        if (data.success && data.subscription) {
          setSubscription(data.subscription);
        }
      } catch (err) {
        console.error('Failed to fetch subscription:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user, navigate]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.'
    );
    
    if (confirmed) {
      try {
        const response = await fetch(`${API_URL}/api/subscription/cancel/${user.id}`, {
          method: 'POST'
        });
        
        const data = await response.json();
        if (data.success) {
          alert('Subscription cancelled. You will retain access until the end of your billing period.');
          // Refresh subscription data
          const refreshResponse = await fetch(`${API_URL}/api/subscription/status/${user.id}`);
          const refreshData = await refreshResponse.json();
          if (refreshData.success && refreshData.subscription) {
            setSubscription(refreshData.subscription);
          }
        } else {
          alert('Failed to cancel subscription. Please contact support.');
        }
      } catch (err) {
        console.error('Error cancelling subscription:', err);
        alert('Failed to cancel subscription. Please contact support.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      padding: '60px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '50px'
        }}>
          <h1 style={{
            fontSize: '2.2rem',
            color: '#ffffff',
            margin: '0 0 10px 0',
            fontWeight: '300',
            letterSpacing: '0.5px'
          }}>Account</h1>
          <button
            onClick={() => navigate('/browse')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              padding: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '400',
              transition: 'color 0.2s',
              textDecoration: 'underline'
            }}
            onMouseOver={(e) => e.target.style.color = '#d1d5db'}
            onMouseOut={(e) => e.target.style.color = '#9ca3af'}
          >
            ← Back to Books
          </button>
        </div>

        {/* User Info Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '40px',
          marginBottom: '25px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '1.1rem',
            color: '#9ca3af',
            marginBottom: '25px',
            marginTop: 0,
            fontWeight: '400',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontSize: '0.85rem'
          }}>Profile</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '500' }}>{user?.name}</div>
          </div>
          
          <div>
            <div style={{ color: '#9ca3af', fontSize: '0.95rem' }}>{user?.email}</div>
          </div>
        </div>

        {/* Subscription Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '40px',
          marginBottom: '25px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '0.85rem',
            color: '#9ca3af',
            marginBottom: '25px',
            marginTop: 0,
            fontWeight: '400',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>Subscription</h2>

          {loading ? (
            <div style={{ color: '#9ca3af', padding: '20px' }}>
              Loading...
            </div>
          ) : subscription ? (
            <div>
              <div style={{ marginBottom: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ 
                    color: '#ffffff', 
                    fontSize: '1.2rem', 
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {subscription.subscription_type}
                  </span>
                  <span style={{
                    background: subscription.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: subscription.status === 'active' ? '#10b981' : '#f59e0b',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {subscription.status}
                  </span>
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                  ${subscription.amount} / {subscription.subscription_type === 'monthly' ? 'month' : 'year'}
                </div>
              </div>

              <div style={{ marginBottom: '25px', color: '#9ca3af', fontSize: '0.85rem', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '8px' }}>
                  Started {formatDate(subscription.started_at)}
                </div>
                {subscription.status === 'cancelled' ? (
                  <div>
                    Access until {formatDate(subscription.expires_at)}
                  </div>
                ) : subscription.next_billing_date && (
                  <div>
                    Next billing {formatDate(subscription.next_billing_date)}
                  </div>
                )}
              </div>

              {subscription.status === 'active' && (
                <button
                  onClick={handleCancelSubscription}
                  style={{
                    background: 'transparent',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '12px 32px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    width: '100%'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                  }}
                >
                  Cancel Subscription
                </button>
              )}

              {subscription.status === 'cancelled' && (
                <button
                  onClick={() => navigate('/subscribe')}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 32px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    width: '100%'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  Reactivate Subscription
                </button>
              )}
            </div>
          ) : (
            <div>
              <p style={{ color: '#9ca3af', marginBottom: '25px', fontSize: '0.95rem' }}>
                Free plan • 5 words max
              </p>
              <button
                onClick={() => navigate('/subscribe')}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  width: '100%'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                Upgrade to Premium
              </button>
            </div>
          )}
        </div>

        {/* Logout */}
        <div style={{
          textAlign: 'center',
          marginTop: '30px'
        }}>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              color: '#9ca3af',
              border: 'none',
              padding: '10px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '400',
              transition: 'color 0.2s',
              textDecoration: 'underline'
            }}
            onMouseOver={(e) => e.target.style.color = '#ef4444'}
            onMouseOut={(e) => e.target.style.color = '#9ca3af'}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Account;
