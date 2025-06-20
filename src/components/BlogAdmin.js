// BlogAdmin.js - Enhanced CMS interface with markdown editor and analytics
import React, { useState, useEffect } from 'react';
import MarkdownEditor from './MarkdownEditor';
import BlogAnalytics from './BlogAnalytics';
import './BlogAdmin.css';

const BlogAdmin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categories: [],
    tags: [],
    featured: false,
    author: 'Akeyreu Team'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postsRes, categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/categories'),
        fetch('/api/tags')
      ]);

      const postsData = await postsRes.json();
      const categoriesData = await categoriesRes.json();
      const tagsData = await tagsRes.json();

      setPosts(postsData);
      setCategories(categoriesData.categories || []);
      setTags(tagsData.tags || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleTagChange = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      categories: [],
      tags: [],
      featured: false,
      author: 'Akeyreu Team'
    });
    setEditingPost(null);
    setShowAddForm(false);
  };

  const handleEdit = (post) => {
    setFormData({
      title: post.title,
      content: post.content,
      categories: post.categories || [],
      tags: post.tags || [],
      featured: post.featured || false,
      author: post.author || 'Akeyreu Team'
    });
    setEditingPost(post);
    setShowAddForm(true);
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const estimateReadTime = (content) => {
    const words = content.split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  const generateSummary = (content, maxLength = 200) => {
    if (!content) return '';
    const plainText = content.replace(/\n/g, ' ').trim();
    if (plainText.length <= maxLength) return plainText;
    const lastSpace = plainText.lastIndexOf(' ', maxLength);
    return plainText.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="blog-admin loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="blog-admin">
      <header className="admin-header">
        <h1>Blog Administration</h1>
        <p>Manage your blog posts, categories, and tags</p>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-nav">
        <button
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`nav-tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          📝 Posts
        </button>
        <button
          className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </nav>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="admin-dashboard">
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Posts</h3>
              <span className="stat-number">{posts.length}</span>
            </div>
            <div className="stat-card">
              <h3>Categories</h3>
              <span className="stat-number">{categories.length}</span>
            </div>
            <div className="stat-card">
              <h3>Tags</h3>
              <span className="stat-number">{tags.length}</span>
            </div>
            <div className="stat-card">
              <h3>Featured</h3>
              <span className="stat-number">{posts.filter(p => p.featured).length}</span>
            </div>
          </div>

          <div className="dashboard-actions">
            <button
              onClick={() => {
                setActiveTab('posts');
                setShowAddForm(true);
              }}
              className="btn btn-primary btn-large"
            >
              ✏️ Create New Post
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className="btn btn-secondary btn-large"
            >
              📈 View Analytics
            </button>
          </div>
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="admin-posts">
          <div className="admin-actions">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-primary"
            >
              {showAddForm ? 'Cancel' : 'Add New Post'}
            </button>
          </div>

      {showAddForm && (
        <div className="post-form-container">
          <h2>{editingPost ? 'Edit Post' : 'Add New Post'}</h2>
          <form className="post-form">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter post title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="author">Author</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Author name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Content *</label>
              <MarkdownEditor
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                placeholder="Write your post content here using Markdown..."
                height="500px"
                showPreview={true}
              />
              <small>
                Use Markdown formatting for rich content.
                <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer">
                  Learn Markdown syntax
                </a>
              </small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categories</label>
                <div className="checkbox-group">
                  {categories.map(category => (
                    <label key={category} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Tags</label>
                <div className="checkbox-group">
                  {tags.slice(0, 10).map(({ tag }) => (
                    <label key={tag} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.tags.includes(tag)}
                        onChange={() => handleTagChange(tag)}
                      />
                      {tag}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                />
                Featured Post
              </label>
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" className="btn btn-primary">
                {editingPost ? 'Update Post' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="posts-list">
        <h2>Existing Posts ({posts.length})</h2>
        <div className="posts-grid">
          {posts.map((post, index) => (
            <div key={post.id || index} className="post-card">
              <div className="post-card-header">
                <h3>{post.title}</h3>
                {post.featured && <span className="featured-badge">Featured</span>}
              </div>
              
              <div className="post-meta">
                <span>By {post.author || 'Unknown'}</span>
                <span>{post.date}</span>
                <span>{post.readTime || estimateReadTime(post.content)} min read</span>
              </div>

              <p className="post-summary">
                {post.summary || generateSummary(post.content)}
              </p>

              <div className="post-taxonomy">
                {post.categories && post.categories.length > 0 && (
                  <div className="categories">
                    {post.categories.map(cat => (
                      <span key={cat} className="category-tag">{cat}</span>
                    ))}
                  </div>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="tags">
                    {post.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag-item">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="post-actions">
                <button 
                  onClick={() => handleEdit(post)}
                  className="btn btn-sm btn-outline"
                >
                  Edit
                </button>
                <button className="btn btn-sm btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="admin-analytics">
          <BlogAnalytics />
        </div>
      )}
    </div>
  );
};

export default BlogAdmin;
