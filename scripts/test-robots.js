#!/usr/bin/env node

// Test script for dynamic robots.txt functionality
// File: /scripts/test-robots.js

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Test configuration
const TEST_CONFIG = {
  local: 'http://localhost:3000',
  vercel: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  production: 'https://akeyreu.com'
};

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'RobotsTxtTester/1.0'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Test function for robots.txt endpoint
async function testRobotsEndpoint(baseUrl, environment) {
  console.log(`\n🤖 Testing robots.txt for ${environment} (${baseUrl})`);
  console.log('=' .repeat(60));
  
  try {
    // Test basic robots.txt
    const robotsUrl = `${baseUrl}/robots.txt`;
    const response = await makeRequest(robotsUrl);
    
    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Content-Type: ${response.headers['content-type']}`);
    console.log(`Cache-Control: ${response.headers['cache-control']}`);
    console.log(`Content-Length: ${response.body.length} characters`);
    
    if (response.statusCode === 200) {
      console.log('\n📄 Robots.txt Content:');
      console.log('-'.repeat(40));
      console.log(response.body);
      console.log('-'.repeat(40));
      
      // Validate content
      const validations = validateRobotsContent(response.body, environment);
      console.log('\n✅ Validation Results:');
      validations.forEach(validation => {
        const icon = validation.passed ? '✅' : '❌';
        console.log(`${icon} ${validation.test}: ${validation.message}`);
      });
      
    } else {
      console.log(`❌ Failed to fetch robots.txt: ${response.statusCode}`);
    }
    
    // Test with debug parameter if not production
    if (environment !== 'production') {
      console.log('\n🔍 Testing debug mode...');
      const debugUrl = `${baseUrl}/robots.txt?debug=true`;
      const debugResponse = await makeRequest(debugUrl);
      
      if (debugResponse.statusCode === 200) {
        console.log('✅ Debug mode working');
        if (debugResponse.body.includes('# Debug Information')) {
          console.log('✅ Debug information included');
        }
      }
    }
    
  } catch (error) {
    console.log(`❌ Error testing ${environment}: ${error.message}`);
  }
}

// Validation function for robots.txt content
function validateRobotsContent(content, environment) {
  const validations = [];
  
  // Check for User-agent
  validations.push({
    test: 'User-agent directive',
    passed: content.includes('User-agent:'),
    message: content.includes('User-agent:') ? 'Found User-agent directive' : 'Missing User-agent directive'
  });
  
  // Check for Sitemap
  validations.push({
    test: 'Sitemap directive',
    passed: content.includes('Sitemap:'),
    message: content.includes('Sitemap:') ? 'Found Sitemap directive' : 'Missing Sitemap directive'
  });
  
  // Environment-specific checks
  if (environment === 'production') {
    validations.push({
      test: 'Production Allow directive',
      passed: content.includes('Allow: /'),
      message: content.includes('Allow: /') ? 'Found Allow directive for production' : 'Missing Allow directive for production'
    });
    
    validations.push({
      test: 'Security disallows',
      passed: content.includes('Disallow: /api/') && content.includes('Disallow: /.env'),
      message: content.includes('Disallow: /api/') ? 'Security disallows present' : 'Missing security disallows'
    });
    
    validations.push({
      test: 'AI bot restrictions',
      passed: content.includes('GPTBot') || content.includes('ChatGPT-User'),
      message: content.includes('GPTBot') ? 'AI bot restrictions present' : 'Missing AI bot restrictions'
    });
  } else {
    validations.push({
      test: 'Development restrictions',
      passed: content.includes('Disallow: /'),
      message: content.includes('Disallow: /') ? 'Development restrictions present' : 'Missing development restrictions'
    });
  }
  
  // Check for crawl delay
  validations.push({
    test: 'Crawl-delay directive',
    passed: content.includes('Crawl-delay:'),
    message: content.includes('Crawl-delay:') ? 'Found Crawl-delay directive' : 'Missing Crawl-delay directive'
  });
  
  return validations;
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Dynamic Robots.txt Tests');
  console.log('=====================================');
  
  // Test local development (if available)
  if (process.env.NODE_ENV !== 'production') {
    try {
      await testRobotsEndpoint(TEST_CONFIG.local, 'development');
    } catch (error) {
      console.log('⚠️  Local server not available, skipping local tests');
    }
  }
  
  // Test Vercel preview (if available)
  if (TEST_CONFIG.vercel) {
    await testRobotsEndpoint(TEST_CONFIG.vercel, 'preview');
  }
  
  // Test production (if accessible)
  if (process.argv.includes('--production')) {
    await testRobotsEndpoint(TEST_CONFIG.production, 'production');
  }
  
  console.log('\n🎉 Tests completed!');
  console.log('\nTo test production, run: npm run test:robots -- --production');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testRobotsEndpoint, validateRobotsContent };
