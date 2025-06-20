const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const path = require('path');

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
  // API Routes
  app.get('/api/posts', (req, res) => {
    const posts = loadPosts();
    res.json(posts);
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
};
