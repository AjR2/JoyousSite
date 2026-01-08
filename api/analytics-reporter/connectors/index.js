/**
 * Social Media Connectors Export
 */
const SocialConnector = require('./base');
const YouTubeConnector = require('./youtube');
const TwitterXConnector = require('./twitter-x');
const InstagramConnector = require('./instagram');
const TikTokConnector = require('./tiktok');

/**
 * Create connector instance based on platform
 */
function createConnector(platform, config = {}) {
  switch (platform.toLowerCase()) {
    case 'youtube':
      return new YouTubeConnector(config);
    case 'twitter':
    case 'twitter_x':
    case 'x':
      return new TwitterXConnector(config);
    case 'instagram':
      return new InstagramConnector(config);
    case 'tiktok':
      return new TikTokConnector(config);
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

/**
 * Get all available connectors
 */
function getAllConnectors(config = {}) {
  return {
    youtube: new YouTubeConnector(config.youtube || {}),
    twitter_x: new TwitterXConnector(config.twitter_x || {}),
    instagram: new InstagramConnector(config.instagram || {}),
    tiktok: new TikTokConnector(config.tiktok || {})
  };
}

/**
 * Test all configured connectors
 */
async function testAllConnectors(config = {}) {
  const connectors = getAllConnectors(config);
  const results = {};

  for (const [platform, connector] of Object.entries(connectors)) {
    results[platform] = await connector.testConnection();
  }

  return results;
}

module.exports = {
  SocialConnector,
  YouTubeConnector,
  TwitterXConnector,
  InstagramConnector,
  TikTokConnector,
  createConnector,
  getAllConnectors,
  testAllConnectors
};
