#!/usr/bin/env node

// Dynamic sitemap generation script
// Generates sitemap.xml based on static pages and blog posts

const fs = require('fs').promises;
const path = require('path');

const POSTS_FILE = path.join(__dirname, '..', 'public', 'posts.json');
const SITEMAP_FILE = path.join(__dirname, '..', 'public', 'sitemap.xml');
const BASE_URL = 'https://www.akeyreu.com';

// Static pages configuration
const STATIC_PAGES = [
  {
    url: '/',
    changefreq: 'weekly',
    priority: '1.0',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/blog',
    changefreq: 'daily',
    priority: '0.9',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/mindful-breaks',
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/contact',
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: new Date().toISOString().split('T')[0]
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

// Load blog posts
async function loadBlogPosts() {
  try {
    const data = await fs.readFile(POSTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading blog posts:', error.message);
    return [];
  }
}

// Generate sitemap XML
function generateSitemapXML(pages) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${pages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
}

// Generate robots.txt
function generateRobotsTxt() {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow admin areas (if any)
Disallow: /admin/
Disallow: /.env
Disallow: /api/

# Allow important pages
Allow: /blog/
Allow: /mindful-breaks/
Allow: /contact/

# Block common bot traps
Disallow: /*?*
Disallow: /*#*
Disallow: /*.json$
Disallow: /*.xml$
Disallow: /*.txt$

# Social media crawlers
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /`;
}

// Main function
async function generateSitemap() {
  console.log('🗺️  Generating sitemap...');
  
  try {
    // Load blog posts
    const posts = await loadBlogPosts();
    console.log(`   ✓ Found ${posts.length} blog posts`);
    
    // Create pages array starting with static pages
    const pages = [...STATIC_PAGES];
    
    // Add blog post pages
    posts.forEach(post => {
      const slug = createSlug(post.title);
      const lastmod = formatDate(post.date);
      
      pages.push({
        url: `${BASE_URL}/blog/${slug}`,
        changefreq: 'monthly',
        priority: '0.6',
        lastmod: lastmod
      });
    });
    
    console.log(`   ✓ Generated ${pages.length} total pages`);
    
    // Generate sitemap XML
    const sitemapXML = generateSitemapXML(pages);
    
    // Write sitemap file
    await fs.writeFile(SITEMAP_FILE, sitemapXML, 'utf8');
    console.log(`   ✓ Sitemap written to ${SITEMAP_FILE}`);
    
    // Generate and write robots.txt
    const robotsTxt = generateRobotsTxt();
    const robotsFile = path.join(__dirname, '..', 'public', 'robots.txt');
    await fs.writeFile(robotsFile, robotsTxt, 'utf8');
    console.log(`   ✓ Robots.txt written to ${robotsFile}`);
    
    // Generate sitemap index if needed (for large sites)
    if (pages.length > 1000) {
      console.log('   ⚠️  Large sitemap detected, consider splitting into multiple sitemaps');
    }
    
    console.log('🎉 Sitemap generation complete!');
    
    // Output summary
    console.log('\n📊 Sitemap Summary:');
    console.log(`   • Total URLs: ${pages.length}`);
    console.log(`   • Static pages: ${STATIC_PAGES.length}`);
    console.log(`   • Blog posts: ${posts.length}`);
    console.log(`   • Base URL: ${BASE_URL}`);
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    process.exit(1);
  }
}

// CLI interface
if (require.main === module) {
  generateSitemap();
}

module.exports = {
  generateSitemap,
  createSlug,
  formatDate
};
