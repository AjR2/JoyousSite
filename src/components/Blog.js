// Enhanced Blog.js with search, filters, and improved functionality
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import slugify from 'slugify';
import './Blog.css';
import MetaTags from './MetaTags';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import BlogSearchAndFilters from './BlogSearchAndFilters';

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    featured: searchParams.get('featured') === 'true' ? true : undefined
  });

  // Fetch all posts on component mount
  useEffect(() => {
    fetch('/api/posts')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        setAllPosts(data);
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching posts:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Search and filter posts
  const searchAndFilterPosts = useCallback(async (query = '', filterOptions = {}) => {
    setSearchLoading(true);

    try {
      // Build search URL with parameters
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (filterOptions.category) params.append('category', filterOptions.category);
      if (filterOptions.tag) params.append('tag', filterOptions.tag);
      if (filterOptions.featured !== undefined) params.append('featured', filterOptions.featured.toString());

      let url = '/api/posts';
      if (params.toString()) {
        url = `/api/search?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Handle different response formats
      if (data.results) {
        setPosts(data.results);
      } else if (Array.isArray(data)) {
        setPosts(data);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error('Error searching posts:', err);
      setError(err.message);
      setPosts([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    const newParams = new URLSearchParams(searchParams);

    if (query) {
      newParams.set('q', query);
    } else {
      newParams.delete('q');
    }

    setSearchParams(newParams);
    searchAndFilterPosts(query, filters);
  }, [searchParams, setSearchParams, filters, searchAndFilterPosts]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    const newParams = new URLSearchParams(searchParams);

    // Update URL parameters
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] && newFilters[key] !== '') {
        newParams.set(key, newFilters[key].toString());
      } else {
        newParams.delete(key);
      }
    });

    setSearchParams(newParams);
    searchAndFilterPosts(searchQuery, newFilters);
  }, [searchParams, setSearchParams, searchQuery, searchAndFilterPosts]);

  // Apply initial search/filters from URL
  useEffect(() => {
    if (searchQuery || Object.values(filters).some(v => v !== '' && v !== undefined)) {
      searchAndFilterPosts(searchQuery, filters);
    }
  }, [allPosts]); // Only run when allPosts is loaded

  // Function to create a proper slug
  const createSlug = (title) => {
    return slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  };

  // Function to create a truncated summary
  const createSummary = (content, maxLength = 175) => {
    if (!content) return '';

    const plainText = content.replace(/<[^>]+>/g, ' ').trim();
    if (plainText.length <= maxLength) return plainText;

    return plainText.slice(0, maxLength).trim() + '...';
  };

  // Check if we have active search/filters
  const hasActiveSearch = searchQuery || Object.values(filters).some(v => v !== '' && v !== undefined);
  const resultCount = posts.length;

  return (
    <>
      <MetaTags
        title="Akeyreu: Blog"
        description="Explore mental wellness insights, personal development tips, and neural technology updates. Discover articles on mindfulness, relationships, self-care, and more."
        keywords="mental wellness, neural technology, sleep analysis, cognitive wellness, AI wellness, nAura, Vza, blog, mindfulness, personal development, self-care"
        canonicalUrl="https://www.akeyreu.com/blog/"
      />

      <ErrorBoundary>
        <main className="blog-center-container" id="main-content" role="main">
          <header className="blog-header">
            <h1 className="blog-title">Blog Posts</h1>
            <p className="blog-description">
              Mental wellness insights and neural technology updates from Akeyreu
            </p>
          </header>

          <div className="blog-layout">
            {/* Left Sidebar - Search and Filters */}
            <aside className="blog-sidebar" role="complementary" aria-label="Search and filter options">
              <BlogSearchAndFilters
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                searchQuery={searchQuery}
                activeFilters={filters}
                isLoading={searchLoading}
              />
            </aside>

            {/* Main Content Area */}
            <div className="blog-main-content">
              {/* Results Summary */}
              {hasActiveSearch && !loading && (
                <div className="search-results-summary" role="status" aria-live="polite">
                  <p>
                    {searchLoading ? 'Searching...' : `Found ${resultCount} post${resultCount !== 1 ? 's' : ''}`}
                    {searchQuery && ` for "${searchQuery}"`}
                    {filters.category && ` in category "${filters.category}"`}
                    {filters.tag && ` with tag "${filters.tag}"`}
                    {filters.featured && ` (featured only)`}
                  </p>
                </div>
              )}

              {loading && (
                <div className="loading-container" role="status" aria-live="polite">
                  <LoadingSpinner />
                  <span className="sr-only">Loading blog posts...</span>
                </div>
              )}

              {error && (
                <div className="error-message" role="alert" aria-live="assertive">
                  <h2>Error Loading Blog Posts</h2>
                  <p>Error: {error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="retry-button"
                    aria-label="Retry loading blog posts"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !error && posts.length === 0 && (
                <div className="no-posts-message" role="status">
                  <p>No blog posts found. Check back soon for new content!</p>
                </div>
              )}

              <section className="blog-posts-section" aria-labelledby="blog-title">
                <h2 className="sr-only">List of blog posts</h2>
                <div className="blog-post-preview-list" role="list">
              {posts.map((post, index) => {
                const slug = post.id || createSlug(post.title);

                return (
                  <article
                    key={post.id || index}
                    className={`blog-post-preview ${post.featured ? 'featured' : ''}`}
                    role="listitem"
                  >
                    <Link
                      to={`/blog/${slug}`}
                      className="blog-post-link"
                      aria-describedby={`post-summary-${index}`}
                    >
                      <header className="post-header">
                        {post.featured && (
                          <span className="featured-badge" aria-label="Featured post">
                            ⭐ Featured
                          </span>
                        )}
                        <h3 className="blog-post-title">{post.title}</h3>
                        <div className="post-meta">
                          <time
                            className="blog-date"
                            dateTime={post.date ? new Date(post.date).toISOString().split('T')[0] : ''}
                            aria-label={`Published on ${post.date || 'unknown date'}`}
                          >
                            {post.date || 'No date available'}
                          </time>
                          {post.author && (
                            <span className="post-author" aria-label={`By ${post.author}`}>
                              by {post.author}
                            </span>
                          )}
                          {post.readTime && (
                            <span className="read-time" aria-label={`${post.readTime} minute read`}>
                              {post.readTime} min read
                            </span>
                          )}
                        </div>
                      </header>

                      <p
                        className="blog-snippet"
                        id={`post-summary-${index}`}
                        aria-label="Post summary"
                      >
                        {post.summary || createSummary(post.content)}
                      </p>

                      {/* Categories and Tags */}
                      <div className="post-taxonomy">
                        {post.categories && post.categories.length > 0 && (
                          <div className="post-categories">
                            {post.categories.slice(0, 2).map(category => (
                              <span key={category} className="category-tag">
                                {category}
                              </span>
                            ))}
                          </div>
                        )}
                        {post.tags && post.tags.length > 0 && (
                          <div className="post-tags">
                            {post.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="tag-item">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className="sr-only">Read full article: {post.title}</span>
                    </Link>
                    </article>
                  );
                })}
                </div>
              </section>
            </div>
          </div>
        </main>
      </ErrorBoundary>
    </>
  );
};

export default Blog;
