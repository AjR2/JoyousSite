/**
 * TikTok Analytics Connector (Stub)
 * To be implemented when TikTok API credentials are available
 */
const SocialConnector = require('./base');

class TikTokConnector extends SocialConnector {
  constructor(config = {}) {
    super(config);
    this.platform = 'tiktok';
    this.accessToken = config.accessToken || process.env.TIKTOK_ACCESS_TOKEN;
    this.accountId = config.accountId || process.env.TIKTOK_ACCOUNT_ID;
  }

  isConfigured() {
    return !!(this.accessToken && this.accountId);
  }

  async getDailyMetrics(params) {
    if (!this.isConfigured()) {
      throw new Error('TikTok connector not configured. Add TIKTOK_ACCESS_TOKEN and TIKTOK_ACCOUNT_ID.');
    }

    console.warn('TikTok connector is a stub. Implement TikTok API integration when credentials are available.');

    const { startDate, endDate } = params;
    const dates = this.getDateRange(startDate, endDate);

    return dates.map(date => this.normalize({}, date));
  }

  normalize(rawData, date) {
    return {
      date,
      platform: this.platform,
      account_id: this.accountId || 'not_configured',
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
      limitations: ['TikTok connector not yet implemented']
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
        message: 'TikTok connector not configured',
        details: {
          hasAccessToken: !!this.accessToken,
          hasAccountId: !!this.accountId
        }
      };
    }

    return {
      success: true,
      message: 'TikTok connector is a stub (not yet implemented)',
      isStub: true
    };
  }
}

module.exports = TikTokConnector;
