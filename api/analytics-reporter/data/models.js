/**
 * Data Models for Analytics Reporter
 * Uses JSON file storage (consistent with existing blog posts pattern)
 * Compatible with Vercel serverless environment
 */
const fs = require('fs');
const path = require('path');

// Use /tmp for Vercel serverless, or local directory for development
const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const DATA_DIR = isVercel
  ? '/tmp/analytics-data'
  : path.join(__dirname, '../../../public/analytics-data');

const CONFIG_FILE = path.join(DATA_DIR, 'reporter-config.json');
const HISTORY_FILE = path.join(DATA_DIR, 'run-history.json');
const METRICS_FILE = path.join(DATA_DIR, 'daily-metrics.json');

// Ensure data directory exists (safe in both environments)
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (error) {
    console.warn('Could not create data directory:', error.message);
  }
}

ensureDataDir();

/**
 * Analytics Reporter Configuration Model
 */
class ReporterConfig {
  static getDefault() {
    return {
      enabled: false,
      primaryRecipient: process.env.ANALYTICS_PRIMARY_RECIPIENT || '',
      secondaryRecipient: process.env.ANALYTICS_SECONDARY_RECIPIENT || '',
      enabledPlatforms: [], // youtube, twitter_x, instagram, tiktok - configure platforms before enabling
      reportWindowDays: 7,
      emailSubjectPrefix: '',
      scheduledSending: false,
      cronExpression: '0 9 * * *', // Daily at 9 AM
      timezone: 'America/New_York',
      includeCSV: false,
      lastUpdated: new Date().toISOString()
    };
  }

  static load() {
    try {
      ensureDataDir();

      if (!fs.existsSync(CONFIG_FILE)) {
        const defaultConfig = this.getDefault();
        this.save(defaultConfig);
        return defaultConfig;
      }

      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading reporter config:', error);
      return this.getDefault();
    }
  }

  static save(config) {
    try {
      ensureDataDir();
      config.lastUpdated = new Date().toISOString();
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
      return config;
    } catch (error) {
      console.error('Error saving reporter config:', error);
      return config;
    }
  }

  static update(updates) {
    const current = this.load();
    const updated = { ...current, ...updates };
    return this.save(updated);
  }
}

/**
 * Analytics Run History Model
 */
class RunHistory {
  static load() {
    try {
      ensureDataDir();

      if (!fs.existsSync(HISTORY_FILE)) {
        return [];
      }

      const data = fs.readFileSync(HISTORY_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading run history:', error);
      return [];
    }
  }

  static save(history) {
    try {
      ensureDataDir();
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Error saving run history:', error);
    }
  }

  static add(runRecord) {
    const history = this.load();

    const record = {
      runId: this.generateRunId(),
      startedAt: new Date().toISOString(),
      completedAt: null,
      success: false,
      warnings: [],
      recipients: [],
      emailSent: false,
      summaryJson: null,
      errorMessage: null,
      ...runRecord
    };

    history.unshift(record); // Add to beginning

    // Keep only last 100 runs
    if (history.length > 100) {
      history.splice(100);
    }

    this.save(history);
    return record;
  }

  static update(runId, updates) {
    const history = this.load();
    const index = history.findIndex(r => r.runId === runId);

    if (index !== -1) {
      history[index] = { ...history[index], ...updates };
      this.save(history);
      return history[index];
    }

    return null;
  }

  static getLatest(count = 10) {
    const history = this.load();
    return history.slice(0, count);
  }

  static getById(runId) {
    const history = this.load();
    return history.find(r => r.runId === runId);
  }

  static generateRunId() {
    return `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static getStats() {
    const history = this.load();
    const total = history.length;
    const successful = history.filter(r => r.success).length;
    const failed = total - successful;
    const lastRun = history[0] || null;

    return {
      totalRuns: total,
      successful,
      failed,
      successRate: total > 0 ? ((successful / total) * 100).toFixed(1) : 0,
      lastRun: lastRun ? {
        runId: lastRun.runId,
        startedAt: lastRun.startedAt,
        success: lastRun.success,
        emailSent: lastRun.emailSent
      } : null
    };
  }
}

/**
 * Daily Metrics Storage Model (Optional - for caching)
 */
class DailyMetrics {
  static load() {
    try {
      ensureDataDir();

      if (!fs.existsSync(METRICS_FILE)) {
        return [];
      }

      const data = fs.readFileSync(METRICS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading daily metrics:', error);
      return [];
    }
  }

  static save(metrics) {
    try {
      ensureDataDir();
      fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
    } catch (error) {
      console.error('Error saving daily metrics:', error);
    }
  }

  static add(metricsArray) {
    const existing = this.load();

    // Add new metrics, avoiding duplicates by date+platform
    metricsArray.forEach(newMetric => {
      const duplicateIndex = existing.findIndex(
        m => m.date === newMetric.date && m.platform === newMetric.platform
      );

      if (duplicateIndex !== -1) {
        existing[duplicateIndex] = newMetric; // Update
      } else {
        existing.push(newMetric); // Add
      }
    });

    // Sort by date descending
    existing.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Keep only last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const filtered = existing.filter(m => new Date(m.date) >= ninetyDaysAgo);

    this.save(filtered);
    return filtered;
  }

  static getRange(startDate, endDate, platform = null) {
    const all = this.load();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return all.filter(m => {
      const mDate = new Date(m.date);
      const inRange = mDate >= start && mDate <= end;
      const matchesPlatform = platform ? m.platform === platform : true;
      return inRange && matchesPlatform;
    });
  }

  static clear() {
    this.save([]);
  }
}

module.exports = {
  ReporterConfig,
  RunHistory,
  DailyMetrics
};
