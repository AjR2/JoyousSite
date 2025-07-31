// Nimbus AI Health Check API endpoint for Vercel
// File: /api/nimbus/health.js

import { securityMiddleware } from '../utils/security.js';
import config from '../utils/config.js';

// Health check utilities
async function checkAPIService(name, testFunction) {
  try {
    const startTime = Date.now();
    await testFunction();
    const responseTime = Date.now() - startTime;
    return {
      service: name,
      status: 'healthy',
      response_time_ms: responseTime,
      last_checked: new Date().toISOString()
    };
  } catch (error) {
    return {
      service: name,
      status: 'unhealthy',
      error: error.message,
      last_checked: new Date().toISOString()
    };
  }
}

async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/models', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return true;
}

async function testClaude() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  // Claude doesn't have a simple health endpoint, so we'll just check if the key exists
  // In a real implementation, you might want to make a minimal API call
  return true;
}

async function testGrok() {
  const apiKey = process.env.XAI_GROK_API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  // Similar to Claude, just check if key exists
  // In production, you might want to test with a minimal API call
  return true;
}

export default async function handler(req, res) {
  // Apply security middleware
  const securityResult = securityMiddleware(req, res, {
    allowedMethods: ['GET', 'OPTIONS'],
    requireOrigin: false, // Health checks should be accessible
    environment: config.environment
  });

  if (securityResult && securityResult.error) {
    return res.status(securityResult.status).json({
      error: securityResult.error,
      timestamp: new Date().toISOString()
    });
  }

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const { detailed } = req.query;
    const startTime = Date.now();

    // Basic health check
    const basicHealth = {
      status: 'healthy',
      service: 'nimbus-ai',
      version: '1.0.0',
      environment: config.environment,
      timestamp: new Date().toISOString(),
      uptime_ms: Date.now() - startTime
    };

    // If detailed health check is not requested, return basic info
    if (!detailed || detailed !== 'true') {
      return res.status(200).json(basicHealth);
    }

    // Detailed health check - test all AI services
    const serviceChecks = await Promise.allSettled([
      checkAPIService('openai', testOpenAI),
      checkAPIService('claude', testClaude),
      checkAPIService('grok', testGrok)
    ]);

    const services = serviceChecks.map(result => 
      result.status === 'fulfilled' ? result.value : {
        service: 'unknown',
        status: 'error',
        error: result.reason?.message || 'Unknown error'
      }
    );

    // Determine overall health
    const healthyServices = services.filter(s => s.status === 'healthy').length;
    const totalServices = services.length;
    const overallStatus = healthyServices > 0 ? 'healthy' : 'unhealthy';

    // Environment checks
    const environmentChecks = {
      node_env: process.env.NODE_ENV || 'unknown',
      vercel_env: process.env.VERCEL_ENV || 'unknown',
      api_keys_configured: {
        openai: !!process.env.OPENAI_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        grok: !!process.env.XAI_GROK_API_KEY
      }
    };

    // System information
    const systemInfo = {
      memory_usage: process.memoryUsage(),
      platform: process.platform,
      node_version: process.version,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    const detailedHealth = {
      ...basicHealth,
      status: overallStatus,
      services: {
        total: totalServices,
        healthy: healthyServices,
        unhealthy: totalServices - healthyServices,
        details: services
      },
      environment: environmentChecks,
      system: systemInfo,
      response_time_ms: Date.now() - startTime
    };

    // Return appropriate status code
    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    return res.status(statusCode).json(detailedHealth);

  } catch (error) {
    console.error('Error in /api/nimbus/health:', error);
    return res.status(500).json({
      status: 'error',
      service: 'nimbus-ai',
      error: 'Health check failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
}
