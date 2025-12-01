import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from './App';
import { Helmet } from 'react-helmet-async';
import './VocabularyPractice.css';

// API URL - use environment variable or default to current domain in production
const API_URL = process.env.REACT_APP_API_URL || '';

const VocabularyPractice = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { bookId } = useParams(); // Optional - if practicing specific book
  
  const [vocabulary, setVocabulary] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  });
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    fetchDueVocabulary();
  }, [user, bookId]);

  const fetchDueVocabulary = async () => {
    try {
      setLoading(true);
      let url = `/api/vocabulary/due/${user.id}`;
      if (bookId) {
        url += `?book_id=${bookId}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        // Shuffle vocabulary for variety
        const shuffled = data.vocabulary.sort(() => Math.random() - 0.5);
        setVocabulary(shuffled);
        setSessionStats(prev => ({ ...prev, total: shuffled.length }));
      }
    } catch (err) {
      console.error('Failed to fetch vocabulary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleResponse = async (correct) => {
    const currentWord = vocabulary[currentIndex];
    
    // Update stats
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1)
    }));
    
    // Update vocabulary review on backend
    try {
      await fetch(`${API_URL}/api/vocabulary/${currentWord.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correct })
      });
    } catch (err) {
      console.error('Failed to update review:', err);
    }
    
    // First flip the card back
    setIsFlipped(false);
    
    // Wait for flip animation to complete before changing content
    setTimeout(() => {
      // Move to next word or end session
      if (currentIndex < vocabulary.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setSessionComplete(true);
      }
    }, 300); // Match the CSS transition duration
  };

  const handleKeyPress = (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      if (!isFlipped) {
        handleFlip();
      }
    } else if (isFlipped) {
      if (e.key === '1') {
        handleResponse(true);
      } else if (e.key === '2') {
        handleResponse(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, currentIndex]);

  if (loading) {
    return (
      <div className="practice-container">
        <Helmet>
          <title>Loading Arabic Vocabulary Practice | ReadArabic</title>
          <meta name="description" content="Loading your Arabic vocabulary practice session with spaced repetition flashcards." />
          <meta name="keywords" content="Arabic vocabulary practice, loading, spaced repetition, Arabic flashcards" />
          <meta name="robots" content="noindex, nofollow" />
          <link rel="canonical" href="https://www.readarabic.io/vocabulary/practice" />
        </Helmet>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading vocabulary...</p>
        </div>
      </div>
    );
  }

  if (vocabulary.length === 0) {
    return (
      <div className="practice-container">
        <Helmet>
          <title>No Vocabulary Due - Arabic Practice | ReadArabic</title>
          <meta name="description" content="No Arabic vocabulary words are due for review. Continue reading to add more words to your practice sessions." />
          <meta name="keywords" content="Arabic vocabulary practice, no words due, Arabic learning, spaced repetition" />
          <meta name="robots" content="noindex, nofollow" />
          <link rel="canonical" href="https://www.readarabic.io/vocabulary/practice" />
        </Helmet>
        <div className="empty-state">
          <h2>No vocabulary due for review</h2>
          <p>Great job! Check back later or add more vocabulary while reading.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Books
          </button>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    const accuracy = sessionStats.total > 0 
      ? Math.round((sessionStats.correct / sessionStats.total) * 100) 
      : 0;
    
    return (
      <div className="practice-container">
        <Helmet>
          <title>Arabic Vocabulary Practice Complete - Session Stats | ReadArabic</title>
          <meta name="description" content="Vocabulary practice session completed. Review your performance and continue learning Arabic with spaced repetition." />
          <meta name="keywords" content="Arabic vocabulary practice complete, spaced repetition stats, Arabic learning progress" />
          <meta name="robots" content="noindex, nofollow" />
          <link rel="canonical" href="https://www.readarabic.io/vocabulary/practice" />
        </Helmet>
        <div className="session-complete">
          <h2>🎉 Session Complete!</h2>
          <div className="stats-summary">
            <div className="stat-item">
              <div className="stat-value">{sessionStats.total}</div>
              <div className="stat-label">Words Reviewed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{sessionStats.correct}</div>
              <div className="stat-label">Correct</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{sessionStats.incorrect}</div>
              <div className="stat-label">Need Review</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{accuracy}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
          </div>
          <div className="session-actions">
            <button onClick={() => window.location.reload()} className="btn-secondary">
              Practice Again
            </button>
            <button onClick={() => navigate('/')} className="btn-primary">
              Back to Books
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentWord = vocabulary[currentIndex];
  const progress = ((currentIndex + 1) / vocabulary.length) * 100;

  return (
    <div className="practice-container">
      <Helmet>
        <title>Arabic Vocabulary Practice - Spaced Repetition Flashcards | ReadArabic</title>
        <meta name="description" content="Practice Arabic vocabulary with intelligent spaced repetition flashcards. Review words from your reading and improve retention with adaptive learning." />
        <meta name="keywords" content="Arabic vocabulary practice, spaced repetition, Arabic flashcards, Arabic learning, Arabic words practice" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://www.readarabic.io/vocabulary/practice" />
      </Helmet>
      <div className="practice-header">
        <button onClick={() => navigate(-1)} className="back-button">← Back</button>
        <div className="progress-info">
          <span>{currentIndex + 1} / {vocabulary.length}</span>
        </div>
      </div>
      
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="flashcard-container">
        <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <div className="card-label">Arabic</div>
              <div className="card-word">{currentWord.word}</div>
              <div className="card-hint">Click or press Space to reveal</div>
            </div>
            <div className="flashcard-back">
              <div className="card-label">Translation</div>
              <div className="card-translation">{currentWord.translation}</div>
              {currentWord.book_id && (
                <div className="card-context">
                  Book {currentWord.book_id}, Page {currentWord.page_number}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isFlipped && (
        <div className="response-buttons">
          <button 
            className="btn-incorrect" 
            onClick={() => handleResponse(false)}
          >
            Need Review (2)
          </button>
          <button 
            className="btn-correct" 
            onClick={() => handleResponse(true)}
          >
            Got it! (1)
          </button>
        </div>
      )}

      <div className="keyboard-hints">
        <span>Space: Flip</span>
        {isFlipped && <span>1: Got it | 2: Need Review</span>}
      </div>
    </div>
  );
}

export default VocabularyPractice;
