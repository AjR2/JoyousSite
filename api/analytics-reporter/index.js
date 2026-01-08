/**
 * Analytics Reporter Module Exports
 */
const AnalyticsReporterOrchestrator = require('./orchestrator');
const LatentMASAnalyzer = require('./latentmas/analyzer');
const ReportBuilder = require('./report-builder');
const { AnalyticsReporterScheduler, getScheduler } = require('./scheduler');
const { ReporterConfig, RunHistory, DailyMetrics } = require('./data/models');
const connectors = require('./connectors');

module.exports = {
  // Main orchestrator
  AnalyticsReporterOrchestrator,

  // Core components
  LatentMASAnalyzer,
  ReportBuilder,

  // Scheduler
  AnalyticsReporterScheduler,
  getScheduler,

  // Data models
  ReporterConfig,
  RunHistory,
  DailyMetrics,

  // Connectors
  ...connectors
};
