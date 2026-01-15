/**
 * Analytics Reporter Run API
 * POST /api/analytics-reporter-run
 * Triggers a report generation and optionally sends emails
 */
const AnalyticsReporterOrchestrator = require('./analytics-reporter/orchestrator');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sendEmail = true, testRecipient = null, trigger = 'manual' } = req.body || {};

    const orchestrator = new AnalyticsReporterOrchestrator();

    console.log('[API] Starting analytics report run...');

    const result = await orchestrator.runReport({
      sendEmail,
      testRecipient,
      trigger
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
        runId: result.runId
      });
    }

    // Return summary (exclude full HTML report to keep response small)
    return res.status(200).json({
      success: true,
      runId: result.runId,
      run: result.run,
      summary: result.analysis?.summary || {},
      narrativeBullets: result.analysis?.narrativeBullets || [],
      topWins: result.analysis?.topWins || [],
      topLosses: result.analysis?.topLosses || [],
      emailResults: result.emailResults || [],
      reportSubject: result.report?.subject || 'Analytics Report'
    });
  } catch (error) {
    console.error('Analytics Reporter run error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
