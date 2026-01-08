/**
 * Analytics Reporter Scheduler
 * Integrates with node-cron for daily report scheduling
 */
const cron = require('node-cron');
const AnalyticsReporterOrchestrator = require('./orchestrator');
const { ReporterConfig } = require('./data/models');

class AnalyticsReporterScheduler {
  constructor() {
    this.tasks = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize scheduler with configuration
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('[AnalyticsReporter] Scheduler already initialized');
      return;
    }

    const config = ReporterConfig.load();

    if (!config.enabled || !config.scheduledSending) {
      console.log('[AnalyticsReporter] Scheduled sending disabled in config');
      return;
    }

    if (!config.primaryRecipient && !config.secondaryRecipient) {
      console.warn('[AnalyticsReporter] No recipients configured, skipping scheduler initialization');
      return;
    }

    this.scheduleDaily(config);
    this.isInitialized = true;

    console.log('[AnalyticsReporter] Scheduler initialized successfully');
  }

  /**
   * Schedule daily report generation
   */
  scheduleDaily(config) {
    const cronExpression = config.cronExpression || '0 9 * * *'; // Default: 9 AM daily
    const timezone = config.timezone || 'America/New_York';

    // Validate cron expression
    if (!cron.validate(cronExpression)) {
      console.error(`[AnalyticsReporter] Invalid cron expression: ${cronExpression}`);
      return;
    }

    console.log(`[AnalyticsReporter] Scheduling daily report: ${cronExpression} (${timezone})`);

    const task = cron.schedule(
      cronExpression,
      async () => {
        console.log('[AnalyticsReporter] Scheduled task triggered');
        await this.runScheduledReport();
      },
      {
        scheduled: true,
        timezone
      }
    );

    this.tasks.set('daily', {
      task,
      cronExpression,
      timezone,
      createdAt: new Date().toISOString()
    });

    console.log('[AnalyticsReporter] Daily report scheduled successfully');
  }

  /**
   * Run scheduled report
   */
  async runScheduledReport() {
    try {
      console.log('[AnalyticsReporter] Running scheduled report...');

      const orchestrator = new AnalyticsReporterOrchestrator();
      const result = await orchestrator.runReport({
        sendEmail: true,
        trigger: 'scheduled'
      });

      if (result.success) {
        console.log(`[AnalyticsReporter] Scheduled report completed successfully (${result.runId})`);
      } else {
        console.error(`[AnalyticsReporter] Scheduled report failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error('[AnalyticsReporter] Scheduled report error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop specific task
   */
  stopTask(taskId) {
    const taskInfo = this.tasks.get(taskId);
    if (taskInfo) {
      taskInfo.task.stop();
      this.tasks.delete(taskId);
      console.log(`[AnalyticsReporter] Task ${taskId} stopped`);
      return true;
    }
    return false;
  }

  /**
   * Stop all tasks
   */
  stopAll() {
    this.tasks.forEach((taskInfo, taskId) => {
      taskInfo.task.stop();
      console.log(`[AnalyticsReporter] Task ${taskId} stopped`);
    });
    this.tasks.clear();
    this.isInitialized = false;
    console.log('[AnalyticsReporter] All tasks stopped');
  }

  /**
   * Restart scheduler with new configuration
   */
  async restart() {
    console.log('[AnalyticsReporter] Restarting scheduler...');
    this.stopAll();
    await this.initialize();
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      activeTasks: Array.from(this.tasks.entries()).map(([id, info]) => ({
        id,
        cronExpression: info.cronExpression,
        timezone: info.timezone,
        createdAt: info.createdAt
      }))
    };
  }

  /**
   * Trigger immediate run (manual trigger from admin)
   */
  async triggerNow() {
    return await this.runScheduledReport();
  }
}

// Singleton instance
let schedulerInstance = null;

/**
 * Get or create scheduler instance
 */
function getScheduler() {
  if (!schedulerInstance) {
    schedulerInstance = new AnalyticsReporterScheduler();
  }
  return schedulerInstance;
}

module.exports = {
  AnalyticsReporterScheduler,
  getScheduler
};
