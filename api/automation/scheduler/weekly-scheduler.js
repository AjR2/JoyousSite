/**
 * WeeklyScheduler - Schedules and manages recurring automation tasks
 * 
 * Features:
 * - Cron-based scheduling for weekly tasks
 * - Thursday execution for weekly analytics reports
 * - Manual trigger support
 * - Execution logging and history
 */

const cron = require('node-cron');
const MultiAgentOrchestrator = require('../orchestrator/multi-agent-orchestrator');

class WeeklyScheduler {
  constructor(config = {}) {
    this.schedulerId = config.schedulerId || `scheduler_${Date.now()}`;
    this.orchestrator = null;
    this.scheduledTasks = new Map();
    this.config = config;
    this.isRunning = false;
    this.executionLog = [];
  }

  /**
   * Initialize the scheduler and orchestrator
   */
  async initialize() {
    this.orchestrator = new MultiAgentOrchestrator({
      platforms: this.config.platforms || ['instagram', 'twitter', 'linkedin', 'facebook'],
      recipients: this.config.recipients || [],
      emailService: this.config.emailService || 'console',
      fromEmail: this.config.fromEmail
    });

    await this.orchestrator.initialize();
    console.log(`📅 WeeklyScheduler initialized: ${this.schedulerId}`);
    
    return { success: true, schedulerId: this.schedulerId };
  }

  /**
   * Schedule the weekly analytics report for Thursday
   * Default: Every Thursday at 9:00 AM
   * 
   * Cron format: minute hour day-of-month month day-of-week
   * '0 9 * * 4' = At 09:00 on Thursday (4 = Thursday)
   */
  scheduleWeeklyAnalytics(options = {}) {
    const {
      cronExpression = '0 9 * * 4', // Default: Thursday at 9 AM
      recipients = this.config.recipients,
      timezone = 'America/New_York'
    } = options;

    // Validate cron expression
    if (!cron.validate(cronExpression)) {
      throw new Error(`Invalid cron expression: ${cronExpression}`);
    }

    const taskId = 'weekly_analytics_report';

    // Cancel existing task if any
    if (this.scheduledTasks.has(taskId)) {
      this.scheduledTasks.get(taskId).stop();
    }

    // Schedule the task
    const task = cron.schedule(cronExpression, async () => {
      await this.executeWeeklyAnalytics(recipients);
    }, {
      scheduled: true,
      timezone
    });

    this.scheduledTasks.set(taskId, {
      task,
      cronExpression,
      timezone,
      recipients,
      createdAt: new Date().toISOString()
    });

    console.log(`\n📆 Weekly analytics report scheduled:`);
    console.log(`   Cron: ${cronExpression}`);
    console.log(`   Timezone: ${timezone}`);
    console.log(`   Recipients: ${recipients.join(', ') || 'Not configured'}`);
    console.log(`   Next run: ${this.getNextRunTime(cronExpression)}`);

    return {
      taskId,
      cronExpression,
      timezone,
      recipients,
      nextRun: this.getNextRunTime(cronExpression)
    };
  }

  /**
   * Execute the weekly analytics workflow
   */
  async executeWeeklyAnalytics(recipients = []) {
    if (this.isRunning) {
      console.log('⚠️ Analytics workflow already running, skipping...');
      return { skipped: true, reason: 'Already running' };
    }

    this.isRunning = true;
    const executionId = `exec_${Date.now()}`;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 WEEKLY ANALYTICS REPORT - ${new Date().toISOString()}`);
    console.log(`${'='.repeat(60)}`);

    const logEntry = {
      executionId,
      startTime: new Date().toISOString(),
      recipients
    };

    try {
      const result = await this.orchestrator.executeWorkflow('weekly_analytics_report', {
        recipients
      });

      logEntry.endTime = new Date().toISOString();
      logEntry.success = result.success;
      logEntry.duration = result.totalDuration;
      logEntry.steps = result.steps;

      console.log(`\n✅ Weekly analytics completed successfully`);
    } catch (error) {
      logEntry.endTime = new Date().toISOString();
      logEntry.success = false;
      logEntry.error = error.message;

      console.error(`\n❌ Weekly analytics failed: ${error.message}`);
    }

    this.executionLog.push(logEntry);
    this.isRunning = false;

    return logEntry;
  }

  /**
   * Manually trigger the weekly analytics (for testing)
   */
  async triggerNow(recipients = []) {
    console.log('\n🔧 Manual trigger requested...');
    return await this.executeWeeklyAnalytics(recipients || this.config.recipients);
  }

  /**
   * Get the next scheduled run time
   */
  getNextRunTime(cronExpression) {
    // Simple calculation for next Thursday at 9 AM
    const now = new Date();
    const daysUntilThursday = (4 - now.getDay() + 7) % 7 || 7;
    const nextThursday = new Date(now);
    nextThursday.setDate(now.getDate() + daysUntilThursday);
    nextThursday.setHours(9, 0, 0, 0);
    return nextThursday.toISOString();
  }

  /**
   * Get all scheduled tasks
   */
  getScheduledTasks() {
    const tasks = {};
    for (const [id, taskInfo] of this.scheduledTasks) {
      tasks[id] = {
        cronExpression: taskInfo.cronExpression,
        timezone: taskInfo.timezone,
        recipients: taskInfo.recipients,
        createdAt: taskInfo.createdAt,
        nextRun: this.getNextRunTime(taskInfo.cronExpression)
      };
    }
    return tasks;
  }

  /**
   * Get execution history
   */
  getExecutionLog() {
    return this.executionLog;
  }

  /**
   * Stop a scheduled task
   */
  stopTask(taskId) {
    const taskInfo = this.scheduledTasks.get(taskId);
    if (taskInfo) {
      taskInfo.task.stop();
      this.scheduledTasks.delete(taskId);
      console.log(`⏹️ Task stopped: ${taskId}`);
      return { stopped: taskId };
    }
    return { error: `Task not found: ${taskId}` };
  }

  /**
   * Stop all scheduled tasks
   */
  stopAll() {
    for (const [id, taskInfo] of this.scheduledTasks) {
      taskInfo.task.stop();
    }
    this.scheduledTasks.clear();
    console.log('⏹️ All scheduled tasks stopped');
    return { stopped: 'all' };
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    this.stopAll();
    if (this.orchestrator) {
      await this.orchestrator.cleanup();
    }
    console.log('🧹 Scheduler cleaned up');
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      schedulerId: this.schedulerId,
      isRunning: this.isRunning,
      scheduledTasks: this.getScheduledTasks(),
      totalExecutions: this.executionLog.length,
      lastExecution: this.executionLog[this.executionLog.length - 1] || null,
      orchestratorStatus: this.orchestrator?.getAgentStatus() || null
    };
  }
}

module.exports = WeeklyScheduler;

