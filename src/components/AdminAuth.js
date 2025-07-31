import React, { useState, useEffect } from 'react';
import BlogAdmin from './BlogAdmin';
import './AdminAuth.css';

const AdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('AdminAuth component loaded. Current state:', {
    isAuthenticated,
    isLoading,
    credentials: { username: credentials.username, password: '***' }
  });

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      // In a real app, you would validate the token with the server
      setIsAuthenticated(true);
    }



    setIsLoading(false);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    console.log('Attempting login with:', credentials.username);

    if (credentials.username === 'admin' && credentials.password === 'akeyreu2024') {
      console.log('Login successful!');
      localStorage.setItem('admin_token', 'dev-token-' + Date.now());
      setIsAuthenticated(true);
      setIsSubmitting(false);
    } else {
      console.log('Login failed - invalid credentials');
      setError('Invalid credentials. Use username: admin, password: akeyreu2024');
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setCredentials({ username: '', password: '' });
  };

  if (isLoading) {
    return (
      <div className="admin-auth-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="admin-authenticated">
        <div className="admin-header-bar">
          <h1>Blog Administration</h1>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
        <BlogAdmin />
      </div>
    );
  }

  return (
    <div className="admin-auth-container">
      <div className="admin-auth-card">
        <div className="auth-header">
          <h1>Admin Login</h1>
          <p>Please enter your credentials to access the blog administration panel</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isSubmitting || !credentials.username || !credentials.password}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-note">
            Please enter your admin credentials to access the blog management interface.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
