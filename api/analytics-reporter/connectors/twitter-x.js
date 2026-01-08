/**
 * Twitter/X Analytics Connector (Stub)
 * To be implemented when X API credentials are available
 */
const SocialConnector = require('./base');

class TwitterXConnector extends SocialConnector {
  constructor(config = {}) {
    super(config);
    this.platform = 'twitter_x';
    this.bearerToken = config.bearerToken || process.env.TWITTER_BEARER_TOKEN;
    this.userId = config.userId || process.env.TWITTER_USER_ID;
  }

  isConfigured() {
    return !!(this.bearerToken && this.userId);
  }

  async getDailyMetrics(params) {
    if (!this.isConfigured()) {
      throw new Error('Twitter/X connector not configured. Add TWITTER_BEARER_TOKEN and TWITTER_USER_ID.');
    }

    // Stub implementation - returns mock data
    console.warn('Twitter/X connector is a stub. Implement API integration when credentials are available.');

    const { startDate, endDate } = params;
    const dates = this.getDateRange(startDate, endDate);

    return dates.map(date => this.normalize({}, date));
  }

  normalize(rawData, date) {
    return {
      date,
      platform: this.platform,
      account_id: this.userId || 'not_configured',
      account_handle: '@placeholder',
      metrics: {
        impressions: 0,
        views: 0,
        watch_time_minutes: null,
        likes: 0,
        comments: 0,
        shares: 0,
        followers_delta: 0,
        clicks: 0,
        engagement_rate: 0
      },
      derived: {
        engagement_rate: 0,
        ctr: 0,
        view_velocity: 0
      },
      raw_payload: rawData,
      data_source: 'stub',
      limitations: ['Twitter/X connector not yet implemented']
    };
  }

  getDateRange(startDate, endDate) {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    let current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  async testConnection() {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Twitter/X connector not configured',
        details: {
          hasBearerToken: !!this.bearerToken,
          hasUserId: !!this.userId
        }
      };
    }

    return {
      success: true,
      message: 'Twitter/X connector is a stub (not yet implemented)',
      isStub: true
    };
  }
}

module.exports = TwitterXConnector;
