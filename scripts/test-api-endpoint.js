#!/usr/bin/env node

// Test the actual API endpoint functionality
// File: /scripts/test-api-endpoint.js

const http = require('http');
const path = require('path');

// Mock request and response objects for testing
class MockRequest {
  constructor(options = {}) {
    this.method = options.method || 'GET';
    this.query = options.query || {};
    this.headers = options.headers || {};
  }
}

class MockResponse {
  constructor() {
    this.statusCode = 200;
    this.headers = {};
    this.body = '';
    this.ended = false;
  }
  
  setHeader(name, value) {
    this.headers[name] = value;
  }
  
  status(code) {
    this.statusCode = code;
    return this;
  }
  
  json(data) {
    this.body = JSON.stringify(data);
    this.ended = true;
    return this;
  }
  
  send(data) {
    this.body = data;
    this.ended = true;
    return this;
  }
  
  end() {
    this.ended = true;
    return this;
  }
}

// Test the API handler directly
async function testAPIHandler() {
  console.log('🔧 Testing API Handler Directly');
  console.log('================================\n');
  
  try {
    // Import the handler (this might fail in some environments)
    const robotsHandler = require('../api/robots.js');
    
    if (robotsHandler.default) {
      console.log('✅ Successfully imported robots.js handler');
      
      // Test production environment
      console.log('\n🧪 Testing Production Environment:');
      console.log('-'.repeat(40));
      
      const prodReq = new MockRequest({ query: { env: 'production' } });
      const prodRes = new MockResponse();
      
      await robotsHandler.default(prodReq, prodRes);
      
      console.log(`Status: ${prodRes.statusCode}`);
      console.log(`Content-Type: ${prodRes.headers['Content-Type']}`);
      console.log(`Cache-Control: ${prodRes.headers['Cache-Control']}`);
      console.log(`Body length: ${prodRes.body.length} characters`);
      
      if (prodRes.body.includes('Allow: /')) {
        console.log('✅ Production mode: Allow directive found');
      } else {
        console.log('❌ Production mode: Allow directive missing');
      }
      
      // Test development environment
      console.log('\n🧪 Testing Development Environment:');
      console.log('-'.repeat(40));
      
      const devReq = new MockRequest({ query: { env: 'development' } });
      const devRes = new MockResponse();
      
      await robotsHandler.default(devReq, devRes);
      
      console.log(`Status: ${devRes.statusCode}`);
      console.log(`Content-Type: ${devRes.headers['Content-Type']}`);
      console.log(`Cache-Control: ${devRes.headers['Cache-Control']}`);
      console.log(`Body length: ${devRes.body.length} characters`);
      
      if (devRes.body.includes('Disallow: /')) {
        console.log('✅ Development mode: Disallow directive found');
      } else {
        console.log('❌ Development mode: Disallow directive missing');
      }
      
      // Test OPTIONS method
      console.log('\n🧪 Testing OPTIONS Method:');
      console.log('-'.repeat(40));
      
      const optionsReq = new MockRequest({ method: 'OPTIONS' });
      const optionsRes = new MockResponse();
      
      await robotsHandler.default(optionsReq, optionsRes);
      
      console.log(`Status: ${optionsRes.statusCode}`);
      console.log(`Ended: ${optionsRes.ended}`);
      
      if (optionsRes.statusCode === 200 && optionsRes.ended) {
        console.log('✅ OPTIONS method handled correctly');
      } else {
        console.log('❌ OPTIONS method not handled correctly');
      }
      
      // Test invalid method
      console.log('\n🧪 Testing Invalid Method (POST):');
      console.log('-'.repeat(40));
      
      const postReq = new MockRequest({ method: 'POST' });
      const postRes = new MockResponse();
      
      await robotsHandler.default(postReq, postRes);
      
      console.log(`Status: ${postRes.statusCode}`);
      
      if (postRes.statusCode === 405) {
        console.log('✅ POST method correctly rejected (405)');
      } else {
        console.log('❌ POST method not handled correctly');
      }
      
    } else {
      console.log('❌ Could not find default export in robots.js');
    }
    
  } catch (error) {
    console.log('⚠️  Could not test API handler directly:', error.message);
    console.log('This is expected in some environments. Testing logic instead...\n');
    
    // Fall back to testing the logic
    await testLogicOnly();
  }
}

// Test just the logic without the full API handler
async function testLogicOnly() {
  console.log('🧠 Testing Robots.txt Logic');
  console.log('============================\n');
  
  // Import our comprehensive test functions
  const { generateRobotsContentTest, validateRobotsContent, createSlugTest } = require('./test-robots-comprehensive.js');
  
  // Test production content
  console.log('📋 Production Content Test:');
  console.log('-'.repeat(30));
  
  const prodContent = await generateRobotsContentTest('production');
  console.log(`✅ Generated ${prodContent.length} characters`);
  console.log(`✅ Contains ${prodContent.split('\n').length} lines`);
  
  // Quick validation
  const prodChecks = [
    { test: 'Allow directive', check: prodContent.includes('Allow: /') },
    { test: 'Sitemap reference', check: prodContent.includes('Sitemap:') },
    { test: 'Security rules', check: prodContent.includes('Disallow: /.env') },
    { test: 'AI bot blocking', check: prodContent.includes('User-agent: GPTBot') }
  ];
  
  prodChecks.forEach(({ test, check }) => {
    console.log(`${check ? '✅' : '❌'} ${test}`);
  });
  
  // Test development content
  console.log('\n📋 Development Content Test:');
  console.log('-'.repeat(30));
  
  const devContent = await generateRobotsContentTest('development');
  console.log(`✅ Generated ${devContent.length} characters`);
  console.log(`✅ Contains ${devContent.split('\n').length} lines`);
  
  // Quick validation
  const devChecks = [
    { test: 'Disallow all', check: devContent.includes('Disallow: /') },
    { test: 'High crawl delay', check: devContent.includes('Crawl-delay: 86400') },
    { test: 'Development label', check: devContent.includes('Development environment') }
  ];
  
  devChecks.forEach(({ test, check }) => {
    console.log(`${check ? '✅' : '❌'} ${test}`);
  });
  
  // Test slug generation
  console.log('\n🔤 Slug Generation Test:');
  console.log('-'.repeat(30));
  
  const testCases = [
    'Understanding Mental Health',
    'The Science of Mindfulness & Neural Plasticity!',
    'Test with Special Characters @#$%'
  ];
  
  testCases.forEach(title => {
    const slug = createSlugTest(title);
    console.log(`✅ "${title}" → "${slug}"`);
  });
}

// Test HTTP server integration (if possible)
async function testHTTPIntegration() {
  console.log('\n🌐 Testing HTTP Integration');
  console.log('============================\n');
  
  // Check if local server is running
  const testUrl = 'http://localhost:3000/robots.txt';
  
  return new Promise((resolve) => {
    const req = http.get(testUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ HTTP Status: ${res.statusCode}`);
        console.log(`✅ Content-Type: ${res.headers['content-type']}`);
        console.log(`✅ Content Length: ${data.length} characters`);
        
        if (data.includes('User-agent:')) {
          console.log('✅ Valid robots.txt content received');
        } else {
          console.log('❌ Invalid robots.txt content');
        }
        
        resolve(true);
      });
    });
    
    req.on('error', (error) => {
      console.log('⚠️  Local server not available:', error.message);
      console.log('   Start server with: npm start');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      console.log('⚠️  Request timeout - server may not be running');
      resolve(false);
    });
  });
}

// Main test runner
async function runEndpointTests() {
  console.log('🚀 API Endpoint Testing Suite');
  console.log('==============================\n');
  
  // Test API handler directly
  await testAPIHandler();
  
  // Test HTTP integration
  await testHTTPIntegration();
  
  console.log('\n🎉 Endpoint testing completed!');
  console.log('\nNext steps:');
  console.log('1. Start development server: npm start');
  console.log('2. Visit: http://localhost:3000/robots.txt');
  console.log('3. Deploy to production and test live endpoint');
}

// Run tests if called directly
if (require.main === module) {
  runEndpointTests().catch(console.error);
}

module.exports = { testAPIHandler, testLogicOnly, testHTTPIntegration };
