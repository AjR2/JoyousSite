/**
 * Analytics Report Builder
 * Generates HTML and plaintext email reports
 */

class ReportBuilder {
  constructor(config = {}) {
    this.config = {
      subjectPrefix: config.subjectPrefix || '',
      brandColor: config.brandColor || '#1DA1F2',
      logoUrl: config.logoUrl || '',
      ...config
    };
  }

  /**
   * Build complete report from analysis results
   */
  build(analysisResult, metadata = {}) {
    const { narrativeBullets, topWins, topLosses, anomalies, priorities, tables, warnings, summary } = analysisResult;

    const reportData = {
      date: metadata.date || new Date().toISOString().split('T')[0],
      subject: this.buildSubject(metadata.date),
      html: this.buildHTML(analysisResult, metadata),
      plaintext: this.buildPlaintext(analysisResult, metadata),
      attachments: metadata.includeCSV ? this.buildCSVAttachment(tables) : null,
      metadata: {
        ...summary,
        generatedAt: new Date().toISOString(),
        reportType: 'daily_analytics'
      }
    };

    return reportData;
  }

  /**
   * Build email subject line
   */
  buildSubject(date) {
    const dateStr = date || new Date().toISOString().split('T')[0];
    const prefix = this.config.subjectPrefix ? `${this.config.subjectPrefix} ` : '';
    return `${prefix}Daily Social Analytics — ${dateStr}`;
  }

  /**
   * Build HTML email body
   */
  buildHTML(analysisResult, metadata) {
    const { narrativeBullets, topWins, topLosses, anomalies, priorities, tables, warnings } = analysisResult;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Analytics Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid ${this.config.brandColor};
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      color: ${this.config.brandColor};
      margin: 0;
      font-size: 28px;
    }
    .date {
      color: #666;
      font-size: 14px;
      margin-top: 5px;
    }
    h2 {
      color: #333;
      font-size: 20px;
      margin-top: 30px;
      margin-bottom: 15px;
      border-bottom: 2px solid #eee;
      padding-bottom: 8px;
    }
    .summary-bullets {
      background: #f8f9fa;
      border-left: 4px solid ${this.config.brandColor};
      padding: 15px 20px;
      margin: 20px 0;
    }
    .summary-bullets li {
      margin: 8px 0;
    }
    .insight-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .insight-card {
      background: #fff;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      padding: 15px;
    }
    .insight-card.win {
      border-color: #4caf50;
      background: #f1f8f4;
    }
    .insight-card.loss {
      border-color: #f44336;
      background: #fef5f5;
    }
    .insight-title {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 5px;
    }
    .insight-value {
      font-size: 24px;
      font-weight: bold;
      margin: 10px 0;
    }
    .insight-value.positive {
      color: #4caf50;
    }
    .insight-value.negative {
      color: #f44336;
    }
    .insight-description {
      font-size: 13px;
      color: #666;
    }
    .anomaly-item {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 12px;
      margin: 10px 0;
      border-radius: 4px;
    }
    .anomaly-severity {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .severity-high {
      background: #f44336;
      color: white;
    }
    .severity-medium {
      background: #ff9800;
      color: white;
    }
    .severity-low {
      background: #ffc107;
      color: #333;
    }
    .priority-item {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 12px;
      margin: 10px 0;
      border-radius: 4px;
    }
    .priority-label {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      margin-right: 8px;
    }
    .priority-high {
      background: #f44336;
      color: white;
    }
    .priority-medium {
      background: #ff9800;
      color: white;
    }
    .priority-low {
      background: #4caf50;
      color: white;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 13px;
    }
    th {
      background: ${this.config.brandColor};
      color: white;
      padding: 10px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #eee;
    }
    tr:hover {
      background: #f5f5f5;
    }
    .warning {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      padding: 10px 15px;
      margin: 15px 0;
      font-size: 13px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Daily Social Analytics Report</h1>
      <div class="date">${metadata.date || new Date().toISOString().split('T')[0]}</div>
    </div>

    <!-- Executive Summary -->
    <section>
      <h2>📈 Executive Summary</h2>
      <div class="summary-bullets">
        <ul>
          ${narrativeBullets.map(bullet => `<li>${this.escapeHtml(bullet)}</li>`).join('')}
        </ul>
      </div>
    </section>

    <!-- Key Wins -->
    ${topWins.length > 0 ? `
    <section>
      <h2>🏆 Key Wins</h2>
      <div class="insight-grid">
        ${topWins.map(win => `
          <div class="insight-card win">
            <div class="insight-title">${this.escapeHtml(win.title)}</div>
            <div class="insight-value positive">${this.escapeHtml(win.value)}</div>
            <div class="insight-description">${this.escapeHtml(win.description)}</div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- Key Watch-outs -->
    ${topLosses.length > 0 ? `
    <section>
      <h2>⚠️ Key Watch-outs</h2>
      <div class="insight-grid">
        ${topLosses.map(loss => `
          <div class="insight-card loss">
            <div class="insight-title">${this.escapeHtml(loss.title)}</div>
            <div class="insight-value negative">${this.escapeHtml(loss.value)}</div>
            <div class="insight-description">${this.escapeHtml(loss.description)}</div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- Anomalies -->
    ${anomalies.length > 0 ? `
    <section>
      <h2>🔍 Anomalies Detected</h2>
      ${anomalies.map(anomaly => `
        <div class="anomaly-item">
          <span class="anomaly-severity severity-${anomaly.severity}">${anomaly.severity}</span>
          <strong>${this.escapeHtml(anomaly.platform)}</strong> — ${this.escapeHtml(anomaly.description)}
          <br><small>Date: ${anomaly.date} | MAD Score: ${anomaly.madScore}</small>
        </div>
      `).join('')}
    </section>
    ` : ''}

    <!-- Recommended Actions -->
    ${priorities.length > 0 ? `
    <section>
      <h2>✅ Recommended Next Actions</h2>
      ${priorities.map(priority => `
        <div class="priority-item">
          <span class="priority-label priority-${priority.priority}">${priority.priority}</span>
          <strong>${this.escapeHtml(priority.action)}</strong>
          <br><small>${this.escapeHtml(priority.reason)}</small>
        </div>
      `).join('')}
    </section>
    ` : ''}

    <!-- Platform Tables -->
    ${Object.keys(tables).length > 0 ? `
    <section>
      <h2>📊 Platform Metrics (7-Day View)</h2>
      ${Object.entries(tables).map(([platform, rows]) => {
        const isYouTube = platform.toLowerCase() === 'youtube';
        return `
        <h3 style="margin-top: 20px; color: #666; text-transform: capitalize;">${platform}</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Views</th>
              ${isYouTube ? '<th>Watch Time</th>' : '<th>Impressions</th>'}
              <th>Engagement</th>
              <th>${isYouTube ? 'Subs Δ' : 'Followers Δ'}</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                <td>${row.date}</td>
                <td>${row.views.toLocaleString()}</td>
                ${isYouTube
                  ? `<td>${this.formatWatchTime(row.watch_time_minutes)}</td>`
                  : `<td>${row.impressions.toLocaleString()}</td>`
                }
                <td>${row.engagement.toLocaleString()}</td>
                <td>${row.followers_delta > 0 ? '+' : ''}${row.followers_delta}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}).join('')}
    </section>
    ` : ''}

    <!-- Warnings -->
    ${warnings.length > 0 ? `
    <section>
      <div class="warning">
        <strong>⚠️ Data Quality Notes:</strong>
        <ul style="margin: 5px 0 0 0; padding-left: 20px;">
          ${warnings.map(w => `<li>${this.escapeHtml(w)}</li>`).join('')}
        </ul>
      </div>
    </section>
    ` : ''}

    <div class="footer">
      Generated by LatentMAS Analytics Reporter<br>
      ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Build plaintext email body
   */
  buildPlaintext(analysisResult, metadata) {
    const { narrativeBullets, topWins, topLosses, anomalies, priorities, tables, warnings } = analysisResult;
    const lines = [];

    lines.push('═══════════════════════════════════════════════════');
    lines.push('    DAILY SOCIAL ANALYTICS REPORT');
    lines.push(`    ${metadata.date || new Date().toISOString().split('T')[0]}`);
    lines.push('═══════════════════════════════════════════════════');
    lines.push('');

    // Executive Summary
    lines.push('📈 EXECUTIVE SUMMARY');
    lines.push('───────────────────────────────────────────────────');
    narrativeBullets.forEach(bullet => lines.push(`  • ${bullet}`));
    lines.push('');

    // Key Wins
    if (topWins.length > 0) {
      lines.push('🏆 KEY WINS');
      lines.push('───────────────────────────────────────────────────');
      topWins.forEach(win => {
        lines.push(`  ${win.title}`);
        lines.push(`  ${win.value} — ${win.description}`);
        lines.push('');
      });
    }

    // Key Watch-outs
    if (topLosses.length > 0) {
      lines.push('⚠️  KEY WATCH-OUTS');
      lines.push('───────────────────────────────────────────────────');
      topLosses.forEach(loss => {
        lines.push(`  ${loss.title}`);
        lines.push(`  ${loss.value} — ${loss.description}`);
        lines.push('');
      });
    }

    // Anomalies
    if (anomalies.length > 0) {
      lines.push('🔍 ANOMALIES DETECTED');
      lines.push('───────────────────────────────────────────────────');
      anomalies.forEach(anomaly => {
        lines.push(`  [${anomaly.severity.toUpperCase()}] ${anomaly.platform}`);
        lines.push(`  ${anomaly.description}`);
        lines.push('');
      });
    }

    // Priorities
    if (priorities.length > 0) {
      lines.push('✅ RECOMMENDED NEXT ACTIONS');
      lines.push('───────────────────────────────────────────────────');
      priorities.forEach(priority => {
        lines.push(`  [${priority.priority.toUpperCase()}] ${priority.action}`);
        lines.push(`  Reason: ${priority.reason}`);
        lines.push('');
      });
    }

    // Warnings
    if (warnings.length > 0) {
      lines.push('⚠️  DATA QUALITY NOTES');
      lines.push('───────────────────────────────────────────────────');
      warnings.forEach(w => lines.push(`  • ${w}`));
      lines.push('');
    }

    lines.push('═══════════════════════════════════════════════════');
    lines.push(`Generated by LatentMAS Analytics Reporter`);
    lines.push(`${new Date().toLocaleString()}`);
    lines.push('═══════════════════════════════════════════════════');

    return lines.join('\n');
  }

  /**
   * Build CSV attachment (optional)
   */
  buildCSVAttachment(tables) {
    const csvParts = [];

    for (const [platform, rows] of Object.entries(tables)) {
      csvParts.push(`Platform: ${platform}`);
      csvParts.push('Date,Views,Impressions,Engagement,Followers Delta');

      rows.forEach(row => {
        csvParts.push(`${row.date},${row.views},${row.impressions},${row.engagement},${row.followers_delta}`);
      });

      csvParts.push('');
    }

    return {
      filename: `analytics-${new Date().toISOString().split('T')[0]}.csv`,
      content: csvParts.join('\n'),
      contentType: 'text/csv'
    };
  }

  /**
   * Escape HTML for safe rendering
   */
  escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Format watch time from minutes to human-readable format
   */
  formatWatchTime(minutes) {
    if (!minutes || minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }
}

module.exports = ReportBuilder;
