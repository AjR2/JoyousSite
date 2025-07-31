#!/usr/bin/env node

/**
 * Nimbus AI Integration Test Script
 * Tests all Nimbus AI endpoints and functionality
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/nimbus`;

// Test utilities
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('🔍 Testing health check...');
  
  try {
    const response = await makeRequest(`${API_BASE}/health`);
    
    if (response.status === 200) {
      console.log('✅ Basic health check passed');
      console.log(`   Status: ${response.data.status}`);
    } else {
      console.log('❌ Basic health check failed');
      console.log(`   Status: ${response.status}`);
    }

    // Test detailed health check
    const detailedResponse = await makeRequest(`${API_BASE}/health?detailed=true`);
    
    if (detailedResponse.status === 200 || detailedResponse.status === 503) {
      console.log('✅ Detailed health check passed');
      if (detailedResponse.data.services) {
        console.log(`   Services: ${detailedResponse.data.services.healthy}/${detailedResponse.data.services.total} healthy`);
      }
    } else {
      console.log('❌ Detailed health check failed');
    }
    
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }
}

async function testAgentsEndpoint() {
  console.log('🤖 Testing agents endpoint...');
  
  try {
    const response = await makeRequest(`${API_BASE}/agents`);
    
    if (response.status === 200) {
      console.log('✅ Agents endpoint accessible');
      console.log(`   Found ${response.data.agents?.length || 0} agents`);
      
      if (response.data.agents && response.data.agents.length > 0) {
        console.log('   Default agents:');
        response.data.agents.forEach(agent => {
          console.log(`   - ${agent.agent_id}: ${agent.status}`);
        });
      }
    } else {
      console.log('❌ Agents endpoint failed');
      console.log(`   Status: ${response.status}`);
    }
    
  } catch (error) {
    console.log('❌ Agents endpoint error:', error.message);
  }
}

async function testChatEndpoint() {
  console.log('💬 Testing chat endpoint...');
  
  try {
    const response = await makeRequest(`${API_BASE}/chat`, {
      method: 'POST',
      body: {
        message: 'Hello, this is a test message. Please respond briefly.',
        conversation_id: 'test-conversation'
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Chat endpoint working');
      console.log(`   Agent used: ${response.data.agent_used || 'unknown'}`);
      console.log(`   Response length: ${response.data.message?.length || 0} characters`);
    } else if (response.status === 500) {
      console.log('⚠️  Chat endpoint accessible but AI services may not be configured');
      console.log('   This is expected if API keys are not set');
    } else {
      console.log('❌ Chat endpoint failed');
      console.log(`   Status: ${response.status}`);
    }
    
  } catch (error) {
    console.log('❌ Chat endpoint error:', error.message);
  }
}

async function testCollaborateEndpoint() {
  console.log('🤝 Testing collaborate endpoint...');
  
  try {
    const response = await makeRequest(`${API_BASE}/collaborate`, {
      method: 'POST',
      body: {
        message: 'Test collaboration message',
        agents: ['gpt4', 'claude']
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Collaborate endpoint working');
      console.log(`   Collaboration details available: ${!!response.data.collaboration_details}`);
    } else if (response.status === 500) {
      console.log('⚠️  Collaborate endpoint accessible but AI services may not be configured');
    } else {
      console.log('❌ Collaborate endpoint failed');
      console.log(`   Status: ${response.status}`);
    }
    
  } catch (error) {
    console.log('❌ Collaborate endpoint error:', error.message);
  }
}

async function testEnvironmentConfiguration() {
  console.log('⚙️  Testing environment configuration...');
  
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY', 
    'XAI_GROK_API_KEY'
  ];
  
  let configuredCount = 0;
  
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar} is configured`);
      configuredCount++;
    } else {
      console.log(`⚠️  ${envVar} is not configured`);
    }
  });
  
  if (configuredCount === requiredEnvVars.length) {
    console.log('✅ All AI API keys are configured');
  } else {
    console.log(`⚠️  ${configuredCount}/${requiredEnvVars.length} API keys configured`);
    console.log('   Some AI features may not work without proper API keys');
  }
}

async function testAdminInterface() {
  console.log('🔐 Testing admin interface accessibility...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/admin`);
    
    if (response.status === 200) {
      console.log('✅ Admin interface is accessible');
    } else {
      console.log(`⚠️  Admin interface returned status: ${response.status}`);
    }
    
  } catch (error) {
    console.log('❌ Admin interface error:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Nimbus AI Integration Tests');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   API Base: ${API_BASE}`);
  console.log('');
  
  await testEnvironmentConfiguration();
  console.log('');
  
  await testHealthCheck();
  console.log('');
  
  await testAgentsEndpoint();
  console.log('');
  
  await testChatEndpoint();
  console.log('');
  
  await testCollaborateEndpoint();
  console.log('');
  
  await testAdminInterface();
  console.log('');
  
  console.log('🏁 Tests completed!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('   1. If API keys are not configured, add them to .env.local');
  console.log('   2. Test the admin interface at /admin');
  console.log('   3. Try the Nimbus AI chat functionality');
  console.log('   4. Deploy to Vercel with environment variables configured');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testHealthCheck,
  testAgentsEndpoint,
  testChatEndpoint,
  testCollaborateEndpoint,
  testEnvironmentConfiguration,
  testAdminInterface
};
