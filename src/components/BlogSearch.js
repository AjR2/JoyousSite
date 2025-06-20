// BlogSearch.js - Component for searching blog posts
import React, { useState, useRef, useEffect } from 'react';
import './BlogSearch.css';

const BlogSearch = ({ onSearch, searchQuery = '', isLoading = false }) => {
  const [query, setQuery] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounce search suggestions
    if (value.length >= 2) {
      // In a real implementation, you might fetch suggestions from an API
      // For now, we'll just show the current query as a suggestion
      setSuggestions([value]);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      searchInputRef.current?.blur();
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        !searchInputRef.current?.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="blog-search" role="search">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <label htmlFor="blog-search-input" className="sr-only">
            Search blog posts
          </label>
          <input
            ref={searchInputRef}
            id="blog-search-input"
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search posts..."
            className="search-input"
            aria-describedby="search-help"
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            autoComplete="off"
          />
          
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="clear-search-btn"
              aria-label="Clear search"
              tabIndex={0}
            >
              ×
            </button>
          )}
          
          <button
            type="submit"
            className="search-submit-btn"
            aria-label="Search posts"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? (
              <span className="search-spinner" aria-hidden="true"></span>
            ) : (
              <span className="search-icon" aria-hidden="true">🔍</span>
            )}
          </button>
        </div>

        <p id="search-help" className="search-help sr-only">
          Search through blog post titles, content, categories, and tags
        </p>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="search-suggestions"
          role="listbox"
          aria-label="Search suggestions"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion-item"
              role="option"
              aria-selected="false"
            >
              <span className="suggestion-icon" aria-hidden="true">🔍</span>
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Search Tips */}
      <div className="search-tips">
        <details>
          <summary>Search Tips</summary>
          <ul>
            <li>Search by keywords in titles or content</li>
            <li>Use category names like "Mental Health" or "Personal Development"</li>
            <li>Search by tags like "mindfulness" or "gratitude"</li>
            <li>Combine with filters for more specific results</li>
          </ul>
        </details>
      </div>
    </div>
  );
};

export default BlogSearch;
