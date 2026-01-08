/**
 * Automation Configuration Example
 * 
 * Copy this file to automation.config.js and fill in your credentials.
 * 
 * IMPORTANT: Never commit automation.config.js with real credentials!
 * Add it to .gitignore.
 */

module.exports = {
  // Email recipients for weekly reports
  recipients: [
    'your-email@example.com'
  ],

  // Email service configuration
  // Options: 'console' (for testing), 'sendgrid', 'nodemailer'
  emailService: 'console',
  fromEmail: 'analytics@yourdomain.com',

  // Scheduling configuration
  schedule: {
    // Cron expression for weekly analytics
    // Default: Every Thursday at 9:00 AM
    cronExpression: '0 9 * * 4',
    timezone: 'America/New_York'
  },

  // Social media platforms to collect analytics from
  platforms: ['instagram', 'twitter', 'linkedin', 'facebook'],

  // Platform-specific credentials
  // These can also be set via environment variables (recommended)
  credentials: {
    instagram: {
      // Get from Facebook Developer Console
      // https://developers.facebook.com/docs/instagram-api/getting-started
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
      accountId: process.env.INSTAGRAM_ACCOUNT_ID || ''
    },
    twitter: {
      // Get from Twitter Developer Portal
      // https://developer.twitter.com/en/portal/dashboard
      bearerToken: process.env.TWITTER_BEARER_TOKEN || '',
      userId: process.env.TWITTER_USER_ID || ''
    },
    linkedin: {
      // Get from LinkedIn Developer Portal
      // https://www.linkedin.com/developers/
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN || '',
      organizationId: process.env.LINKEDIN_ORG_ID || ''
    },
    facebook: {
      // Get from Facebook Developer Console
      // https://developers.facebook.com/
      accessToken: process.env.FACEBOOK_ACCESS_TOKEN || '',
      pageId: process.env.FACEBOOK_PAGE_ID || ''
    }
  },

  // SendGrid configuration (if using SendGrid for email)
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || ''
  },

  // SMTP configuration (if using Nodemailer for email)
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || ''
  }
};

