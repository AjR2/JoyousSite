async function diagnoseNimbusAI() {
  const fetch = (await import('node-fetch')).default;
  
  console.log('🔍 Diagnosing Nimbus AI System...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('XAI_GROK_API_KEY:', process.env.XAI_GROK_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
  console.log('');

  // Test API endpoints
  const endpoints = [
    'http://localhost:3004/api/nimbus/health',
    'http://localhost:3004/api/nimbus/health?detailed=true',
    'http://localhost:3004/api/nimbus/test-chat'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🌐 Testing: ${endpoint}`);
      const response = await fetch(endpoint);
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorText = await response.text();
        console.log(`   Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
    console.log('');
  }

  // Test chat endpoint
  try {
    console.log('💬 Testing Chat Endpoint...');
    const response = await fetch('http://localhost:3004/api/nimbus/chat-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, this is a diagnostic test.',
        conversation_id: 'diagnostic-test'
      })
    });

    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Chat working! Agent used: ${data.agent_used}`);
      console.log(`   Response: "${data.message}"`);
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Chat failed: ${errorText}`);
    }
  } catch (error) {
    console.log(`   ❌ Chat error: ${error.message}`);
  }

  console.log('\n🔧 Recommendations:');
  
  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.XAI_GROK_API_KEY) {
    console.log('❌ No AI API keys configured. Add at least one API key to .env.local');
  }
  
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  Running in production mode. Make sure API keys are set in your deployment environment.');
  }
  
  console.log('✅ For local development, ensure .env.local contains your API keys');
  console.log('✅ For production deployment, set environment variables in your hosting platform');
}

diagnoseNimbusAI().catch(console.error);
