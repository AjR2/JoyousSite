// Vercel API Route for Tags
const fs = require('fs');
const path = require('path');

// Helper function to load posts
const loadPosts = () => {
  try {
    const postsPath = path.join(process.cwd(), 'public', 'posts.json');
    if (fs.existsSync(postsPath)) {
      const data = fs.readFileSync(postsPath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading posts:', error);
    return [];
  }
};

// Extract tags from posts
const getTags = (posts) => {
  const tagCounts = {};
  posts.forEach(post => {
    if (post.tags) {
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  
  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
};

module.exports = function handler(req, res) {
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
    const posts = loadPosts();
    const tags = getTags(posts);
    
    res.status(200).json({
      tags,
      total: tags.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Tags API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};
