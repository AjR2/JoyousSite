// Authentication endpoint for admin login
module.exports = function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: 'Username and password are required',
      timestamp: new Date().toISOString()
    });
  }

  // Get credentials from environment variables
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.error('Admin credentials not configured in environment variables');
    return res.status(500).json({
      error: 'Server configuration error',
      timestamp: new Date().toISOString()
    });
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');

    return res.status(200).json({
      success: true,
      token,
      message: 'Authentication successful',
      timestamp: new Date().toISOString()
    });
  } else {
    return res.status(401).json({
      error: 'Invalid credentials',
      timestamp: new Date().toISOString()
    });
  }
};

