#!/usr/bin/env node

// Simple development server for testing the blog enhancements
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');

const PORT = 3000;

// Simple data functions for development
async function getAllPosts() {
  const postsData = await fs.readFile(path.join(__dirname, '..', 'public', 'posts.json'), 'utf8');
  return JSON.parse(postsData);
}

async function getPostBySlug(slug) {
  const posts = await getAllPosts();
  return posts.find(post => post.id === slug);
}

async function searchPosts(query = '', filters = {}) {
  const posts = await getAllPosts();
  let filteredPosts = posts;

  // Apply filters
  if (filters.category) {
    filteredPosts = filteredPosts.filter(post =>
      post.categories && post.categories.includes(filters.category)
    );
  }

  if (filters.tag) {
    filteredPosts = filteredPosts.filter(post =>
      post.tags && post.tags.includes(filters.tag)
    );
  }

  if (filters.featured !== undefined) {
    filteredPosts = filteredPosts.filter(post => post.featured === filters.featured);
  }

  // Apply text search
  if (query) {
    const searchTerm = query.toLowerCase();
    filteredPosts = filteredPosts.filter(post =>
      post.title.toLowerCase().includes(searchTerm) ||
      (post.content && post.content.toLowerCase().includes(searchTerm)) ||
      (post.summary && post.summary.toLowerCase().includes(searchTerm)) ||
      (post.categories && post.categories.some(cat => cat.toLowerCase().includes(searchTerm))) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  }

  return filteredPosts;
}

async function getAllCategories() {
  const posts = await getAllPosts();
  const categories = new Set();
  posts.forEach(post => {
    if (post.categories) {
      post.categories.forEach(cat => categories.add(cat));
    }
  });
  return Array.from(categories).sort();
}

async function getAllTags() {
  const posts = await getAllPosts();
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
}

async function getPostsByCategory(category) {
  const posts = await getAllPosts();
  return posts.filter(post =>
    post.categories && post.categories.includes(category)
  );
}

async function getPostsByTag(tag) {
  const posts = await getAllPosts();
  return posts.filter(post =>
    post.tags && post.tags.includes(tag)
  );
}

async function getFeaturedPosts() {
  const posts = await getAllPosts();
  return posts.filter(post => post.featured === true);
}

// Simple HTTP server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // API Routes
    if (pathname === '/api/posts') {
      const posts = await getAllPosts();
      const transformedPosts = posts.map(post => ({
        ...post,
        content: undefined // Exclude content for list view
      }));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(transformedPosts));
      return;
    }

    if (pathname.startsWith('/api/posts/')) {
      const slug = pathname.split('/')[3];
      const post = await getPostBySlug(slug);

      if (!post) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Post not found' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(post));
      return;
    }

    if (pathname === '/api/search') {
      const { q, category, tag, featured } = query;

      const filters = {};
      if (category) filters.category = category;
      if (tag) filters.tag = tag;
      if (featured !== undefined) filters.featured = featured === 'true';

      const posts = await searchPosts(q || '', filters);
      const transformedPosts = posts.map(post => ({
        ...post,
        content: undefined
      }));

      const result = {
        query: q || '',
        filters,
        results: transformedPosts,
        count: transformedPosts.length,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (pathname === '/api/categories') {
      const categories = await getAllCategories();
      const result = {
        categories,
        count: categories.length,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (pathname === '/api/tags') {
      const tags = await getAllTags();
      const result = {
        tags,
        count: tags.length,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (pathname === '/api/featured') {
      const posts = await getFeaturedPosts();
      const transformedPosts = posts.map(post => ({
        ...post,
        content: undefined
      }));

      const result = {
        posts: transformedPosts,
        count: transformedPosts.length,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (pathname === '/api/rss') {
      const posts = await getAllPosts();
      const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

      const rssItems = sortedPosts.slice(0, 20).map(post => `
    <item>
      <title>${post.title}</title>
      <link>http://localhost:${PORT}/blog/${post.id}</link>
      <guid>http://localhost:${PORT}/blog/${post.id}</guid>
      <description>${post.summary || 'Read more...'}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`).join('');

      const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Akeyreu Blog</title>
    <link>http://localhost:${PORT}/blog</link>
    <description>Mental wellness insights and neural technology updates</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;

      res.writeHead(200, { 'Content-Type': 'application/rss+xml' });
      res.end(rssXml);
      return;
    }

    // Serve static files
    if (pathname.startsWith('/favicon') || pathname.endsWith('.css') || pathname.endsWith('.js') || pathname.endsWith('.png') || pathname.endsWith('.jpg') || pathname.endsWith('.ico')) {
      try {
        const filePath = path.join(__dirname, '..', 'public', pathname);
        const content = await fs.readFile(filePath);

        let contentType = 'text/plain';
        if (pathname.endsWith('.css')) contentType = 'text/css';
        if (pathname.endsWith('.js')) contentType = 'application/javascript';
        if (pathname.endsWith('.png')) contentType = 'image/png';
        if (pathname.endsWith('.jpg')) contentType = 'image/jpeg';
        if (pathname.endsWith('.ico')) contentType = 'image/x-icon';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
        return;
      } catch (err) {
        // File not found, continue to serve index.html
      }
    }

    // Serve index.html for all other routes (SPA)
    const indexPath = path.join(__dirname, '..', 'public', 'index.html');
    const indexContent = await fs.readFile(indexPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(indexContent);

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Development server running at http://localhost:${PORT}`);
  console.log(`📝 Blog available at http://localhost:${PORT}/blog`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api/*`);
  console.log(`📡 RSS feed available at http://localhost:${PORT}/api/rss`);
  console.log('\n✨ Test the following features:');
  console.log('   - Enhanced blog with search and filters');
  console.log('   - Categories and tags functionality');
  console.log('   - Social sharing (copy link will work)');
  console.log('   - Related posts algorithm');
  console.log('   - RSS feed generation');
  console.log('\n🛑 To stop the server, press Ctrl+C');
});

module.exports = server;
