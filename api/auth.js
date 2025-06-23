// Simple authentication API for admin access
// File: /api/auth.js

import { securityMiddleware } from './utils/security.js';
import config from './utils/config.js';

// Admin credentials from environment variables
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD
};

export default async function handler(req, res) {
  // Apply security middleware (includes CORS headers and OPTIONS handling)
  const securityResult = securityMiddleware(req, res, {
    allowedMethods: ['POST', 'OPTIONS'],
    requireOrigin: process.env.NODE_ENV === 'production',
    environment: config.environment
  });

  if (securityResult && securityResult.error) {
    return res.status(securityResult.status).json({
      error: securityResult.error,
      timestamp: new Date().toISOString()
    });
  }

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }
  
  if (securityResult && securityResult.error) {
    return res.status(securityResult.status).json({ 
      error: securityResult.error,
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Check if admin credentials are configured
    if (!ADMIN_CREDENTIALS.username || !ADMIN_CREDENTIALS.password) {
      return res.status(500).json({
        error: 'Admin credentials not configured. Please set ADMIN_USERNAME and ADMIN_PASSWORD environment variables.',
        timestamp: new Date().toISOString()
      });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required',
        timestamp: new Date().toISOString()
      });
    }

    // Check credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // In production, you would generate a proper JWT token here
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      return res.status(200).json({
        success: true,
        token,
        message: 'Authentication successful',
        timestamp: new Date().toISOString()
      });
    } else {
      // Add delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return res.status(401).json({
        error: 'Invalid credentials',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error in /api/auth:', error);
    return res.status(500).json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}
