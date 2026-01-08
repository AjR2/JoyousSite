/**
 * Analytics Reporter Test API
 * POST /api/analytics-reporter-test
 * Test email sending without running full report
 */
const ReportBuilder = require('./analytics-reporter/report-builder');
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
    const { recipient } = req.body || {};

    if (!recipient) {
      return res.status(400).json({
        success: false,
        error: 'Recipient email required'
      });
    }

    // Create mock analysis result for testing
    const mockAnalysis = {
      narrativeBullets: [
        'This is a test email from the Analytics Reporter',
        'No actual data was analyzed - this is a connectivity test'
      ],
      topWins: [
        {
          title: 'Test Win',
          value: '+100%',
          description: 'This is a sample win metric',
          impact: 'high'
        }
      ],
      topLosses: [],
      anomalies: [],
      priorities: [
        {
          type: 'test',
          priority: 'low',
          score: 0.1,
          platform: 'test',
          action: 'Verify email delivery is working',
          reason: 'Email system test'
        }
      ],
      tables: {},
      warnings: ['This is a test email - no real data analyzed'],
      summary: {
        totalMetrics: 0,
        dateRange: {},
        platforms: ['test'],
        trendsDetected: 0,
        anomaliesDetected: 0
      }
    };

    // Build test report
    const reportBuilder = new ReportBuilder({
      subjectPrefix: '[TEST]'
    });

    const report = reportBuilder.build(mockAnalysis, {
      date: new Date().toISOString().split('T')[0],
      includeCSV: false
    });

    // Send test email
    const orchestrator = new AnalyticsReporterOrchestrator();
    await orchestrator.initializeEmailAgent();

    const result = await orchestrator.emailAgent.sendEmail({
      to: recipient,
      subject: report.subject,
      html: report.html,
      plaintext: report.plaintext
    });

    return res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      recipient,
      result
    });
  } catch (error) {
    console.error('Analytics Reporter test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
