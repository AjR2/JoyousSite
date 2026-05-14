import React, { useState, useEffect } from 'react';
import BlogAdmin from './BlogAdmin';
import EnactiveAgents from './EnactiveAgents';
import './AdminAuth.css';

const ADMIN_TABS = [
  { id: 'agents', label: 'Agent Ops' },
  { id: 'blog',   label: 'Blog' },
];

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('agents');

  return (
    <div className="admin-authenticated">
      <div className="admin-header-bar">
        <div className="admin-tab-bar">
          {ADMIN_TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin-tab-btn${activeTab === tab.id ? ' admin-tab-btn--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>

      {activeTab === 'agents' && <EnactiveAgents />}
      {activeTab === 'blog'   && <BlogAdmin />}
    </div>
  );
}

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    console.log('Attempting login with:', credentials.username);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Login successful!');
        localStorage.setItem('admin_token', data.token);
        setIsAuthenticated(true);
      } else {
        console.log('Login failed - invalid credentials');
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
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
    return <AdminDashboard onLogout={handleLogout} />;
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
