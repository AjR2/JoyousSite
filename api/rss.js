// RSS Feed API endpoint
// File: /api/rss.js

import { getAllPosts } from './utils/data.js';
import config from './utils/config.js';

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
    
    // Take only the latest 20 posts for the feed
    const feedPosts = sortedPosts.slice(0, 20);
    
    // Generate RSS XML
    const rssXml = generateRSSFeed(feedPosts);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=7200'); // 1 hour browser, 2 hours CDN
    
    return res.status(200).send(rssXml);
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return res.status(500).json({ error: 'Failed to generate RSS feed' });
  }
}

function generateRSSFeed(posts) {
  const siteUrl = config.baseUrl || 'https://www.akeyreu.com';
  const feedUrl = `${siteUrl}/api/rss`;
  const currentDate = new Date().toUTCString();
  
  // Escape XML special characters
  const escapeXml = (str) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // Convert markdown to plain text for description
  const markdownToText = (markdown) => {
    if (!markdown) return '';
    return markdown
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/>\s+/g, '') // Remove blockquotes
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
  };

  const rssItems = posts.map(post => {
    const postUrl = `${siteUrl}/blog/${post.id}`;
    const pubDate = new Date(post.date).toUTCString();
    const description = escapeXml(post.summary || markdownToText(post.content).substring(0, 300) + '...');
    const title = escapeXml(post.title);
    const author = escapeXml(post.author || 'Akeyreu Team');
    
    // Generate categories XML
    const categoriesXml = post.categories ? 
      post.categories.map(cat => `<category>${escapeXml(cat)}</category>`).join('\n      ') : '';
    
    return `
    <item>
      <title>${title}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <author>noreply@akeyreu.com (${author})</author>
      ${categoriesXml}
      ${post.tags ? post.tags.map(tag => `<category>${escapeXml(tag)}</category>`).join('\n      ') : ''}
      <source url="${feedUrl}">Akeyreu Blog</source>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Akeyreu Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Mental wellness insights and neural technology updates from Akeyreu. Discover articles on mindfulness, personal development, relationships, and cutting-edge wellness technology.</description>
    <language>en-us</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <pubDate>${currentDate}</pubDate>
    <ttl>60</ttl>
    <image>
      <url>${siteUrl}/favicon.ico</url>
      <title>Akeyreu Blog</title>
      <link>${siteUrl}/blog</link>
      <width>32</width>
      <height>32</height>
    </image>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <managingEditor>noreply@akeyreu.com (Akeyreu Team)</managingEditor>
    <webMaster>noreply@akeyreu.com (Akeyreu Team)</webMaster>
    <category>Mental Health</category>
    <category>Personal Development</category>
    <category>Technology</category>
    <category>Wellness</category>
    <copyright>Copyright ${new Date().getFullYear()} Akeyreu. All rights reserved.</copyright>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <generator>Akeyreu Blog RSS Generator</generator>
    ${rssItems}
  </channel>
</rss>`;
}

// Alternative JSON Feed format
export async function generateJSONFeed(posts) {
  const siteUrl = config.baseUrl || 'https://www.akeyreu.com';
  
  const feedItems = posts.slice(0, 20).map(post => ({
    id: `${siteUrl}/blog/${post.id}`,
    url: `${siteUrl}/blog/${post.id}`,
    title: post.title,
    content_html: post.content ? post.content.replace(/\n/g, '<br>') : '',
    content_text: post.summary || post.content?.substring(0, 300) + '...',
    summary: post.summary,
    date_published: new Date(post.date).toISOString(),
    date_modified: new Date(post.date).toISOString(),
    author: {
      name: post.author || 'Akeyreu Team'
    },
    tags: [...(post.categories || []), ...(post.tags || [])],
    _akeyreu: {
      read_time: post.readTime,
      featured: post.featured,
      categories: post.categories,
      tags: post.tags
    }
  }));

  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Akeyreu Blog',
    home_page_url: `${siteUrl}/blog`,
    feed_url: `${siteUrl}/api/feed.json`,
    description: 'Mental wellness insights and neural technology updates from Akeyreu',
    icon: `${siteUrl}/favicon.ico`,
    favicon: `${siteUrl}/favicon.ico`,
    language: 'en-US',
    authors: [
      {
        name: 'Akeyreu Team',
        url: siteUrl
      }
    ],
    items: feedItems
  };
}
