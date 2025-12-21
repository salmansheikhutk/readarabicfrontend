import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import './App.css';
import VocabularyPractice from './VocabularyPractice';
import Subscribe from './Subscribe';
import Account from './Account';

// API URL - use environment variable or default to current domain in production
const API_URL = process.env.REACT_APP_API_URL || '';

// Warn if API_URL is not configured in production builds
if (typeof window !== 'undefined' && !process.env.REACT_APP_API_URL) {
  // This helps catch cases where the app was built without REACT_APP_API_URL
  // and will attempt to call relative /api endpoints which the static host cannot serve.
  // Only log in development or for debugging in production.
  console.warn('REACT_APP_API_URL is not set. API calls will use relative /api paths which may 404 if not proxied to backend. Please set REACT_APP_API_URL on the production frontend (Heroku) to your backend URL.');
}

export const UserContext = createContext(null);

// Landing page with sign-in button
function Landing() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // Redirect to browse if already logged in
  useEffect(() => {
    if (user) {
      navigate('/browse');
    }
  }, [user, navigate]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#ffffff',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}
    className="landing-padding">
      <Helmet>
        <title>Learn Arabic Online - Read 2000+ Texts | ReadArabic</title>
        <meta name="description" content="Learn Arabic by reading authentic texts. Interactive reader with instant word translations, sentence meanings, and vocabulary practice. Start reading Arabic today - no textbooks needed." />
        <meta name="keywords" content="learn Arabic, learn Arabic online, Arabic learning app, read Arabic online, Arabic text reader, Arabic vocabulary, Arabic reading practice, Arabic language learning, study Arabic, Arabic texts, Arabic books online" />
        <link rel="canonical" href="https://www.readarabic.io/" />
      </Helmet>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.9;
            transform: scale(1.05);
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .landing-title {
            font-size: 2.5rem !important;
          }
          .landing-subtitle {
            font-size: 1.5rem !important;
          }
          .features-section {
            gap: 20px !important;
            font-size: 1rem !important;
          }
          .landing-padding {
            padding: 15px !important;
          }
          .section-margin {
            margin-bottom: 30px !important;
          }
        }

        @media (max-width: 480px) {
          .landing-title {
            font-size: 2rem !important;
          }
          .landing-subtitle {
            font-size: 1.2rem !important;
          }
          .features-section {
            gap: 15px !important;
            font-size: 0.95rem !important;
            flex-direction: column !important;
            align-items: center !important;
          }
          .landing-padding {
            padding: 10px !important;
          }
          .section-margin {
            margin-bottom: 20px !important;
          }
        }
      `}</style>

      {/* Title Above Video */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        zIndex: 1,
        position: 'relative',
        animation: 'fadeInUp 0.8s ease-out'
      }}
      className="section-margin">
        <h1 style={{
          fontSize: '3.5rem',
          marginBottom: '12px',
          color: '#1a202c',
          fontFamily: "'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', serif",
          direction: 'rtl',
          fontWeight: '700',
          letterSpacing: '-0.02em',
          animation: 'fadeIn 1s ease-out 0.2s backwards'
        }}
        className="landing-title">اقرأ عربي</h1>
        
        <h2 style={{
          fontSize: '2rem',
          marginBottom: '8px',
          color: '#4a5568',
          fontWeight: '600',
          letterSpacing: '-0.01em',
          animation: 'fadeIn 1s ease-out 0.3s backwards'
        }}
        className="landing-subtitle">Read Arabic</h2>
        
        <p style={{
          fontSize: '1.15rem',
          marginBottom: '20px',
          color: '#1a202c',
          fontWeight: '500',
          letterSpacing: '0.02em',
          animation: 'fadeIn 1s ease-out 0.35s backwards'
        }}>
          The Classical Arabic Reading Platform
        </p>
      </div>

      {/* Sign In Button Above Video */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        zIndex: 1,
        position: 'relative',
        animation: 'fadeInUp 0.8s ease-out 0.4s backwards'
      }}
      className="section-margin">
        <div style={{
          marginBottom: '15px'
        }}>
          <span style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '8px 20px',
            borderRadius: '25px',
            fontSize: '0.95rem',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            marginBottom: '15px'
          }}>
            🎉 Beta Access Free
          </span>
        </div>
        <LoginButton />
      </div>

      {/* Video Section */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto 40px auto',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        animation: 'fadeInUp 0.8s ease-out 0.5s backwards',
        zIndex: 1,
        position: 'relative'
      }}
      className="section-margin">
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: '16px'
          }}
        >
          <source src="/readarabic.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Developer Credit */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        zIndex: 1,
        position: 'relative',
        animation: 'fadeInUp 0.8s ease-out 0.7s backwards'
      }}
      className="section-margin">
        <p style={{
          fontSize: '0.95rem',
          color: '#64748b',
          margin: 0,
          fontWeight: '500'
        }}>
          From the developers of <a 
            href="https://www.laneslexicon.com" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#4f46e5'}
            onMouseOut={(e) => e.target.style.color = '#667eea'}
          >
            www.laneslexicon.com
          </a>
        </p>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        width: '100%',
        textAlign: 'center',
        color: 'rgba(74, 85, 104, 0.8)',
        fontSize: '0.9rem',
        zIndex: 1,
        direction: 'ltr'
      }}>
        © 2025 Read Arabic. All rights reserved.
      </div>
    </div>
  );
}

// Browse page with pre-selected beginner book
function Browse() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [beginnerBook, setBeginnerBook] = useState(null);
  const [loadingBook, setLoadingBook] = useState(true);
  const [error, setError] = useState(null);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  // Redirect to landing if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch the beginner book (ID: 158)
  useEffect(() => {
    if (!user) return;
    
    const fetchBeginnerBook = async () => {
      try {
        setLoadingBook(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/api/book/158`);
        const data = await response.json();
        
        if (data.success && data.book) {
          // Store book with ID
          setBeginnerBook({ ...data.book, id: 158 });
        } else {
          setError('Failed to load beginner book');
        }
      } catch (err) {
        setError('Failed to load book: ' + err.message);
      } finally {
        setLoadingBook(false);
      }
    };

    fetchBeginnerBook();
  }, [user]);

  const handleBookSelect = () => {
    navigate('/learning');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fa',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Helmet>
        <title>Start Reading Arabic - ReadArabic</title>
        <meta name="description" content="Begin your Arabic reading journey with our beginner-friendly text. Interactive reader with instant translations." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://www.readarabic.io/browse" />
      </Helmet>
      
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 40px', 
        background: 'white', 
        borderBottom: '1px solid #e1e4e8',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          color: '#2c3e50', 
          margin: 0,
          fontWeight: '600'
        }}>
          ReadArabic
        </h1>
        
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ color: '#2c3e50', fontWeight: '500', fontSize: '0.95rem' }}>{user.name}</span>
            <button 
              onClick={() => navigate('/account')}
              style={{ 
                background: 'transparent',
                border: '1px solid #e1e4e8',
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '6px',
                transition: 'background 0.2s',
                color: '#6b7280',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
              onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >
              Account
            </button>
            <button 
              onClick={() => navigate('/vocabulary/practice')} 
              style={{ 
                background: '#667eea', 
                color: 'white', 
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.target.style.opacity = '0.9'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
              Practice
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '40px 20px',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%'
      }}>
        {loadingBook ? (
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>Loading...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <p style={{ color: '#ef4444', fontSize: '1.1rem', marginBottom: '20px' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Try Again
            </button>
          </div>
        ) : beginnerBook ? (
          <div>
            {/* Reading Section */}
            <div>
              <h2 style={{
                fontSize: '1.5rem',
                color: '#1a202c',
                marginBottom: '24px',
                fontWeight: '700',
                textAlign: 'left'
              }}>
                Practice Reading with Tashkeel
              </h2>

              {/* Book Card */}
              <div
                onClick={handleBookSelect}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: '1px solid #e1e4e8',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.15)';
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#e1e4e8';
                }}
              >
                <div style={{
                  fontSize: '2rem',
                  minWidth: '40px'
                }}>📖</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    color: '#1a202c',
                    marginBottom: '8px',
                    fontWeight: '600',
                    fontFamily: "'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', serif",
                    direction: 'rtl',
                    lineHeight: '1.6'
                  }}>
                    {beginnerBook.meta?.name || 'Beginner Text'}
                  </h3>
                  {beginnerBook.meta?.category_name && (
                    <div style={{
                      display: 'inline-block',
                      background: '#f0f4ff',
                      color: '#667eea',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {beginnerBook.meta.category_name}
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                marginTop: '32px',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e1e4e8'
              }}>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  margin: 0,
                  lineHeight: '1.6'
                }}>
                  💡 <strong>Tip:</strong> Select any word to see its definition, or highlight a sentence for instant translation. Save words to practice them later with spaced repetition.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          h2 {
            font-size: 1.5rem !important;
          }
          h3 {
            font-size: 1.4rem !important;
          }
        }
      `}</style>
    </div>
  );
}

// Learning page - Table of contents for beginner book
function Learning() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect to landing if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch the beginner book data to get all pages
  useEffect(() => {
    if (!user) return;
    
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/api/book/158`);
        const data = await response.json();
        
        if (data.success && data.book) {
          setBookData(data.book);
        } else {
          setError('Failed to load book');
        }
      } catch (err) {
        setError('Failed to load book: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [user]);

  const handlePageClick = (pageIndex) => {
    navigate(`/book/158?page=${pageIndex}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fa'
    }}>
      <Helmet>
        <title>Learning - ReadArabic</title>
        <meta name="description" content="Practice Arabic reading with structured lessons and instant translations." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 40px', 
        background: 'white', 
        borderBottom: '1px solid #e1e4e8',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h1 
          onClick={() => navigate('/browse')}
          style={{ 
            fontSize: '1.5rem', 
            color: '#2c3e50', 
            margin: 0,
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ReadArabic
        </h1>
        
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ color: '#2c3e50', fontWeight: '500', fontSize: '0.95rem' }}>{user.name}</span>
            <button 
              onClick={() => navigate('/account')}
              style={{ 
                background: 'transparent',
                border: '1px solid #e1e4e8',
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '6px',
                transition: 'background 0.2s',
                color: '#6b7280',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
              onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >
              Account
            </button>
            <button 
              onClick={() => navigate('/vocabulary/practice')} 
              style={{ 
                background: '#667eea', 
                color: 'white', 
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.target.style.opacity = '0.9'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
              Practice
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{
        padding: '40px 20px',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>Loading...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <p style={{ color: '#ef4444', fontSize: '1.1rem', marginBottom: '20px' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Try Again
            </button>
          </div>
        ) : bookData?.pages ? (
          <div>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#1a202c',
              marginBottom: '16px',
              fontWeight: '700'
            }}>
              Practice Reading with Tashkeel
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#6b7280',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Select any reading to begin. Each lesson includes instant word definitions and sentence translations.
            </p>

            {/* Table of Contents - List of Headings */}
            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              {(bookData.indexes?.headings || []).map((heading, index) => {
                const pageIndex = heading.page - 1; // heading.page is 1-based
                const actualPageNumber = bookData.pages?.[pageIndex]?.page;
                
                if (!actualPageNumber) return null;
                
                return (
                  <div
                    key={index}
                    onClick={() => handlePageClick(pageIndex)}
                    style={{
                      background: 'white',
                      padding: '20px 24px',
                      borderRadius: '8px',
                      border: '1px solid #e1e4e8',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.borderColor = '#667eea';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.borderColor = '#e1e4e8';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#6b7280',
                        marginBottom: '6px',
                        fontWeight: '500'
                      }}>
                        Reading {index + 1}
                      </div>
                      <div style={{
                        fontSize: '1.15rem',
                        color: '#1a202c',
                        fontWeight: '600',
                        fontFamily: "'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', serif",
                        direction: 'rtl',
                        textAlign: 'right',
                        lineHeight: '1.8'
                      }}>
                        {heading.title}
                      </div>
                    </div>
                    <span style={{
                      color: '#667eea',
                      fontSize: '1.2rem',
                      flexShrink: 0
                    }}>
                      →
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function BookReader() {
  const { bookId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showToc, setShowToc] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [translation, setTranslation] = useState('');
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [showTranslation, setShowTranslation] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [isArabicContent, setIsArabicContent] = useState(true);
  const [definitions, setDefinitions] = useState([]);
  const [dictionary, setDictionary] = useState(() => {
    const saved = localStorage.getItem('readarabic-dictionary');
    return saved ? JSON.parse(saved) : [];
  });
  const [inlineTranslations, setInlineTranslations] = useState({});
  const [vocabularyIds, setVocabularyIds] = useState({}); // Store vocab_id for each position
  const [vocabularyLoaded, setVocabularyLoaded] = useState(false);
  const [editingDictIndex, setEditingDictIndex] = useState(null);
  const [editingDictValue, setEditingDictValue] = useState('');
  const [editingInlinePosition, setEditingInlinePosition] = useState(null); // pageIndex-wordIndex
  const [editingInlineKey, setEditingInlineKey] = useState(null); // the actual word
  const [editingInlineValue, setEditingInlineValue] = useState('');
  const [showDuplicateOptions, setShowDuplicateOptions] = useState(false); // Show options for existing words
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // Track current visible page
  const selectionRangeRef = React.useRef(null); // Store the selection range
  const tocRef = React.useRef(null); // Reference to TOC container
  const isNavigatingRef = React.useRef(false); // Flag to prevent observer interference during navigation
  const [saveErrorMessage, setSaveErrorMessage] = useState(''); // Show styled error message
  const [hasActiveSubscription, setHasActiveSubscription] = useState(null);

  useEffect(() => {
    localStorage.setItem('readarabic-dictionary', JSON.stringify(dictionary));
  }, [dictionary]);

  useEffect(() => {
    localStorage.setItem('readarabic-inline-translations', JSON.stringify(inlineTranslations));
  }, [inlineTranslations]);

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`${API_URL}/api/subscription/status/${user.id}`);
        const data = await response.json();
        
        if (data.success && data.is_premium) {
          setHasActiveSubscription(true);
        } else {
          setHasActiveSubscription(false);
        }
      } catch (err) {
        console.error('Failed to check subscription:', err);
        setHasActiveSubscription(false);
      }
    };
    
    checkSubscription();
  }, [user]);
  useEffect(() => {
    if (user && bookId && bookData && !vocabularyLoaded) {
      fetch(`${API_URL}/api/vocabulary/${user.id}?book_id=${bookId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.vocabulary.length > 0) {
            
            // Convert database vocabulary to inline translations format
            // Use the exact word_position from database
            const translations = {};
            const vocabIds = {};
            
            data.vocabulary.forEach((vocab) => {
              const word = vocab.word;
              const translation = vocab.translation;
              const pageNum = vocab.page_number;
              const wordPosition = vocab.word_position;
              const vocabId = vocab.id;
              
              // Find the page index for this page number
              const pageIndex = bookData.pages.findIndex(p => p.page === pageNum);
              if (pageIndex === -1) return;
              
              // Use the exact position from database
              const position = `${pageIndex}-${wordPosition}`;
              const cleanWord = word
                .replace(/[\u064B-\u065F\u0670]/g, '')
                .replace(/[،؛؟.!:()\[\]{}«»""'']/g, '');
              
              if (!translations[cleanWord]) {
                translations[cleanWord] = {};
              }
              translations[cleanWord][position] = translation;
              
              // Store vocab ID for this position
              if (!vocabIds[cleanWord]) {
                vocabIds[cleanWord] = {};
              }
              vocabIds[cleanWord][position] = vocabId;
            });
            
            setInlineTranslations(translations); // Replace entirely, not merge
            setVocabularyIds(vocabIds); // Replace entirely, not merge
            setVocabularyLoaded(true);
          } else {
            console.log('No vocabulary found for this book');
            setVocabularyLoaded(true);
          }
        })
        .catch(err => {
          console.error('Failed to load vocabulary:', err);
          setVocabularyLoaded(true);
        });
    }
  }, [user, bookId, bookData, vocabularyLoaded]);

  // Fetch book data on mount
  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError(null);
      setVocabularyLoaded(false); // Reset vocabulary loaded flag
      setInlineTranslations({}); // Clear old translations
      setVocabularyIds({}); // Clear old vocab IDs
      
      try {
        const response = await fetch(`${API_URL}/api/book/${bookId}`);
        const data = await response.json();
        
        if (data.success) {
          setBookData(data.book);
        } else {
          setError('Failed to load book');
        }
      } catch (err) {
        setError('Failed to load book: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  // Scroll to page from query parameter
  useEffect(() => {
    if (!bookData?.pages) return;
    
    const searchParams = new URLSearchParams(location.search);
    const pageParam = searchParams.get('page');
    
    if (pageParam !== null) {
      const pageIndex = parseInt(pageParam);
      if (!isNaN(pageIndex) && pageIndex >= 0 && pageIndex < bookData.pages.length) {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          scrollToPage(pageIndex);
        }, 100);
      }
    }
  }, [bookData, location.search]);

  // Track current visible page with Intersection Observer
  useEffect(() => {
    if (!bookData?.pages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the highest intersection ratio
        let maxRatio = 0;
        let visiblePageIndex = currentPageIndex;
        
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            const pageId = entry.target.id;
            const pageIndex = parseInt(pageId.replace('page-', ''));
            visiblePageIndex = pageIndex;
          }
        });
        
        if (maxRatio > 0 && !isNavigatingRef.current) {
          setCurrentPageIndex(visiblePageIndex);
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '-20% 0px -20% 0px'
      }
    );

    // Observe all page elements
    const pageElements = document.querySelectorAll('[id^="page-"]');
    pageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [bookData]);

  // Auto-scroll TOC to show current page
  useEffect(() => {
    if (!tocRef.current || !bookData?.pages) return;
    
    const currentPage = bookData.pages[currentPageIndex];
    if (!currentPage) return;
    
    // Find the TOC item that corresponds to this page
    const tocItem = tocRef.current.querySelector(`[data-page-index="${currentPageIndex}"]`);
    if (tocItem) {
      tocItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentPageIndex, bookData]);

  const scrollToPage = (pageIndex) => {
    // Disable observer updates during navigation
    isNavigatingRef.current = true;
    
    const element = document.getElementById(`page-${pageIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShowToc(false);
      // Re-enable observer after scroll completes
      setTimeout(() => {
        setCurrentPageIndex(pageIndex);
        isNavigatingRef.current = false;
      }, 1000);
    } else {
      console.warn(`Page ${pageIndex} not rendered yet - updating currentPageIndex`);
      setCurrentPageIndex(pageIndex);
      setShowToc(false);
      setTimeout(() => {
        const el = document.getElementById(`page-${pageIndex}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // Re-enable observer
        setTimeout(() => {
          setCurrentPageIndex(pageIndex);
          isNavigatingRef.current = false;
        }, 1000);
      }, 100);
    }
  };

  const findPageIndexByPageNumber = (pageNumber) => {
    // Find the array index for a given book page number
    if (!bookData?.pages) return 0;
    const index = bookData.pages.findIndex(p => p.page === pageNumber);
    return index >= 0 ? index : 0;
  };

  const handleTextSelection = async () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    // Check if we clicked inside the popup - if so, ignore
    const activeElement = document.activeElement;
    const popup = document.querySelector('.translation-popup');
    if (popup && popup.contains(document.elementFromPoint(window.lastMouseX, window.lastMouseY))) {
      console.log('Clicked inside popup, ignoring');
      return;
    }
    
    if (text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Store the selection range so we can find the exact word later
      selectionRangeRef.current = range.cloneRange();
      setShowDuplicateOptions(false);
      
      setSelectedText(text);
      setButtonPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + window.scrollY
      });
      setShowTranslation(true);
      setTranslating(true);
      setTranslation('');
      setIsArabicContent(true);
      
      // Call backend API for word definition using AraTools
      try {
        // For single words, use AraTools via backend
        // Split by actual whitespace and filter out empty strings
        const words = text.split(/\s+/).filter(w => w.length > 0);
        if (words.length === 1) {
          console.log('Single word detected, calling AraTools:', text);
          const response = await fetch(`${API_URL}/api/define/${encodeURIComponent(text)}`);
          const data = await response.json();
          
          console.log('AraTools response:', data);
          
          if (data.success) {
            // Store definitions for rendering as rows
            if (data.definition && data.definition.words) {
              console.log('Got', data.definition.words.length, 'definitions from AraTools');
              setDefinitions(data.definition.words);
            } else {
              console.log('No words in AraTools response');
              setDefinitions([]);
              // If no definitions found, don't fall back to AI for single words
            }
            setTranslation(''); // Clear text translation
          } else {
            // If AraTools fails, fall back to AI
            console.log('AraTools failed, falling back to AI');
            await translateWithAI(text, true); // true = single word fallback
          }
        } else {
          // For phrases (multiple words), use AI
          console.log('Multiple words detected:', words.length, 'words');
          await translateWithAI(text, false); // false = multi-word phrase
        }
      } catch (error) {
        console.error('Definition/Translation error:', error);
        // If there's an error, try AI as fallback
        try {
          await translateWithAI(text, true);
        } catch (aiError) {
          console.error('AI fallback also failed:', aiError);
          setTranslation(`Error: ${aiError.message}`);
        }
      } finally {
        setTranslating(false);
      }
    } else {
      setShowTranslation(false);
      setTranslation('');
    }
  };

  const translateWithAI = async (text, isSingleWord = false) => {
    // Call backend API endpoint (secure - API key is on backend)
    const response = await fetch(`${API_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        is_single_word: isSingleWord
      })
    });
    
    const data = await response.json();
    
    if (!data.success || data.error) {
      throw new Error(data.error || 'Translation failed');
    }
    
    const translationText = data.translation;
    setTranslation(translationText);
    // Create a fake definition object for AI translations so they can be hoverable
    setDefinitions([{
      form: text,
      voc_form: text,
      nice_gloss: translationText,
      root: null,
      isAI: !isSingleWord  // Only mark as AI for multi-word phrases
    }]);
  };

  const handleTranslate = () => {
    // For now, just log the selected text
    // You can integrate with a translation API later
    console.log('Translating:', selectedText);
    alert(`Translation for: ${selectedText}\n\n(Translation API integration coming soon)`);
  };

  const startEditingDict = (index, currentValue) => {
    setEditingDictIndex(index);
    setEditingDictValue(currentValue);
  };

  const saveEditDict = (index) => {
    const updatedDict = [...dictionary];
    const oldItem = updatedDict[index];
    const newEnglish = editingDictValue;
    
    updatedDict[index] = {
      ...oldItem,
      english: newEnglish
    };
    setDictionary(updatedDict);
    
    // Update inline translations - use the selectedWord if available, otherwise the arabic word
    const wordToUpdate = oldItem.selectedWord || oldItem.arabic;
    setInlineTranslations(prev => {
      const updated = { ...prev };
      if (updated[wordToUpdate]) {
        updated[wordToUpdate] = newEnglish;
      }
      return updated;
    });
    
    setEditingDictIndex(null);
    setEditingDictValue('');
  };

  const cancelEditDict = () => {
    setEditingDictIndex(null);
    setEditingDictValue('');
  };

  const startEditingInline = (pageIndex, wordIdx, wordKey, currentValue, e) => {
    e.stopPropagation();
    e.preventDefault();
    const position = `${pageIndex}-${wordIdx}`;
    console.log('Starting to edit inline at position:', position, 'word:', wordKey, currentValue);
    setEditingInlinePosition(position);
    setEditingInlineKey(wordKey);
    setEditingInlineValue(currentValue);
  };

  const saveEditInline = async (value) => {
    if (!editingInlineKey || !editingInlinePosition) return;
    
    // Get value from parameter or from input element
    const newValue = value !== undefined ? value : document.querySelector('.inline-edit-input')?.value || editingInlineValue;
    
    // Update local state immediately
    setInlineTranslations(prev => {
      const updated = { ...prev };
      if (!updated[editingInlineKey]) {
        updated[editingInlineKey] = {};
      }
      updated[editingInlineKey][editingInlinePosition] = newValue;
      return updated;
    });
    
    // Get vocab_id for this position
    const vocabId = vocabularyIds[editingInlineKey]?.[editingInlinePosition];
    
    // Update database if user is logged in and vocab_id exists
    if (user && vocabId) {
      try {
        const response = await fetch(`${API_URL}/api/vocabulary/${vocabId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ translation: newValue })
        });
        const data = await response.json();
        if (!data.success) {
          console.error('Failed to update translation:', data.error);
        }
      } catch (err) {
        console.error('Error updating translation:', err);
      }
    } else {
      console.log('No vocab_id found for', editingInlineKey, 'at position', editingInlinePosition);
    }
    
    setEditingInlinePosition(null);
    setEditingInlineKey(null);
    setEditingInlineValue('');
  };

  const cancelEditInline = () => {
    setEditingInlinePosition(null);
    setEditingInlineKey(null);
    setEditingInlineValue('');
  };

  const deleteDictItem = (index) => {
    const itemToDelete = dictionary[index];
    const updatedDict = dictionary.filter((_, idx) => idx !== index);
    setDictionary(updatedDict);
    
    // Remove inline translation - use selectedWord if available
    const wordToRemove = itemToDelete.selectedWord || itemToDelete.arabic;
    setInlineTranslations(prev => {
      const updated = { ...prev };
      delete updated[wordToRemove];
      return updated;
    });
  };

  const addToDictionary = (def, useExisting = false) => {
    const arabicWord = def.voc_form || def.form;
    const englishDef = def.nice_gloss;
    
    // Keep the original word WITH diacritics for database storage
    const originalWordWithDiacritics = selectedText.trim()
      .replace(/[،؛؟.!:()\[\]{}«»""'']/g, ''); // Only remove punctuation, keep diacritics
    
    // Remove diacritics and punctuation from selected word for consistent matching
    const selectedWord = selectedText.trim()
      .replace(/[\u064B-\u065F\u0670]/g, '') // Remove diacritics
      .replace(/[،؛؟.!:()\[\]{}«»""'']/g, ''); // Remove punctuation
    
    // Find the exact word wrapper by searching for one that contains the selected text
    let position = null;
    if (selectionRangeRef.current) {
      const range = selectionRangeRef.current;
      const allWrappers = document.querySelectorAll('.word-wrapper');
      
      // Find wrapper that contains this range
      for (const wrapper of allWrappers) {
        if (wrapper.contains(range.startContainer) || wrapper.contains(range.endContainer)) {
          // Check if the wrapper's text matches our selected word
          const wrapperText = wrapper.textContent.trim()
            .replace(/[\u064B-\u065F\u0670]/g, '')
            .replace(/[،؛؟.!:()\[\]{}«»""'']/g, '');
          
          if (wrapperText === selectedWord) {
            position = wrapper.getAttribute('data-position');
            break;
          }
        }
      }
    }
    
    if (!position) {
      console.error('Could not determine word position');
      // Close the translation popup and show error message
      setShowTranslation(false);
      setShowDuplicateOptions(false);
      setSaveErrorMessage('Could not save, we are working on this.');
      return;
    }
    
    // Check if this word already has a translation at a DIFFERENT location
    const existingTranslation = inlineTranslations[selectedWord];
    const hasTranslationAtThisLocation = existingTranslation?.[position];
    
    // Only show duplicate options if word exists elsewhere AND not already at this location AND we haven't shown options yet
    if (existingTranslation && !hasTranslationAtThisLocation && !showDuplicateOptions) {
      // Word exists at different location - show options instead of saving immediately
      setShowDuplicateOptions(true);
      return;
    }
    
    // Add to dictionary with the selected word as reference
    const exists = dictionary.some(item => 
      item.arabic === arabicWord && item.english === englishDef
    );
    
    if (!exists) {
      setDictionary([...dictionary, { 
        arabic: arabicWord, 
        english: englishDef,
        selectedWord: selectedWord
      }]);
    }
    
    // Add inline translation for THIS SPECIFIC LOCATION ONLY
    setInlineTranslations(prev => {
      const updated = { ...prev };
      
      if (!updated[selectedWord]) {
        updated[selectedWord] = {};
      }
      
      // Store translation for this specific location
      updated[selectedWord][position] = englishDef;
      
      return updated;
    });
    
    // Save to database if user is logged in
    if (user) {
      const [pageIndex, wordIndex] = position.split('-').map(Number);
      const currentPage = bookData?.pages?.[pageIndex];
      
      fetch(`${API_URL}/api/vocabulary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          word: originalWordWithDiacritics,  // Save WITH diacritics
          translation: englishDef,
          book_id: parseInt(bookId),
          page_number: currentPage?.page || null,
          volume_number: currentPage?.vol || null,
          word_position: wordIndex
        })
      })
        .then(async res => {
          const data = await res.json();
          if (res.status === 403 && data.error === 'FREE_LIMIT_REACHED') {
            // Free tier - no longer has limits during beta
            console.warn('Free tier limit reached (should not happen during beta)');
          } else if (!res.ok) {
            console.error('Error saving vocabulary:', data);
          } else if (data.success && data.vocabulary?.id) {
            // Store the vocab_id so immediate edits work
            setVocabularyIds(prev => {
              const updated = { ...prev };
              if (!updated[selectedWord]) {
                updated[selectedWord] = {};
              }
              updated[selectedWord][position] = data.vocabulary.id;
              return updated;
            });
          }
          return data;
        })
        .catch(err => console.error('Error saving vocabulary:', err));
    }
    
    setShowTranslation(false);
    setShowDuplicateOptions(false);
  };
  
  const applyExistingTranslation = () => {
    const selectedWord = selectedText.trim()
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[،؛؟.!:()\[\]{}«»""'']/g, '');
    
    const existingData = inlineTranslations[selectedWord];
    if (!existingData) return;
    
    // Find position from stored selection
    let position = null;
    if (selectionRangeRef.current) {
      let element = selectionRangeRef.current.startContainer;
      if (element.nodeType === Node.TEXT_NODE) {
        element = element.parentElement;
      }
      const wrapper = element?.closest('.word-wrapper');
      if (wrapper) {
        position = wrapper.getAttribute('data-position');
      }
    }
    
    if (!position) return;
    
    // Get the first translation (they should all be the same for a word)
    const translation = Object.values(existingData)[0];
    
    setInlineTranslations(prev => {
      const updated = { ...prev };
      updated[selectedWord][position] = translation;
      return updated;
    });
    
    setShowTranslation(false);
    setShowDuplicateOptions(false);
  };
  
  const lookupOtherDefinitions = () => {
    // Just hide the duplicate options and show the normal definitions
    setShowDuplicateOptions(false);
  };

  useEffect(() => {
    const trackMouse = (e) => {
      window.lastMouseX = e.clientX;
      window.lastMouseY = e.clientY;
    };
    document.addEventListener('mousemove', trackMouse);
    document.addEventListener('mouseup', handleTextSelection);
    return () => {
      document.removeEventListener('mousemove', trackMouse);
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, []);

  // Helper to render page text with title spans and word-by-word translation
  const renderPageText = (text, pageIndex) => {
    const elements = [];
    let wordCounter = 0;
    
    // Parse text to find title spans - match with single or double quotes, with or without brackets
    const titleRegex = /<span[^>]*data-type=["']title["'][^>]*id=([^\s>]+)[^>]*>(.+?)<\/span>/g;
    let lastIndex = 0;
    let match;
    
    while ((match = titleRegex.exec(text)) !== null) {
      // Render text before this title
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        elements.push(renderTextWords(beforeText, pageIndex, wordCounter));
        wordCounter += beforeText.split(' ').filter(w => w.trim()).length;
      }
      
      // Render the title - strip brackets if present
      const titleId = match[1].replace(/^["']|["']$/g, ''); // Remove quotes if present
      let titleText = match[2];
      // Remove brackets
      titleText = titleText.replace(/^\[/, '').replace(/\]$/, '');
      
      elements.push(
        <span key={`title-${titleId}`} className="page-title-inline" data-type="title">
          {titleText}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Render remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      elements.push(renderTextWords(remainingText, pageIndex, wordCounter));
    }
    
    return elements;
  };
  
  // Helper to render regular text word-by-word with translations
  const renderTextWords = (text, pageIndex, startWordIdx) => {
    return text.split(' ').map((word, localIdx) => {
      if (!word.trim()) return ' ';
      
      const wordIdx = startWordIdx + localIdx;
      // Remove diacritics and punctuation for matching
      const cleanWord = word.trim()
        .replace(/[\u064B-\u065F\u0670]/g, '') // Remove diacritics
        .replace(/[،؛؟.!:()\[\]{}«»""'']/g, ''); // Remove punctuation
      
      const currentPosition = `${pageIndex}-${wordIdx}`;
      // Check if THIS SPECIFIC LOCATION has a translation
      const hasTranslation = inlineTranslations[cleanWord]?.[currentPosition];
      const isEditing = editingInlinePosition === currentPosition;
      
      return (
        <span key={`${pageIndex}-${wordIdx}`} className="word-wrapper" data-position={currentPosition}>
          <span className={hasTranslation ? 'word-with-translation' : ''}>
            {hasTranslation && (
              isEditing ? (
                <span 
                  className="inline-translation-edit"
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    className="inline-edit-input"
                    defaultValue={editingInlineValue}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setEditingInlineValue(e.target.value);
                        saveEditInline(e.target.value);
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        cancelEditInline();
                      }
                    }}
                    autoFocus
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button 
                    className="inline-save-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      saveEditInline();
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >✓</button>
                  <button 
                    className="inline-cancel-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelEditInline();
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >✕</button>
                </span>
              ) : (
                <span className="inline-translation-wrapper">
                  <span 
                    className="inline-translation"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      startEditingInline(pageIndex, wordIdx, cleanWord, inlineTranslations[cleanWord]?.[currentPosition], e);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onMouseUp={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    title="Click to edit translation"
                  >
                    {inlineTranslations[cleanWord]?.[currentPosition]}
                  </span>
                  <button
                    className="inline-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      
                      // Get vocab_id for this position
                      const vocabId = vocabularyIds[cleanWord]?.[currentPosition];
                      
                      if (vocabId && user) {
                        // Delete from database first
                        fetch(`${API_URL}/api/vocabulary/${vocabId}`, {
                          method: 'DELETE'
                        })
                        .then(res => res.json())
                        .then(data => {
                          if (data.success) {
                            // Only update local state if database delete succeeded
                            setInlineTranslations(prev => {
                              const updated = { ...prev };
                              if (updated[cleanWord]) {
                                delete updated[cleanWord][currentPosition];
                                // If no more locations for this word, remove the word entry
                                if (Object.keys(updated[cleanWord]).length === 0) {
                                  delete updated[cleanWord];
                                }
                              }
                              return updated;
                            });
                            
                            // Also remove from vocabularyIds
                            setVocabularyIds(prev => {
                              const updated = { ...prev };
                              if (updated[cleanWord]) {
                                delete updated[cleanWord][currentPosition];
                                if (Object.keys(updated[cleanWord]).length === 0) {
                                  delete updated[cleanWord];
                                }
                              }
                              return updated;
                            });
                          } else {
                            console.error('Failed to delete vocabulary from database:', data.error);
                          }
                        })
                        .catch(err => {
                          console.error('Error deleting vocabulary:', err);
                        });
                      } else {
                        // No vocab_id or not logged in - just remove from local state
                        setInlineTranslations(prev => {
                          const updated = { ...prev };
                          if (updated[cleanWord]) {
                            delete updated[cleanWord][currentPosition];
                            // If no more locations for this word, remove the word entry
                            if (Object.keys(updated[cleanWord]).length === 0) {
                              delete updated[cleanWord];
                            }
                          }
                          return updated;
                        });
                      }
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    title="Delete translation"
                  >
                    ✕
                  </button>
                </span>
              )
            )}
            {word}
          </span>
          {' '}
        </span>
      );
    });
  };

  if (loading) {
    return (
      <div className="app">
        <Helmet>
          <title>Loading Arabic Text - ReadArabic</title>
          <meta name="description" content="Loading Arabic text with interactive reading tools and dictionary." />
          <meta name="keywords" content="Arabic reading, Arabic texts, loading" />
          <meta name="robots" content="noindex, nofollow" />
          <link rel="canonical" href={`https://www.readarabic.io/book/${bookId}`} />
        </Helmet>
        <div className="main-content">
          <div className="empty-state">
            <div className="spinner"></div>
            <p className="loading">Loading book...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Helmet>
          <title>Book Not Found - ReadArabic</title>
          <meta name="description" content="The requested Arabic text could not be found. Browse our collection of 2000+ Arabic texts." />
          <meta name="keywords" content="Arabic reading, book not found, Arabic texts" />
          <meta name="robots" content="noindex, nofollow" />
          <link rel="canonical" href={`https://www.readarabic.io/book/${bookId}`} />
        </Helmet>
        <div className="main-content">
          <div className="empty-state">
            <p className="error-message">{error}</p>
            <button className="retry-btn" onClick={() => navigate('/')}>Back to Books</button>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = bookData?.pages?.length || 0;
  const headings = bookData?.indexes?.headings || [];

  return (
    <div className="app">
      <Helmet>
        <title>{bookData?.meta?.name ? `${bookData.meta.name} - Read Arabic Text` : 'Reading Arabic Text - ReadArabic'}</title>
        <meta name="description" content={bookData?.meta?.name ? `Read ${bookData.meta.name} with interactive Arabic dictionary, translations, and vocabulary building tools.` : 'Read Arabic texts with built-in dictionary, sentence translations, and spaced repetition vocabulary practice.'} />
        <meta name="keywords" content="Arabic reading, Arabic texts, Arabic books, Arabic dictionary, Arabic learning, Arabic vocabulary" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`https://www.readarabic.io/book/${bookId}`} />
      </Helmet>
      {/* Translation Popup */}
      {showTranslation && (
        <div
          className="translation-popup"
          style={{
            left: `${buttonPosition.x}px`,
            top: `${buttonPosition.y}px`
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {translating ? (
            <div className="translation-loading">Translating...</div>
          ) : showDuplicateOptions ? (
            <div className="duplicate-options">
              <div className="duplicate-header">This word already has a translation:</div>
              <button
                className="duplicate-option-btn use-existing"
                onClick={(e) => {
                  e.stopPropagation();
                  applyExistingTranslation();
                }}
              >
                <span className="option-icon">✓</span>
                <div className="option-content">
                  <div className="option-title">Use existing translation</div>
                  <div className="option-subtitle">
                    "{Object.values(inlineTranslations[selectedText.trim().replace(/[\u064B-\u065F\u0670]/g, '').replace(/[،؛؟.!:()\[\]{}«»""'']/g, '')] || {})[0]}"
                  </div>
                </div>
              </button>
              <button
                className="duplicate-option-btn lookup-other"
                onClick={(e) => {
                  e.stopPropagation();
                  lookupOtherDefinitions();
                }}
              >
                <span className="option-icon">🔍</span>
                <div className="option-content">
                  <div className="option-title">Look up other definitions</div>
                  <div className="option-subtitle">Choose a different meaning</div>
                </div>
              </button>
            </div>
          ) : definitions.length > 0 ? (
            <div className="definitions-list">
              {definitions.map((def, idx) => {
                const form = def.voc_form || def.form || 'N/A';
                const gloss = def.nice_gloss || 'N/A';
                const root = (def.root && typeof def.root === 'string') 
                  ? def.root.split('').join('-') 
                  : '';
                
                // AI Translation - completely separate rendering
                if (def.isAI) {
                  return (
                    <div 
                      key={idx}
                      className="ai-translation-container"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        console.log('AI translation clicked!');
                        addToDictionary(def);
                      }}
                      style={{
                        position: 'relative',
                        padding: '16px',
                        paddingTop: '32px',
                        cursor: 'pointer',
                        direction: 'ltr',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(147, 51, 234, 0.15)',
                        color: '#9333ea',
                        padding: '3px 10px',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        AI Translation
                      </div>
                      <div style={{
                        fontSize: '0.95rem',
                        lineHeight: '1.5',
                        color: 'inherit'
                      }}>
                        {gloss}
                      </div>
                    </div>
                  );
                }
                
                // Single word definition - original code unchanged
                return (
                  <div 
                    key={idx}
                    className="definition-row"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      console.log('Row clicked!');
                      addToDictionary(def);
                    }}
                  >
                    <span className="def-number">{idx + 1}.</span>
                    <span className="voc-form">{form}</span>
                    <span className="def-separator">-</span>
                    <span className="def-gloss">{gloss}</span>
                    {root && (
                      <>
                        <span className="def-separator">-</span>
                        <span className="def-root">{root}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : translation ? (
            <div 
              className="translation-text" 
              style={{
                direction: isArabicContent ? 'rtl' : 'ltr',
                textAlign: isArabicContent ? 'right' : 'left'
              }}
            >
              {translation}
            </div>
          ) : (
            <div className="translation-text">No definition found</div>
          )}
        </div>
      )}

      {/* Save Error Message */}
      {saveErrorMessage && (
        <div
          className="save-error-popup"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 1000,
            maxWidth: '350px',
            textAlign: 'center'
          }}
          onClick={() => setSaveErrorMessage('')}
        >
          <div style={{
            color: '#374151',
            fontSize: '1rem',
            lineHeight: '1.5',
            marginBottom: '16px'
          }}>
            {saveErrorMessage}
          </div>
          <button
            style={{
              background: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '0.85rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#e5e7eb'}
            onMouseOut={(e) => e.target.style.background = '#f3f4f6'}
          >
            OK
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${showSidebar ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1>ReadArabic</h1>
          {user ? (
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <button 
                onClick={() => {
                  setUser(null);
                  localStorage.removeItem('user');
                  navigate('/');
                }} 
                className="logout-btn"
              >
                Logout
              </button>
            </div>
          ) : (
            <LoginButton />
          )}
        </div>
        
        {showSidebar && (
          <div className="sidebar-content">
            <div className="toc-header">
              <button className="back-button" onClick={() => navigate('/browse')}>← Back to Books</button>
              <h3>Table of Contents</h3>
            </div>
            <div className="toc-list" ref={tocRef}>
              {headings.map((heading, index) => {
                // heading.page is a 1-based index into pages array - USE THIS DIRECTLY
                const targetPageIndex = heading.page - 1;
                
                // Get the actual page number from the pages array at this index
                const actualPageNumber = bookData?.pages?.[targetPageIndex]?.page;
                
                // Validate the index is within bounds
                if (targetPageIndex < 0 || targetPageIndex >= bookData?.pages?.length || !actualPageNumber) {
                  return null;
                }
                
                const isActive = currentPageIndex === targetPageIndex;
                
                return (
                  <div
                    key={index}
                    data-page-index={targetPageIndex}
                    className={`toc-item level-${heading.level} ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      // Disable observer immediately
                      isNavigatingRef.current = true;
                      
                      
                      // Always update currentPageIndex first to ensure page is loaded
                      setCurrentPageIndex(targetPageIndex);
                      setShowToc(false);
                      
                      // Wait for page to render, then scroll
                      setTimeout(() => {
                        const element = document.getElementById(`page-${targetPageIndex}`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                        
                        // Re-enable observer after scroll completes
                        setTimeout(() => {
                          isNavigatingRef.current = false;
                        }, 1000);
                      }, 150);
                    }}
                    style={isActive ? {
                      background: 'rgba(16, 185, 129, 0.15)',
                      borderLeft: '3px solid #10b981',
                      color: '#10b981'
                    } : {}}
                  >
                    <span className="toc-title">{heading.title}</span>
                    <span className="toc-page">p. {actualPageNumber}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="pdf-viewer">
          <div className="pdf-controls">
            <span className="page-info">
              {bookData?.meta?.name || 'Book'} - {bookData?.pages?.length || 0} Pages
            </span>
          </div>

          <div className="pdf-document">
            {bookData?.pages?.map((page, index) => {
              // Only render pages within a range of the current page for performance
              const isNearCurrentPage = Math.abs(index - currentPageIndex) <= 2;
              
              return (
                <div key={index} id={`page-${index}`} className="book-page">
                  <div className="page-meta">
                    <span>Volume: {page.vol}</span>
                    <span>Page: {page.page}</span>
                  </div>
                  <div className="page-text">
                    {isNearCurrentPage ? renderPageText(page.text, index) : <div style={{ minHeight: '500px' }}>Loading...</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginButton() {
  const { user, setUser } = useContext(UserContext);

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      // Send the credential to your backend to verify and create/get user
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect to browse after successful login
        window.location.href = '/browse';
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleLogout = () => {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  if (user) {
    return (
      <div className="user-info">
        <img src={user.profile_picture} alt={user.name} className="user-avatar" />
        <span>{user.name}</span>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    );
  }

  const handleLoginClick = () => {
    // Save current page to localStorage before redirecting
    const currentPath = window.location.pathname;
    console.log('💾 Saving current path for redirect:', currentPath);
    localStorage.setItem('redirectAfterLogin', currentPath);
    
    // Use OAuth redirect flow instead of popup to avoid origin issues
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const redirectUri = window.location.origin + '/auth/callback';
    console.log('Redirect URI:', redirectUri);
    const encodedRedirectUri = encodeURIComponent(redirectUri);
    const scope = encodeURIComponent('openid profile email');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    
    console.log('Full auth URL:', authUrl);
    
    // Redirect to Google OAuth
    window.location.href = authUrl;
  };

  return (
    <button 
      onClick={handleLoginClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        background: 'white',
        color: '#2c3e50',
        border: '2px solid #e5e7eb',
        padding: '14px 32px',
        borderRadius: '12px',
        fontSize: '1.05rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        margin: '0 auto'
      }}
      onMouseOver={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
        e.target.style.borderColor = '#667eea';
      }}
      onMouseOut={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        e.target.style.borderColor = '#e5e7eb';
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
        <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
        <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
        <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.991 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
      </svg>
      Sign in with Google
    </button>
  );
}

function AuthCallback({ setUser }) {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      // Exchange code for user info via backend
      fetch(`${API_URL}/api/auth/google/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirect_uri: window.location.origin + '/auth/callback' })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect back to the page they were on, or browse if not set
            const redirectPath = localStorage.getItem('redirectAfterLogin') || '/browse';
            localStorage.removeItem('redirectAfterLogin');
            navigate(redirectPath);
          } else {
            console.error('Auth failed:', data.error);
            navigate('/');
          }
        })
        .catch(err => {
          console.error('Auth error:', err);
          navigate('/');
        });
    } else {
      navigate('/');
    }
  }, [setUser, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>Logging in...</div>
    </div>
  );
}

function AppContent() {
  const [user, setUser] = useState(null);

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/learning" element={<Learning />} />
          {/* Subscribe route - commented out during free beta
          <Route path="/subscribe" element={<Subscribe />} />
          */}
          <Route path="/account" element={<Account />} />
          <Route path="/book/:bookId" element={<BookReader />} />
          <Route path="/vocabulary/practice" element={<VocabularyPractice />} />
          <Route path="/vocabulary/practice/:bookId" element={<VocabularyPractice />} />
          <Route path="/auth/callback" element={<AuthCallback setUser={setUser} />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

function App() {
  // Load Google Identity Services script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    
    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <HelmetProvider>
      <AppContent />
    </HelmetProvider>
  );
}

export default App;
