import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookData, setBookData] = useState(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

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
    setPageNumber(0);
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

  const goToPrevPage = () => {
    setPageNumber(prevPage => Math.max(prevPage - 1, 0));
  };

  const goToNextPage = () => {
    if (bookData && bookData.pages) {
      setPageNumber(prevPage => Math.min(prevPage + 1, bookData.pages.length - 1));
    }
  };

  const getCurrentPage = () => {
    if (!bookData || !bookData.pages) return null;
    return bookData.pages[pageNumber];
  };

  const currentPage = getCurrentPage();
  const totalPages = bookData?.pages?.length || 0;

  return (
    <div className="app">
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
              <button 
                onClick={goToPrevPage} 
                disabled={pageNumber <= 0}
                className="nav-button"
              >
                Previous
              </button>
              
              <span className="page-info">
                Page {pageNumber + 1} of {totalPages}
              </span>
              
              <button 
                onClick={goToNextPage} 
                disabled={pageNumber >= totalPages - 1}
                className="nav-button"
              >
                Next
              </button>
            </div>

            <div className="pdf-document">
              {currentPage && (
                <div className="book-page">
                  <div className="page-meta">
                    <span>Volume: {currentPage.vol}</span>
                    <span>Page: {currentPage.page}</span>
                  </div>
                  <div className="page-text">
                    {currentPage.text}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
