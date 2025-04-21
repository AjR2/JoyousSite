// Updated BlogPost.js to use ErrorBoundary and proper component organization
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import slugify from 'slugify';
import './BlogPost.css';
import MetaTags from './MetaTags';
import SchemaMarkup from './SchemaMarkup';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Use the API endpoint instead of static JSON file
    fetch(`/api/posts/${slug}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Post not found');
          }
          throw new Error(`Failed to fetch post: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching post:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  // Handle back to blog list
  const handleBackClick = () => {
    navigate('/blog');
  };

  if (loading) {
    return (
      <div className="blog-content loading-container">
        <LoadingSpinner />
        <p>Loading post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-content error-container" role="alert">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleBackClick} className="back-button">
          Back to Blog
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="blog-content not-found-container">
        <h2>Post Not Found</h2>
        <p>The blog post you're looking for doesn't exist or has been moved.</p>
        <button onClick={handleBackClick} className="back-button">
          Back to Blog
        </button>
      </div>
    );
  }

  // Generate canonical URL
  const canonicalSlug = post.url ? post.url.split('/').pop() :
    slugify(post.title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
  const canonicalUrl = `https://www.akeyreu.com/blog/${canonicalSlug}`;

  return (
    <>
      <MetaTags
        title={`${post.title} | Akeyreu Blog`}
        description={post.summary || (post.content && post.content.slice(0, 175).trim())}
        canonicalUrl={canonicalUrl}
        ogType="article"
        publishDate={post.date}
      />

      <SchemaMarkup
        type="article"
        data={{
          name: post.title,
          description: post.summary,
          datePublished: post.date,
          url: canonicalUrl
        }}
      />

      <ErrorBoundary>
        <div className="blog-content">
          {/* <button onClick={handleBackClick} className="back-button" aria-label="Back to blog list">
            &larr; Back to Blog
          </button> */}

          <h1>{post.title}</h1>
          <h5>{post.date || 'No date available'}</h5>

          {/* {post.key_points && post.key_points.length > 0 && (
            <div className="key-points-section">
              <h3>Key Points</h3>
              <ul>
                {post.key_points.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          )} */}

          {post.content && post.content.split('<>').map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}

          {/* <div className="post-footer">
            <button onClick={handleBackClick} className="back-button" aria-label="Back to blog list">
              &larr; Back to Blog
            </button>
          </div> */}
        </div>
      </ErrorBoundary>
    </>
  );
};

export default BlogPost;
