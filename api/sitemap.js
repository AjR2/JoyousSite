// Dynamic sitemap API endpoint
// Generates sitemap.xml on-demand with current blog posts

import { getAllPosts } from './utils/data.js';
import config from './utils/config.js';

// Static pages configuration
const STATIC_PAGES = [
  {
    url: '/',
    changefreq: 'weekly',
    priority: '1.0'
  },
  {
    url: '/blog',
    changefreq: 'daily',
    priority: '0.9'
  },
  {
    url: '/mindful-breaks',
    changefreq: 'weekly',
    priority: '0.8'
  },
  {
    url: '/contact',
    changefreq: 'monthly',
    priority: '0.7'
  }
];

// Helper function to create slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Helper function to format date for sitemap
function formatDate(dateString) {
  if (!dateString) return new Date().toISOString().split('T')[0];
  
  try {
    // Parse various date formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Try parsing "Month DD, YYYY" format
      const parts = dateString.match(/(\w+)\s+(\d+),\s+(\d+)/);
      if (parts) {
        const [, month, day, year] = parts;
        const monthNames = {
          'January': 0, 'February': 1, 'March': 2, 'April': 3,
          'May': 4, 'June': 5, 'July': 6, 'August': 7,
          'September': 8, 'October': 9, 'November': 10, 'December': 11
        };
        const parsedDate = new Date(year, monthNames[month], day);
        return parsedDate.toISOString().split('T')[0];
      }
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  } catch (error) {
    return new Date().toISOString().split('T')[0];
  }
}

// Generate sitemap XML
function generateSitemapXML(pages, baseUrl) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', config.cors.origin.join(', '));
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', config.cors.allowedHeaders.join(', '));
  
  // Set content type for XML
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  
  // Set caching headers (cache for 1 hour)
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=7200');
  res.setHeader('Last-Modified', new Date().toUTCString());

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get current timestamp for lastmod
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Create pages array starting with static pages
    const pages = STATIC_PAGES.map(page => ({
      ...page,
      lastmod: currentDate
    }));
    
    // Load blog posts
    const posts = await getAllPosts();
    
    // Add blog post pages
    posts.forEach(post => {
      const slug = createSlug(post.title);
      const lastmod = formatDate(post.date);
      
      pages.push({
        url: `/blog/${slug}`,
        changefreq: 'monthly',
        priority: '0.6',
        lastmod: lastmod
      });
    });
    
    // Generate sitemap XML
    const sitemapXML = generateSitemapXML(pages, config.baseUrl);
    
    // Return the sitemap
    res.status(200).send(sitemapXML);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ 
      error: 'Failed to generate sitemap',
      message: error.message 
    });
  }
}
