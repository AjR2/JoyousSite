// Simple test endpoint to verify Vercel API deployment
module.exports = function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    deployment: 'FORCE_REBUILD_20241231',
    version: '1.0.1',
    environment: process.env.NODE_ENV || 'production',
    vercel_working: true
  });
};
