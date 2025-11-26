import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
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
    // Clear old format and start fresh
    localStorage.removeItem('readarabic-inline-translations');
    return {};
  });
  const [editingDictIndex, setEditingDictIndex] = useState(null);
  const [editingDictValue, setEditingDictValue] = useState('');
  const [editingInlinePosition, setEditingInlinePosition] = useState(null); // pageIndex-wordIndex
  const [editingInlineKey, setEditingInlineKey] = useState(null); // the actual word
  const [editingInlineValue, setEditingInlineValue] = useState('');
  const [showDuplicateOptions, setShowDuplicateOptions] = useState(false); // Show options for existing words
  const selectionRangeRef = React.useRef(null); // Store the selection range

  useEffect(() => {
    localStorage.setItem('readarabic-dictionary', JSON.stringify(dictionary));
  }, [dictionary]);

  useEffect(() => {
    localStorage.setItem('readarabic-inline-translations', JSON.stringify(inlineTranslations));
  }, [inlineTranslations]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch books on mount and when category changes
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoadingBooks(true);
        setError(null);
        
        let url = '/api/books';
        const params = [];
        if (selectedCategory) {
          params.push(`category=${selectedCategory}`);
        }
        if (params.length > 0) {
          url += '?' + params.join('&');
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          setBooks(data.books);
        } else {
          setError(data.error || 'Failed to fetch books');
        }
      } catch (err) {
        setError('Failed to fetch books: ' + err.message);
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();
  }, [selectedCategory]);





  const handleBookSelect = async (book) => {
    setSelectedBook(book);
    setBookData(null);
    setLoading(true);
    setError(null);
    
    try {
      // Use book.id to fetch the actual book content
      const response = await fetch(`/api/book/${book.id}`);
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

  const scrollToPage = (pageIndex) => {
    const element = document.getElementById(`page-${pageIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShowToc(false);
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

  const startEditingInline = (pageIndex, wordIdx, wordKey, currentValue, e) => {
    e.stopPropagation();
    e.preventDefault();
    const position = `${pageIndex}-${wordIdx}`;
    console.log('Starting to edit inline at position:', position, 'word:', wordKey, currentValue);
    setEditingInlinePosition(position);
    setEditingInlineKey(wordKey);
    setEditingInlineValue(currentValue);
  };

  const saveEditInline = () => {
    if (!editingInlineKey || !editingInlinePosition) return;
    
    setInlineTranslations(prev => {
      const updated = { ...prev };
      if (!updated[editingInlineKey]) {
        updated[editingInlineKey] = {};
      }
      updated[editingInlineKey][editingInlinePosition] = editingInlineValue;
      return updated;
    });
    
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
            console.log('=== SAVING ===');
            console.log('Selected text:', selectedText);
            console.log('Cleaned word:', selectedWord);
            console.log('Position:', position);
            break;
          }
        }
      }
    }
    
    if (!position) {
      console.error('Could not determine word position');
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
      
      console.log('Saved translation:', {
        word: selectedWord,
        position: position,
        translation: englishDef,
        fullData: updated[selectedWord]
      });
      
      return updated;
    });
    
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

  const totalPages = bookData?.pages?.length || 0;
  const headings = bookData?.indexes?.headings || [];

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
      
      // Debug - show ALL words with their positions on first page
      if (pageIndex === 0 && wordIdx < 30) {
        console.log(`Word #${wordIdx}: "${word}" -> clean: "${cleanWord}" -> position: ${currentPosition}`);
      }
      
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
                    value={editingInlineValue}
                    onChange={(e) => setEditingInlineValue(e.target.value)}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        saveEditInline();
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
        
        {showSidebar && selectedBook && (
          <div className="sidebar-content">
            <div className="toc-header">
              <button className="back-button" onClick={() => {
                setSelectedBook(null);
                setBookData(null);
              }}>← Back to Books</button>
              <h3>Table of Contents</h3>
            </div>
            <div className="toc-list">
              {headings.map((heading, index) => {
                // heading.page is the array index (0-based or 1-based)
                // We need to get the actual page number from the pages array
                const pageIndex = heading.page - 1; // Convert to 0-based index
                const actualPageNumber = bookData?.pages?.[pageIndex]?.page || heading.page;
                return (
                  <div
                    key={index}
                    className={`toc-item level-${heading.level}`}
                    onClick={() => scrollToPage(pageIndex)}
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
        {selectedBook && bookData ? (
          <div className="pdf-viewer">
            <div className="pdf-controls">
              <span className="page-info">
                {bookData?.meta?.name || 'Book'} - {bookData?.pages?.length || 0} Pages
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
                    {renderPageText(page.text, index)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !selectedBook ? (
          <div className="book-selection-screen">
                        <div className="welcome-header">
              <h1>Welcome to ReadArabic</h1>
              <p>Select a book to start reading</p>
            </div>

            {/* Categories Filter */}
            <div className="main-categories-section">
              <h3>Browse by Category</h3>
              <div className="main-categories-grid">
                <button
                  className={`main-category-card ${!selectedCategory ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(null)}
                >
                  <div className="category-name">All Books</div>
                  <div className="category-count">{loadingBooks ? '...' : books.length}</div>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.cat_id}
                    className={`main-category-card ${selectedCategory === cat.cat_id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.cat_id)}
                  >
                    <div className="category-name">{cat.category_name}</div>
                    <div className="category-count">{cat.book_count}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Books Grid */}
            <div className="main-books-section">
              <h3>
                {selectedCategory 
                  ? categories.find(c => c.cat_id === selectedCategory)?.category_name || 'Category'
                  : 'All Books'
                }
              </h3>
              
              {loadingBooks ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading books...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p className="error-message">{error}</p>
                  <button className="retry-btn" onClick={() => setSelectedCategory(null)}>Try Again</button>
                </div>
              ) : books.length === 0 ? (
                <div className="empty-books-state">
                  <p>No books found</p>
                  <p className="empty-subtitle">Try a different category or search term</p>
                </div>
              ) : (
                <div className="main-books-grid">
                  {books.map((book) => {
                    // Extract author from info field
                    const authorMatch = book.info?.match(/المؤلف:\s*(.+?)(?:\n|\[|$)/);
                    const author = authorMatch ? authorMatch[1].trim() : null;
                    
                    // Extract page count from info field
                    const pageMatch = book.info?.match(/عدد الصفحات:\s*(\d+)/);
                    const pageCount = pageMatch ? pageMatch[1] : null;
                    
                    return (
                      <div
                        key={book.id}
                        className="main-book-card"
                        onClick={() => handleBookSelect(book)}
                      >
                        <div className="book-card-body">
                          <h4 className="book-title">{book.name}</h4>
                          {book.category_name && (
                            <div className="book-category-badge">{book.category_name}</div>
                          )}
                          {author && (
                            <p className="book-author">{author}</p>
                          )}
                          {pageCount && (
                            <p className="book-pages">{pageCount} صفحة</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="spinner"></div>
            <p className="loading">Loading book...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
