// Sitemap XML API endpoint
// File: /api/sitemap.xml.js

import { getAllPosts, getAllCategories, getAllTags } from './utils/data.js';
import config from './utils/config.js';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all posts, categories, and tags
    const [posts, categories, tags] = await Promise.all([
      getAllPosts(),
      getAllCategories(),
      getAllTags()
    ]);
    
    // Generate sitemap XML
    const sitemapXml = generateSitemap(posts, categories, tags);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=7200'); // 1 hour browser, 2 hours CDN
    
    return res.status(200).send(sitemapXml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}

function generateSitemap(posts, categories, tags) {
  const siteUrl = config.baseUrl || 'https://www.akeyreu.com';
  const currentDate = new Date().toISOString();
  
  // Static pages
  const staticPages = [
    {
      url: siteUrl,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '1.0'
    },
    {
      url: `${siteUrl}/blog`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.9'
    },
    {
      url: `${siteUrl}/about`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      url: `${siteUrl}/contact`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.6'
    }
  ];

  // Blog posts
  const blogPosts = posts.map(post => {
    const postDate = new Date(post.date);
    const isRecent = (Date.now() - postDate.getTime()) < (30 * 24 * 60 * 60 * 1000); // 30 days
    
    return {
      url: `${siteUrl}/blog/${post.id}`,
      lastmod: postDate.toISOString(),
      changefreq: isRecent ? 'weekly' : 'monthly',
      priority: post.featured ? '0.8' : '0.7'
    };
  });

  // Category pages
  const categoryPages = categories.map(category => ({
    url: `${siteUrl}/blog?category=${encodeURIComponent(category)}`,
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: '0.6'
  }));

  // Tag pages
  const tagPages = tags.slice(0, 20).map(({ tag }) => ({ // Limit to top 20 tags
    url: `${siteUrl}/blog?tag=${encodeURIComponent(tag)}`,
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: '0.5'
  }));

  // Combine all URLs
  const allUrls = [...staticPages, ...blogPosts, ...categoryPages, ...tagPages];

  // Generate XML
  const urlEntries = allUrls.map(page => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urlEntries}
</urlset>`;
}

// Generate robots.txt content
export function generateRobotsTxt() {
  const siteUrl = config.baseUrl || 'https://www.akeyreu.com';
  
  return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${siteUrl}/api/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow admin areas (if any)
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Allow important directories
Allow: /blog/
Allow: /about/
Allow: /contact/

# Host directive
Host: ${siteUrl}`;
}
