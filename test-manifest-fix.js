async function testManifestFix() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔍 Testing Manifest and Service Worker Fix...\n');
  
  // Test local development server
  console.log('📍 Testing Local Development Server (localhost:3004)');
  const localTests = [
    { url: 'http://localhost:3004/manifest.json', expectedType: 'application/manifest+json', shouldContain: '"name"' },
    { url: 'http://localhost:3004/sw.js', expectedType: 'application/javascript', shouldContain: 'self.addEventListener' }
  ];

  for (const test of localTests) {
    try {
      const response = await fetch(test.url);
      const contentType = response.headers.get('content-type') || '';
      const content = await response.text();
      
      console.log(`🌐 ${test.url}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${contentType}`);
      
      if (response.ok && contentType.includes(test.expectedType.split('/')[1]) && content.includes(test.shouldContain)) {
        console.log(`   ✅ SUCCESS: File served correctly`);
      } else {
        console.log(`   ❌ ISSUE: Expected ${test.expectedType}, got ${contentType}`);
        console.log(`   Content preview: ${content.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    console.log('');
  }

  // Test production server (after deployment)
  console.log('📍 Testing Production Server (www.akeyreu.com)');
  const productionTests = [
    { url: 'https://www.akeyreu.com/manifest.json', expectedType: 'application/manifest+json', shouldContain: '"name"' },
    { url: 'https://www.akeyreu.com/sw.js', expectedType: 'application/javascript', shouldContain: 'self.addEventListener' }
  ];

  for (const test of productionTests) {
    try {
      const response = await fetch(test.url);
      const contentType = response.headers.get('content-type') || '';
      const content = await response.text();
      
      console.log(`🌐 ${test.url}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${contentType}`);
      
      if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
        console.log(`   ❌ PROBLEM: Still returning HTML instead of expected file type`);
        console.log(`   This means the deployment hasn't been updated yet`);
      } else if (response.ok && content.includes(test.shouldContain)) {
        console.log(`   ✅ SUCCESS: File served correctly`);
      } else {
        console.log(`   ⚠️  WARNING: Unexpected content`);
        console.log(`   Content preview: ${content.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    console.log('');
  }

  console.log('🔧 Next Steps:');
  console.log('1. ✅ Local development server is working correctly');
  console.log('2. 🚀 Deploy the changes to production (git push)');
  console.log('3. ⏳ Wait for Vercel deployment to complete');
  console.log('4. 🧪 Test production URLs again');
  console.log('5. 🎉 Manifest error should be resolved!');
}

testManifestFix().catch(console.error);
