// Consolidated Feeds API endpoint - handles both RSS and JSON feeds
// File: /api/feeds.js

import { getAllPosts, transformPostToApiFormat } from './utils/data.js';
import config from './utils/config.js';
import { securityMiddleware } from './utils/security.js';

// Generate RSS XML feed
function generateRSSFeed(posts, baseUrl) {
  const rssItems = posts.slice(0, 20).map(post => {
    const postUrl = `${baseUrl}/blog/${createSlug(post.title)}`;
    const pubDate = post.date ? new Date(post.date).toUTCString() : new Date().toUTCString();
    
    return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.summary || post.content?.substring(0, 200) + '...' || ''}]]></description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[Mental Wellness]]></category>
      ${post.tags ? post.tags.map(tag => `<category><![CDATA[${tag}]]></category>`).join('') : ''}
    </item>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Akeyreu Blog</title>
    <description>Mental wellness insights, neural technology updates, and cognitive health tips from Akeyreu</description>
    <link>${baseUrl}/blog</link>
    <atom:link href="${baseUrl}/api/feeds?format=rss" rel="self" type="application/rss+xml"/>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>contact@akeyreu.com (Akeyreu Team)</managingEditor>
    <webMaster>contact@akeyreu.com (Akeyreu Team)</webMaster>
    <category>Mental Wellness</category>
    <category>Neural Technology</category>
    <category>Cognitive Health</category>
    <ttl>60</ttl>
    <image>
      <url>${baseUrl}/assets/logo.png</url>
      <title>Akeyreu Blog</title>
      <link>${baseUrl}/blog</link>
      <width>144</width>
      <height>144</height>
    </image>
    ${rssItems}
  </channel>
</rss>`;
}

// Generate JSON feed
function generateJSONFeed(posts, baseUrl) {
  const feedItems = posts.slice(0, 20).map(post => {
    const postUrl = `${baseUrl}/blog/${createSlug(post.title)}`;
    
    return {
      id: postUrl,
      url: postUrl,
      title: post.title,
      content_html: post.content || '',
      content_text: post.summary || post.content?.replace(/<[^>]*>/g, '').substring(0, 200) + '...' || '',
      summary: post.summary || '',
      date_published: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
      date_modified: post.dateModified ? new Date(post.dateModified).toISOString() : (post.date ? new Date(post.date).toISOString() : new Date().toISOString()),
      author: {
        name: 'Akeyreu Team',
        url: baseUrl
      },
      tags: post.tags || ['Mental Wellness', 'Neural Technology']
    };
  });

  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Akeyreu Blog',
    description: 'Mental wellness insights, neural technology updates, and cognitive health tips from Akeyreu',
    home_page_url: `${baseUrl}/blog`,
    feed_url: `${baseUrl}/api/feeds?format=json`,
    language: 'en-US',
    author: {
      name: 'Akeyreu Team',
      url: baseUrl
    },
    icon: `${baseUrl}/assets/logo.png`,
    favicon: `${baseUrl}/favicon.ico`,
    items: feedItems
  };
}

// Helper function to create slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default async function handler(req, res) {
  // Apply security middleware
  const securityResult = securityMiddleware(req, res);
  if (!securityResult.allowed) {
    return res.status(securityResult.status).json({ 
      error: securityResult.message,
      timestamp: new Date().toISOString()
    });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', config.cors.origin.join(', '));
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', config.cors.allowedHeaders.join(', '));

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const { format = 'rss' } = req.query;
    const baseUrl = config.baseUrl;

    // Get all posts
    const posts = await getAllPosts();
    
    // Sort posts by date (newest first)
    const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (format === 'json') {
      // Generate JSON feed
      const jsonFeed = generateJSONFeed(sortedPosts, baseUrl);
      
      // Set appropriate headers
      res.setHeader('Content-Type', 'application/feed+json; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600'); // 30 min browser, 1 hour CDN
      res.setHeader('Last-Modified', new Date().toUTCString());
      
      return res.status(200).json(jsonFeed);
    } else {
      // Generate RSS feed (default)
      const rssFeed = generateRSSFeed(sortedPosts, baseUrl);
      
      // Set appropriate headers
      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=3600'); // 30 min browser, 1 hour CDN
      res.setHeader('Last-Modified', new Date().toUTCString());
      
      return res.status(200).send(rssFeed);
    }
  } catch (error) {
    console.error('Error generating feed:', error);
    return res.status(500).json({ 
      error: 'Failed to generate feed',
      timestamp: new Date().toISOString()
    });
  }
}
