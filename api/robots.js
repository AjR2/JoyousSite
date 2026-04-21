// Dynamic robots.txt API endpoint
module.exports = function handler(req, res) {
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

  const robots = `# Enactive - theenactive.com
# robots.txt

User-agent: *
Allow: /

# Sitemap location
Sitemap: https://theenactive.com/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow admin and sensitive areas
Disallow: /admin/
Disallow: /admin
Disallow: /.env
Disallow: /api/

# Allow important pages explicitly
Allow: /contact/
Allow: /contact
Allow: /terms
Allow: /privacy
Allow: /cognitive-offload-sprint

# Block only search query URLs
Disallow: /search?
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

# AI crawlers — explicitly allowed
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: YouBot
Allow: /

User-agent: cohere-ai
Allow: /
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.status(200).send(robots);
};
