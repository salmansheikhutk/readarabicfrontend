import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showToc, setShowToc] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [translation, setTranslation] = useState('');
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [showTranslation, setShowTranslation] = useState(false);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/books');
      const data = await response.json();
      
      if (data.success) {
        setBooks(data.books);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch books: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSelect = async (book) => {
    setSelectedBook(book);
    setBookData(null);
    
    try {
      const response = await fetch(book.url);
      const data = await response.json();
      
      if (data.success) {
        setBookData(data.book);
      } else {
        setError('Failed to load book');
      }
    } catch (err) {
      setError('Failed to load book: ' + err.message);
    }
  };

  const scrollToPage = (pageIndex) => {
    const element = document.getElementById(`page-${pageIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShowToc(false);
    }
  };

  const handleTextSelection = async () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText(text);
      setButtonPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + window.scrollY
      });
      setShowTranslation(true);
      setTranslating(true);
      setTranslation('');
      
      // Call OpenAI API for translation
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a translator. Translate the given Arabic text to English. Only provide the translation, no explanations.'
              },
              {
                role: 'user',
                content: `Translate this Arabic text to English: ${text}`
              }
            ],
            max_tokens: 200,
            temperature: 0.3
          })
        });
        
        const data = await response.json();
        console.log('OpenAI Response:', data);
        
        if (data.error) {
          console.error('OpenAI Error:', data.error);
          setTranslation(`Error: ${data.error.message || 'API Error'}`);
        } else if (data.choices && data.choices[0]) {
          setTranslation(data.choices[0].message.content);
        } else {
          console.error('Unexpected response format:', data);
          setTranslation('Translation failed - unexpected response');
        }
      } catch (error) {
        console.error('Translation error:', error);
        setTranslation(`Error: ${error.message}`);
      } finally {
        setTranslating(false);
      }
    } else {
      setShowTranslation(false);
      setTranslation('');
    }
  };

  const handleTranslate = () => {
    // For now, just log the selected text
    // You can integrate with a translation API later
    console.log('Translating:', selectedText);
    alert(`Translation for: ${selectedText}\n\n(Translation API integration coming soon)`);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, []);

  const totalPages = bookData?.pages?.length || 0;
  const headings = bookData?.indexes?.headings || [];

  return (
    <div className="app">
      {/* Translation Popup */}
      {showTranslation && (
        <div
          className="translation-popup"
          style={{
            left: `${buttonPosition.x}px`,
            top: `${buttonPosition.y}px`
          }}
        >
          {translating ? (
            <div className="translation-loading">Translating...</div>
          ) : (
            <div className="translation-text">{translation}</div>
          )}
        </div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${showSidebar ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1>ReadArabic</h1>
          <button 
            className="toggle-sidebar"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? '←' : '→'}
          </button>
        </div>
        
        {showSidebar && (
          <div className="sidebar-content">
            {!selectedBook ? (
              <>
                {loading && <p className="loading">Loading books...</p>}
                {error && <p className="error">{error}</p>}
                
                <div className="pdf-list">
                  {books.map((book, index) => (
                    <div
                      key={index}
                      className={`pdf-item ${selectedBook?.id === book.id ? 'active' : ''}`}
                      onClick={() => handleBookSelect(book)}
                    >
                      <div className="pdf-name">{book.title}</div>
                      <div className="pdf-info">{book.author}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="toc-header">
                  <button className="back-button" onClick={() => setSelectedBook(null)}>← Back to Books</button>
                  <h3>Table of Contents</h3>
                </div>
                <div className="toc-list">
                  {headings.map((heading, index) => (
                    <div
                      key={index}
                      className={`toc-item level-${heading.level}`}
                      onClick={() => scrollToPage(heading.page - 1)}
                    >
                      <span className="toc-title">{heading.title}</span>
                      <span className="toc-page">p. {heading.page}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content">
        {!selectedBook ? (
          <div className="empty-state">
            <h2>Welcome to ReadArabic</h2>
            <p>Select a book from the sidebar to start reading</p>
          </div>
        ) : !bookData ? (
          <div className="empty-state">
            <p className="loading">Loading book...</p>
          </div>
        ) : (
          <div className="pdf-viewer">
            <div className="pdf-controls">
              <span className="page-info">
                {bookData?.meta?.name || 'Book'} - {totalPages} Pages
              </span>
            </div>

            <div className="pdf-document">
              {bookData?.pages?.map((page, index) => (
                <div key={index} id={`page-${index}`} className="book-page">
                  <div className="page-meta">
                    <span>Volume: {page.vol}</span>
                    <span>Page: {page.page}</span>
                  </div>
                  <div className="page-text">
                    {page.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
