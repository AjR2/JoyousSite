import React, { useState, useRef, useEffect, useCallback } from 'react';
import './BlogSearchAndFilters.css';

const BlogSearchAndFilters = ({ 
  onSearch, 
  onFilterChange, 
  searchQuery = '', 
  activeFilters = {}, 
  isLoading = false 
}) => {
  const [query, setQuery] = useState(searchQuery);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Load categories and tags
  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const response = await fetch('/api/posts');
        if (response.ok) {
          const posts = await response.json();
          
          // Extract unique categories
          const uniqueCategories = [...new Set(
            posts.flatMap(post => post.categories || [])
          )].sort();
          
          // Extract and count tags
          const tagCounts = {};
          posts.forEach(post => {
            if (post.tags) {
              post.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
              });
            }
          });
          
          const sortedTags = Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);
          
          setCategories(uniqueCategories);
          setTags(sortedTags);
        }
      } catch (error) {
        console.error('Error loading filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFiltersData();
  }, []);

  // Generate search suggestions
  const generateSuggestions = useCallback((searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    const suggestions = [];
    const term = searchTerm.toLowerCase();

    // Add category suggestions
    categories.forEach(category => {
      if (category.toLowerCase().includes(term)) {
        suggestions.push(category);
      }
    });

    // Add tag suggestions
    tags.forEach(({ tag }) => {
      if (tag.toLowerCase().includes(term)) {
        suggestions.push(tag);
      }
    });

    setSuggestions([...new Set(suggestions)].slice(0, 5));
  }, [categories, tags]);

  // Handle input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    generateSuggestions(value);
    setShowSuggestions(value.length > 0);
  };

  // Handle search submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(query);
  };

  // Handle suggestion clicks
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  // Handle clear search
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch('');
    searchInputRef.current?.focus();
  };

  // Handle filter changes
  const handleCategoryChange = (category) => {
    const newCategory = activeFilters.category === category ? '' : category;
    onFilterChange({ ...activeFilters, category: newCategory });
  };

  const handleTagChange = (tag) => {
    const newTag = activeFilters.tag === tag ? '' : tag;
    onFilterChange({ ...activeFilters, tag: newTag });
  };

  const handleFeaturedChange = (e) => {
    const featured = e.target.checked ? true : undefined;
    onFilterChange({ ...activeFilters, featured });
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFilterChange({ category: '', tag: '', featured: undefined });
  };

  // Check if there are active filters
  const hasActiveFilters = activeFilters.category || activeFilters.tag || activeFilters.featured;
  const displayTags = showAllTags ? tags : tags.slice(0, 8);

  return (
    <div className="blog-search-and-filters">
      {/* Mobile Toggle Button */}
      <button
        className="mobile-filters-toggle"
        onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        aria-expanded={isMobileFiltersOpen}
        aria-controls="search-and-filters-content"
      >
        <span className="toggle-icon">{isMobileFiltersOpen ? '✕' : '🔍'}</span>
        <span>Search & Filters</span>
        {hasActiveFilters && (
          <span className="mobile-active-indicator">
            ({Object.values(activeFilters).filter(v => v && v !== '').length})
          </span>
        )}
      </button>

      {/* Search and Filters Content */}
      <div
        id="search-and-filters-content"
        className={`search-and-filters-content ${isMobileFiltersOpen ? 'mobile-open' : ''}`}
      >
        {/* Main Search Bar */}
        <div className="search-section" role="search">
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
              >
                ×
              </button>
            )}

            <button
              type="submit"
              className="search-submit-btn"
              disabled={isLoading}
              aria-label="Search posts"
            >
              {isLoading ? (
                <span className="search-spinner" aria-hidden="true"></span>
              ) : (
                '🔍'
              )}
            </button>
          </div>

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
        </form>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="advanced-toggle-section">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="advanced-toggle-btn"
          aria-expanded={showAdvanced}
          aria-controls="advanced-filters"
        >
          <span className="toggle-icon" aria-hidden="true">
            {showAdvanced ? '▼' : '▶'}
          </span>
          Advanced Search & Filters
          {hasActiveFilters && (
            <span className="active-filters-indicator" aria-label="Active filters applied">
              ({Object.values(activeFilters).filter(v => v && v !== '').length})
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div 
          id="advanced-filters" 
          className="advanced-filters-panel"
          role="region"
          aria-label="Advanced search filters"
        >
          {/* Quick Actions */}
          <div className="filter-actions">
            {hasActiveFilters && (
              <button 
                onClick={clearAllFilters}
                className="clear-all-btn"
                aria-label="Clear all active filters"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Search Tips */}
          <div className="search-tips-section">
            <h4>Search Tips</h4>
            <ul className="tips-list">
              <li>Search by keywords in titles or content</li>
              <li>Use category names like "Mental Health" or "Personal Development"</li>
              <li>Search by tags like "mindfulness" or "gratitude"</li>
              <li>Combine search with filters below for precise results</li>
            </ul>
          </div>

          {/* Filters */}
          {loading ? (
            <div className="filters-loading">
              <span>Loading filters...</span>
            </div>
          ) : (
            <div className="filters-grid">
              {/* Featured Posts Filter */}
              <div className="filter-group">
                <h4>Featured</h4>
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={activeFilters.featured === true}
                    onChange={handleFeaturedChange}
                  />
                  <span className="checkmark"></span>
                  Featured Posts Only
                </label>
              </div>

              {/* Categories Filter */}
              {categories.length > 0 && (
                <div className="filter-group">
                  <h4>Categories</h4>
                  <div className="filter-options">
                    {categories.map(category => (
                      <label key={category} className="filter-option">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={activeFilters.category === category}
                          onChange={() => handleCategoryChange(category)}
                        />
                        <span className="radio-mark"></span>
                        {category}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags Filter */}
              {tags.length > 0 && (
                <div className="filter-group">
                  <h4>Tags</h4>
                  <div className="filter-options tags-grid">
                    {displayTags.map(({ tag, count }) => (
                      <label key={tag} className="filter-option tag-option">
                        <input
                          type="radio"
                          name="tag"
                          value={tag}
                          checked={activeFilters.tag === tag}
                          onChange={() => handleTagChange(tag)}
                        />
                        <span className="radio-mark"></span>
                        <span className="tag-name">{tag}</span>
                        <span className="tag-count">({count})</span>
                      </label>
                    ))}
                  </div>
                  
                  {tags.length > 8 && (
                    <button
                      onClick={() => setShowAllTags(!showAllTags)}
                      className="show-more-tags-btn"
                    >
                      {showAllTags ? 'Show Less' : `Show ${tags.length - 8} More Tags`}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="active-filters-summary">
              <h4>Active Filters:</h4>
              <div className="active-filter-tags">
                {activeFilters.featured && (
                  <span className="active-filter-tag">
                    Featured
                    <button 
                      onClick={() => onFilterChange({ ...activeFilters, featured: undefined })}
                      aria-label="Remove featured filter"
                      className="remove-filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {activeFilters.category && (
                  <span className="active-filter-tag">
                    {activeFilters.category}
                    <button 
                      onClick={() => onFilterChange({ ...activeFilters, category: '' })}
                      aria-label={`Remove ${activeFilters.category} category filter`}
                      className="remove-filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {activeFilters.tag && (
                  <span className="active-filter-tag">
                    #{activeFilters.tag}
                    <button 
                      onClick={() => onFilterChange({ ...activeFilters, tag: '' })}
                      aria-label={`Remove ${activeFilters.tag} tag filter`}
                      className="remove-filter"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default BlogSearchAndFilters;
