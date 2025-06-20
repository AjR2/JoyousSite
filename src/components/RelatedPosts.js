// RelatedPosts.js - Component to show related blog posts
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './RelatedPosts.css';

const RelatedPosts = ({ currentPost, maxPosts = 3 }) => {
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentPost) return;
    
    findRelatedPosts(currentPost, maxPosts)
      .then(posts => {
        setRelatedPosts(posts);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error finding related posts:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [currentPost, maxPosts]);

  const findRelatedPosts = async (post, limit) => {
    try {
      // Fetch all posts
      const response = await fetch('/api/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const allPosts = await response.json();
      
      // Filter out the current post
      const otherPosts = allPosts.filter(p => p.id !== post.id);
      
      // Calculate similarity scores
      const scoredPosts = otherPosts.map(otherPost => ({
        ...otherPost,
        similarity: calculateSimilarity(post, otherPost)
      }));
      
      // Sort by similarity score (highest first) and take the top results
      return scoredPosts
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
        
    } catch (error) {
      throw new Error('Failed to find related posts');
    }
  };

  const calculateSimilarity = (post1, post2) => {
    let score = 0;
    
    // Category similarity (highest weight)
    if (post1.categories && post2.categories) {
      const commonCategories = post1.categories.filter(cat => 
        post2.categories.includes(cat)
      );
      score += commonCategories.length * 3;
    }
    
    // Tag similarity (medium weight)
    if (post1.tags && post2.tags) {
      const commonTags = post1.tags.filter(tag => 
        post2.tags.includes(tag)
      );
      score += commonTags.length * 2;
    }
    
    // Title similarity (low weight)
    if (post1.title && post2.title) {
      const titleWords1 = post1.title.toLowerCase().split(/\s+/);
      const titleWords2 = post2.title.toLowerCase().split(/\s+/);
      const commonWords = titleWords1.filter(word => 
        word.length > 3 && titleWords2.includes(word)
      );
      score += commonWords.length * 1;
    }
    
    // Content similarity (very low weight, basic keyword matching)
    if (post1.summary && post2.summary) {
      const words1 = post1.summary.toLowerCase().split(/\s+/);
      const words2 = post2.summary.toLowerCase().split(/\s+/);
      const commonWords = words1.filter(word => 
        word.length > 4 && words2.includes(word)
      );
      score += commonWords.length * 0.5;
    }
    
    // Featured post bonus
    if (post2.featured) {
      score += 1;
    }
    
    // Recency bonus (newer posts get slight preference)
    const daysDiff = Math.abs(new Date(post1.date) - new Date(post2.date)) / (1000 * 60 * 60 * 24);
    if (daysDiff < 30) {
      score += 0.5;
    }
    
    return score;
  };

  if (loading) {
    return (
      <div className="related-posts loading">
        <h3>Related Posts</h3>
        <div className="related-posts-skeleton">
          {[...Array(maxPosts)].map((_, index) => (
            <div key={index} className="skeleton-post">
              <div className="skeleton-title"></div>
              <div className="skeleton-meta"></div>
              <div className="skeleton-summary"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || relatedPosts.length === 0) {
    return null; // Don't show anything if there are no related posts
  }

  return (
    <section className="related-posts" aria-labelledby="related-posts-heading">
      <h3 id="related-posts-heading">Related Posts</h3>
      <div className="related-posts-grid">
        {relatedPosts.map((post, index) => (
          <article key={post.id} className="related-post-card">
            <Link
              to={`/blog/${post.id}`}
              className="related-post-link"
              aria-describedby={`related-post-summary-${index}`}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <header className="related-post-header">
                {post.featured && (
                  <span className="featured-badge" aria-label="Featured post">
                    ⭐
                  </span>
                )}
                <h4 className="related-post-title">{post.title}</h4>
                <div className="related-post-meta">
                  <time 
                    className="related-post-date"
                    dateTime={post.date}
                  >
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </time>
                  {post.readTime && (
                    <span className="related-post-read-time">
                      {post.readTime} min read
                    </span>
                  )}
                </div>
              </header>
              
              <p 
                className="related-post-summary"
                id={`related-post-summary-${index}`}
              >
                {post.summary || 'Read more about this topic...'}
              </p>
              
              {/* Show similarity indicators */}
              <div className="similarity-indicators">
                {post.categories && currentPost.categories && (
                  <>
                    {post.categories.filter(cat => 
                      currentPost.categories.includes(cat)
                    ).map(category => (
                      <span key={category} className="similarity-tag category">
                        {category}
                      </span>
                    ))}
                  </>
                )}
                {post.tags && currentPost.tags && (
                  <>
                    {post.tags.filter(tag => 
                      currentPost.tags.includes(tag)
                    ).slice(0, 2).map(tag => (
                      <span key={tag} className="similarity-tag tag">
                        #{tag}
                      </span>
                    ))}
                  </>
                )}
              </div>
              
              <div className="related-post-cta">
                <span className="read-more-text">Read more →</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
      
      <div className="related-posts-footer">
        <Link
          to="/blog"
          className="view-all-posts"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          View all posts →
        </Link>
      </div>
    </section>
  );
};

export default RelatedPosts;
