// BlogFilters.js - Component for filtering blog posts by categories and tags
import React, { useState, useEffect } from 'react';
import './BlogFilters.css';

const BlogFilters = ({ onFilterChange, activeFilters = {} }) => {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllTags, setShowAllTags] = useState(false);

  useEffect(() => {
    // Fetch categories and tags
    Promise.all([
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/tags').then(res => res.json())
    ])
    .then(([categoriesData, tagsData]) => {
      setCategories(categoriesData.categories || []);
      setTags(tagsData.tags || []);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching filter data:', error);
      setLoading(false);
    });
  }, []);

  const handleCategoryChange = (category) => {
    const newCategory = activeFilters.category === category ? '' : category;
    onFilterChange({ ...activeFilters, category: newCategory });
  };

  const handleTagChange = (tag) => {
    const newTag = activeFilters.tag === tag ? '' : tag;
    onFilterChange({ ...activeFilters, tag: newTag });
  };

  const handleFeaturedChange = () => {
    const newFeatured = activeFilters.featured === true ? undefined : true;
    onFilterChange({ ...activeFilters, featured: newFeatured });
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = activeFilters.category || activeFilters.tag || activeFilters.featured;
  const displayTags = showAllTags ? tags : tags.slice(0, 8);

  if (loading) {
    return (
      <div className="blog-filters loading" role="status" aria-live="polite">
        <span className="sr-only">Loading filters...</span>
        <div className="filter-skeleton">
          <div className="skeleton-item"></div>
          <div className="skeleton-item"></div>
          <div className="skeleton-item"></div>
        </div>
      </div>
    );
  }

  return (
    <aside className="blog-filters" role="complementary" aria-label="Blog post filters">
      <div className="filters-header">
        <h3>Filter Posts</h3>
        {hasActiveFilters && (
          <button 
            onClick={clearAllFilters}
            className="clear-filters-btn"
            aria-label="Clear all active filters"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Featured Posts Filter */}
      <div className="filter-group">
        <h4>Featured</h4>
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={activeFilters.featured === true}
            onChange={handleFeaturedChange}
            aria-describedby="featured-filter-desc"
          />
          <span className="checkmark"></span>
          Featured Posts Only
        </label>
        <p id="featured-filter-desc" className="sr-only">
          Show only posts marked as featured
        </p>
      </div>

      {/* Categories Filter */}
      {categories.length > 0 && (
        <div className="filter-group">
          <h4>Categories</h4>
          <div className="filter-options" role="radiogroup" aria-label="Post categories">
            {categories.map(category => (
              <label key={category} className="filter-option">
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={activeFilters.category === category}
                  onChange={() => handleCategoryChange(category)}
                  aria-describedby={`category-${category.replace(/\s+/g, '-').toLowerCase()}-desc`}
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
          <div className="filter-options tags-grid" role="radiogroup" aria-label="Post tags">
            {displayTags.map(({ tag, count }) => (
              <label key={tag} className="filter-option tag-option">
                <input
                  type="radio"
                  name="tag"
                  value={tag}
                  checked={activeFilters.tag === tag}
                  onChange={() => handleTagChange(tag)}
                  aria-describedby={`tag-${tag.replace(/\s+/g, '-').toLowerCase()}-desc`}
                />
                <span className="radio-mark"></span>
                <span className="tag-name">{tag}</span>
                <span className="tag-count" aria-label={`${count} posts`}>({count})</span>
              </label>
            ))}
          </div>
          
          {tags.length > 8 && (
            <button
              onClick={() => setShowAllTags(!showAllTags)}
              className="show-more-tags-btn"
              aria-expanded={showAllTags}
              aria-controls="tags-grid"
            >
              {showAllTags ? 'Show Less' : `Show All ${tags.length} Tags`}
            </button>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="active-filters" role="status" aria-live="polite">
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
                {activeFilters.tag}
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
    </aside>
  );
};

export default BlogFilters;
