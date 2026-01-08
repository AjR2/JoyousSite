/**
 * EmailReportAgent - Generates and sends email reports
 * 
 * Features:
 * - Generate formatted HTML/text reports from analytics data
 * - Send emails via configured email service (SendGrid, Nodemailer, etc.)
 * - Support for scheduled delivery
 * - Template-based report generation
 */

const BaseAgent = require('./base-agent');

class EmailReportAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      ...config,
      name: config.name || 'EmailReportAgent',
      role: 'report_generator',
      capabilities: ['generate_report', 'send_email', 'format_html', 'format_text']
    });

    this.emailConfig = config.emailConfig || {};
    this.templates = config.templates || {};
    this.defaultRecipients = config.recipients || [];
  }

  /**
   * Main task performer
   */
  async performTask(task) {
    const { type, ...params } = task;

    switch (type) {
      case 'generate_report':
        return this.generateReport(params.data, params.format);
      case 'send_email':
        return await this.sendEmail(params);
      case 'generate_and_send':
        return await this.generateAndSend(params);
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  /**
   * Generate a formatted report from analytics data
   */
  generateReport(data, format = 'html') {
    const reportDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (format === 'html') {
      return this.generateHTMLReport(data, reportDate);
    } else {
      return this.generateTextReport(data, reportDate);
    }
  }

  /**
   * Generate HTML formatted report
   */
  generateHTMLReport(data, reportDate) {
    let platformSections = '';

    if (data.data) {
      for (const [platform, platformData] of Object.entries(data.data)) {
        const metrics = platformData.metrics || {};
        let metricsHTML = '';

        for (const [key, value] of Object.entries(metrics)) {
          if (key !== 'note' && key !== 'configureAt') {
            metricsHTML += `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;">${this.formatMetricName(key)}</td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${this.formatValue(value)}</td></tr>`;
          }
        }

        if (metrics.note) {
          metricsHTML = `<tr><td colspan="2" style="padding: 12px; color: #666; font-style: italic;">${metrics.note}</td></tr>`;
        }

        platformSections += `
          <div style="margin-bottom: 24px; background: #f9f9f9; border-radius: 8px; padding: 16px;">
            <h3 style="margin: 0 0 12px 0; color: #333; text-transform: capitalize;">${platform}</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${metricsHTML || '<tr><td style="color: #666;">No metrics available</td></tr>'}
            </table>
            <p style="font-size: 12px; color: #888; margin: 8px 0 0 0;">Source: ${platformData.source || 'unknown'}</p>
          </div>
        `;
      }
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #1a1a1a; margin: 0;">📊 Weekly Social Media Analytics</h1>
    <p style="color: #666; margin: 8px 0 0 0;">${reportDate}</p>
  </div>

  <div style="background: #e8f4fd; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <h2 style="margin: 0 0 8px 0; color: #0066cc; font-size: 16px;">Summary</h2>
    <p style="margin: 0; color: #333;">
      Collected analytics from <strong>${data.totalPlatforms || 0}</strong> platforms.
      <br/>Successful: ${data.successfulFetches || 0} | Failed: ${data.failedFetches || 0}
    </p>
  </div>

  ${platformSections}

  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 12px;">
    <p>Generated automatically by Akeyreu Nimbus AI</p>
    <p>Report collected at: ${data.collectedAt || new Date().toISOString()}</p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text report
   */
  generateTextReport(data, reportDate) {
    let report = `
===========================================
📊 WEEKLY SOCIAL MEDIA ANALYTICS REPORT
${reportDate}
===========================================

SUMMARY
-------
Platforms Analyzed: ${data.totalPlatforms || 0}
Successful: ${data.successfulFetches || 0}
Failed: ${data.failedFetches || 0}

`;

    if (data.data) {
      for (const [platform, platformData] of Object.entries(data.data)) {
        report += `\n${platform.toUpperCase()}\n${'='.repeat(platform.length)}\n`;
        const metrics = platformData.metrics || {};
        
        for (const [key, value] of Object.entries(metrics)) {
          report += `${this.formatMetricName(key)}: ${this.formatValue(value)}\n`;
        }
        report += `Source: ${platformData.source || 'unknown'}\n`;
      }
    }

    report += `\n---\nGenerated by Akeyreu Nimbus AI\n${data.collectedAt || new Date().toISOString()}`;
    return report;
  }

  /**
   * Format metric name to be human-readable
   */
  formatMetricName(name) {
    return name
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Format value for display
   */
  formatValue(value) {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  }

  /**
   * Send an email using configured email service
   */
  async sendEmail(params) {
    const { to, subject, html, text, attachments } = params;
    const recipients = to || this.defaultRecipients;

    if (!recipients || !recipients.length) {
      // No recipients - just log to console
      console.log('⚠️ No recipients configured - logging report to console only');
      return this.logEmail(['(no recipients)'], subject, html, text);
    }

    // Use the configured email service
    const emailService = this.emailConfig.service || 'console';

    switch (emailService) {
      case 'sendgrid':
        return await this.sendViaSendGrid(recipients, subject, html, text);
      case 'mailgun':
        return await this.sendViaMailgun(recipients, subject, html, text);
      case 'nodemailer':
        return await this.sendViaNodemailer(recipients, subject, html, text);
      case 'console':
      default:
        return this.logEmail(recipients, subject, html, text);
    }
  }

  /**
   * Send email via SendGrid
   */
  async sendViaSendGrid(to, subject, html, text) {
    const apiKey = process.env.SENDGRID_API_KEY;
    const from = this.emailConfig.from || process.env.SENDGRID_FROM_EMAIL;

    if (!apiKey) {
      throw new Error('SendGrid API key not configured. Set SENDGRID_API_KEY environment variable.');
    }

    const fetch = global.fetch || require('node-fetch');

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: to.map(email => ({ email })) }],
        from: { email: from },
        subject,
        content: [
          { type: 'text/html', value: html },
          { type: 'text/plain', value: text || 'Please view this email in an HTML-capable client.' }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SendGrid error: ${response.status} - ${errorText}`);
    }

    return {
      success: true,
      service: 'sendgrid',
      recipients: to,
      subject,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Send email via Mailgun
   */
  async sendViaMailgun(to, subject, html, text) {
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;
    const from = this.emailConfig.from || process.env.MAILGUN_FROM_EMAIL || `Analytics Reporter <mailgun@${domain}>`;

    if (!apiKey || !domain) {
      throw new Error('Mailgun not configured. Set MAILGUN_API_KEY and MAILGUN_DOMAIN environment variables.');
    }

    const fetch = global.fetch || require('node-fetch');

    // Mailgun uses basic auth with "api" as username and API key as password
    const auth = Buffer.from(`api:${apiKey}`).toString('base64');

    // Prepare form data for Mailgun
    const formData = new URLSearchParams();
    formData.append('from', from);
    formData.append('subject', subject);
    formData.append('html', html);
    formData.append('text', text || 'Please view this email in an HTML-capable client.');

    // Add recipients
    to.forEach(email => formData.append('to', email));

    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mailgun error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    return {
      success: true,
      service: 'mailgun',
      messageId: result.id,
      recipients: to,
      subject,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Send email via Nodemailer (for SMTP)
   */
  async sendViaNodemailer(to, subject, html, text) {
    try {
      const nodemailer = require('nodemailer');

      const transporter = nodemailer.createTransport({
        host: this.emailConfig.smtp?.host || process.env.SMTP_HOST,
        port: this.emailConfig.smtp?.port || process.env.SMTP_PORT || 587,
        secure: this.emailConfig.smtp?.secure || false,
        auth: {
          user: this.emailConfig.smtp?.user || process.env.SMTP_USER,
          pass: this.emailConfig.smtp?.pass || process.env.SMTP_PASS
        }
      });

      const info = await transporter.sendMail({
        from: this.emailConfig.from || process.env.SMTP_FROM,
        to: to.join(', '),
        subject,
        text,
        html
      });

      return {
        success: true,
        service: 'nodemailer',
        messageId: info.messageId,
        recipients: to,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Nodemailer error: ${error.message}`);
    }
  }

  /**
   * Log email to console (for testing/development)
   */
  logEmail(to, subject, html, text) {
    console.log('='.repeat(60));
    console.log('📧 EMAIL REPORT (Console Mode)');
    console.log('='.repeat(60));
    console.log(`To: ${to.join(', ')}`);
    console.log(`Subject: ${subject}`);
    console.log('-'.repeat(60));
    console.log(text || 'HTML content - view in browser');
    console.log('='.repeat(60));

    return {
      success: true,
      service: 'console',
      recipients: to,
      subject,
      note: 'Email logged to console. Configure SENDGRID_API_KEY or SMTP settings for actual delivery.',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate a report and send it in one operation
   */
  async generateAndSend(params) {
    const { data, recipients, subject, format = 'html' } = params;

    // Generate the report
    const htmlContent = this.generateHTMLReport(data, new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }));

    const textContent = this.generateTextReport(data, new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }));

    // Send the email
    const emailResult = await this.sendEmail({
      to: recipients || this.defaultRecipients,
      subject: subject || `📊 Weekly Social Media Analytics - ${new Date().toLocaleDateString()}`,
      html: htmlContent,
      text: textContent
    });

    return {
      reportGenerated: true,
      emailSent: emailResult.success,
      emailDetails: emailResult
    };
  }
}

module.exports = EmailReportAgent;

