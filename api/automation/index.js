/**
 * Web Automation Module
 * 
 * Multi-agent system for automating web tasks, inspired by LatentMAS architecture.
 * 
 * Features:
 * - Multi-agent orchestration with context passing (like latent state transfer)
 * - Social media analytics collection from multiple platforms
 * - Automated email reports with scheduling
 * - Weekly Thursday execution for analytics reports
 * 
 * Usage:
 * 
 * 1. As Express middleware:
 *    const { router } = require('./api/automation');
 *    app.use('/api/automation', router);
 * 
 * 2. Programmatic usage:
 *    const { WeeklyScheduler } = require('./api/automation');
 *    const scheduler = new WeeklyScheduler({ recipients: ['email@example.com'] });
 *    await scheduler.initialize();
 *    scheduler.scheduleWeeklyAnalytics();
 * 
 * Environment Variables:
 * - INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_ACCOUNT_ID
 * - TWITTER_BEARER_TOKEN, TWITTER_USER_ID
 * - LINKEDIN_ACCESS_TOKEN, LINKEDIN_ORG_ID
 * - FACEBOOK_ACCESS_TOKEN, FACEBOOK_PAGE_ID
 * - SENDGRID_API_KEY, SENDGRID_FROM_EMAIL (for email delivery)
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM (alternative email)
 */

// Agents
const BaseAgent = require('./agents/base-agent');
const WebAutomationAgent = require('./agents/web-automation-agent');
const SocialMediaAnalyticsAgent = require('./agents/social-media-analytics-agent');
const EmailReportAgent = require('./agents/email-report-agent');
const AIAnalyticsAgent = require('./agents/ai-analytics-agent');

// Orchestrator
const MultiAgentOrchestrator = require('./orchestrator/multi-agent-orchestrator');

// Scheduler
const WeeklyScheduler = require('./scheduler/weekly-scheduler');

// Routes
const { router, initializeScheduler } = require('./routes/automation-routes');

module.exports = {
  // Agents
  BaseAgent,
  WebAutomationAgent,
  SocialMediaAnalyticsAgent,
  EmailReportAgent,
  AIAnalyticsAgent,

  // Orchestrator
  MultiAgentOrchestrator,

  // Scheduler
  WeeklyScheduler,

  // Express router
  router,
  initializeScheduler
};

