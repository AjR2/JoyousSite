// Dynamic robots.txt API endpoint
module.exports = function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the base URL from the request headers
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.yourjoyousmind.com';
  const baseUrl = `${protocol}://${host}`;

  const robots = `# Joyous - ${host}
# robots.txt

User-agent: *
Allow: /

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow admin and sensitive areas
Disallow: /admin/
Disallow: /admin
Disallow: /.env
Disallow: /api/

# Allow important pages explicitly
Allow: /blog/
Allow: /blog
Allow: /mindful-breaks/
Allow: /mindful-breaks
Allow: /contact/
Allow: /contact
Allow: /terms
Allow: /privacy

# Block common bot traps
Disallow: /*?*
Disallow: /*#*

# Social media crawlers - full access
User-agent: facebookexternalhit
Allow: /

User-agent: facebookexternalhit/1.1
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: Pinterest
Allow: /

# Google crawlers
User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Googlebot-News
Allow: /

# Bing crawler
User-agent: Bingbot
Allow: /
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.status(200).send(robots);
};
