// Simple test endpoint for Nimbus AI chat
module.exports = function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.json({
      message: "Test endpoint is working!",
      timestamp: new Date().toISOString(),
      environment: {
        openai_key_configured: !!process.env.OPENAI_API_KEY,
        anthropic_key_configured: !!process.env.ANTHROPIC_API_KEY,
        grok_key_configured: !!process.env.XAI_GROK_API_KEY
      }
    });
  }

  if (req.method === 'POST') {
    const { message } = req.body || {};
    
    return res.json({
      message: `Echo: ${message || 'No message provided'}`,
      original_message: message,
      timestamp: new Date().toISOString(),
      agent_used: 'test-echo',
      status: 'success'
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
