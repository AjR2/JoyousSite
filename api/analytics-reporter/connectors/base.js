/**
 * Base Social Media Connector Interface
 * All platform connectors must extend this class
 */
class SocialConnector {
  constructor(config = {}) {
    this.config = config;
    this.platform = 'unknown';
  }

  /**
   * Fetch daily metrics for a date range
   * @param {Object} params - Query parameters
   * @param {string} params.startDate - YYYY-MM-DD format
   * @param {string} params.endDate - YYYY-MM-DD format
   * @param {string} params.accountId - Platform-specific account identifier
   * @returns {Promise<Array<Object>>} Array of normalized daily metrics
   */
  async getDailyMetrics(params) {
    throw new Error('getDailyMetrics must be implemented by subclass');
  }

  /**
   * Normalize platform-specific data to unified schema
   * @param {Object} rawData - Platform-specific raw data
   * @param {string} date - YYYY-MM-DD format
   * @returns {Object} NormalizedDailyMetrics
   */
  normalize(rawData, date) {
    throw new Error('normalize must be implemented by subclass');
  }

  /**
   * Test connection to platform API
   * @returns {Promise<Object>} Status object with success boolean and message
   */
  async testConnection() {
    try {
      // Default implementation - subclasses can override
      const testDate = new Date();
      testDate.setDate(testDate.getDate() - 1);
      const yesterday = testDate.toISOString().split('T')[0];

      await this.getDailyMetrics({
        startDate: yesterday,
        endDate: yesterday,
        accountId: this.config.accountId
      });

      return { success: true, message: `${this.platform} connection successful` };
    } catch (error) {
      return { success: false, message: error.message, error };
    }
  }

  /**
   * Get connector metadata
   * @returns {Object} Connector info
   */
  getInfo() {
    return {
      platform: this.platform,
      accountId: this.config.accountId,
      configured: this.isConfigured()
    };
  }

  /**
   * Check if connector is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    return false; // Override in subclasses
  }
}

module.exports = SocialConnector;
