#!/usr/bin/env node

// Production Build Test Suite
// Tests the full website deployment to ensure everything works in production

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Test functions
async function testHomepage() {
  console.log('🏠 Testing Homepage...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/`);
    
    if (response.statusCode === 200) {
      console.log('✅ Homepage loads successfully');
      
      // Check for key content
      const content = response.data;
      const checks = [
        { test: content.includes('Akeyreu'), name: 'Brand name present' },
        { test: content.includes('What Is Akeyreu?'), name: 'Hero section present' },
        { test: content.includes('nAura'), name: 'nAura product mentioned' },
        { test: content.includes('Vza'), name: 'Vza product mentioned' },
        { test: content.includes('/blog'), name: 'Blog link present' }
      ];
      
      checks.forEach(check => {
        if (check.test) {
          console.log(`✅ ${check.name}`);
        } else {
          console.log(`❌ ${check.name}`);
        }
      });
    } else {
      console.log(`❌ Homepage failed with status: ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ Homepage test failed: ${error.message}`);
  }
}

async function testBlogPage() {
  console.log('\n📝 Testing Blog Page...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/blog`);
    
    if (response.statusCode === 200) {
      console.log('✅ Blog page loads successfully');
      
      // Check for React app content
      const content = response.data;
      const checks = [
        { test: content.includes('id="root"'), name: 'React root element present' },
        { test: content.includes('react'), name: 'React scripts loaded' },
        { test: content.includes('Blog'), name: 'Blog content referenced' }
      ];
      
      checks.forEach(check => {
        if (check.test) {
          console.log(`✅ ${check.name}`);
        } else {
          console.log(`❌ ${check.name}`);
        }
      });
    } else {
      console.log(`❌ Blog page failed with status: ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ Blog page test failed: ${error.message}`);
  }
}

async function testAPIEndpoints() {
  console.log('\n🔌 Testing API Endpoints...');
  
  const endpoints = [
    { url: '/api/posts', name: 'Posts API', expectJSON: true },
    { url: '/api/categories', name: 'Categories API', expectJSON: true },
    { url: '/api/tags', name: 'Tags API', expectJSON: true },
    { url: '/api/featured', name: 'Featured API', expectJSON: true },
    { url: '/api/search?q=meditation', name: 'Search API', expectJSON: true },
    { url: '/api/rss', name: 'RSS Feed', expectJSON: false }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${BASE_URL}${endpoint.url}`);
      
      if (response.statusCode === 200) {
        console.log(`✅ ${endpoint.name} responds successfully`);
        
        if (endpoint.expectJSON) {
          try {
            const jsonData = JSON.parse(response.data);
            console.log(`✅ ${endpoint.name} returns valid JSON`);
            
            // Additional checks based on endpoint
            if (endpoint.url === '/api/posts' && Array.isArray(jsonData)) {
              console.log(`✅ Posts API returns ${jsonData.length} posts`);
            }
            if (endpoint.url === '/api/categories' && jsonData.categories) {
              console.log(`✅ Categories API returns ${jsonData.categories.length} categories`);
            }
            if (endpoint.url === '/api/tags' && jsonData.tags) {
              console.log(`✅ Tags API returns ${jsonData.tags.length} tags`);
            }
          } catch (parseError) {
            console.log(`❌ ${endpoint.name} returns invalid JSON`);
          }
        } else {
          // Check RSS feed
          if (response.data.includes('<?xml') && response.data.includes('<rss')) {
            console.log(`✅ RSS feed returns valid XML`);
          } else {
            console.log(`❌ RSS feed returns invalid XML`);
          }
        }
      } else {
        console.log(`❌ ${endpoint.name} failed with status: ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name} test failed: ${error.message}`);
    }
  }
}

async function testStaticAssets() {
  console.log('\n📁 Testing Static Assets...');
  
  const assets = [
    { url: '/favicon.ico', name: 'Favicon' },
    { url: '/static/js/bundle.js', name: 'JavaScript Bundle' },
    { url: '/static/css/main.css', name: 'CSS Bundle' }
  ];
  
  for (const asset of assets) {
    try {
      const response = await makeRequest(`${BASE_URL}${asset.url}`);
      
      if (response.statusCode === 200) {
        console.log(`✅ ${asset.name} loads successfully`);
      } else if (response.statusCode === 404) {
        console.log(`⚠️ ${asset.name} not found (may be normal for some assets)`);
      } else {
        console.log(`❌ ${asset.name} failed with status: ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`⚠️ ${asset.name} test failed: ${error.message}`);
    }
  }
}

async function testSEOFeatures() {
  console.log('\n🔍 Testing SEO Features...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/`);
    
    if (response.statusCode === 200) {
      const content = response.data;
      
      const seoChecks = [
        { test: content.includes('<title>'), name: 'Page title present' },
        { test: content.includes('meta name="description"'), name: 'Meta description present' },
        { test: content.includes('meta property="og:'), name: 'Open Graph tags present' },
        { test: content.includes('meta property="twitter:'), name: 'Twitter Card tags present' },
        { test: content.includes('link rel="alternate" type="application/rss+xml"'), name: 'RSS feed link present' },
        { test: content.includes('application/ld+json'), name: 'Structured data present' }
      ];
      
      seoChecks.forEach(check => {
        if (check.test) {
          console.log(`✅ ${check.name}`);
        } else {
          console.log(`❌ ${check.name}`);
        }
      });
    }
  } catch (error) {
    console.log(`❌ SEO features test failed: ${error.message}`);
  }
}

async function testPerformance() {
  console.log('\n⚡ Testing Performance...');
  
  const startTime = Date.now();
  
  try {
    const response = await makeRequest(`${BASE_URL}/`);
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    if (response.statusCode === 200) {
      console.log(`✅ Homepage loads in ${loadTime}ms`);
      
      if (loadTime < 1000) {
        console.log('✅ Excellent load time (< 1s)');
      } else if (loadTime < 3000) {
        console.log('⚠️ Good load time (< 3s)');
      } else {
        console.log('❌ Slow load time (> 3s)');
      }
      
      // Check for performance optimizations
      const content = response.data;
      const perfChecks = [
        { test: content.includes('loading="lazy"'), name: 'Lazy loading implemented' },
        { test: content.includes('preconnect'), name: 'DNS preconnect present' },
        { test: response.headers['cache-control'], name: 'Cache headers present' }
      ];
      
      perfChecks.forEach(check => {
        if (check.test) {
          console.log(`✅ ${check.name}`);
        } else {
          console.log(`⚠️ ${check.name} not detected`);
        }
      });
    }
  } catch (error) {
    console.log(`❌ Performance test failed: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Production Build Test Suite');
  console.log('================================\n');
  console.log(`Testing deployment at: ${BASE_URL}\n`);
  
  // Wait a moment for server to be ready
  console.log('⏳ Waiting for server to be ready...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testHomepage();
  await testBlogPage();
  await testAPIEndpoints();
  await testStaticAssets();
  await testSEOFeatures();
  await testPerformance();
  
  console.log('\n🎉 Production Build Testing Complete!');
  console.log('\n📋 Summary:');
  console.log('✅ = Working correctly');
  console.log('⚠️ = Working but could be improved');
  console.log('❌ = Needs attention');
  
  console.log('\n🌐 Manual Testing Recommendations:');
  console.log('1. Open http://localhost:3000 in browser');
  console.log('2. Navigate to /blog and test the enhanced features');
  console.log('3. Test individual blog posts at /blog/[slug]');
  console.log('4. Verify API endpoints return correct data');
  console.log('5. Test RSS feed at /api/rss');
  console.log('6. Check mobile responsiveness');
  console.log('7. Test accessibility with screen reader');
  console.log('8. Verify all enhanced features work as expected');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testHomepage,
  testBlogPage,
  testAPIEndpoints,
  testStaticAssets,
  testSEOFeatures,
  testPerformance
};
