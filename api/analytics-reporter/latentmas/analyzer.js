/**
 * LatentMAS Analytics Engine
 * Rule-based trend detection, anomaly detection, and priority scoring
 */

class LatentMASAnalyzer {
  constructor(config = {}) {
    this.config = {
      trendWindowDays: config.trendWindowDays || 7,
      comparisonDays: config.comparisonDays || 5,
      anomalyThreshold: config.anomalyThreshold || 2.5, // MAD multiplier
      priorityWeights: config.priorityWeights || {
        views: 1.0,
        impressions: 0.8,
        engagement_rate: 1.2,
        followers_delta: 1.5,
        watch_time: 0.9
      },
      ...config
    };
    this.metrics = [];
  }

  /**
   * Ingest normalized metrics
   */
  ingest(metrics) {
    if (!Array.isArray(metrics)) {
      throw new Error('Metrics must be an array');
    }
    this.metrics = metrics.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Perform comprehensive analysis
   */
  analyze(windowDays = null) {
    const days = windowDays || this.config.trendWindowDays;

    if (this.metrics.length === 0) {
      return this.getEmptyAnalysis();
    }

    const recentMetrics = this.getRecentMetrics(days);
    const previousMetrics = this.getPreviousMetrics(days, this.config.comparisonDays);

    // Core analyses
    const trends = this.detectTrends(recentMetrics, previousMetrics);
    const anomalies = this.detectAnomalies(recentMetrics);
    const priorities = this.scorePriorities(trends, anomalies);
    const narrativeBullets = this.generateNarrativeBullets(trends, anomalies, priorities);
    const insights = this.extractInsights(trends, anomalies);
    const tables = this.generateTables(recentMetrics);

    return {
      narrativeBullets,
      topWins: insights.wins.slice(0, 3),
      topLosses: insights.losses.slice(0, 3),
      anomalies: anomalies.slice(0, 5),
      priorities: priorities.slice(0, 5),
      tables,
      warnings: this.generateWarnings(recentMetrics),
      summary: {
        totalMetrics: this.metrics.length,
        dateRange: {
          start: this.metrics[0]?.date,
          end: this.metrics[this.metrics.length - 1]?.date
        },
        platforms: [...new Set(this.metrics.map(m => m.platform))],
        trendsDetected: trends.length,
        anomaliesDetected: anomalies.length
      }
    };
  }

  /**
   * Detect trends by comparing recent vs previous periods
   */
  detectTrends(recentMetrics, previousMetrics) {
    const trends = [];

    // Group by platform
    const platformGroups = this.groupByPlatform(recentMetrics);
    const previousGroups = this.groupByPlatform(previousMetrics);

    for (const [platform, metrics] of Object.entries(platformGroups)) {
      const previous = previousGroups[platform] || [];

      const recentStats = this.calculateStats(metrics);
      const previousStats = this.calculateStats(previous);

      // Compare key metrics
      const comparisons = this.compareStats(recentStats, previousStats);

      for (const comparison of comparisons) {
        if (Math.abs(comparison.percentChange) > 10) { // 10% threshold
          trends.push({
            platform,
            metric: comparison.metric,
            direction: comparison.direction,
            percentChange: comparison.percentChange,
            recentValue: comparison.recentValue,
            previousValue: comparison.previousValue,
            magnitude: Math.abs(comparison.percentChange)
          });
        }
      }
    }

    return trends.sort((a, b) => b.magnitude - a.magnitude);
  }

  /**
   * Detect anomalies using Median Absolute Deviation (MAD)
   */
  detectAnomalies(metrics) {
    const anomalies = [];
    const platformGroups = this.groupByPlatform(metrics);

    for (const [platform, platformMetrics] of Object.entries(platformGroups)) {
      const metricNames = ['views', 'impressions', 'likes', 'comments', 'followers_delta'];

      for (const metricName of metricNames) {
        const values = platformMetrics
          .map(m => m.metrics?.[metricName])
          .filter(v => v !== null && v !== undefined && !isNaN(v));

        if (values.length < 3) continue; // Need enough data

        const median = this.calculateMedian(values);
        const mad = this.calculateMAD(values, median);

        // Find outliers
        platformMetrics.forEach((m, idx) => {
          const value = m.metrics?.[metricName];
          if (value === null || value === undefined || isNaN(value)) return;

          const deviation = Math.abs(value - median);
          const madScore = mad > 0 ? deviation / mad : 0;

          if (madScore > this.config.anomalyThreshold) {
            anomalies.push({
              date: m.date,
              platform,
              metric: metricName,
              value,
              median,
              madScore: madScore.toFixed(2),
              severity: madScore > 4 ? 'high' : madScore > 3 ? 'medium' : 'low',
              description: `${metricName} on ${platform} (${value}) is ${madScore.toFixed(1)}x MAD from median (${median.toFixed(0)})`
            });
          }
        });
      }
    }

    return anomalies.sort((a, b) => parseFloat(b.madScore) - parseFloat(a.madScore));
  }

  /**
   * Score priorities based on weighted impact
   */
  scorePriorities(trends, anomalies) {
    const priorities = [];

    // Priority from trends
    trends.forEach(trend => {
      const weight = this.config.priorityWeights[trend.metric] || 1.0;
      const impactScore = (trend.magnitude / 100) * weight;

      priorities.push({
        type: 'trend',
        priority: impactScore > 0.5 ? 'high' : impactScore > 0.2 ? 'medium' : 'low',
        score: impactScore,
        platform: trend.platform,
        action: this.generateActionItem(trend),
        reason: `${trend.metric} ${trend.direction} by ${trend.percentChange.toFixed(1)}%`
      });
    });

    // Priority from anomalies
    anomalies.forEach(anomaly => {
      const impactScore = parseFloat(anomaly.madScore) / 10;

      priorities.push({
        type: 'anomaly',
        priority: anomaly.severity,
        score: impactScore,
        platform: anomaly.platform,
        action: `Investigate ${anomaly.metric} spike/drop on ${anomaly.date}`,
        reason: anomaly.description
      });
    });

    return priorities.sort((a, b) => b.score - a.score);
  }

  /**
   * Generate narrative bullets
   */
  generateNarrativeBullets(trends, anomalies, priorities) {
    const bullets = [];

    // Overall summary
    if (trends.length > 0) {
      const positiveChanges = trends.filter(t => t.direction === 'up').length;
      const negativeChanges = trends.filter(t => t.direction === 'down').length;
      bullets.push(`Detected ${trends.length} significant trends: ${positiveChanges} improvements, ${negativeChanges} declines`);
    }

    // Top trend
    if (trends.length > 0) {
      const topTrend = trends[0];
      bullets.push(`Biggest change: ${topTrend.platform} ${topTrend.metric} ${topTrend.direction} ${topTrend.percentChange.toFixed(1)}%`);
    }

    // Anomalies
    if (anomalies.length > 0) {
      bullets.push(`Found ${anomalies.length} anomalies requiring attention`);
    }

    // High priority items
    const highPriorities = priorities.filter(p => p.priority === 'high');
    if (highPriorities.length > 0) {
      bullets.push(`${highPriorities.length} high-priority action items identified`);
    }

    // Platform-specific insights
    const platforms = [...new Set(this.metrics.map(m => m.platform))];
    if (platforms.length > 1) {
      bullets.push(`Cross-platform analysis across ${platforms.join(', ')}`);
    }

    return bullets.length > 0 ? bullets : ['Insufficient data for trend analysis'];
  }

  /**
   * Extract top wins and losses
   */
  extractInsights(trends, anomalies) {
    const wins = trends
      .filter(t => t.direction === 'up')
      .map(t => ({
        title: `${t.platform}: ${t.metric} increased`,
        value: `+${t.percentChange.toFixed(1)}%`,
        description: `${t.metric} grew from ${t.previousValue.toFixed(0)} to ${t.recentValue.toFixed(0)}`,
        impact: t.magnitude > 50 ? 'high' : t.magnitude > 20 ? 'medium' : 'low'
      }));

    const losses = trends
      .filter(t => t.direction === 'down')
      .map(t => ({
        title: `${t.platform}: ${t.metric} decreased`,
        value: `${t.percentChange.toFixed(1)}%`,
        description: `${t.metric} dropped from ${t.previousValue.toFixed(0)} to ${t.recentValue.toFixed(0)}`,
        impact: t.magnitude > 50 ? 'high' : t.magnitude > 20 ? 'medium' : 'low'
      }));

    return { wins, losses };
  }

  /**
   * Generate data tables for report
   */
  generateTables(metrics) {
    const platformGroups = this.groupByPlatform(metrics);
    const tables = {};

    for (const [platform, platformMetrics] of Object.entries(platformGroups)) {
      tables[platform] = platformMetrics.map(m => ({
        date: m.date,
        views: m.metrics?.views || 0,
        impressions: m.metrics?.impressions || 0,
        engagement: ((m.metrics?.likes || 0) + (m.metrics?.comments || 0) + (m.metrics?.shares || 0)),
        followers_delta: m.metrics?.followers_delta || 0
      }));
    }

    return tables;
  }

  /**
   * Generate warnings about data quality
   */
  generateWarnings(metrics) {
    const warnings = [];

    if (metrics.length < 3) {
      warnings.push('Insufficient data for robust trend analysis (need 3+ days)');
    }

    const platforms = [...new Set(metrics.map(m => m.platform))];
    platforms.forEach(platform => {
      const platformMetrics = metrics.filter(m => m.platform === platform);
      const hasNulls = platformMetrics.some(m =>
        Object.values(m.metrics || {}).some(v => v === null || v === undefined)
      );

      if (hasNulls) {
        warnings.push(`${platform} has incomplete data - some metrics unavailable`);
      }
    });

    return warnings;
  }

  // Helper methods

  getRecentMetrics(days) {
    return this.metrics.slice(-days);
  }

  getPreviousMetrics(recentDays, previousDays) {
    const start = Math.max(0, this.metrics.length - recentDays - previousDays);
    const end = this.metrics.length - recentDays;
    return this.metrics.slice(start, end);
  }

  groupByPlatform(metrics) {
    return metrics.reduce((acc, m) => {
      if (!acc[m.platform]) acc[m.platform] = [];
      acc[m.platform].push(m);
      return acc;
    }, {});
  }

  calculateStats(metrics) {
    if (metrics.length === 0) return {};

    const stats = {};
    const metricNames = ['views', 'impressions', 'likes', 'comments', 'shares', 'followers_delta'];

    metricNames.forEach(name => {
      const values = metrics.map(m => m.metrics?.[name]).filter(v => v !== null && v !== undefined);
      if (values.length > 0) {
        stats[name] = {
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          sum: values.reduce((a, b) => a + b, 0),
          count: values.length
        };
      }
    });

    return stats;
  }

  compareStats(recent, previous) {
    const comparisons = [];

    for (const [metric, recentStat] of Object.entries(recent)) {
      const previousStat = previous[metric];
      if (!previousStat) continue;

      const percentChange = previousStat.avg > 0
        ? ((recentStat.avg - previousStat.avg) / previousStat.avg) * 100
        : 0;

      comparisons.push({
        metric,
        direction: percentChange > 0 ? 'up' : 'down',
        percentChange,
        recentValue: recentStat.avg,
        previousValue: previousStat.avg
      });
    }

    return comparisons;
  }

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  calculateMAD(values, median) {
    const deviations = values.map(v => Math.abs(v - median));
    return this.calculateMedian(deviations);
  }

  generateActionItem(trend) {
    if (trend.direction === 'up') {
      return `Analyze what drove ${trend.metric} growth on ${trend.platform} and replicate`;
    } else {
      return `Investigate ${trend.metric} decline on ${trend.platform} and course-correct`;
    }
  }

  getEmptyAnalysis() {
    return {
      narrativeBullets: ['No metrics data available'],
      topWins: [],
      topLosses: [],
      anomalies: [],
      priorities: [],
      tables: {},
      warnings: ['No data ingested'],
      summary: {
        totalMetrics: 0,
        dateRange: {},
        platforms: [],
        trendsDetected: 0,
        anomaliesDetected: 0
      }
    };
  }
}

module.exports = LatentMASAnalyzer;
