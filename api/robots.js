// Dynamic robots.txt API endpoint
// Generates robots.txt on-demand with environment-specific configurations
// File: /api/robots.js

import config from './utils/config.js';
import { getAllPosts } from './utils/data.js';

// Helper function to create slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Helper function to generate robots.txt content
async function generateRobotsContent(environment = 'production') {
  const robotsConfig = config.robots[environment] || config.robots.production;
  const botConfigs = config.robots.botConfigs;
  const baseUrl = config.baseUrl;
  
  let content = '';
  
  // Main user-agent rules
  content += 'User-agent: *\n';
  
  if (robotsConfig.allowAll) {
    content += 'Allow: /\n';
  } else {
    content += 'Disallow: /\n';
  }
  
  content += '\n';
  
  // Add specific disallow rules (avoid duplicates)
  if (robotsConfig.disallowPaths && robotsConfig.disallowPaths.length > 0) {
    const uniquePaths = [...new Set(robotsConfig.disallowPaths)];
    // Don't duplicate the main "Disallow: /" if already set above
    const pathsToAdd = robotsConfig.allowAll ? uniquePaths : uniquePaths.filter(path => path !== '/');

    if (pathsToAdd.length > 0) {
      pathsToAdd.forEach(path => {
        content += `Disallow: ${path}\n`;
      });
      content += '\n';
    }
  }
  
  // Add specific allow rules
  if (robotsConfig.allowPaths && robotsConfig.allowPaths.length > 0) {
    robotsConfig.allowPaths.forEach(path => {
      content += `Allow: ${path}\n`;
    });
    content += '\n';
  }
  
  // Add crawl delay
  if (robotsConfig.crawlDelay) {
    content += `Crawl-delay: ${robotsConfig.crawlDelay}\n\n`;
  }
  
  // Add bot-specific configurations
  Object.entries(botConfigs).forEach(([botName, botConfig]) => {
    content += `User-agent: ${botName}\n`;
    
    // Bot-specific allow rules
    if (botConfig.allow && botConfig.allow.length > 0) {
      botConfig.allow.forEach(path => {
        content += `Allow: ${path}\n`;
      });
    }
    
    // Bot-specific disallow rules
    if (botConfig.disallow && botConfig.disallow.length > 0) {
      botConfig.disallow.forEach(path => {
        content += `Disallow: ${path}\n`;
      });
    }
    
    // Bot-specific crawl delay
    if (botConfig.crawlDelay) {
      content += `Crawl-delay: ${botConfig.crawlDelay}\n`;
    }
    
    content += '\n';
  });
  
  // Add dynamic blog post allows for better SEO
  if (environment === 'production') {
    try {
      const posts = await getAllPosts();
      if (posts && posts.length > 0) {
        content += `# Blog posts - explicitly allowed for SEO\n`;
        posts.slice(0, 10).forEach(post => { // Limit to recent 10 posts to avoid bloat
          const slug = createSlug(post.title);
          content += `Allow: /blog/${slug}\n`;
        });
        content += '\n';
      }
    } catch (error) {
      console.warn('Could not load posts for robots.txt:', error.message);
    }
  }

  // Add sitemap reference
  content += `# Sitemap\n`;
  content += `Sitemap: ${baseUrl}/sitemap.xml\n\n`;
  
  // Add additional SEO-friendly comments and advanced rules
  if (environment === 'production') {
    content += `# Generated dynamically on ${new Date().toISOString()}\n`;
    content += `# For questions about this robots.txt, contact: admin@akeyreu.com\n`;
    content += `# Website: ${baseUrl}\n\n`;

    // Add security-focused rules
    content += `# Security and privacy protection\n`;
    content += `Disallow: /.git/\n`;
    content += `Disallow: /.env*\n`;
    content += `Disallow: /node_modules/\n`;
    content += `Disallow: /package*.json\n`;
    content += `Disallow: /vercel.json\n`;
    content += `Disallow: /.vercel/\n`;
    content += `Disallow: /api/test*\n`;
    content += `Disallow: /api/debug*\n\n`;

    // Add performance-focused rules
    content += `# Performance optimization - block resource files\n`;
    content += `Disallow: /build/\n`;
    content += `Disallow: /*.map$\n`;
    content += `Disallow: /static/js/*.chunk.js\n`;
    content += `Disallow: /static/css/*.chunk.css\n`;
    content += `Disallow: /static/media/\n\n`;

    // Add SEO-focused rules
    content += `# SEO optimization\n`;
    content += `Disallow: /*?utm_*\n`;
    content += `Disallow: /*?ref=*\n`;
    content += `Disallow: /*?source=*\n`;
    content += `Disallow: /*&utm_*\n`;
    content += `Disallow: /*&ref=*\n`;
    content += `Disallow: /*&source=*\n`;
    content += `Disallow: /search?*\n`;
    content += `Disallow: /*?search=*\n\n`;

    // Add mobile-specific optimizations
    content += `# Mobile optimization\n`;
    content += `Allow: /static/css/\n`;
    content += `Allow: /static/js/main*.js\n`;
    content += `Allow: /favicon.ico\n`;
    content += `Allow: /manifest.json\n\n`;

    // Add comprehensive security rules
    content += `# Additional security rules\n`;
    content += `Disallow: /node_modules/\n`;
    content += `Disallow: /package*.json\n`;
    content += `Disallow: /vercel.json\n\n`;

    // Add specific bot instructions for better SEO
    content += `# Additional bot-specific rules\n`;
    content += `User-agent: GPTBot\n`;
    content += `Disallow: /\n\n`;

    content += `User-agent: ChatGPT-User\n`;
    content += `Disallow: /\n\n`;

    content += `User-agent: CCBot\n`;
    content += `Disallow: /\n\n`;

    content += `User-agent: anthropic-ai\n`;
    content += `Disallow: /\n\n`;

    content += `User-agent: Claude-Web\n`;
    content += `Disallow: /\n\n`;

    // Add crawl budget optimization
    content += `# Crawl budget optimization\n`;
    content += `User-agent: *\n`;
    content += `Request-rate: 1/10s\n\n`;

  } else {
    content += `# Development environment - crawling restricted\n`;
    content += `# Generated on ${new Date().toISOString()}\n`;
    content += `# This is a development/staging environment\n\n`;

    // Add development-specific restrictions
    content += `# Development restrictions\n`;
    content += `Disallow: /\n`;
    content += `Crawl-delay: 86400\n\n`;
  }
  
  return content;
}

// Helper function to detect environment
function detectEnvironment(req) {
  // Check for explicit environment parameter
  if (req.query.env) {
    return req.query.env === 'production' ? 'production' : 'development';
  }
  
  // Check environment variables
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
    return 'production';
  }
  
  // Check if running on Vercel preview
  if (process.env.VERCEL_ENV === 'preview') {
    return 'development'; // Treat preview as development for robots.txt
  }
  
  // Default to development for local/unknown environments
  return 'development';
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', config.cors.origin.join(', '));
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', config.cors.allowedHeaders.join(', '));
  
  // Set content type for robots.txt
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  
  // Set caching headers (cache for 1 hour in production, 5 minutes in development)
  const environment = detectEnvironment(req);
  const cacheTime = environment === 'production' ? 3600 : 300;
  res.setHeader('Cache-Control', `public, max-age=${cacheTime}, s-maxage=${cacheTime * 2}`);
  res.setHeader('Last-Modified', new Date().toUTCString());

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Generate robots.txt content based on environment
    const robotsContent = await generateRobotsContent(environment);
    
    // Add debug information in development
    if (environment === 'development' && req.query.debug === 'true') {
      const debugInfo = `# Debug Information\n# Environment: ${environment}\n# Generated at: ${new Date().toISOString()}\n# Base URL: ${config.baseUrl}\n\n`;
      res.status(200).send(debugInfo + robotsContent);
    } else {
      res.status(200).send(robotsContent);
    }
    
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    
    // Fallback robots.txt in case of error
    const fallbackContent = `User-agent: *\n${environment === 'production' ? 'Allow: /' : 'Disallow: /'}\n\nSitemap: ${config.baseUrl}/sitemap.xml\n`;
    
    res.status(200).send(fallbackContent);
  }
}
