import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import slugify from 'slugify';
import './BlogPost.css';
import MetaTags from './MetaTags';
import SchemaMarkup from './SchemaMarkup';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import SocialShare from './SocialShare';
import RelatedPosts from './RelatedPosts';

const BlogPost = () => {
  console.log('🚀 BlogPost component is rendering');
  const { slug } = useParams();
  console.log('🚀 BlogPost slug:', slug);
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Early exit for invalid slugs
  useEffect(() => {
    if (!slug || slug === 'undefined') {
      setError('Invalid blog post slug.');
      setLoading(false);
      return;
    }

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
        console.log('🚀 BlogPost fetched data:', data);
        setPost(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching post:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

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

  // Helper function to safely get string values
  const safeString = (value) => {
    console.log('🔍 safeString called with:', { value, type: typeof value, isSymbol: typeof value === 'symbol' });
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'symbol') {
      console.warn('⚠️ Symbol value detected and converted to empty string:', value);
      return '';
    }
    return String(value);
  };

  // Debug the post object
  console.log('🐛 BlogPost Debug - Full post object:', post);
  console.log('🐛 BlogPost Debug - Post keys and types:', Object.keys(post || {}).map(key => ({
    key,
    value: post[key],
    type: typeof post[key],
    isSymbol: typeof post[key] === 'symbol'
  })));

  const safeTitle = safeString(post.title) || 'Untitled Post';
  const safeSummary = safeString(post.summary);
  const safeContent = safeString(post.content);
  const safeDate = safeString(post.date);

  console.log('🐛 BlogPost Debug - Safe values:', {
    safeTitle,
    safeSummary: safeSummary.substring(0, 50) + '...',
    safeContent: safeContent.substring(0, 50) + '...',
    safeDate
  });

  const canonicalSlug = post.url
    ? post.url.split('/').pop()
    : slugify(safeTitle, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
  const canonicalUrl = `https://www.akeyreu.com/blog/${canonicalSlug}`;

  // Create safe description
  const safeDescription = safeSummary || (safeContent ? safeContent.slice(0, 175).trim() : 'Read this blog post on Akeyreu');

  return (
    <>
      <MetaTags
        title={`${safeTitle} | Akeyreu Blog`}
        description={safeDescription}
        canonicalUrl={canonicalUrl}
        ogType="article"
        publishDate={safeDate || null}
      />

      <SchemaMarkup
        type="article"
        data={{
          name: safeTitle,
          description: safeDescription,
          datePublished: safeDate,
          url: canonicalUrl
        }}
      />

      <ErrorBoundary>
        <article className="blog-content">
          <header className="blog-post-header">
            <button onClick={handleBackClick} className="back-button">
              ← Back to Blog
            </button>

            <h1 className="blog-post-title">{safeTitle}</h1>

            <div className="blog-post-meta">
              <time className="blog-post-date" dateTime={safeDate}>
                {safeDate || 'No date available'}
              </time>
              {post.author && (
                <span className="blog-post-author">by {safeString(post.author)}</span>
              )}
              {post.readTime && (
                <span className="blog-post-read-time">{safeString(post.readTime)} min read</span>
              )}
            </div>

            {/* Categories and Tags */}
            {(post.categories?.length > 0 || post.tags?.length > 0) && (
              <div className="blog-post-taxonomy">
                {post.categories?.length > 0 && (
                  <div className="blog-post-categories">
                    <span className="taxonomy-label">Categories:</span>
                    {post.categories.map(category => (
                      <span key={category} className="category-tag">
                        {category}
                      </span>
                    ))}
                  </div>
                )}
                {post.tags?.length > 0 && (
                  <div className="blog-post-tags">
                    <span className="taxonomy-label">Tags:</span>
                    {post.tags.map(tag => (
                      <span key={tag} className="tag-item">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </header>

          <div className="blog-post-content">
            {safeContent ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  h1: ({children, ...props}) => <h2 className="content-h1" {...props}>{children}</h2>,
                  h2: ({children, ...props}) => <h3 className="content-h2" {...props}>{children}</h3>,
                  h3: ({children, ...props}) => <h4 className="content-h3" {...props}>{children}</h4>,
                  p: ({children, ...props}) => <p className="content-p" {...props}>{children}</p>,
                  blockquote: ({children, ...props}) => <blockquote className="content-quote" {...props}>{children}</blockquote>,
                  code: ({inline, children, ...props}) =>
                    inline ?
                      <code className="content-code-inline" {...props}>{String(children)}</code> :
                      <code className="content-code-block" {...props}>{String(children)}</code>,
                  pre: ({children, ...props}) => <pre className="content-pre" {...props}>{children}</pre>,
                  ul: ({children, ...props}) => <ul className="content-ul" {...props}>{children}</ul>,
                  ol: ({children, ...props}) => <ol className="content-ol" {...props}>{children}</ol>,
                  li: ({children, ...props}) => <li className="content-li" {...props}>{children}</li>,
                  a: ({href, children, ...props}) => (
                    <a href={href} className="content-link" target="_blank" rel="noopener noreferrer" {...props}>
                      {children}
                    </a>
                  ),
                  img: ({src, alt, ...props}) => (
                    <img src={src} alt={alt} className="content-img" loading="lazy" {...props} />
                  )
                }}
              >
                {safeContent}
              </ReactMarkdown>
            ) : (
              <p className="no-content">No content available for this post.</p>
            )}
          </div>

          {/* Social Sharing */}
          <SocialShare
            url={typeof window !== 'undefined' ? window.location.href : canonicalUrl}
            title={safeTitle}
            description={safeDescription}
            hashtags={Array.isArray(post.tags) ? post.tags.map(tag => safeString(tag)) : []}
          />

          {/* Related Posts */}
          <RelatedPosts currentPost={post} maxPosts={3} />

          <footer className="blog-post-footer">
            <button onClick={handleBackClick} className="back-button">
              ← Back to Blog
            </button>
          </footer>
        </article>
      </ErrorBoundary>
    </>
  );
};

export default BlogPost;
