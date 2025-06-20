// JSON Feed API endpoint
// File: /api/feed.json.js

import { getAllPosts } from './utils/data.js';
import { generateJSONFeed } from './rss.js';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all posts
    const posts = await getAllPosts();
    
    // Sort posts by date (newest first)
    const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Generate JSON feed
    const jsonFeed = await generateJSONFeed(sortedPosts);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/feed+json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=7200'); // 1 hour browser, 2 hours CDN
    
    return res.status(200).json(jsonFeed);
  } catch (error) {
    console.error('Error generating JSON feed:', error);
    return res.status(500).json({ error: 'Failed to generate JSON feed' });
  }
}
