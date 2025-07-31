// Simple robots.txt API endpoint
module.exports = function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const robots = `User-agent: *
Allow: /

Sitemap: https://www.akeyreu.com/api/sitemap.xml`;
  
  res.setHeader('Content-Type', 'text/plain');
  res.send(robots);
};
