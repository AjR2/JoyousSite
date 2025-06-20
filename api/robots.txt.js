// Robots.txt API endpoint
// File: /api/robots.txt.js

import { generateRobotsTxt } from './sitemap.xml.js';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate robots.txt content
    const robotsTxt = generateRobotsTxt();
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=172800'); // 1 day browser, 2 days CDN
    
    return res.status(200).send(robotsTxt);
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    return res.status(500).send('User-agent: *\nDisallow:');
  }
}
