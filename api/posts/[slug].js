// Enhanced API endpoint for individual post CRUD operations
// File: /api/posts/[slug].js

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

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { slug } = req.query;

  try {
    const posts = loadPosts();

    if (req.method === 'GET') {
      const post = posts.find(p => p.id === slug);
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ error: 'Post not found' });
      }
    } else if (req.method === 'DELETE') {
      const postIndex = posts.findIndex(post => post.id === slug);

      if (postIndex === -1) {
        return res.status(404).json({
          error: 'Post not found',
          timestamp: new Date().toISOString()
        });
      }

      // Remove post from array
      const deletedPost = posts.splice(postIndex, 1)[0];

      // Save to file
      if (savePosts(posts)) {
        return res.status(200).json({
          message: 'Post deleted successfully',
          deletedPost: {
            id: deletedPost.id,
            title: deletedPost.title
          },
          timestamp: new Date().toISOString()
        });
      } else {
        return res.status(500).json({
          error: 'Failed to save changes',
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
