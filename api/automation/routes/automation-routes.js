/**
 * Automation API Routes
 * 
 * Endpoints for managing the web automation system:
 * - Start/stop scheduler
 * - Trigger manual execution
 * - View status and history
 * - Configure settings
 */

const express = require('express');
const WeeklyScheduler = require('../scheduler/weekly-scheduler');

const router = express.Router();

// Global scheduler instance
let scheduler = null;

/**
 * Initialize the scheduler with configuration
 */
async function initializeScheduler(config = {}) {
  if (scheduler) {
    await scheduler.cleanup();
  }
  
  scheduler = new WeeklyScheduler({
    platforms: config.platforms || ['instagram', 'twitter', 'linkedin', 'facebook'],
    recipients: config.recipients || [],
    emailService: config.emailService || 'console',
    fromEmail: config.fromEmail || process.env.EMAIL_FROM
  });
  
  await scheduler.initialize();
  return scheduler;
}

/**
 * GET /api/automation/status
 * Get the current status of the automation system
 */
router.get('/status', (req, res) => {
  if (!scheduler) {
    return res.json({
      initialized: false,
      message: 'Scheduler not initialized. POST to /api/automation/start to begin.'
    });
  }
  
  res.json({
    initialized: true,
    ...scheduler.getStatus()
  });
});

/**
 * POST /api/automation/start
 * Start the scheduler with optional configuration
 */
router.post('/start', async (req, res) => {
  try {
    const config = req.body || {};
    
    await initializeScheduler(config);
    
    // Schedule the weekly analytics report
    const scheduleResult = scheduler.scheduleWeeklyAnalytics({
      cronExpression: config.cronExpression || '0 9 * * 4', // Thursday 9 AM
      recipients: config.recipients || [],
      timezone: config.timezone || 'America/New_York'
    });
    
    res.json({
      success: true,
      message: 'Automation scheduler started',
      schedule: scheduleResult,
      status: scheduler.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/automation/stop
 * Stop all scheduled tasks
 */
router.post('/stop', async (req, res) => {
  if (!scheduler) {
    return res.status(400).json({
      success: false,
      error: 'Scheduler not initialized'
    });
  }
  
  try {
    await scheduler.cleanup();
    scheduler = null;
    
    res.json({
      success: true,
      message: 'Automation scheduler stopped'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/automation/trigger
 * Manually trigger the weekly analytics report
 */
router.post('/trigger', async (req, res) => {
  if (!scheduler) {
    // Initialize with request config if not already running
    try {
      await initializeScheduler(req.body || {});
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Failed to initialize: ${error.message}`
      });
    }
  }
  
  try {
    const recipients = req.body?.recipients || [];
    const result = await scheduler.triggerNow(recipients);
    
    res.json({
      success: result.success,
      execution: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/automation/history
 * Get execution history
 */
router.get('/history', (req, res) => {
  if (!scheduler) {
    return res.json({
      initialized: false,
      history: []
    });
  }
  
  res.json({
    initialized: true,
    history: scheduler.getExecutionLog()
  });
});

/**
 * GET /api/automation/workflows
 * Get available workflows
 */
router.get('/workflows', (req, res) => {
  if (!scheduler || !scheduler.orchestrator) {
    return res.json({
      initialized: false,
      workflows: {}
    });
  }
  
  res.json({
    initialized: true,
    workflows: scheduler.orchestrator.getWorkflows()
  });
});

module.exports = { router, initializeScheduler };

