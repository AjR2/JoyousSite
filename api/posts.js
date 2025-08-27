// Vercel API Route for Blog Posts
const fs = require('fs');
const path = require('path');

// Helper functions
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

const savePosts = (posts) => {
  try {
    const postsPath = path.join(process.cwd(), 'public', 'posts.json');
    const data = JSON.stringify(posts, null, 2);
    fs.writeFileSync(postsPath, data, 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving posts:', error);
    return false;
  }
};

module.exports = function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const posts = loadPosts();
      res.status(200).json(posts);
    } else if (req.method === 'POST') {
      const posts = loadPosts();
      const { title, content, author, categories, tags, featured } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          error: 'Title and content are required',
          timestamp: new Date().toISOString()
        });
      }

      // Generate ID from title
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Check if post with this ID already exists
      const existingPost = posts.find(post => post.id === id);
      if (existingPost) {
        return res.status(409).json({
          error: 'A post with this title already exists',
          timestamp: new Date().toISOString()
        });
      }

      // Create new post
      const newPost = {
        id,
        title,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        author: author || 'Akeyreu Team',
        categories: categories || [],
        tags: tags || [],
        summary: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
        featured: featured || false,
        readTime: Math.ceil(content.split(/\s+/).length / 200),
        content
      };

      // Add to beginning of posts array (newest first)
      posts.unshift(newPost);

      // Save to file
      if (savePosts(posts)) {
        return res.status(201).json({
          message: 'Post created successfully',
          post: newPost,
          timestamp: new Date().toISOString()
        });
      } else {
        return res.status(500).json({
          error: 'Failed to save post',
          timestamp: new Date().toISOString()
        });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}
