/**
 * YouTube Analytics Connector
 * Fetches channel analytics using YouTube Data API v3 and YouTube Analytics API
 *
 * With OAuth: Gets detailed daily metrics (views, watch time, impressions, CTR, etc.)
 * Without OAuth: Gets basic cumulative channel statistics only
 */
const SocialConnector = require('./base');

class YouTubeConnector extends SocialConnector {
  constructor(config = {}) {
    super(config);
    this.platform = 'youtube';
    this.apiKey = config.apiKey || process.env.YOUTUBE_API_KEY;
    this.channelId = config.channelId || process.env.YOUTUBE_CHANNEL_ID;

    // OAuth credentials for YouTube Analytics API
    this.refreshToken = config.refreshToken || process.env.YOUTUBE_OAUTH_REFRESH_TOKEN;
    this.clientId = config.clientId || process.env.YOUTUBE_OAUTH_CLIENT_ID;
    this.clientSecret = config.clientSecret || process.env.YOUTUBE_OAUTH_CLIENT_SECRET;
    this.accessToken = null;
    this.accessTokenExpiry = null;
  }

  isConfigured() {
    return !!(this.apiKey && this.channelId);
  }

  isOAuthConfigured() {
    return !!(this.refreshToken && this.clientId && this.clientSecret);
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken() {
    // Return cached token if still valid (with 5 min buffer)
    if (this.accessToken && this.accessTokenExpiry && Date.now() < this.accessTokenExpiry - 300000) {
      return this.accessToken;
    }

    console.log('[YouTube OAuth] Refreshing access token...');

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('[YouTube OAuth] Token refresh failed:', error);
      throw new Error(`OAuth token refresh failed: ${error.error_description || response.statusText}`);
    }

    const tokens = await response.json();
    this.accessToken = tokens.access_token;
    this.accessTokenExpiry = Date.now() + (tokens.expires_in * 1000);

    console.log('[YouTube OAuth] Access token refreshed successfully');
    return this.accessToken;
  }

  /**
   * Fetch daily metrics from YouTube
   * Uses YouTube Analytics API with OAuth for detailed metrics,
   * falls back to basic Data API if OAuth not configured
   */
  async getDailyMetrics(params) {
    const { startDate, endDate } = params;

    if (!this.isConfigured()) {
      throw new Error('YouTube connector not configured. Missing API key or channel ID.');
    }

    // If OAuth is configured, use YouTube Analytics API for detailed daily metrics
    if (this.isOAuthConfigured()) {
      console.log('[YouTube] Using OAuth for detailed analytics');
      return this.fetchAnalyticsMetrics(startDate, endDate);
    }

    // Fallback to basic Data API (cumulative stats only)
    console.log('[YouTube] OAuth not configured, using basic Data API');
    const metrics = [];
    const dates = this.getDateRange(startDate, endDate);
    const channelStats = await this.fetchChannelStats();

    for (const date of dates) {
      const normalized = this.normalize(channelStats, date);
      metrics.push(normalized);
    }

    return metrics;
  }

  /**
   * Fetch detailed daily metrics from YouTube Analytics API
   * Requires OAuth authentication
   */
  async fetchAnalyticsMetrics(startDate, endDate) {
    const accessToken = await this.getAccessToken();
    const channelStats = await this.fetchChannelStats();

    // YouTube Analytics API query
    const url = new URL('https://youtubeanalytics.googleapis.com/v2/reports');
    url.searchParams.append('ids', `channel==${this.channelId}`);
    url.searchParams.append('startDate', startDate);
    url.searchParams.append('endDate', endDate);
    url.searchParams.append('dimensions', 'day');
    url.searchParams.append('metrics', [
      'views',
      'estimatedMinutesWatched',
      'averageViewDuration',
      'subscribersGained',
      'subscribersLost',
      'likes',
      'dislikes',
      'comments',
      'shares',
      'annotationClickThroughRate',
      'averageViewPercentage'
    ].join(','));
    url.searchParams.append('sort', 'day');

    console.log('[YouTube Analytics] Fetching daily metrics from', startDate, 'to', endDate);

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('[YouTube Analytics] API error:', error);

      // If Analytics API fails, try with fewer metrics (some channels don't have all)
      if (error.error?.code === 400) {
        return this.fetchAnalyticsMetricsBasic(startDate, endDate, accessToken, channelStats);
      }

      throw new Error(`YouTube Analytics API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('[YouTube Analytics] Received', data.rows?.length || 0, 'days of data');

    return this.normalizeAnalyticsData(data, channelStats);
  }

  /**
   * Fallback with basic metrics if full metrics not available
   */
  async fetchAnalyticsMetricsBasic(startDate, endDate, accessToken, channelStats) {
    const url = new URL('https://youtubeanalytics.googleapis.com/v2/reports');
    url.searchParams.append('ids', `channel==${this.channelId}`);
    url.searchParams.append('startDate', startDate);
    url.searchParams.append('endDate', endDate);
    url.searchParams.append('dimensions', 'day');
    url.searchParams.append('metrics', 'views,estimatedMinutesWatched,subscribersGained,subscribersLost,likes,comments,shares');
    url.searchParams.append('sort', 'day');

    console.log('[YouTube Analytics] Retrying with basic metrics...');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`YouTube Analytics API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return this.normalizeAnalyticsData(data, channelStats);
  }

  /**
   * Normalize YouTube Analytics API data to unified schema
   */
  normalizeAnalyticsData(analyticsData, channelStats) {
    const snippet = channelStats.snippet;
    const stats = channelStats.statistics;
    const metrics = [];

    // Column headers tell us what each index represents
    const headers = analyticsData.columnHeaders?.map(h => h.name) || [];

    for (const row of analyticsData.rows || []) {
      const dayData = {};
      headers.forEach((header, index) => {
        dayData[header] = row[index];
      });

      const subscribersDelta = (dayData.subscribersGained || 0) - (dayData.subscribersLost || 0);
      const views = dayData.views || 0;
      const likes = dayData.likes || 0;
      const comments = dayData.comments || 0;
      const shares = dayData.shares || 0;

      // Calculate engagement rate: (likes + comments + shares) / views * 100
      const engagementRate = views > 0 ? ((likes + comments + shares) / views * 100) : 0;

      metrics.push({
        date: dayData.day,
        platform: this.platform,
        account_id: this.channelId,
        account_handle: snippet?.customUrl || snippet?.title || this.channelId,
        metrics: {
          views: views,
          watch_time_minutes: dayData.estimatedMinutesWatched || 0,
          average_view_duration: dayData.averageViewDuration || 0,
          subscribers: parseInt(stats.subscriberCount) || 0,
          subscribers_gained: dayData.subscribersGained || 0,
          subscribers_lost: dayData.subscribersLost || 0,
          subscribers_delta: subscribersDelta,
          likes: likes,
          dislikes: dayData.dislikes || 0,
          comments: comments,
          shares: shares,
          average_view_percentage: dayData.averageViewPercentage || 0,
          ctr: dayData.annotationClickThroughRate || 0,
          videos: parseInt(stats.videoCount) || 0
        },
        derived: {
          engagement_rate: Math.round(engagementRate * 100) / 100,
          watch_time_hours: Math.round((dayData.estimatedMinutesWatched || 0) / 60 * 100) / 100,
          avg_view_minutes: Math.round((dayData.averageViewDuration || 0) / 60 * 100) / 100
        },
        raw_payload: {
          analytics: dayData,
          channel: {
            title: snippet?.title,
            customUrl: snippet?.customUrl,
            totalViews: stats?.viewCount,
            totalSubscribers: stats?.subscriberCount
          }
        },
        data_source: 'youtube_analytics_api'
      });
    }

    return metrics;
  }

  /**
   * Fetch channel statistics using YouTube Data API v3
   */
  async fetchChannelStats() {
    console.log('[YouTube] Fetching channel stats for:', this.channelId);

    const url = new URL('https://www.googleapis.com/youtube/v3/channels');
    url.searchParams.append('part', 'statistics,snippet');
    url.searchParams.append('id', this.channelId);
    url.searchParams.append('key', this.apiKey);

    console.log('[YouTube] API URL:', url.toString().replace(this.apiKey, 'API_KEY_HIDDEN'));

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('[YouTube] API error:', error);
      throw new Error(`YouTube API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.error('[YouTube] Channel not found:', this.channelId);
      throw new Error(`Channel not found: ${this.channelId}`);
    }

    console.log('[YouTube] Channel stats fetched successfully:', {
      title: data.items[0].snippet?.title,
      subscriberCount: data.items[0].statistics?.subscriberCount,
      viewCount: data.items[0].statistics?.viewCount
    });

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
   * Normalize YouTube Data API response to unified schema (basic/fallback mode)
   */
  normalize(channelData, date) {
    const stats = channelData.statistics;
    const snippet = channelData.snippet;

    return {
      date,
      platform: this.platform,
      account_id: this.channelId,
      account_handle: snippet?.customUrl || snippet?.title || this.channelId,
      metrics: {
        // Cumulative totals only (not daily metrics)
        views: parseInt(stats.viewCount) || 0,
        subscribers: parseInt(stats.subscriberCount) || 0,
        videos: parseInt(stats.videoCount) || 0,
        watch_time_minutes: null,
        likes: null,
        comments: null,
        shares: null,
        subscribers_delta: null
      },
      derived: {
        engagement_rate: null,
        ctr: null
      },
      raw_payload: {
        statistics: stats,
        snippet: {
          title: snippet?.title,
          customUrl: snippet?.customUrl
        }
      },
      data_source: 'youtube_data_api_v3_basic',
      limitations: [
        'OAuth not configured - showing cumulative totals only',
        'Add YOUTUBE_OAUTH_REFRESH_TOKEN, CLIENT_ID, CLIENT_SECRET for daily metrics'
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
            hasChannelId: !!this.channelId,
            hasOAuth: this.isOAuthConfigured()
          }
        };
      }

      const channelData = await this.fetchChannelStats();
      const videos = await this.fetchRecentVideos(5);

      // Test OAuth if configured
      let oauthStatus = { configured: false };
      if (this.isOAuthConfigured()) {
        try {
          await this.getAccessToken();
          oauthStatus = {
            configured: true,
            working: true,
            message: 'OAuth working - full analytics available'
          };
        } catch (oauthError) {
          oauthStatus = {
            configured: true,
            working: false,
            message: `OAuth error: ${oauthError.message}`
          };
        }
      } else {
        oauthStatus = {
          configured: false,
          working: false,
          message: 'OAuth not configured - only basic stats available',
          required: ['YOUTUBE_OAUTH_REFRESH_TOKEN', 'YOUTUBE_OAUTH_CLIENT_ID', 'YOUTUBE_OAUTH_CLIENT_SECRET']
        };
      }

      return {
        success: true,
        message: oauthStatus.working
          ? 'YouTube connection successful with full analytics'
          : 'YouTube connection successful (basic mode)',
        details: {
          channel: channelData.snippet.title,
          subscribers: channelData.statistics.subscriberCount,
          totalViews: channelData.statistics.viewCount,
          videoCount: channelData.statistics.videoCount,
          recentVideos: videos.length,
          oauth: oauthStatus
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
