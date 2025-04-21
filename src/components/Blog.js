// Updated Blog.js to use ErrorBoundary and proper component organization
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import slugify from 'slugify';
import './Blog.css';
import MetaTags from './MetaTags';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Use the API endpoint instead of static JSON file
    fetch('/api/posts')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching posts:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

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

    const plainText = content.replace(/<>/g, ' ').trim();
    if (plainText.length <= maxLength) return plainText;

    return plainText.slice(0, maxLength).trim() + '...';
  };

  return (
    <>
      <MetaTags
        title="Akeyreu: Blog"
        description="Akeyreu integrates advanced neural technologies with mental wellness practices, making technology-enhanced wellness accessible to everyone through nAura and Vza."
        keywords="mental wellness, neural technology, sleep analysis, cognitive wellness, AI wellness, nAura, Vza, blog"
        canonicalUrl="https://www.akeyreu.com/blog/"
      />

      <ErrorBoundary>
        <div className="blog-center-container">
          <h2 className="blog-title">Blog Posts</h2>

          {loading && <LoadingSpinner />}

          {error && (
            <div className="error-message" role="alert">
              <p>Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="retry-button"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="no-posts-message">
              <p>No blog posts found. Check back soon for new content!</p>
            </div>
          )}

          <div className="blog-post-preview-list">
            {posts.map((post, index) => {
              const slug = createSlug(post.title);

              return (
                <Link
                  to={`/blog/${slug}`}
                  key={index}
                  className="blog-post-preview"
                  aria-label={`Read blog post: ${post.title}`}
                >
                  <h3>{post.title}</h3>
                  <p className="blog-date">{post.date || 'No date available'}</p>
                  <p className="blog-snippet">
                    {post.summary || createSummary(post.content)}
                  </p>
                  {post.key_points && post.key_points.length > 0 && (
                    <div className="key-points">
                      <span className="key-points-label">Key points:</span>
                      <ul>
                        {post.key_points.slice(0, 2).map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                        {post.key_points.length > 2 && <li>...</li>}
                      </ul>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </ErrorBoundary>
    </>
  );
};

export default Blog;
