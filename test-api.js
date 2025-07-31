// Simple API test script
const baseUrl = process.argv[2] || 'http://localhost:3000';

const endpoints = [
  '/api/posts',
  '/api/analytics', 
  '/api/categories',
  '/api/tags',
  '/api/nimbus/health-simple?detailed=true'
];

async function testEndpoint(endpoint) {
  try {
    console.log(`Testing ${endpoint}...`);
    const response = await fetch(`${baseUrl}${endpoint}`);
    const text = await response.text();
    
    // Check if it's JSON
    try {
      const json = JSON.parse(text);
      console.log(`✅ ${endpoint} - JSON response (${Object.keys(json).length} keys)`);
      return true;
    } catch (e) {
      console.log(`❌ ${endpoint} - HTML response (${text.length} chars)`);
      console.log(`   First 100 chars: ${text.substring(0, 100)}...`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${endpoint} - Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log(`\n🧪 Testing API endpoints on ${baseUrl}\n`);
  
  let passed = 0;
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint);
    if (success) passed++;
    console.log('');
  }
  
  console.log(`\n📊 Results: ${passed}/${endpoints.length} endpoints working`);
  
  if (passed === endpoints.length) {
    console.log('🎉 All API endpoints are working correctly!');
  } else {
    console.log('⚠️  Some endpoints are returning HTML instead of JSON');
  }
}

// For Node.js versions that don't have fetch built-in
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

runTests().catch(console.error);
