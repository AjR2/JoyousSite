async function testProductionFiles() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔍 Testing Production File Serving...\n');
  
  const baseUrl = 'https://www.akeyreu.com';
  const testFiles = [
    { path: '/sw.js', expectedType: 'application/javascript', shouldContain: 'self.addEventListener' },
    { path: '/manifest.json', expectedType: 'application/manifest+json', shouldContain: '"name"' },
    { path: '/robots.txt', expectedType: 'text/plain', shouldContain: 'User-agent' },
    { path: '/sitemap.xml', expectedType: 'application/xml', shouldContain: '<urlset' },
    { path: '/api/nimbus/health', expectedType: 'application/json', shouldContain: '"status"' }
  ];

  for (const file of testFiles) {
    try {
      console.log(`🌐 Testing: ${baseUrl}${file.path}`);
      const response = await fetch(`${baseUrl}${file.path}`);
      const contentType = response.headers.get('content-type') || '';
      const content = await response.text();
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${contentType}`);
      
      // Check if it's returning HTML instead of expected content
      if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
        console.log(`   ❌ PROBLEM: Returning HTML instead of expected file type`);
        console.log(`   Expected: ${file.expectedType}`);
        console.log(`   Content preview: ${content.substring(0, 100)}...`);
      } else if (content.includes(file.shouldContain)) {
        console.log(`   ✅ SUCCESS: File served correctly`);
        console.log(`   Content preview: ${content.substring(0, 100)}...`);
      } else {
        console.log(`   ⚠️  WARNING: File served but content may be incorrect`);
        console.log(`   Expected to contain: ${file.shouldContain}`);
        console.log(`   Content preview: ${content.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    console.log('');
  }

  console.log('🔧 Recommendations:');
  console.log('1. If files are returning HTML, the Vercel routing configuration needs to be updated');
  console.log('2. Redeploy after making the vercel.json changes');
  console.log('3. Clear browser cache and test again');
  console.log('4. Check Vercel deployment logs for any build errors');
}

testProductionFiles().catch(console.error);
