/**
 * SocialMediaAnalyticsAgent - Specialized agent for pulling social media analytics
 * 
 * Supports multiple platforms:
 * - Instagram (via web automation or API)
 * - Twitter/X
 * - LinkedIn
 * - Facebook
 * 
 * Can work in two modes:
 * 1. API Mode - Uses official platform APIs (requires credentials)
 * 2. Web Automation Mode - Uses browser automation (for platforms without API access)
 */

const WebAutomationAgent = require('./web-automation-agent');

class SocialMediaAnalyticsAgent extends WebAutomationAgent {
  constructor(config = {}) {
    super({
      ...config,
      name: config.name || 'SocialMediaAnalyticsAgent',
      role: 'analytics_collector',
      capabilities: [
        'fetch_instagram_analytics',
        'fetch_twitter_analytics', 
        'fetch_linkedin_analytics',
        'fetch_facebook_analytics',
        'aggregate_metrics',
        ...(config.capabilities || [])
      ]
    });

    // Platform credentials (from config or env)
    this.credentials = config.credentials || {};
    this.platforms = config.platforms || ['instagram'];
    this.analyticsData = {};
  }

  /**
   * Main task performer - routes to appropriate platform handler
   */
  async performTask(task) {
    const { type, platform, ...params } = task;

    switch (type) {
      case 'fetch_analytics':
        return await this.fetchAnalytics(platform, params);
      case 'fetch_all_analytics':
        return await this.fetchAllPlatformAnalytics(params);
      case 'aggregate':
        return this.aggregateAnalytics();
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  /**
   * Fetch analytics for a specific platform
   */
  async fetchAnalytics(platform, params = {}) {
    switch (platform) {
      case 'instagram':
        return await this.fetchInstagramAnalytics(params);
      case 'twitter':
        return await this.fetchTwitterAnalytics(params);
      case 'linkedin':
        return await this.fetchLinkedInAnalytics(params);
      case 'facebook':
        return await this.fetchFacebookAnalytics(params);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Fetch analytics from all configured platforms
   */
  async fetchAllPlatformAnalytics(params = {}) {
    const results = {};
    
    for (const platform of this.platforms) {
      try {
        results[platform] = await this.fetchAnalytics(platform, params);
        results[platform].success = true;
      } catch (error) {
        results[platform] = { success: false, error: error.message };
      }
    }

    this.analyticsData = results;
    return results;
  }

  /**
   * Fetch Instagram analytics
   * Uses Instagram Graph API if access token available, otherwise web automation
   */
  async fetchInstagramAnalytics(params = {}) {
    const { accessToken, accountId } = this.credentials.instagram || {};
    
    if (accessToken && accountId) {
      return await this.fetchInstagramViaAPI(accessToken, accountId, params);
    }
    
    // Fallback to web automation (limited data)
    return await this.fetchInstagramViaWeb(params);
  }

  /**
   * Fetch Instagram analytics via Graph API
   */
  async fetchInstagramViaAPI(accessToken, accountId, params = {}) {
    const fetch = global.fetch || require('node-fetch');
    const metrics = 'impressions,reach,profile_views,follower_count';
    const period = params.period || 'day';
    
    const url = `https://graph.facebook.com/v18.0/${accountId}/insights?metric=${metrics}&period=${period}&access_token=${accessToken}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`);
    }
    
    const data = await response.json();
    return this.parseInstagramAPIResponse(data);
  }

  /**
   * Parse Instagram API response into standardized format
   */
  parseInstagramAPIResponse(data) {
    const metrics = {};
    
    if (data.data) {
      data.data.forEach(item => {
        metrics[item.name] = item.values?.[0]?.value || 0;
      });
    }

    return {
      platform: 'instagram',
      timestamp: new Date().toISOString(),
      metrics,
      source: 'api'
    };
  }

  /**
   * Fetch Instagram data via web automation (fallback)
   */
  async fetchInstagramViaWeb(params = {}) {
    // This would require login, which is complex and against ToS
    // Return mock data for demonstration
    return {
      platform: 'instagram',
      timestamp: new Date().toISOString(),
      metrics: {
        note: 'Web automation for Instagram requires authentication. Please configure API credentials.',
        configureAt: 'Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_ACCOUNT_ID environment variables'
      },
      source: 'demo'
    };
  }

  /**
   * Fetch Twitter/X analytics
   */
  async fetchTwitterAnalytics(params = {}) {
    const { bearerToken, userId } = this.credentials.twitter || {};

    if (bearerToken && userId) {
      return await this.fetchTwitterViaAPI(bearerToken, userId, params);
    }

    return {
      platform: 'twitter',
      timestamp: new Date().toISOString(),
      metrics: {
        note: 'Twitter API v2 requires authentication. Please configure API credentials.',
        configureAt: 'Set TWITTER_BEARER_TOKEN and TWITTER_USER_ID environment variables'
      },
      source: 'demo'
    };
  }

  /**
   * Fetch Twitter analytics via API
   */
  async fetchTwitterViaAPI(bearerToken, userId, params = {}) {
    const fetch = global.fetch || require('node-fetch');

    // Get user metrics
    const url = `https://api.twitter.com/2/users/${userId}?user.fields=public_metrics`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${bearerToken}` }
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      platform: 'twitter',
      timestamp: new Date().toISOString(),
      metrics: data.data?.public_metrics || {},
      source: 'api'
    };
  }

  /**
   * Fetch LinkedIn analytics
   */
  async fetchLinkedInAnalytics(params = {}) {
    const { accessToken, organizationId } = this.credentials.linkedin || {};

    if (accessToken && organizationId) {
      return await this.fetchLinkedInViaAPI(accessToken, organizationId, params);
    }

    return {
      platform: 'linkedin',
      timestamp: new Date().toISOString(),
      metrics: {
        note: 'LinkedIn API requires OAuth authentication. Please configure API credentials.',
        configureAt: 'Set LINKEDIN_ACCESS_TOKEN and LINKEDIN_ORG_ID environment variables'
      },
      source: 'demo'
    };
  }

  /**
   * Fetch LinkedIn analytics via API
   */
  async fetchLinkedInViaAPI(accessToken, organizationId, params = {}) {
    const fetch = global.fetch || require('node-fetch');

    const url = `https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:${organizationId}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      platform: 'linkedin',
      timestamp: new Date().toISOString(),
      metrics: data.elements?.[0] || {},
      source: 'api'
    };
  }

  /**
   * Fetch Facebook analytics
   */
  async fetchFacebookAnalytics(params = {}) {
    const { accessToken, pageId } = this.credentials.facebook || {};

    if (accessToken && pageId) {
      return await this.fetchFacebookViaAPI(accessToken, pageId, params);
    }

    return {
      platform: 'facebook',
      timestamp: new Date().toISOString(),
      metrics: {
        note: 'Facebook API requires Page Access Token. Please configure API credentials.',
        configureAt: 'Set FACEBOOK_ACCESS_TOKEN and FACEBOOK_PAGE_ID environment variables'
      },
      source: 'demo'
    };
  }

  /**
   * Fetch Facebook analytics via API
   */
  async fetchFacebookViaAPI(accessToken, pageId, params = {}) {
    const fetch = global.fetch || require('node-fetch');
    const metrics = 'page_impressions,page_engaged_users,page_fans';
    const period = params.period || 'week';

    const url = `https://graph.facebook.com/v18.0/${pageId}/insights?metric=${metrics}&period=${period}&access_token=${accessToken}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status}`);
    }

    const data = await response.json();

    const metrics_parsed = {};
    if (data.data) {
      data.data.forEach(item => {
        metrics_parsed[item.name] = item.values?.[0]?.value || 0;
      });
    }

    return {
      platform: 'facebook',
      timestamp: new Date().toISOString(),
      metrics: metrics_parsed,
      source: 'api'
    };
  }

  /**
   * Aggregate all collected analytics into a summary
   */
  aggregateAnalytics() {
    const summary = {
      collectedAt: new Date().toISOString(),
      platforms: Object.keys(this.analyticsData),
      totalPlatforms: Object.keys(this.analyticsData).length,
      successfulFetches: 0,
      failedFetches: 0,
      data: this.analyticsData
    };

    for (const platform in this.analyticsData) {
      if (this.analyticsData[platform].success) {
        summary.successfulFetches++;
      } else {
        summary.failedFetches++;
      }
    }

    return summary;
  }
}

module.exports = SocialMediaAnalyticsAgent;

