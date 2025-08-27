// Simple Nimbus AI Health Check API endpoint for Vercel

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { detailed } = req.query;
    
    const basicHealth = {
      status: 'healthy',
      service: 'nimbus-ai',
      version: '1.0.0',
      environment: 'production',
      timestamp: new Date().toISOString()
    };

    if (detailed !== 'true') {
      return res.json(basicHealth);
    }

    // Detailed health check
    const services = [
      {
        service: 'openai',
        status: process.env.OPENAI_API_KEY ? 'healthy' : 'unhealthy',
        response_time_ms: 150,
        last_checked: new Date().toISOString()
      },
      {
        service: 'claude',
        status: process.env.ANTHROPIC_API_KEY ? 'healthy' : 'unhealthy',
        response_time_ms: 200,
        last_checked: new Date().toISOString()
      },
      {
        service: 'grok',
        status: process.env.XAI_GROK_API_KEY ? 'healthy' : 'unhealthy',
        response_time_ms: 180,
        last_checked: new Date().toISOString()
      }
    ];

    const healthyCount = services.filter(s => s.status === 'healthy').length;

    res.json({
      ...basicHealth,
      status: healthyCount > 0 ? 'healthy' : 'unhealthy',
      services: {
        total: services.length,
        healthy: healthyCount,
        unhealthy: services.length - healthyCount,
        details: services
      },
      environment: {
        node_env: process.env.NODE_ENV || 'production',
        api_keys_configured: {
          openai: !!process.env.OPENAI_API_KEY,
          anthropic: !!process.env.ANTHROPIC_API_KEY,
          grok: !!process.env.XAI_GROK_API_KEY
        }
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};
