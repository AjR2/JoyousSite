/**
 * Analytics Reporter Test Script
 * Run with: node api/analytics-reporter/test.js
 */
const { AnalyticsReporterOrchestrator, testAllConnectors, ReporterConfig } = require('./index');

async function testConnectorConfiguration() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 TESTING CONNECTOR CONFIGURATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const results = await testAllConnectors();

  for (const [platform, result] of Object.entries(results)) {
    console.log(`\n📌 ${platform.toUpperCase()}`);
    console.log(`   Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   Message: ${result.message}`);

    if (result.details) {
      console.log('   Details:');
      Object.entries(result.details).forEach(([key, value]) => {
        console.log(`   - ${key}: ${value}`);
      });
    }

    if (result.isStub) {
      console.log('   ⚠️  This is a stub connector (not yet implemented)');
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function testReportGeneration() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 TESTING REPORT GENERATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const orchestrator = new AnalyticsReporterOrchestrator();

  console.log('Running analytics reporter...');

  const result = await orchestrator.runReport({
    sendEmail: false, // Don't send emails in test mode
    cacheMetrics: false,
    trigger: 'test_script'
  });

  if (result.success) {
    console.log('\n✅ Report generated successfully!');
    console.log(`\nRun ID: ${result.runId}`);
    console.log(`\nSummary:`);
    console.log(`- Total metrics: ${result.analysis.summary.totalMetrics}`);
    console.log(`- Platforms: ${result.analysis.summary.platforms.join(', ')}`);
    console.log(`- Trends detected: ${result.analysis.summary.trendsDetected}`);
    console.log(`- Anomalies detected: ${result.analysis.summary.anomaliesDetected}`);

    console.log(`\nNarrative Bullets:`);
    result.analysis.narrativeBullets.forEach((bullet, i) => {
      console.log(`${i + 1}. ${bullet}`);
    });

    if (result.analysis.topWins.length > 0) {
      console.log(`\nTop Wins:`);
      result.analysis.topWins.forEach((win, i) => {
        console.log(`${i + 1}. ${win.title} (${win.value})`);
      });
    }

    if (result.analysis.topLosses.length > 0) {
      console.log(`\nTop Watch-outs:`);
      result.analysis.topLosses.forEach((loss, i) => {
        console.log(`${i + 1}. ${loss.title} (${loss.value})`);
      });
    }

    if (result.analysis.warnings.length > 0) {
      console.log(`\nWarnings:`);
      result.analysis.warnings.forEach(w => console.log(`⚠️  ${w}`));
    }
  } else {
    console.log('\n❌ Report generation failed!');
    console.log(`Error: ${result.error}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function showCurrentConfig() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚙️  CURRENT CONFIGURATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const config = ReporterConfig.load();

  console.log(`Enabled: ${config.enabled ? 'Yes' : 'No'}`);
  console.log(`Scheduled Sending: ${config.scheduledSending ? 'Yes' : 'No'}`);
  console.log(`Primary Recipient: ${config.primaryRecipient || '(not set)'}`);
  console.log(`Secondary Recipient: ${config.secondaryRecipient || '(not set)'}`);
  console.log(`Enabled Platforms: ${config.enabledPlatforms.join(', ')}`);
  console.log(`Report Window: ${config.reportWindowDays} days`);
  console.log(`Cron Expression: ${config.cronExpression}`);
  console.log(`Timezone: ${config.timezone}`);
  console.log(`Include CSV: ${config.includeCSV ? 'Yes' : 'No'}`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function runAllTests() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║    ANALYTICS REPORTER - COMPREHENSIVE TEST SUITE          ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  await showCurrentConfig();
  await testConnectorConfiguration();
  await testReportGeneration();

  console.log('✅ All tests completed!\n');
}

// Run tests
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('\n❌ Test suite failed:');
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  testConnectorConfiguration,
  testReportGeneration,
  showCurrentConfig,
  runAllTests
};
