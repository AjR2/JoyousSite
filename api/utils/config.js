// Enhanced Configuration utility for API with security
// File: /api/utils/config.js

// Helper function to parse environment arrays
function parseEnvArray(envVar, defaultValue = []) {
    if (!envVar) return defaultValue;
    return envVar.split(',').map(item => item.trim()).filter(Boolean);
}

// Helper function to get boolean from environment
function parseEnvBoolean(envVar, defaultValue = false) {
    if (!envVar) return defaultValue;
    return envVar.toLowerCase() === 'true';
}

// Environment configuration with security enhancements
const config = {
    // Environment detection
    environment: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',

    // Base URL for the site
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
        process.env.NODE_ENV === 'production' ? 'https://akeyreu.com' :
        'http://localhost:3000',

    // API base URL
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api` :
        process.env.NODE_ENV === 'production' ? 'https://akeyreu.com/api' :
        'http://localhost:3000/api',

    // Enhanced CORS settings with environment variables
    cors: {
        origin: parseEnvArray(
            process.env.CORS_ORIGINS,
            process.env.NODE_ENV === 'production'
                ? ['https://akeyreu.com', 'https://www.akeyreu.com']
                : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001']
        ),
        methods: parseEnvArray(
            process.env.CORS_METHODS,
            process.env.NODE_ENV === 'production'
                ? ['GET', 'POST', 'OPTIONS']
                : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        ),
        allowedHeaders: parseEnvArray(
            process.env.CORS_HEADERS,
            ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
        ),
        credentials: parseEnvBoolean(process.env.CORS_CREDENTIALS, false),
        maxAge: parseInt(process.env.CORS_MAX_AGE) || (process.env.NODE_ENV === 'production' ? 86400 : 300)
    },

    // Security settings
    security: {
        enableRateLimit: parseEnvBoolean(process.env.ENABLE_RATE_LIMIT, true),
        enableSecurityHeaders: parseEnvBoolean(process.env.ENABLE_SECURITY_HEADERS, true),
        requireOriginValidation: parseEnvBoolean(process.env.REQUIRE_ORIGIN_VALIDATION, process.env.NODE_ENV === 'production'),
        maxRequestSize: parseInt(process.env.MAX_REQUEST_SIZE) || 1048576, // 1MB default
        sessionSecret: process.env.SESSION_SECRET || 'default-dev-secret-change-in-production',
        jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production'
    },

    // Cache settings with environment variables
    cache: {
        defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL) || 5 * 60 * 1000, // 5 minutes
        postTTL: parseInt(process.env.CACHE_POST_TTL) || 10 * 60 * 1000,   // 10 minutes for individual posts
        searchTTL: parseInt(process.env.CACHE_SEARCH_TTL) || 2 * 60 * 1000,   // 2 minutes for search results
        enabled: parseEnvBoolean(process.env.CACHE_ENABLED, true),
        maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 100 // Maximum number of cached items
    },

    // Email configuration (for contact forms)
    email: {
        serviceId: process.env.EMAILJS_SERVICE_ID,
        templateId: process.env.EMAILJS_TEMPLATE_ID,
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        // Fallback values only for development
        fallback: {
            serviceId: process.env.NODE_ENV === 'development' ? 'service_jpewjm8' : null,
            templateId: process.env.NODE_ENV === 'development' ? 'template_lmr1i7v' : null,
            publicKey: process.env.NODE_ENV === 'development' ? 'Rc8h7uEQIYsCp9F2L' : null
        }
    },

    // Rate limiting configuration
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
        skipSuccessfulRequests: parseEnvBoolean(process.env.RATE_LIMIT_SKIP_SUCCESS, false),
        skipFailedRequests: parseEnvBoolean(process.env.RATE_LIMIT_SKIP_FAILED, false)
    },

    // Logging configuration
    logging: {
        level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug'),
        enableConsole: parseEnvBoolean(process.env.LOG_CONSOLE, true),
        enableFile: parseEnvBoolean(process.env.LOG_FILE, false),
        enableRemote: parseEnvBoolean(process.env.LOG_REMOTE, false),
        remoteEndpoint: process.env.LOG_REMOTE_ENDPOINT
    },

    // Robots.txt configuration
    robots: {
        // Environment-specific settings
        production: {
            allowAll: true,
            crawlDelay: 1,
            disallowPaths: [
                '/admin/',
                '/.env',
                '/api/',
                '/*?*',
                '/*#*',
                '/*.json$',
                '/*.xml$',
                '/*.txt$'
            ],
            allowPaths: [
                '/blog/',
                '/mindful-breaks/',
                '/contact/'
            ]
        },
        development: {
            allowAll: false,
            crawlDelay: 10,
            disallowPaths: ['/'],
            allowPaths: []
        },
        // Bot-specific configurations
        botConfigs: {
            'facebookexternalhit': {
                allow: ['/'],
                disallow: []
            },
            'Twitterbot': {
                allow: ['/'],
                disallow: []
            },
            'LinkedInBot': {
                allow: ['/'],
                disallow: []
            },
            'Googlebot': {
                allow: ['/'],
                disallow: ['/api/', '/admin/'],
                crawlDelay: 1
            },
            'Bingbot': {
                allow: ['/'],
                disallow: ['/api/', '/admin/'],
                crawlDelay: 2
            }
        }
    }
};

export default config;
