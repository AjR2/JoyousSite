#!/usr/bin/env node

// Local test for robots.txt API logic
// File: /scripts/test-robots-local.js

// Mock the API modules for local testing
const path = require('path');
const fs = require('fs');

// Mock config
const mockConfig = {
  baseUrl: 'http://localhost:3000',
  cors: {
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Content-Type']
  },
  robots: {
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

// Mock posts data
const mockPosts = [
  { title: 'Understanding Mental Health in the Digital Age', date: 'December 15, 2024' },
  { title: 'The Science of Mindfulness and Neural Plasticity', date: 'December 10, 2024' },
  { title: 'Building Resilience Through Technology', date: 'December 5, 2024' }
];

// Helper function to create slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Helper function to generate robots.txt content (copied from our API)
async function generateRobotsContent(environment = 'production') {
  const robotsConfig = mockConfig.robots[environment] || mockConfig.robots.production;
  const botConfigs = mockConfig.robots.botConfigs;
  const baseUrl = mockConfig.baseUrl;
  
  let content = '';
  
  // Main user-agent rules
  content += 'User-agent: *\n';
  
  if (robotsConfig.allowAll) {
    content += 'Allow: /\n';
  } else {
    content += 'Disallow: /\n';
  }
  
  content += '\n';
  
  // Add specific disallow rules
  if (robotsConfig.disallowPaths && robotsConfig.disallowPaths.length > 0) {
    robotsConfig.disallowPaths.forEach(path => {
      content += `Disallow: ${path}\n`;
    });
    content += '\n';
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
      const posts = mockPosts; // Use mock posts
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

// Test function
async function testRobotsGeneration() {
  console.log('🤖 Testing Dynamic Robots.txt Generation');
  console.log('=========================================\n');
  
  // Test production environment
  console.log('📋 Production Environment:');
  console.log('-'.repeat(40));
  const productionRobots = await generateRobotsContent('production');
  console.log(productionRobots);
  
  console.log('\n📋 Development Environment:');
  console.log('-'.repeat(40));
  const developmentRobots = await generateRobotsContent('development');
  console.log(developmentRobots);
  
  // Validate content
  console.log('\n✅ Validation Results:');
  console.log('='.repeat(30));
  
  const prodValidations = [
    { test: 'Contains User-agent', passed: productionRobots.includes('User-agent:') },
    { test: 'Contains Sitemap', passed: productionRobots.includes('Sitemap:') },
    { test: 'Contains Allow directive', passed: productionRobots.includes('Allow: /') },
    { test: 'Contains security disallows', passed: productionRobots.includes('Disallow: /api/') },
    { test: 'Contains AI bot restrictions', passed: productionRobots.includes('GPTBot') },
    { test: 'Contains blog post allows', passed: productionRobots.includes('Allow: /blog/') }
  ];
  
  const devValidations = [
    { test: 'Contains User-agent', passed: developmentRobots.includes('User-agent:') },
    { test: 'Contains Sitemap', passed: developmentRobots.includes('Sitemap:') },
    { test: 'Contains Disallow all', passed: developmentRobots.includes('Disallow: /') },
    { test: 'Contains high crawl delay', passed: developmentRobots.includes('Crawl-delay: 86400') }
  ];
  
  console.log('\nProduction Validation:');
  prodValidations.forEach(v => {
    console.log(`${v.passed ? '✅' : '❌'} ${v.test}`);
  });
  
  console.log('\nDevelopment Validation:');
  devValidations.forEach(v => {
    console.log(`${v.passed ? '✅' : '❌'} ${v.test}`);
  });
  
  console.log('\n🎉 Local robots.txt generation test completed!');
}

// Run the test
if (require.main === module) {
  testRobotsGeneration().catch(console.error);
}

module.exports = { generateRobotsContent, createSlug };
