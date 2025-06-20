// Security utilities for API endpoints
// File: /api/utils/security.js

import config from './config.js';

// Rate limiting store (in-memory for simplicity, use Redis in production)
const rateLimitStore = new Map();

// Security headers configuration
const SECURITY_HEADERS = {
  // Prevent XSS attacks
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.emailjs.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.emailjs.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()'
  ].join(', ')
};

// Enhanced CORS configuration
const CORS_CONFIG = {
  production: {
    origin: [
      'https://akeyreu.com',
      'https://www.akeyreu.com'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    credentials: false,
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200
  },
  development: {
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001'
    ],
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-Debug-Mode'
    ],
    credentials: false,
    maxAge: 300, // 5 minutes
    optionsSuccessStatus: 200
  }
};

// Rate limiting configuration
const RATE_LIMITS = {
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests, please try again later'
  },
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    message: 'Rate limit exceeded for this endpoint'
  },
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'API rate limit exceeded'
  }
};

// Input validation patterns
const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  name: /^[a-zA-Z\s'-]{2,50}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
};

// Set security headers
export function setSecurityHeaders(res, additionalHeaders = {}) {
  // Set default security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  // Set additional headers
  Object.entries(additionalHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}

// Enhanced CORS handler
export function setCORSHeaders(res, environment = 'production') {
  const corsConfig = CORS_CONFIG[environment] || CORS_CONFIG.production;
  
  res.setHeader('Access-Control-Allow-Origin', corsConfig.origin.join(', '));
  res.setHeader('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
  res.setHeader('Access-Control-Max-Age', corsConfig.maxAge.toString());
  
  if (corsConfig.credentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

// Validate origin against allowed origins
export function validateOrigin(origin, environment = 'production') {
  if (!origin) return false;
  
  const corsConfig = CORS_CONFIG[environment] || CORS_CONFIG.production;
  return corsConfig.origin.includes(origin);
}

// Rate limiting middleware
export function rateLimit(identifier, limitType = 'default') {
  const limit = RATE_LIMITS[limitType] || RATE_LIMITS.default;
  const now = Date.now();
  const windowStart = now - limit.windowMs;
  
  // Get or create rate limit data for this identifier
  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, []);
  }
  
  const requests = rateLimitStore.get(identifier);
  
  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => timestamp > windowStart);
  
  // Check if limit exceeded
  if (validRequests.length >= limit.maxRequests) {
    return {
      allowed: false,
      message: limit.message,
      retryAfter: Math.ceil((validRequests[0] + limit.windowMs - now) / 1000)
    };
  }
  
  // Add current request
  validRequests.push(now);
  rateLimitStore.set(identifier, validRequests);
  
  return {
    allowed: true,
    remaining: limit.maxRequests - validRequests.length,
    resetTime: windowStart + limit.windowMs
  };
}

// Input sanitization
export function sanitizeInput(input, type = 'text') {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Basic HTML entity encoding
  let sanitized = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  // Type-specific sanitization
  switch (type) {
    case 'email':
      sanitized = sanitized.toLowerCase().trim();
      break;
    case 'name':
      sanitized = sanitized.trim().replace(/\s+/g, ' ');
      break;
    case 'slug':
      sanitized = sanitized.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
      break;
    case 'url':
      sanitized = sanitized.trim();
      break;
    default:
      sanitized = sanitized.trim();
  }
  
  return sanitized;
}

// Input validation
export function validateInput(input, type, required = true) {
  // Check if required
  if (required && (!input || input.trim() === '')) {
    return { valid: false, error: `${type} is required` };
  }
  
  // If not required and empty, it's valid
  if (!required && (!input || input.trim() === '')) {
    return { valid: true, value: '' };
  }
  
  const sanitized = sanitizeInput(input, type);
  
  // Length validation
  const lengthLimits = {
    email: { min: 5, max: 254 },
    name: { min: 2, max: 50 },
    subject: { min: 5, max: 100 },
    message: { min: 10, max: 1000 },
    slug: { min: 1, max: 100 },
    url: { min: 10, max: 2048 }
  };
  
  const limits = lengthLimits[type];
  if (limits) {
    if (sanitized.length < limits.min) {
      return { valid: false, error: `${type} must be at least ${limits.min} characters` };
    }
    if (sanitized.length > limits.max) {
      return { valid: false, error: `${type} must not exceed ${limits.max} characters` };
    }
  }
  
  // Pattern validation
  const pattern = VALIDATION_PATTERNS[type];
  if (pattern && !pattern.test(sanitized)) {
    return { valid: false, error: `Invalid ${type} format` };
  }
  
  return { valid: true, value: sanitized };
}

// Security middleware for API endpoints
export function securityMiddleware(req, res, options = {}) {
  const {
    rateLimit: rateLimitType = 'default',
    requireOrigin = true,
    allowedMethods = ['GET'],
    environment = process.env.NODE_ENV || 'development'
  } = options;
  
  // Set security headers
  setSecurityHeaders(res);
  
  // Set CORS headers
  setCORSHeaders(res, environment);
  
  // Validate origin in production
  if (requireOrigin && environment === 'production') {
    const origin = req.headers.origin;
    if (!validateOrigin(origin, environment)) {
      return { error: 'Invalid origin', status: 403 };
    }
  }
  
  // Check allowed methods
  if (!allowedMethods.includes(req.method)) {
    return { error: 'Method not allowed', status: 405 };
  }
  
  // Rate limiting
  const clientId = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const rateLimitResult = rateLimit(clientId, rateLimitType);
  
  if (!rateLimitResult.allowed) {
    res.setHeader('Retry-After', rateLimitResult.retryAfter);
    return { error: rateLimitResult.message, status: 429 };
  }
  
  // Set rate limit headers
  res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
  res.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
  
  return { success: true };
}

export default {
  setSecurityHeaders,
  setCORSHeaders,
  validateOrigin,
  rateLimit,
  sanitizeInput,
  validateInput,
  securityMiddleware,
  VALIDATION_PATTERNS,
  RATE_LIMITS,
  CORS_CONFIG
};
