// Vercel API function to serve manifest.json
export default function handler(req, res) {
  // Set proper headers for manifest.json
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Return the manifest data
  const manifest = {
    "short_name": "Akeyreu",
    "name": "Akeyreu - Neural Technology & Mental Wellness",
    "description": "Akeyreu integrates advanced neural technologies with mental wellness practices, making technology-enhanced wellness accessible to everyone.",
    "icons": [
      {
        "src": "favicon.ico",
        "sizes": "64x64 32x32 24x24 16x16",
        "type": "image/x-icon"
      }
    ],
    "start_url": ".",
    "display": "standalone",
    "theme_color": "#000000",
    "background_color": "#ffffff",
    "orientation": "portrait-primary",
    "scope": "/",
    "lang": "en-US",
    "categories": ["health", "wellness", "technology"],
    "screenshots": []
  };

  res.status(200).json(manifest);
}
