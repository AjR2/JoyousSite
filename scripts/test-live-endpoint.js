#!/usr/bin/env node

// Live endpoint testing for robots.txt
// File: /scripts/test-live-endpoint.js

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Test URLs
const TEST_URLS = {
  local: 'http://localhost:3000/robots.txt',
  localApi: 'http://localhost:3000/api/robots',
  production: 'https://akeyreu.com/robots.txt'
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'RobotsTxtTester/1.0',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url: url
        });
      });
    });

    req.on('error', (error) => {
      reject({ error, url });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject({ error: new Error('Request timeout'), url });
    });

    req.end();
  });
}

// Validate robots.txt content
function validateContent(content, environment = 'unknown') {
  const validations = [];
  
  // Basic structure checks
  validations.push({
    test: 'Contains User-agent',
    passed: content.includes('User-agent:'),
    critical: true
  });
  
  validations.push({
    test: 'Contains Sitemap',
    passed: content.includes('Sitemap:'),
    critical: true
  });
  
  // Content quality checks
  validations.push({
    test: 'Reasonable length',
    passed: content.length > 50 && content.length < 50000,
    critical: false
  });
  
  validations.push({
    test: 'No syntax errors',
    passed: !content.includes('undefined') && !content.includes('null'),
    critical: true
  });
  
  // Environment-specific checks
  if (environment === 'production') {
    validations.push({
      test: 'Production: Allow directive',
      passed: content.includes('Allow: /'),
      critical: true
    });
    
    validations.push({
      test: 'Production: Security rules',
      passed: content.includes('Disallow: /.env') && content.includes('Disallow: /api/'),
      critical: true
    });
    
    validations.push({
      test: 'Production: AI bot blocking',
      passed: content.includes('GPTBot') && content.includes('Disallow: /'),
      critical: false
    });
  } else if (environment === 'development') {
    validations.push({
      test: 'Development: Disallow all',
      passed: content.includes('Disallow: /'),
      critical: true
    });
    
    validations.push({
      test: 'Development: High crawl delay',
      passed: content.includes('86400') || content.includes('Crawl-delay: 10'),
      critical: false
    });
  }
  
  return validations;
}

// Test a specific endpoint
async function testEndpoint(url, expectedEnvironment = 'unknown') {
  console.log(`\n🔍 Testing: ${url}`);
  console.log('='.repeat(60));
  
  try {
    const response = await makeRequest(url);
    
    console.log(`✅ Status: ${response.statusCode}`);
    console.log(`✅ Content-Type: ${response.headers['content-type'] || 'not set'}`);
    console.log(`✅ Content-Length: ${response.body.length} characters`);
    
    if (response.headers['cache-control']) {
      console.log(`✅ Cache-Control: ${response.headers['cache-control']}`);
    }
    
    if (response.headers['last-modified']) {
      console.log(`✅ Last-Modified: ${response.headers['last-modified']}`);
    }
    
    // Validate content
    const validations = validateContent(response.body, expectedEnvironment);
    
    console.log('\n📋 Content Validation:');
    console.log('-'.repeat(30));
    
    let criticalPassed = 0;
    let criticalTotal = 0;
    let totalPassed = 0;
    
    validations.forEach(validation => {
      const icon = validation.passed ? '✅' : '❌';
      const critical = validation.critical ? ' [CRITICAL]' : '';
      console.log(`${icon} ${validation.test}${critical}`);
      
      if (validation.critical) {
        criticalTotal++;
        if (validation.passed) criticalPassed++;
      }
      
      if (validation.passed) totalPassed++;
    });
    
    console.log(`\n📊 Results: ${totalPassed}/${validations.length} passed`);
    console.log(`📊 Critical: ${criticalPassed}/${criticalTotal} passed`);
    
    // Show content preview
    console.log('\n📄 Content Preview (first 15 lines):');
    console.log('-'.repeat(40));
    response.body.split('\n').slice(0, 15).forEach((line, i) => {
      console.log(`${String(i + 1).padStart(2)}: ${line}`);
    });
    
    if (response.body.split('\n').length > 15) {
      console.log('...');
    }
    
    return {
      success: response.statusCode === 200,
      criticalPassed: criticalPassed === criticalTotal,
      totalValidations: validations.length,
      passedValidations: totalPassed,
      content: response.body
    };
    
  } catch (error) {
    console.log(`❌ Error: ${error.error?.message || error.message}`);
    console.log(`❌ URL: ${error.url || url}`);
    
    return {
      success: false,
      error: error.error?.message || error.message
    };
  }
}

// Test different environments and parameters
async function testEnvironmentVariations(baseUrl) {
  console.log(`\n🧪 Testing Environment Variations for: ${baseUrl}`);
  console.log('='.repeat(60));
  
  const variations = [
    { url: baseUrl, name: 'Default' },
    { url: `${baseUrl}?env=production`, name: 'Explicit Production' },
    { url: `${baseUrl}?env=development`, name: 'Explicit Development' },
    { url: `${baseUrl}?debug=true`, name: 'Debug Mode' }
  ];
  
  for (const variation of variations) {
    console.log(`\n🔬 Testing: ${variation.name}`);
    console.log('-'.repeat(30));
    
    try {
      const response = await makeRequest(variation.url);
      console.log(`Status: ${response.statusCode}`);
      console.log(`Length: ${response.body.length} chars`);
      
      if (variation.name === 'Debug Mode' && response.body.includes('Debug Information')) {
        console.log('✅ Debug information included');
      }
      
      if (variation.name === 'Explicit Production' && response.body.includes('Allow: /')) {
        console.log('✅ Production mode detected');
      }
      
      if (variation.name === 'Explicit Development' && response.body.includes('Disallow: /')) {
        console.log('✅ Development mode detected');
      }
      
    } catch (error) {
      console.log(`❌ Failed: ${error.error?.message || error.message}`);
    }
  }
}

// Test HTTP methods
async function testHTTPMethods(baseUrl) {
  console.log(`\n🌐 Testing HTTP Methods for: ${baseUrl}`);
  console.log('='.repeat(60));
  
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
  
  for (const method of methods) {
    try {
      const response = await makeRequest(baseUrl, { method });
      
      if (method === 'GET') {
        console.log(`✅ ${method}: ${response.statusCode} (expected 200)`);
      } else if (method === 'OPTIONS') {
        console.log(`✅ ${method}: ${response.statusCode} (expected 200)`);
      } else {
        const expected = response.statusCode === 405;
        console.log(`${expected ? '✅' : '❌'} ${method}: ${response.statusCode} (expected 405)`);
      }
      
    } catch (error) {
      console.log(`❌ ${method}: ${error.error?.message || error.message}`);
    }
  }
}

// Main test runner
async function runLiveTests() {
  console.log('🚀 Live Robots.txt Endpoint Testing');
  console.log('====================================\n');
  
  let totalTests = 0;
  let successfulTests = 0;
  
  // Test local development server
  console.log('🏠 Testing Local Development Server');
  try {
    const localResult = await testEndpoint(TEST_URLS.local, 'development');
    totalTests++;
    if (localResult.success && localResult.criticalPassed) successfulTests++;
    
    // Test API endpoint directly
    const localApiResult = await testEndpoint(TEST_URLS.localApi, 'development');
    totalTests++;
    if (localApiResult.success && localApiResult.criticalPassed) successfulTests++;
    
    // Test variations if local server is working
    if (localResult.success) {
      await testEnvironmentVariations(TEST_URLS.localApi);
      await testHTTPMethods(TEST_URLS.localApi);
    }
    
  } catch (error) {
    console.log('⚠️  Local server not available. Start with: npm start');
  }
  
  // Test production if requested
  if (process.argv.includes('--production')) {
    console.log('\n🌍 Testing Production Server');
    try {
      const prodResult = await testEndpoint(TEST_URLS.production, 'production');
      totalTests++;
      if (prodResult.success && prodResult.criticalPassed) successfulTests++;
    } catch (error) {
      console.log('⚠️  Production server test failed');
    }
  }
  
  // Summary
  console.log('\n🎯 Live Testing Summary');
  console.log('='.repeat(30));
  console.log(`Total endpoint tests: ${totalTests}`);
  console.log(`Successful tests: ${successfulTests}`);
  console.log(`Success rate: ${totalTests > 0 ? ((successfulTests / totalTests) * 100).toFixed(1) : 0}%`);
  
  if (successfulTests === totalTests && totalTests > 0) {
    console.log('\n🎉 All live tests passed! Robots.txt endpoint is working correctly.');
  } else if (totalTests === 0) {
    console.log('\n⚠️  No servers available for testing.');
    console.log('Start local server with: npm start');
    console.log('Test production with: npm run test:live -- --production');
  } else {
    console.log('\n⚠️  Some tests failed. Check the implementation.');
  }
}

// Export for use in other scripts
module.exports = {
  testEndpoint,
  validateContent,
  testEnvironmentVariations,
  testHTTPMethods,
  makeRequest
};

// Run tests if called directly
if (require.main === module) {
  runLiveTests().catch(console.error);
}
