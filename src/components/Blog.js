import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Blog.css';
import MetaTags from './MetaTags';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/posts') // need to update with real
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch posts');
        return res.json();
      })
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <MetaTags
        title="Akeyreu: Blog"
        description="Akeyreu integrates advanced neural technologies with mental wellness practices, making technology-enhanced wellness accessible to everyone through nAura and Vza."
        keywords="mental wellness, neural technology, sleep analysis, cognitive wellness, AI wellness, nAura, Vza, blog"
        canonicalUrl="https://www.akeyreu.com/blog/"
      />
      
      <div className="blog-center-container">
        <h2 className="blog-title">Blog Posts</h2>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        <div className="blog-post-preview-list">
          {posts.map((post, index) => (
            <Link to={`/blog/${post.title.toLowerCase().replace(/\s+/g, '-')}`} key={index} className="blog-post-preview">
              <h3>{post.title}</h3>
              <p className="blog-date">{post.date || 'No date available'}</p>
              <p className="blog-snippet">
                {(post.content || post.summary || '')
                  .slice(0, 175)
                  .trim()}
                ...
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;