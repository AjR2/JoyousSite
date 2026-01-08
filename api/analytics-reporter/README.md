# LatentMAS Analytics Reporter

Automated social media analytics reporting system with multi-agent analysis, anomaly detection, and daily email delivery.

## 🎯 Features

- **Multi-Platform Analytics**: Pull metrics from YouTube, Twitter/X, Instagram, TikTok (YouTube fully functional, others are stubs)
- **LatentMAS Analysis Engine**:
  - Trend detection (recent vs. historical comparison)
  - Anomaly detection using Median Absolute Deviation (MAD)
  - Priority scoring for actionable insights
  - Automated narrative generation
- **Beautiful HTML Email Reports**: Professional email templates with tables, charts, and insights
- **Flexible Scheduling**: Daily automated reports via node-cron
- **Admin UI**: Full configuration and control panel in existing admin interface
- **JSON-Based Storage**: Lightweight data persistence without additional DB setup

## 📁 Architecture

```
api/analytics-reporter/
├── connectors/               # Platform-specific data connectors
│   ├── base.js              # Base connector interface
│   ├── youtube.js           # ✅ Functional YouTube connector
│   ├── twitter-x.js         # 🔲 Stub implementation
│   ├── instagram.js         # 🔲 Stub implementation
│   ├── tiktok.js            # 🔲 Stub implementation
│   └── index.js             # Connector factory
│
├── latentmas/               # Analysis engine
│   └── analyzer.js          # Trend detection, anomalies, priorities
│
├── data/                    # JSON-based data models
│   └── models.js            # ReporterConfig, RunHistory, DailyMetrics
│
├── orchestrator.js          # Main coordination logic
├── report-builder.js        # HTML/plaintext email templates
├── scheduler.js             # node-cron integration
├── index.js                 # Module exports
├── test.js                  # Test suite
└── README.md                # This file

api/                         # Vercel serverless endpoints
├── analytics-reporter-status.js    # GET status and history
├── analytics-reporter-config.js    # GET/POST configuration
├── analytics-reporter-run.js       # POST run report now
└── analytics-reporter-test.js      # POST send test email
```

## 🚀 Quick Start

### 1. Configure Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# YouTube (required for functional connector)
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=your_channel_id

# Email recipients
ANALYTICS_PRIMARY_RECIPIENT=you@example.com
ANALYTICS_SECONDARY_RECIPIENT=colleague@example.com

# Email delivery (choose one)
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=analytics@yourdomain.com
# OR
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_SERVICE=sendgrid  # or 'nodemailer' or 'console'

# Optional: customize schedule
ANALYTICS_CRON_EXPRESSION=0 9 * * *  # Daily at 9 AM
ANALYTICS_TIMEZONE=America/New_York
ANALYTICS_REPORT_WINDOW_DAYS=7
```

### 2. Get YouTube API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **YouTube Data API v3**
4. Create credentials → API Key
5. Find your channel ID: YouTube Studio → Settings → Channel → Advanced settings

### 3. Access Admin Panel

1. Navigate to: `https://yoursite.com/admin`
2. Login with your admin credentials
3. Click the **"📊 Analytics Reporter"** tab
4. Configure recipients and platforms
5. Click **"💾 Save Configuration"**

### 4. Test the System

**Option A: Admin UI**
- Click **"📨 Send Test"** to send a test email
- Click **"▶️ Run Now"** to generate a full report

**Option B: Command Line**
```bash
cd /path/to/project
node api/analytics-reporter/test.js
```

## 📊 How It Works

### Data Flow

```
┌─────────────────┐
│   Schedulercron │ ──┐
│   or Manual     │   │
└─────────────────┘   │
                      ▼
            ┌──────────────────┐
            │   Orchestrator   │
            └──────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ YouTube  │  │Twitter/X │  │Instagram │
  │Connector │  │Connector │  │Connector │
  └──────────┘  └──────────┘  └──────────┘
        │             │             │
        └─────────────┼─────────────┘
                      ▼
          ┌──────────────────────┐
          │  Normalized Metrics  │
          └──────────────────────┘
                      │
                      ▼
          ┌──────────────────────┐
          │  LatentMAS Analyzer  │
          │  • Trend Detection   │
          │  • Anomaly Detection │
          │  • Priority Scoring  │
          └──────────────────────┘
                      │
                      ▼
          ┌──────────────────────┐
          │   Report Builder     │
          │  • HTML Template     │
          │  • Plaintext         │
          │  • CSV (optional)    │
          └──────────────────────┘
                      │
                      ▼
          ┌──────────────────────┐
          │   Email Delivery     │
          │  (SendGrid or SMTP)  │
          └──────────────────────┘
```

### LatentMAS Analysis

**Trend Detection**:
- Compares recent window (default: last 2 days) vs. previous period (default: 5 days)
- Calculates percentage change for all metrics
- Flags trends >10% as significant

**Anomaly Detection**:
- Uses Median Absolute Deviation (MAD) for robust outlier detection
- Calculates MAD score for each metric
- Flags values >2.5 MAD as anomalies
- Severity: high (>4 MAD), medium (>3 MAD), low (>2.5 MAD)

**Priority Scoring**:
- Weighted scoring based on metric importance
- Default weights:
  - `followers_delta`: 1.5
  - `engagement_rate`: 1.2
  - `views`: 1.0
  - `watch_time`: 0.9
  - `impressions`: 0.8

## 🔌 API Endpoints

All endpoints are Vercel serverless functions:

### GET /api/analytics-reporter-status
Get current status, stats, and recent run history.

**Query params**:
- `testConnectors=true` - Include connector test results

**Response**:
```json
{
  "success": true,
  "config": {
    "enabled": true,
    "scheduledSending": true,
    "enabledPlatforms": ["youtube"],
    "hasRecipients": true
  },
  "stats": {
    "totalRuns": 10,
    "successful": 9,
    "failed": 1,
    "successRate": "90.0",
    "lastRun": {
      "runId": "run_1234567890_abc123",
      "startedAt": "2025-01-08T12:00:00.000Z",
      "success": true,
      "emailSent": true
    }
  },
  "recentRuns": [...]
}
```

### GET /api/analytics-reporter-config
Get current configuration.

### POST /api/analytics-reporter-config
Update configuration.

**Body**:
```json
{
  "enabled": true,
  "primaryRecipient": "you@example.com",
  "secondaryRecipient": "colleague@example.com",
  "enabledPlatforms": ["youtube"],
  "reportWindowDays": 7,
  "scheduledSending": true
}
```

### POST /api/analytics-reporter-run
Trigger report generation and delivery.

**Body**:
```json
{
  "sendEmail": true,
  "testRecipient": null,
  "trigger": "manual"
}
```

**Response**:
```json
{
  "success": true,
  "runId": "run_1234567890_abc123",
  "summary": {
    "totalMetrics": 7,
    "trendsDetected": 3,
    "anomaliesDetected": 1
  },
  "narrativeBullets": [...],
  "topWins": [...],
  "emailResults": [...]
}
```

### POST /api/analytics-reporter-test
Send test email to verify delivery.

**Body**:
```json
{
  "recipient": "test@example.com"
}
```

## 📅 Scheduling

### Default Schedule
- **Frequency**: Daily
- **Time**: 9:00 AM
- **Timezone**: America/New_York
- **Cron**: `0 9 * * *`

### Custom Schedule

Configure via environment variables:
```bash
ANALYTICS_CRON_EXPRESSION=0 6 * * *  # 6 AM daily
ANALYTICS_TIMEZONE=America/Los_Angeles
```

Or via admin UI:
1. Go to Admin → Analytics Reporter → Configuration
2. Update cron expression
3. Save configuration
4. Scheduler will restart automatically

### Cron Expression Format
```
┌─────────── minute (0 - 59)
│ ┌───────── hour (0 - 23)
│ │ ┌─────── day of month (1 - 31)
│ │ │ ┌───── month (1 - 12)
│ │ │ │ ┌─── day of week (0 - 6) (Sunday=0)
│ │ │ │ │
* * * * *
```

**Examples**:
- `0 9 * * *` - Daily at 9 AM
- `0 9 * * 1-5` - Weekdays at 9 AM
- `0 9 * * 1` - Mondays at 9 AM
- `0 6,18 * * *` - 6 AM and 6 PM daily

## 🧪 Testing

### Run Test Suite
```bash
node api/analytics-reporter/test.js
```

Tests:
1. ✅ Connector configuration
2. ✅ Report generation (without email)
3. ✅ Current configuration display

### Test Individual Components

**Test connectors only**:
```javascript
const { testAllConnectors } = require('./api/analytics-reporter');
const results = await testAllConnectors();
console.log(results);
```

**Test report generation**:
```javascript
const { AnalyticsReporterOrchestrator } = require('./api/analytics-reporter');
const orchestrator = new AnalyticsReporterOrchestrator();
const result = await orchestrator.runReport({ sendEmail: false });
```

**Test email delivery**:
```bash
curl -X POST https://yoursite.com/api/analytics-reporter-test \
  -H "Content-Type: application/json" \
  -d '{"recipient":"test@example.com"}'
```

## 📝 Data Storage

### File Locations
```
public/analytics-data/
├── reporter-config.json      # Configuration
├── run-history.json          # Execution history (last 100 runs)
└── daily-metrics.json        # Cached metrics (last 90 days)
```

### Configuration Schema
```json
{
  "enabled": false,
  "primaryRecipient": "",
  "secondaryRecipient": "",
  "enabledPlatforms": ["youtube"],
  "reportWindowDays": 7,
  "emailSubjectPrefix": "",
  "scheduledSending": false,
  "cronExpression": "0 9 * * *",
  "timezone": "America/New_York",
  "includeCSV": false,
  "lastUpdated": "2025-01-08T12:00:00.000Z"
}
```

### Run History Schema
```json
{
  "runId": "run_1234567890_abc123",
  "startedAt": "2025-01-08T09:00:00.000Z",
  "completedAt": "2025-01-08T09:00:15.000Z",
  "success": true,
  "warnings": [],
  "recipients": ["you@example.com"],
  "emailSent": true,
  "summaryJson": {
    "totalMetrics": 7,
    "trendsDetected": 3,
    "anomaliesDetected": 1
  },
  "errorMessage": null
}
```

## 🔧 Extending Connectors

### Implementing a New Platform

1. **Create connector file**: `api/analytics-reporter/connectors/newplatform.js`

```javascript
const SocialConnector = require('./base');

class NewPlatformConnector extends SocialConnector {
  constructor(config = {}) {
    super(config);
    this.platform = 'newplatform';
    this.apiKey = config.apiKey || process.env.NEWPLATFORM_API_KEY;
  }

  isConfigured() {
    return !!this.apiKey;
  }

  async getDailyMetrics(params) {
    const { startDate, endDate } = params;

    // Fetch data from platform API
    const rawData = await this.fetchFromAPI(startDate, endDate);

    // Normalize to standard schema
    return rawData.map(item => this.normalize(item, item.date));
  }

  normalize(rawData, date) {
    return {
      date,
      platform: this.platform,
      account_id: this.accountId,
      account_handle: rawData.handle,
      metrics: {
        impressions: rawData.impressions,
        views: rawData.views,
        likes: rawData.likes,
        comments: rawData.comments,
        shares: rawData.shares,
        followers_delta: rawData.new_followers
      },
      derived: {
        engagement_rate: (rawData.engagements / rawData.impressions) * 100
      },
      raw_payload: rawData
    };
  }
}

module.exports = NewPlatformConnector;
```

2. **Add to connector factory**: `api/analytics-reporter/connectors/index.js`

```javascript
const NewPlatformConnector = require('./newplatform');

function createConnector(platform, config = {}) {
  switch (platform.toLowerCase()) {
    // ... existing cases
    case 'newplatform':
      return new NewPlatformConnector(config);
  }
}
```

3. **Update admin UI**: Add platform to checkbox list in `AnalyticsReporterAdmin.js`

## 🐛 Troubleshooting

### No Emails Received

1. **Check email service configuration**:
   ```bash
   # Verify env vars are set
   echo $EMAIL_SERVICE
   echo $SENDGRID_API_KEY  # or SMTP_* vars
   ```

2. **Test email delivery**:
   - Use Admin UI → Actions → "Send Test"
   - Check spam folder
   - Verify sender email is verified (SendGrid requirement)

3. **Check console mode**:
   - If `EMAIL_SERVICE=console`, emails are logged only
   - Change to `sendgrid` or `nodemailer`

### No Data in Reports

1. **Verify connector configuration**:
   ```bash
   node api/analytics-reporter/test.js
   ```

2. **Check API credentials**:
   - YouTube: Valid API key + correct channel ID
   - Test manually: `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=YOUR_CHANNEL_ID&key=YOUR_API_KEY`

3. **Review run history**:
   - Admin UI → Status & History
   - Check error messages and warnings

### Scheduler Not Running

1. **Verify configuration**:
   - `scheduledSending` must be `true`
   - Recipients must be configured
   - Cron expression must be valid

2. **Check logs**:
   - Vercel: Check function logs in Vercel dashboard
   - Local: Check console output

3. **Restart scheduler**:
   - Update config in admin UI (auto-restarts)
   - Or redeploy application

## 📧 Email Report Preview

**Subject**: `Daily Social Analytics — 2025-01-08`

**Sections**:
1. **Executive Summary** - Key narrative bullets
2. **Key Wins** - Top 3 positive trends
3. **Key Watch-outs** - Top 3 concerning trends
4. **Anomalies Detected** - Statistical outliers
5. **Recommended Next Actions** - Prioritized action items
6. **Platform Metrics** - 7-day data tables
7. **Data Quality Notes** - Warnings and limitations

## 🔐 Security Notes

- ❌ **Never commit `.env` file** - Contains API keys
- ✅ **API keys stored server-side only** - Not exposed to frontend bundle
- ✅ **Admin UI requires authentication** - Token-based auth
- ✅ **Vercel functions run serverless** - Isolated execution
- ⚠️  **Rotate API keys regularly** - Best practice

## 📚 Additional Resources

- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [SendGrid API](https://docs.sendgrid.com/api-reference)
- [node-cron Documentation](https://github.com/node-cron/node-cron)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

## 🤝 Support

For issues or questions:
1. Check this README
2. Review test output: `node api/analytics-reporter/test.js`
3. Check admin UI status page
4. Review Vercel function logs

---

Built with ❤️ using LatentMAS principles
