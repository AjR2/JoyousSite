/**
 * Analytics Reporter Admin Component
 * Manages analytics reporting configuration and execution
 */
import React, { useState, useEffect } from 'react';
import './AnalyticsReporterAdmin.css';

const AnalyticsReporterAdmin = () => {
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeSection, setActiveSection] = useState('config');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [configRes, statusRes] = await Promise.all([
        fetch('/api/analytics-reporter-config'),
        fetch('/api/analytics-reporter-status')
      ]);

      const configData = await configRes.json();
      const statusData = await statusRes.json();

      if (configData.success) setConfig(configData.config);
      if (statusData.success) setStatus(statusData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics reporter data:', error);
      showMessage('Error loading data: ' + error.message, 'error');
      setLoading(false);
    }
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlatformToggle = (platform) => {
    setConfig(prev => ({
      ...prev,
      enabledPlatforms: prev.enabledPlatforms.includes(platform)
        ? prev.enabledPlatforms.filter(p => p !== platform)
        : [...prev.enabledPlatforms, platform]
    }));
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/analytics-reporter-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const data = await response.json();

      if (data.success) {
        setConfig(data.config);
        showMessage('Configuration saved successfully', 'success');
      } else {
        showMessage('Error saving: ' + data.error, 'error');
      }
    } catch (error) {
      showMessage('Error saving configuration: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRunNow = async () => {
    if (!confirm('Run analytics report now? This will send emails to configured recipients.')) {
      return;
    }

    setRunning(true);
    try {
      const response = await fetch('/api/analytics-reporter-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sendEmail: true, trigger: 'manual_admin' })
      });

      const data = await response.json();

      if (data.success) {
        showMessage(`Report generated successfully! ${data.emailResults?.filter(r => r.success).length || 0} emails sent.`, 'success');
        fetchData(); // Refresh status
      } else {
        showMessage('Error running report: ' + data.error, 'error');
      }
    } catch (error) {
      showMessage('Error running report: ' + error.message, 'error');
    } finally {
      setRunning(false);
    }
  };

  const handleSendTest = async () => {
    const testEmail = prompt('Enter email address for test:');
    if (!testEmail) return;

    setTesting(true);
    try {
      const response = await fetch('/api/analytics-reporter-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: testEmail })
      });

      const data = await response.json();

      if (data.success) {
        showMessage(`Test email sent to ${testEmail}`, 'success');
      } else {
        showMessage('Error sending test: ' + data.error, 'error');
      }
    } catch (error) {
      showMessage('Error sending test email: ' + error.message, 'error');
    } finally {
      setTesting(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  if (loading) {
    return (
      <div className="analytics-reporter-loading">
        <div className="loading-spinner"></div>
        <p>Loading Analytics Reporter...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="analytics-reporter-error">
        <p>Failed to load configuration</p>
        <button onClick={fetchData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="analytics-reporter-admin">
      <div className="ar-header">
        <h2>📊 Analytics Reporter</h2>
        <p>LatentMAS-powered social media analytics and reporting</p>
      </div>

      {message && (
        <div className={`ar-message ar-message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Section Navigation */}
      <div className="ar-section-nav">
        <button
          className={activeSection === 'config' ? 'active' : ''}
          onClick={() => setActiveSection('config')}
        >
          ⚙️ Configuration
        </button>
        <button
          className={activeSection === 'status' ? 'active' : ''}
          onClick={() => setActiveSection('status')}
        >
          📈 Status & History
        </button>
        <button
          className={activeSection === 'actions' ? 'active' : ''}
          onClick={() => setActiveSection('actions')}
        >
          🚀 Actions
        </button>
      </div>

      {/* Configuration Section */}
      {activeSection === 'config' && (
        <div className="ar-section">
          <h3>Configuration</h3>

          <div className="ar-form-group">
            <label>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => handleConfigChange('enabled', e.target.checked)}
              />
              Enable Analytics Reporter
            </label>
          </div>

          <div className="ar-form-group">
            <label>
              <input
                type="checkbox"
                checked={config.scheduledSending}
                onChange={(e) => handleConfigChange('scheduledSending', e.target.checked)}
              />
              Enable Scheduled Sending
            </label>
            <small>Automatically send daily reports</small>
          </div>

          <div className="ar-form-group">
            <label>Primary Recipient Email</label>
            <input
              type="email"
              value={config.primaryRecipient}
              onChange={(e) => handleConfigChange('primaryRecipient', e.target.value)}
              placeholder="primary@example.com"
            />
          </div>

          <div className="ar-form-group">
            <label>Secondary Recipient Email</label>
            <input
              type="email"
              value={config.secondaryRecipient}
              onChange={(e) => handleConfigChange('secondaryRecipient', e.target.value)}
              placeholder="secondary@example.com"
            />
          </div>

          <div className="ar-form-group">
            <label>Enabled Platforms</label>
            <div className="ar-platform-checkboxes">
              {['youtube', 'twitter_x', 'instagram', 'tiktok'].map(platform => (
                <label key={platform}>
                  <input
                    type="checkbox"
                    checked={config.enabledPlatforms.includes(platform)}
                    onChange={() => handlePlatformToggle(platform)}
                  />
                  {platform.replace('_', ' / ').toUpperCase()}
                </label>
              ))}
            </div>
            <small>Note: Only YouTube is fully functional. Others are stubs.</small>
          </div>

          <div className="ar-form-group">
            <label>Report Window (Days)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={config.reportWindowDays}
              onChange={(e) => handleConfigChange('reportWindowDays', parseInt(e.target.value))}
            />
            <small>Number of days to analyze (1-30)</small>
          </div>

          <div className="ar-form-group">
            <label>Email Subject Prefix (Optional)</label>
            <input
              type="text"
              value={config.emailSubjectPrefix}
              onChange={(e) => handleConfigChange('emailSubjectPrefix', e.target.value)}
              placeholder="[YourBrand]"
            />
          </div>

          <div className="ar-form-group">
            <label>
              <input
                type="checkbox"
                checked={config.includeCSV}
                onChange={(e) => handleConfigChange('includeCSV', e.target.checked)}
              />
              Include CSV Attachment
            </label>
          </div>

          <div className="ar-form-actions">
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="ar-btn-primary"
            >
              {saving ? 'Saving...' : '💾 Save Configuration'}
            </button>
          </div>
        </div>
      )}

      {/* Status Section */}
      {activeSection === 'status' && status && (
        <div className="ar-section">
          <h3>Status & History</h3>

          <div className="ar-stats-grid">
            <div className="ar-stat-card">
              <div className="ar-stat-label">Total Runs</div>
              <div className="ar-stat-value">{status.stats.totalRuns}</div>
            </div>
            <div className="ar-stat-card">
              <div className="ar-stat-label">Successful</div>
              <div className="ar-stat-value success">{status.stats.successful}</div>
            </div>
            <div className="ar-stat-card">
              <div className="ar-stat-label">Failed</div>
              <div className="ar-stat-value error">{status.stats.failed}</div>
            </div>
            <div className="ar-stat-card">
              <div className="ar-stat-label">Success Rate</div>
              <div className="ar-stat-value">{status.stats.successRate}%</div>
            </div>
          </div>

          {status.stats.lastRun && (
            <div className="ar-last-run">
              <h4>Last Run</h4>
              <p><strong>Run ID:</strong> {status.stats.lastRun.runId}</p>
              <p><strong>Started:</strong> {new Date(status.stats.lastRun.startedAt).toLocaleString()}</p>
              <p><strong>Status:</strong> {status.stats.lastRun.success ? '✅ Success' : '❌ Failed'}</p>
              <p><strong>Email Sent:</strong> {status.stats.lastRun.emailSent ? 'Yes' : 'No'}</p>
            </div>
          )}

          {status.recentRuns && status.recentRuns.length > 0 && (
            <div className="ar-recent-runs">
              <h4>Recent Runs</h4>
              <table>
                <thead>
                  <tr>
                    <th>Run ID</th>
                    <th>Started</th>
                    <th>Status</th>
                    <th>Trends</th>
                    <th>Anomalies</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {status.recentRuns.map(run => (
                    <tr key={run.runId}>
                      <td><code>{run.runId.slice(-8)}</code></td>
                      <td>{new Date(run.startedAt).toLocaleString()}</td>
                      <td>{run.success ? '✅' : '❌'}</td>
                      <td>{run.summaryJson?.trendsDetected || 0}</td>
                      <td>{run.summaryJson?.anomaliesDetected || 0}</td>
                      <td>{run.emailSent ? '📧' : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Actions Section */}
      {activeSection === 'actions' && (
        <div className="ar-section">
          <h3>Actions</h3>

          <div className="ar-action-card">
            <h4>🚀 Run Report Now</h4>
            <p>Generate and send analytics report immediately to configured recipients.</p>
            <button
              onClick={handleRunNow}
              disabled={running || !config.primaryRecipient}
              className="ar-btn-primary ar-btn-large"
            >
              {running ? '⏳ Running...' : '▶️ Run Now'}
            </button>
            {!config.primaryRecipient && (
              <small className="ar-warning">Configure recipient email first</small>
            )}
          </div>

          <div className="ar-action-card">
            <h4>📧 Send Test Email</h4>
            <p>Send a test email to verify email delivery is working.</p>
            <button
              onClick={handleSendTest}
              disabled={testing}
              className="ar-btn-secondary ar-btn-large"
            >
              {testing ? '⏳ Sending...' : '📨 Send Test'}
            </button>
          </div>

          <div className="ar-action-card">
            <h4>🔄 Refresh Data</h4>
            <p>Reload configuration and status from server.</p>
            <button
              onClick={fetchData}
              className="ar-btn-secondary ar-btn-large"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsReporterAdmin;
