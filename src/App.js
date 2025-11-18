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
  const [isArabicContent, setIsArabicContent] = useState(true);
  const [definitions, setDefinitions] = useState([]);
  const [dictionary, setDictionary] = useState(() => {
    const saved = localStorage.getItem('readarabic-dictionary');
    return saved ? JSON.parse(saved) : [];
  });
  const [inlineTranslations, setInlineTranslations] = useState(() => {
    const saved = localStorage.getItem('readarabic-inline-translations');
    return saved ? JSON.parse(saved) : {};
  });
  const [editingDictIndex, setEditingDictIndex] = useState(null);
  const [editingDictValue, setEditingDictValue] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    localStorage.setItem('readarabic-dictionary', JSON.stringify(dictionary));
  }, [dictionary]);

  useEffect(() => {
    localStorage.setItem('readarabic-inline-translations', JSON.stringify(inlineTranslations));
  }, [inlineTranslations]);

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
        const words = text.split(/\s+/);
        if (words.length === 1) {
          console.log('Single word detected, calling AraTools:', text);
          const response = await fetch(`/api/define/${encodeURIComponent(text)}`);
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
            }
            setTranslation(''); // Clear text translation
          } else {
            // If AraTools fails, fall back to AI
            console.log('AraTools failed, falling back to AI');
            await translateWithAI(text);
          }
        } else {
          // For phrases, use AI
          await translateWithAI(text);
        }
      } catch (error) {
        console.error('Definition/Translation error:', error);
        // If there's an error, try AI as fallback
        try {
          await translateWithAI(text);
          await translateWithAI(text);
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

  const translateWithAI = async (text) => {
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
    
    if (data.error) {
      throw new Error(data.error.message || 'API Error');
    } else if (data.choices && data.choices[0]) {
      const translationText = data.choices[0].message.content;
      setTranslation(translationText);
      // Create a fake definition object for AI translations so they can be hoverable
      setDefinitions([{
        form: text,
        voc_form: text,
        nice_gloss: translationText,
        root: null,
        isAI: true
      }]);
    } else {
      throw new Error('Translation failed - unexpected response');
    }
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

  const addToDictionary = (def) => {
    console.log('addToDictionary called with:', def);
    console.log('Selected text was:', selectedText);
    
    const arabicWord = def.voc_form || def.form;
    const englishDef = def.nice_gloss;
    const selectedWord = selectedText.trim();
    
    // Add to dictionary with the selected word as reference
    const exists = dictionary.some(item => 
      item.arabic === arabicWord && item.english === englishDef
    );
    
    if (!exists) {
      setDictionary([...dictionary, { 
        arabic: arabicWord, 
        english: englishDef,
        selectedWord: selectedWord // Store the actual selected word
      }]);
    }
    
    // Add inline translation using the ACTUAL SELECTED WORD as key
    console.log('Adding inline translation for word:', selectedWord, '=', englishDef);
    
    setInlineTranslations(prev => {
      const updated = { ...prev, [selectedWord]: englishDef };
      console.log('Inline translations updated:', updated);
      return updated;
    });
    
    setShowTranslation(false);
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
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {translating ? (
            <div className="translation-loading">Translating...</div>
          ) : definitions.length > 0 ? (
            <div className="definitions-list">
              {definitions.map((def, idx) => {
                const form = def.voc_form || def.form || 'N/A';
                const gloss = def.nice_gloss || 'N/A';
                const root = (def.root && typeof def.root === 'string') 
                  ? def.root.split('').join('-') 
                  : '';
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
                    {!def.isAI && <span className="def-number">{idx + 1}.</span>}
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
            {/* Dictionary Section */}
            <div className="dictionary-section">
              <h3>My Dictionary ({dictionary.length})</h3>
              {dictionary.length === 0 ? (
                <p className="empty-dict">Click on definitions to add words</p>
              ) : (
                <div className="dictionary-list">
                  {dictionary.slice(-10).reverse().map((item, idx) => {
                    const actualIndex = dictionary.length - 1 - idx;
                    const isEditing = editingDictIndex === actualIndex;
                    return (
                      <div key={idx} className="dict-item">
                        <div className="dict-arabic">{item.arabic}</div>
                        {isEditing ? (
                          <div className="dict-edit-controls">
                            <input
                              type="text"
                              className="dict-edit-input"
                              value={editingDictValue}
                              onChange={(e) => setEditingDictValue(e.target.value)}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEditDict(actualIndex);
                                if (e.key === 'Escape') cancelEditDict();
                              }}
                            />
                            <button className="dict-btn dict-btn-save" onClick={() => saveEditDict(actualIndex)}>✓</button>
                            <button className="dict-btn dict-btn-cancel" onClick={cancelEditDict}>✗</button>
                          </div>
                        ) : (
                          <>
                            <div className="dict-english">{item.english}</div>
                            <div className="dict-actions">
                              <button className="dict-btn dict-btn-edit" onClick={() => startEditingDict(actualIndex, item.english)}>✎</button>
                              <button className="dict-btn dict-btn-delete" onClick={() => deleteDictItem(actualIndex)}>🗑</button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                  {dictionary.length > 10 && (
                    <div className="dict-more">...and {dictionary.length - 10} more</div>
                  )}
                </div>
              )}
            </div>
            
            <div className="divider"></div>
            
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
                    {page.text.split(' ').map((word, wordIdx) => {
                      const cleanWord = word.trim();
                      const hasTranslation = inlineTranslations[cleanWord];
                      if (hasTranslation && wordIdx < 5) {
                        console.log('Rendering word with translation:', cleanWord, hasTranslation);
                      }
                      return (
                        <span key={wordIdx} className="word-wrapper">
                          <span className={hasTranslation ? 'word-with-translation' : ''}>
                            {hasTranslation && (
                              <span className="inline-translation">
                                {inlineTranslations[cleanWord]}
                              </span>
                            )}
                            {word}
                          </span>
                          {' '}
                        </span>
                      );
                    })}
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
