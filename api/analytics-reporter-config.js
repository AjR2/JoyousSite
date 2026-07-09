/**
 * Analytics Reporter Configuration API
 * GET/POST /api/analytics-reporter-config
 */
const { ReporterConfig } = require('./analytics-reporter/data/models');
const { requireAuth } = require('./_lib/verifyToken');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!requireAuth(req, res)) return;

  try {
    if (req.method === 'GET') {
      // Get current configuration
      const config = ReporterConfig.load();
      return res.status(200).json({
        success: true,
        config
      });
    }

    if (req.method === 'POST') {
      // Update configuration
      const updates = req.body;

      // Validate
      if (updates.enabledPlatforms && !Array.isArray(updates.enabledPlatforms)) {
        return res.status(400).json({
          success: false,
          error: 'enabledPlatforms must be an array'
        });
      }

      if (updates.reportWindowDays && (updates.reportWindowDays < 1 || updates.reportWindowDays > 30)) {
        return res.status(400).json({
          success: false,
          error: 'reportWindowDays must be between 1 and 30'
        });
      }

      const updated = ReporterConfig.update(updates);

      return res.status(200).json({
        success: true,
        config: updated,
        message: 'Configuration updated'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Analytics Reporter config error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
