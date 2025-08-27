// Vercel API Route for Analytics
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

// Generate analytics data
const generateAnalytics = (posts) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Recent posts (last 30 days)
  const recentPosts = posts.filter(post => {
    const postDate = new Date(post.date);
    return postDate >= thirtyDaysAgo;
  });

  // Category distribution
  const categoryStats = {};
  posts.forEach(post => {
    if (post.categories) {
      post.categories.forEach(category => {
        categoryStats[category] = (categoryStats[category] || 0) + 1;
      });
    }
  });

  // Tag distribution
  const tagStats = {};
  posts.forEach(post => {
    if (post.tags) {
      post.tags.forEach(tag => {
        tagStats[tag] = (tagStats[tag] || 0) + 1;
      });
    }
  });

  // Monthly post distribution (last 12 months)
  const monthlyStats = {};
  const twelveMonthsAgo = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
  
  posts.forEach(post => {
    const postDate = new Date(post.date);
    if (postDate >= twelveMonthsAgo) {
      const monthKey = postDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1;
    }
  });

  return {
    overview: {
      totalPosts: posts.length,
      recentPosts: recentPosts.length,
      featuredPosts: posts.filter(post => post.featured).length,
      totalCategories: Object.keys(categoryStats).length,
      totalTags: Object.keys(tagStats).length,
      averageReadTime: posts.length > 0 ? 
        Math.round(posts.reduce((sum, post) => sum + (post.readTime || 5), 0) / posts.length) : 0
    },
    categories: Object.entries(categoryStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    tags: Object.entries(tagStats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15),
    monthlyPosts: Object.entries(monthlyStats)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month + ' 1') - new Date(b.month + ' 1')),
    recentActivity: recentPosts
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(post => ({
        id: post.id,
        title: post.title,
        date: post.date,
        author: post.author,
        categories: post.categories || []
      }))
  };
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
    const analytics = generateAnalytics(posts);
    
    res.status(200).json({
      ...analytics,
      timestamp: new Date().toISOString(),
      generated: true
    });
  } catch (error) {
    console.error('Analytics API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}
