// BlogAnalytics.js - Simple analytics dashboard for blog
import React, { useState, useEffect } from 'react';
import './BlogAnalytics.css';

const BlogAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalPosts: 0,
    totalCategories: 0,
    totalTags: 0,
    featuredPosts: 0,
    averageReadTime: 0,
    postsPerCategory: {},
    postsPerTag: {},
    recentPosts: [],
    popularCategories: [],
    popularTags: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data
      const [postsRes, categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/categories'),
        fetch('/api/tags')
      ]);

      if (!postsRes.ok || !categoriesRes.ok || !tagsRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const posts = await postsRes.json();
      const categoriesData = await categoriesRes.json();
      const tagsData = await tagsRes.json();

      // Calculate analytics
      const calculatedAnalytics = calculateAnalytics(posts, categoriesData, tagsData);
      setAnalytics(calculatedAnalytics);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const calculateAnalytics = (posts, categoriesData, tagsData) => {
    const totalPosts = posts.length;
    const featuredPosts = posts.filter(post => post.featured).length;
    const averageReadTime = Math.round(
      posts.reduce((sum, post) => sum + (post.readTime || 0), 0) / totalPosts
    );

    // Posts per category
    const postsPerCategory = {};
    posts.forEach(post => {
      if (post.categories) {
        post.categories.forEach(category => {
          postsPerCategory[category] = (postsPerCategory[category] || 0) + 1;
        });
      }
    });

    // Posts per tag
    const postsPerTag = {};
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => {
          postsPerTag[tag] = (postsPerTag[tag] || 0) + 1;
        });
      }
    });

    // Recent posts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPosts = posts.filter(post => 
      new Date(post.date) > thirtyDaysAgo
    ).length;

    // Popular categories (top 5)
    const popularCategories = Object.entries(postsPerCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    // Popular tags (top 10)
    const popularTags = Object.entries(postsPerTag)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return {
      totalPosts,
      totalCategories: categoriesData.categories?.length || 0,
      totalTags: tagsData.tags?.length || 0,
      featuredPosts,
      averageReadTime,
      recentPosts,
      postsPerCategory,
      postsPerTag,
      popularCategories,
      popularTags
    };
  };

  const StatCard = ({ title, value, subtitle, icon, color = '#3b82f6' }) => (
    <div className="stat-card" style={{ '--stat-color': color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );

  const ProgressBar = ({ label, value, max, color = '#3b82f6' }) => {
    const percentage = Math.round((value / max) * 100);
    return (
      <div className="progress-item">
        <div className="progress-header">
          <span className="progress-label">{label}</span>
          <span className="progress-value">{value}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${percentage}%`,
              backgroundColor: color 
            }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="blog-analytics loading">
        <h2>Blog Analytics</h2>
        <div className="analytics-skeleton">
          <div className="skeleton-cards">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-analytics error">
        <h2>Blog Analytics</h2>
        <div className="error-message">
          <p>Failed to load analytics: {error}</p>
          <button onClick={fetchAnalytics} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-analytics">
      <header className="analytics-header">
        <h2>Blog Analytics Dashboard</h2>
        <p>Overview of your blog's content and performance</p>
      </header>

      {/* Key Metrics */}
      <section className="key-metrics">
        <StatCard
          title="Total Posts"
          value={analytics.totalPosts}
          icon="📝"
          color="#3b82f6"
        />
        <StatCard
          title="Categories"
          value={analytics.totalCategories}
          icon="📂"
          color="#10b981"
        />
        <StatCard
          title="Tags"
          value={analytics.totalTags}
          icon="🏷️"
          color="#f59e0b"
        />
        <StatCard
          title="Featured Posts"
          value={analytics.featuredPosts}
          subtitle={`${Math.round((analytics.featuredPosts / analytics.totalPosts) * 100)}% of total`}
          icon="⭐"
          color="#ef4444"
        />
        <StatCard
          title="Avg. Read Time"
          value={`${analytics.averageReadTime} min`}
          icon="⏱️"
          color="#8b5cf6"
        />
        <StatCard
          title="Recent Posts"
          value={analytics.recentPosts}
          subtitle="Last 30 days"
          icon="🆕"
          color="#06b6d4"
        />
      </section>

      {/* Content Distribution */}
      <section className="content-distribution">
        <div className="distribution-section">
          <h3>Popular Categories</h3>
          <div className="progress-list">
            {analytics.popularCategories.map(({ category, count }) => (
              <ProgressBar
                key={category}
                label={category}
                value={count}
                max={analytics.totalPosts}
                color="#3b82f6"
              />
            ))}
          </div>
        </div>

        <div className="distribution-section">
          <h3>Top Tags</h3>
          <div className="progress-list">
            {analytics.popularTags.slice(0, 8).map(({ tag, count }) => (
              <ProgressBar
                key={tag}
                label={tag}
                value={count}
                max={analytics.totalPosts}
                color="#10b981"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Content Health */}
      <section className="content-health">
        <h3>Content Health</h3>
        <div className="health-metrics">
          <div className="health-item">
            <span className="health-label">Posts with Categories</span>
            <span className="health-value">
              {Math.round((Object.values(analytics.postsPerCategory).reduce((a, b) => a + b, 0) / analytics.totalPosts) * 100)}%
            </span>
          </div>
          <div className="health-item">
            <span className="health-label">Posts with Tags</span>
            <span className="health-value">
              {Math.round((Object.values(analytics.postsPerTag).reduce((a, b) => a + b, 0) / analytics.totalPosts) * 100)}%
            </span>
          </div>
          <div className="health-item">
            <span className="health-label">Featured Content</span>
            <span className="health-value">
              {Math.round((analytics.featuredPosts / analytics.totalPosts) * 100)}%
            </span>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="analytics-actions">
        <button onClick={fetchAnalytics} className="refresh-button">
          🔄 Refresh Data
        </button>
        <button 
          onClick={() => window.open('/blog', '_blank')} 
          className="view-blog-button"
        >
          👁️ View Blog
        </button>
      </section>
    </div>
  );
};

export default BlogAnalytics;
