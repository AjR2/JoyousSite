/**
 * Analytics Reporter Orchestrator
 * Coordinates connectors, analysis, reporting, and email delivery
 */
const { getAllConnectors } = require('./connectors');
const LatentMASAnalyzer = require('./latentmas/analyzer');
const ReportBuilder = require('./report-builder');
const { ReporterConfig, RunHistory, DailyMetrics } = require('./data/models');

class AnalyticsReporterOrchestrator {
  constructor(config = {}) {
    this.config = config;
    this.emailAgent = null;
  }

  /**
   * Initialize email agent (reuse existing infrastructure)
   */
  async initializeEmailAgent() {
    if (this.emailAgent) return this.emailAgent;

    try {
      // Use existing email-report-agent from automation system
      const EmailReportAgent = require('../automation/agents/email-report-agent');
      this.emailAgent = new EmailReportAgent({
        emailConfig: {
          service: process.env.EMAIL_SERVICE || 'console',
          from: process.env.MAILGUN_FROM_EMAIL || process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_FROM,
          smtp: {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        }
      });

      await this.emailAgent.initialize();
      return this.emailAgent;
    } catch (error) {
      console.warn('Email agent initialization failed, using fallback:', error.message);
      // Fallback to simple console logger
      this.emailAgent = {
        sendEmail: async ({ to, subject, html, plaintext }) => {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📧 EMAIL SEND (Console Mode)');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`To: ${to}`);
          console.log(`Subject: ${subject}`);
          console.log('─────────────────────────────────────────────────');
          console.log(plaintext);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          return { success: true, mode: 'console' };
        }
      };
      return this.emailAgent;
    }
  }

  /**
   * Run full analytics report generation and delivery
   */
  async runReport(options = {}) {
    const config = ReporterConfig.load();
    const runId = RunHistory.generateRunId();

    // Create run record
    const runRecord = RunHistory.add({
      runId,
      startedAt: new Date().toISOString(),
      recipients: [
        config.primaryRecipient,
        config.secondaryRecipient
      ].filter(Boolean),
      trigger: options.trigger || 'manual'
    });

    try {
      console.log(`[AnalyticsReporter] Starting run ${runId}`);

      // Step 1: Fetch metrics from all enabled platforms
      const metrics = await this.fetchMetrics(config);
      console.log(`[AnalyticsReporter] Fetched ${metrics.length} metric records`);

      // Step 2: Store metrics (optional caching)
      if (options.cacheMetrics !== false) {
        DailyMetrics.add(metrics);
      }

      // Step 3: Analyze with LatentMAS
      const analyzer = new LatentMASAnalyzer({
        trendWindowDays: config.reportWindowDays,
        comparisonDays: 5
      });
      analyzer.ingest(metrics);
      const analysis = analyzer.analyze();
      console.log(`[AnalyticsReporter] Analysis complete: ${analysis.summary.trendsDetected} trends, ${analysis.summary.anomaliesDetected} anomalies`);

      // Step 4: Build report
      const reportBuilder = new ReportBuilder({
        subjectPrefix: config.emailSubjectPrefix
      });
      const report = reportBuilder.build(analysis, {
        date: new Date().toISOString().split('T')[0],
        includeCSV: config.includeCSV
      });
      console.log(`[AnalyticsReporter] Report generated`);

      // Step 5: Send emails (if not test mode)
      let emailResults = [];
      if (options.sendEmail !== false) {
        emailResults = await this.sendEmails(report, config, options);
        console.log(`[AnalyticsReporter] Emails sent: ${emailResults.filter(r => r.success).length}/${emailResults.length}`);
      }

      // Step 6: Update run record
      const updatedRun = RunHistory.update(runId, {
        completedAt: new Date().toISOString(),
        success: true,
        emailSent: emailResults.some(r => r.success),
        warnings: analysis.warnings,
        summaryJson: {
          totalMetrics: metrics.length,
          trendsDetected: analysis.summary.trendsDetected,
          anomaliesDetected: analysis.summary.anomaliesDetected,
          emailsSent: emailResults.filter(r => r.success).length
        }
      });

      console.log(`[AnalyticsReporter] Run ${runId} completed successfully`);

      return {
        success: true,
        runId,
        run: updatedRun,
        analysis,
        report,
        emailResults
      };

    } catch (error) {
      console.error(`[AnalyticsReporter] Run ${runId} failed:`, error);

      // Update run record with error
      RunHistory.update(runId, {
        completedAt: new Date().toISOString(),
        success: false,
        errorMessage: error.message,
        errorStack: error.stack
      });

      return {
        success: false,
        runId,
        error: error.message,
        errorStack: error.stack
      };
    }
  }

  /**
   * Fetch metrics from all enabled platforms
   */
  async fetchMetrics(config) {
    const connectors = getAllConnectors();
    const enabledPlatforms = config.enabledPlatforms || ['youtube'];
    const windowDays = config.reportWindowDays || 7;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - windowDays);

    const allMetrics = [];
    const errors = [];

    for (const platform of enabledPlatforms) {
      const connector = connectors[platform];

      if (!connector) {
        console.warn(`[AnalyticsReporter] Unknown platform: ${platform}`);
        continue;
      }

      if (!connector.isConfigured()) {
        console.warn(`[AnalyticsReporter] ${platform} not configured, skipping`);
        continue;
      }

      try {
        console.log(`[AnalyticsReporter] Fetching ${platform} metrics...`);
        const metrics = await connector.getDailyMetrics({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          accountId: connector.config.channelId || connector.config.accountId
        });

        allMetrics.push(...metrics);
        console.log(`[AnalyticsReporter] ${platform}: ${metrics.length} records`);
      } catch (error) {
        console.error(`[AnalyticsReporter] ${platform} fetch failed:`, error.message);
        errors.push({ platform, error: error.message });
      }
    }

    if (errors.length > 0 && allMetrics.length === 0) {
      throw new Error(`All platforms failed: ${errors.map(e => e.platform).join(', ')}`);
    }

    return allMetrics;
  }

  /**
   * Send emails to configured recipients
   */
  async sendEmails(report, config, options = {}) {
    await this.initializeEmailAgent();

    const recipients = options.testRecipient
      ? [options.testRecipient]
      : [config.primaryRecipient, config.secondaryRecipient].filter(Boolean);

    if (recipients.length === 0) {
      console.warn('[AnalyticsReporter] No recipients configured');
      return [];
    }

    const results = [];

    for (const recipient of recipients) {
      try {
        const result = await this.emailAgent.sendEmail({
          to: recipient,
          subject: report.subject,
          html: report.html,
          plaintext: report.plaintext,
          attachments: report.attachments ? [report.attachments] : []
        });

        results.push({
          recipient,
          success: true,
          result
        });
      } catch (error) {
        console.error(`[AnalyticsReporter] Email to ${recipient} failed:`, error);
        results.push({
          recipient,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Test connector configuration
   */
  async testConnectors() {
    const { testAllConnectors } = require('./connectors');
    return await testAllConnectors();
  }

  /**
   * Get current status
   */
  getStatus() {
    const config = ReporterConfig.load();
    const stats = RunHistory.getStats();

    return {
      configured: !!(config.primaryRecipient || config.secondaryRecipient),
      enabled: config.enabled,
      scheduledSending: config.scheduledSending,
      enabledPlatforms: config.enabledPlatforms,
      stats
    };
  }
}

module.exports = AnalyticsReporterOrchestrator;
