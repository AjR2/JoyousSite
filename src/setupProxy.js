const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

// For Node.js versions that don't have fetch built-in
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Load blog posts data
const loadPosts = () => {
  try {
    const postsPath = path.join(__dirname, '../public/posts.json');
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

// Save blog posts data
const savePosts = (posts) => {
  try {
    const postsPath = path.join(__dirname, '../public/posts.json');
    const data = JSON.stringify(posts, null, 2);
    fs.writeFileSync(postsPath, data, 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving posts:', error);
    return false;
  }
};

// Generate slug from title
const generateSlug = (title) => {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
};

// Estimate reading time
const estimateReadTime = (content) => {
  if (!content) return 1;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200);
};

// Generate summary from content
const generateSummary = (content, maxLength = 200) => {
  if (!content) return '';
  const plainText = content.replace(/\n/g, ' ').trim();
  if (plainText.length <= maxLength) return plainText;
  const lastSpace = plainText.lastIndexOf(' ', maxLength);
  return plainText.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
};

// Admin credentials from environment variables (with fallback for development)
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'dev-password-123'
};

// Extract categories from posts
const getCategories = (posts) => {
  const categories = new Set();
  posts.forEach(post => {
    if (post.categories) {
      post.categories.forEach(cat => categories.add(cat));
    }
  });
  return Array.from(categories).sort();
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

// Search posts
const searchPosts = (posts, query, filters = {}) => {
  let results = [...posts];
  
  // Apply category filter
  if (filters.category) {
    results = results.filter(post => 
      post.categories && post.categories.includes(filters.category)
    );
  }
  
  // Apply tag filter
  if (filters.tag) {
    results = results.filter(post => 
      post.tags && post.tags.includes(filters.tag)
    );
  }
  
  // Apply featured filter
  if (filters.featured !== undefined) {
    results = results.filter(post => post.featured === filters.featured);
  }
  
  // Apply text search
  if (query) {
    const searchTerm = query.toLowerCase();
    results = results.filter(post => {
      const searchableText = [
        post.title,
        post.summary,
        post.content,
        ...(post.categories || []),
        ...(post.tags || [])
      ].join(' ').toLowerCase();
      
      return searchableText.includes(searchTerm);
    });
  }
  
  return results;
};

// Generate RSS feed
const generateRSS = (posts) => {
  const baseUrl = 'http://localhost:3000';
  const rssItems = posts.slice(0, 20).map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.summary || ''}]]></description>
      <link>${baseUrl}/blog/${post.id}</link>
      <guid>${baseUrl}/blog/${post.id}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>noreply@akeyreu.com (${post.author || 'Akeyreu Team'})</author>
      ${post.categories ? post.categories.map(cat => `<category>${cat}</category>`).join('') : ''}
    </item>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Akeyreu Blog</title>
    <description>Mental wellness insights and neural technology updates</description>
    <link>${baseUrl}/blog</link>
    <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;
};

module.exports = function(app) {
  // Enable JSON parsing for POST requests
  app.use('/api', require('express').json());

  // Authentication endpoint
  app.post('/api/auth', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required',
        timestamp: new Date().toISOString()
      });
    }

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
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
  });

  // API Routes
  app.get('/api/posts', (req, res) => {
    const posts = loadPosts();
    res.json(posts);
  });

  // Create new post
  app.post('/api/posts', (req, res) => {
    const { title, content, author, categories, tags, featured } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Title and content are required',
        timestamp: new Date().toISOString()
      });
    }

    try {
      const posts = loadPosts();

      // Generate ID from title
      const id = generateSlug(title);

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
        summary: generateSummary(content),
        featured: featured || false,
        readTime: estimateReadTime(content),
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
    } catch (error) {
      console.error('Error creating post:', error);
      return res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  });

  app.get('/api/posts/:slug', (req, res) => {
    const posts = loadPosts();
    const post = posts.find(p => p.id === req.params.slug);
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  });

  // Update existing post
  app.put('/api/posts/:slug', (req, res) => {
    const { title, content, author, categories, tags, featured } = req.body;
    const slug = req.params.slug;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Title and content are required',
        timestamp: new Date().toISOString()
      });
    }

    try {
      const posts = loadPosts();
      const postIndex = posts.findIndex(post => post.id === slug);

      if (postIndex === -1) {
        return res.status(404).json({
          error: 'Post not found',
          timestamp: new Date().toISOString()
        });
      }

      // Update post with new data
      const updatedPost = {
        ...posts[postIndex],
        title,
        content,
        author: author || posts[postIndex].author,
        categories: categories || [],
        tags: tags || [],
        featured: featured || false,
        summary: generateSummary(content),
        readTime: estimateReadTime(content)
      };

      posts[postIndex] = updatedPost;

      // Save to file
      if (savePosts(posts)) {
        return res.status(200).json({
          message: 'Post updated successfully',
          post: updatedPost,
          timestamp: new Date().toISOString()
        });
      } else {
        return res.status(500).json({
          error: 'Failed to save post',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error updating post:', error);
      return res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Delete post
  app.delete('/api/posts/:slug', (req, res) => {
    const slug = req.params.slug;

    try {
      const posts = loadPosts();
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
    } catch (error) {
      console.error('Error deleting post:', error);
      return res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  });

  app.get('/api/categories', (req, res) => {
    const posts = loadPosts();
    const categories = getCategories(posts);
    res.json({ categories });
  });

  app.get('/api/tags', (req, res) => {
    const posts = loadPosts();
    const tags = getTags(posts);
    res.json({ tags });
  });

  app.get('/api/featured', (req, res) => {
    const posts = loadPosts();
    const featured = posts.filter(post => post.featured);
    res.json(featured);
  });

  app.get('/api/search', (req, res) => {
    const posts = loadPosts();
    const { q, category, tag, featured } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (tag) filters.tag = tag;
    if (featured !== undefined) filters.featured = featured === 'true';
    
    const results = searchPosts(posts, q, filters);
    res.json({ results, total: results.length, query: q, filters });
  });

  app.get('/api/rss', (req, res) => {
    const posts = loadPosts();
    const rss = generateRSS(posts);
    res.set('Content-Type', 'application/rss+xml');
    res.send(rss);
  });

  app.get('/api/feed.json', (req, res) => {
    const posts = loadPosts();
    const baseUrl = 'http://localhost:3000';
    
    const feed = {
      version: 'https://jsonfeed.org/version/1.1',
      title: 'Akeyreu Blog',
      description: 'Mental wellness insights and neural technology updates',
      home_page_url: `${baseUrl}/blog`,
      feed_url: `${baseUrl}/api/feed.json`,
      items: posts.slice(0, 20).map(post => ({
        id: `${baseUrl}/blog/${post.id}`,
        url: `${baseUrl}/blog/${post.id}`,
        title: post.title,
        content_html: post.content || '',
        summary: post.summary || '',
        date_published: new Date(post.date).toISOString(),
        author: {
          name: post.author || 'Akeyreu Team'
        },
        tags: post.tags || []
      }))
    };
    
    res.json(feed);
  });

  app.get('/api/sitemap.xml', (req, res) => {
    const posts = loadPosts();
    const baseUrl = 'http://localhost:3000';
    
    const urls = [
      { loc: baseUrl, priority: '1.0', changefreq: 'daily' },
      { loc: `${baseUrl}/blog`, priority: '0.9', changefreq: 'daily' },
      ...posts.map(post => ({
        loc: `${baseUrl}/blog/${post.id}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: new Date(post.date).toISOString().split('T')[0]
      }))
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <priority>${url.priority}</priority>
    <changefreq>${url.changefreq}</changefreq>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  app.get('/api/robots.txt', (req, res) => {
    const robots = `User-agent: *
Allow: /

Sitemap: http://localhost:3000/api/sitemap.xml`;

    res.set('Content-Type', 'text/plain');
    res.send(robots);
  });

  // =============================================================================
  // BLOG API ENDPOINTS
  // =============================================================================

  // Blog Analytics Endpoint
  app.get('/api/analytics', (req, res) => {
    const posts = loadPosts();
    const analytics = generateAnalytics(posts);

    res.json({
      ...analytics,
      timestamp: new Date().toISOString(),
      generated: true
    });
  });

  // Categories Endpoint
  app.get('/api/categories', (req, res) => {
    const posts = loadPosts();
    const categories = new Set();
    posts.forEach(post => {
      if (post.categories) {
        post.categories.forEach(cat => categories.add(cat));
      }
    });

    res.json({
      categories: Array.from(categories).sort(),
      total: categories.size,
      timestamp: new Date().toISOString()
    });
  });

  // Tags Endpoint
  app.get('/api/tags', (req, res) => {
    const posts = loadPosts();
    const tagCounts = {};
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const tags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      tags,
      total: tags.length,
      timestamp: new Date().toISOString()
    });
  });

  // =============================================================================
  // BLOG API ENDPOINTS
  // =============================================================================

  // Blog Analytics Endpoint
  app.get('/api/analytics', (req, res) => {
    const posts = loadPosts();
    const analytics = generateAnalytics(posts);

    res.json({
      ...analytics,
      timestamp: new Date().toISOString(),
      generated: true
    });
  });

  // Categories Endpoint
  app.get('/api/categories', (req, res) => {
    const posts = loadPosts();
    const categories = new Set();
    posts.forEach(post => {
      if (post.categories) {
        post.categories.forEach(cat => categories.add(cat));
      }
    });

    res.json({
      categories: Array.from(categories).sort(),
      total: categories.size,
      timestamp: new Date().toISOString()
    });
  });

  // Tags Endpoint
  app.get('/api/tags', (req, res) => {
    const posts = loadPosts();
    const tagCounts = {};
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const tags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      tags,
      total: tags.length,
      timestamp: new Date().toISOString()
    });
  });

  // =============================================================================
  // NIMBUS AI ENDPOINTS
  // =============================================================================

  // Nimbus AI Health Check
  app.get('/api/nimbus/health', (req, res) => {
    const { detailed } = req.query;

    const basicHealth = {
      status: 'healthy',
      service: 'nimbus-ai',
      version: '1.0.0',
      environment: 'development',
      timestamp: new Date().toISOString()
    };

    if (detailed !== 'true') {
      return res.json(basicHealth);
    }

    // Detailed health check
    const services = [
      {
        service: 'openai',
        status: process.env.OPENAI_API_KEY ? 'healthy' : 'unhealthy',
        response_time_ms: 150,
        last_checked: new Date().toISOString()
      },
      {
        service: 'claude',
        status: process.env.ANTHROPIC_API_KEY ? 'healthy' : 'unhealthy',
        response_time_ms: 200,
        last_checked: new Date().toISOString()
      },
      {
        service: 'grok',
        status: process.env.XAI_GROK_API_KEY ? 'healthy' : 'unhealthy',
        response_time_ms: 180,
        last_checked: new Date().toISOString()
      }
    ];

    const healthyCount = services.filter(s => s.status === 'healthy').length;

    res.json({
      ...basicHealth,
      status: healthyCount > 0 ? 'healthy' : 'unhealthy',
      services: {
        total: services.length,
        healthy: healthyCount,
        unhealthy: services.length - healthyCount,
        details: services
      },
      environment: {
        node_env: process.env.NODE_ENV || 'development',
        api_keys_configured: {
          openai: !!process.env.OPENAI_API_KEY,
          anthropic: !!process.env.ANTHROPIC_API_KEY,
          grok: !!process.env.XAI_GROK_API_KEY
        }
      }
    });
  });

  // Nimbus AI Agents Management
  app.get('/api/nimbus/agents', (req, res) => {
    const defaultAgents = [
      {
        agent_id: 'nimbus',
        description: 'Primary Nimbus AI assistant for general mental wellness support',
        inputs: ['text', 'conversation_context'],
        outputs: ['text', 'recommendations'],
        escalates_to_human: false,
        capabilities: ['mental_wellness_guidance', 'product_information', 'general_support'],
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        agent_id: 'sleep_specialist',
        description: 'Specialized agent for sleep-related queries and nAura product support',
        inputs: ['text', 'sleep_data', 'biometric_data'],
        outputs: ['text', 'sleep_recommendations', 'naura_insights'],
        escalates_to_human: false,
        capabilities: ['sleep_analysis', 'naura_support', 'sleep_hygiene_advice'],
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        agent_id: 'cognitive_wellness',
        description: 'Cognitive wellness specialist for Vza product and CBT support',
        inputs: ['text', 'mood_data', 'cognitive_assessments'],
        outputs: ['text', 'cbt_exercises', 'vza_recommendations'],
        escalates_to_human: true,
        capabilities: ['cbt_guidance', 'vza_support', 'cognitive_exercises'],
        status: 'active',
        created_at: new Date().toISOString()
      }
    ];

    res.json({
      agents: defaultAgents,
      total: defaultAgents.length,
      timestamp: new Date().toISOString()
    });
  });

  // Nimbus AI Chat Endpoint with Real AI Integration
  app.post('/api/nimbus/chat', async (req, res) => {
    const { message, agent_id, conversation_id } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string',
        timestamp: new Date().toISOString()
      });
    }

    // Check if any AI API keys are configured
    const hasApiKeys = !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.XAI_GROK_API_KEY);

    if (!hasApiKeys) {
      return res.json({
        message: "Hello! I'm Nimbus AI. I'm currently running in demo mode since no AI API keys are configured. To enable full AI functionality, please add your API keys to the environment variables.",
        conversation_id: conversation_id || `demo_${Date.now()}`,
        agent_used: 'demo',
        multi_agent_details: {
          selected_agent: agent_id || 'demo',
          agent_used: 'demo',
          fallback_used: false,
          demo_mode: true
        },
        timestamp: new Date().toISOString()
      });
    }

    try {
      // Select agent based on message content or specified agent_id
      const selectedAgent = agent_id || selectBestAgent(message);
      let response;
      let agentUsed;

      // Call the appropriate AI service
      switch (selectedAgent) {
        case 'claude':
          response = await callClaude(message);
          agentUsed = 'claude';
          break;
        case 'grok':
          response = await callGrok(message);
          agentUsed = 'grok';
          break;
        case 'gpt4':
        default:
          response = await callOpenAI(message);
          agentUsed = 'gpt4';
          break;
      }

      res.json({
        message: response,
        conversation_id: conversation_id || `conv_${Date.now()}`,
        agent_used: agentUsed,
        multi_agent_details: {
          selected_agent: selectedAgent,
          agent_used: agentUsed,
          fallback_used: false,
          reasoning: `Selected ${agentUsed} based on message content analysis`
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in Nimbus AI chat:', error);

      // Fallback to a simple response if AI fails
      res.json({
        message: "I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment. If the issue persists, it may be due to API rate limits or connectivity issues.",
        conversation_id: conversation_id || `error_${Date.now()}`,
        agent_used: 'fallback',
        multi_agent_details: {
          selected_agent: agent_id || 'gpt4',
          agent_used: 'fallback',
          fallback_used: true,
          error: error.message
        },
        timestamp: new Date().toISOString()
      });
    }
  });

  // =============================================================================
  // ANALYTICS HELPER FUNCTIONS
  // =============================================================================

  // Generate analytics data
  function generateAnalytics(posts) {
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
  }

  // =============================================================================
  // AI SERVICE FUNCTIONS
  // =============================================================================

  // Agent selection logic
  function selectBestAgent(message) {
    const lowerMessage = message.toLowerCase();

    // Sleep and wellness queries -> Claude (good for health topics)
    if (lowerMessage.includes('sleep') || lowerMessage.includes('naura') ||
        lowerMessage.includes('insomnia') || lowerMessage.includes('wellness') ||
        lowerMessage.includes('mental health') || lowerMessage.includes('anxiety')) {
      return 'claude';
    }

    // Creative, emotional, or conversational queries -> Grok
    if (lowerMessage.includes('feel') || lowerMessage.includes('mood') ||
        lowerMessage.includes('stress') || lowerMessage.includes('creative') ||
        lowerMessage.includes('fun') || lowerMessage.includes('joke')) {
      return 'grok';
    }

    // Technical, analytical, or general queries -> GPT-4
    return 'gpt4';
  }

  // OpenAI GPT-4 API call
  async function callOpenAI(message) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are Nimbus AI, an intelligent assistant for Akeyreu, a mental wellness technology company.
            You help users with mental wellness questions, provide information about Akeyreu's products (nAura for sleep analysis and Vza for cognitive wellness),
            and offer supportive guidance. Be empathetic, professional, and helpful. Keep responses concise but informative.`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Anthropic Claude API call
  async function callClaude(message) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `You are Nimbus AI, a mental wellness specialist for Akeyreu. Focus on providing thoughtful, evidence-based responses about mental wellness, sleep health, and cognitive wellness. Be empathetic and supportive.

User question: ${message}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  // xAI Grok API call
  async function callGrok(message) {
    const apiKey = process.env.XAI_GROK_API_KEY;
    if (!apiKey) {
      throw new Error('Grok API key not configured');
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-2-1212',
        messages: [
          {
            role: 'system',
            content: 'You are Nimbus AI for Akeyreu mental wellness company. Be creative, empathetic, and engaging while providing helpful mental wellness support. Use a warm, conversational tone.'
          },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Grok API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
};
