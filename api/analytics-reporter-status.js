/**
 * Analytics Reporter Status API
 * GET /api/analytics-reporter-status
 */
const { ReporterConfig, RunHistory } = require('./analytics-reporter/data/models');
const { testAllConnectors } = require('./analytics-reporter/connectors');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const config = ReporterConfig.load();
    const stats = RunHistory.getStats();
    const recentRuns = RunHistory.getLatest(5);

    // Test connectors if requested
    let connectorStatus = null;
    if (req.query.testConnectors === 'true') {
      connectorStatus = await testAllConnectors();
    }

    res.status(200).json({
      success: true,
      config: {
        enabled: config.enabled,
        scheduledSending: config.scheduledSending,
        enabledPlatforms: config.enabledPlatforms,
        reportWindowDays: config.reportWindowDays,
        cronExpression: config.cronExpression,
        hasRecipients: !!(config.primaryRecipient || config.secondaryRecipient)
      },
      stats,
      recentRuns: recentRuns.map(run => ({
        runId: run.runId,
        startedAt: run.startedAt,
        success: run.success,
        emailSent: run.emailSent,
        summaryJson: run.summaryJson
      })),
      connectorStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics Reporter status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
