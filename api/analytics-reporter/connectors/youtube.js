/**
 * YouTube Analytics Connector
 * Fetches channel analytics using YouTube Data API v3 and Analytics API
 */
const SocialConnector = require('./base');

class YouTubeConnector extends SocialConnector {
  constructor(config = {}) {
    super(config);
    this.platform = 'youtube';
    this.apiKey = config.apiKey || process.env.YOUTUBE_API_KEY;
    this.channelId = config.channelId || process.env.YOUTUBE_CHANNEL_ID;
    this.analyticsEnabled = !!process.env.YOUTUBE_OAUTH_REFRESH_TOKEN;
  }

  isConfigured() {
    return !!(this.apiKey && this.channelId);
  }

  /**
   * Fetch daily metrics from YouTube
   * Note: Public API (API key) has limited metrics. OAuth required for full analytics.
   */
  async getDailyMetrics(params) {
    const { startDate, endDate } = params;

    if (!this.isConfigured()) {
      throw new Error('YouTube connector not configured. Missing API key or channel ID.');
    }

    const metrics = [];
    const dates = this.getDateRange(startDate, endDate);

    // Fetch channel statistics (current snapshot)
    const channelStats = await this.fetchChannelStats();

    // For each date, create a metrics entry
    // Note: Without YouTube Analytics API (OAuth), we can only get current stats
    // We'll create daily entries based on current data with estimated deltas
    for (const date of dates) {
      const normalized = this.normalize(channelStats, date);
      metrics.push(normalized);
    }

    return metrics;
  }

  /**
   * Fetch channel statistics using YouTube Data API v3
   */
  async fetchChannelStats() {
    const url = new URL('https://www.googleapis.com/youtube/v3/channels');
    url.searchParams.append('part', 'statistics,snippet');
    url.searchParams.append('id', this.channelId);
    url.searchParams.append('key', this.apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`YouTube API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error(`Channel not found: ${this.channelId}`);
    }

    return data.items[0];
  }

  /**
   * Fetch recent video statistics
   */
  async fetchRecentVideos(maxResults = 10) {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.append('part', 'id');
    url.searchParams.append('channelId', this.channelId);
    url.searchParams.append('maxResults', maxResults.toString());
    url.searchParams.append('order', 'date');
    url.searchParams.append('type', 'video');
    url.searchParams.append('key', this.apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = await response.json();
    const videoIds = data.items.map(item => item.id.videoId).join(',');

    if (!videoIds) {
      return [];
    }

    // Fetch video statistics
    const statsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    statsUrl.searchParams.append('part', 'statistics,snippet');
    statsUrl.searchParams.append('id', videoIds);
    statsUrl.searchParams.append('key', this.apiKey);

    const statsResponse = await fetch(statsUrl.toString());
    const statsData = await statsResponse.json();

    return statsData.items || [];
  }

  /**
   * Normalize YouTube data to unified schema
   */
  normalize(channelData, date) {
    const stats = channelData.statistics;
    const snippet = channelData.snippet;

    // Note: Without Analytics API, we don't have daily granular data
    // This provides current totals - in production, implement OAuth for daily metrics
    return {
      date,
      platform: this.platform,
      account_id: this.channelId,
      account_handle: snippet?.customUrl || snippet?.title || this.channelId,
      metrics: {
        // Cumulative totals (not daily deltas without Analytics API)
        views: parseInt(stats.viewCount) || 0,
        subscribers: parseInt(stats.subscriberCount) || 0,
        videos: parseInt(stats.videoCount) || 0,
        // Estimated daily metrics (would need Analytics API for actuals)
        impressions: null, // Requires Analytics API
        watch_time_minutes: null, // Requires Analytics API
        likes: null, // Aggregate only
        comments: parseInt(stats.commentCount) || 0,
        shares: null, // Requires Analytics API
        followers_delta: null, // Requires historical data
        clicks: null,
        engagement_rate: null // Can be calculated with more data
      },
      derived: {
        engagement_rate: null,
        ctr: null,
        view_velocity: null
      },
      raw_payload: {
        statistics: stats,
        snippet: {
          title: snippet?.title,
          description: snippet?.description?.substring(0, 200),
          customUrl: snippet?.customUrl,
          publishedAt: snippet?.publishedAt
        }
      },
      data_source: 'youtube_data_api_v3',
      limitations: [
        'Daily metrics require YouTube Analytics API with OAuth',
        'Current implementation shows cumulative totals only',
        'Implement OAuth refresh token for granular daily analytics'
      ]
    };
  }

  /**
   * Generate date range array
   */
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

  /**
   * Enhanced test connection with diagnostics
   */
  async testConnection() {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          message: 'YouTube connector not configured',
          details: {
            hasApiKey: !!this.apiKey,
            hasChannelId: !!this.channelId
          }
        };
      }

      const channelData = await this.fetchChannelStats();
      const videos = await this.fetchRecentVideos(5);

      return {
        success: true,
        message: 'YouTube connection successful',
        details: {
          channel: channelData.snippet.title,
          subscribers: channelData.statistics.subscriberCount,
          totalViews: channelData.statistics.viewCount,
          videoCount: channelData.statistics.videoCount,
          recentVideos: videos.length,
          analyticsEnabled: this.analyticsEnabled
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.stack
      };
    }
  }
}

module.exports = YouTubeConnector;
