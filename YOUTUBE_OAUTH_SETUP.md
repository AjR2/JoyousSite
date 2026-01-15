# YouTube OAuth Setup Guide

Complete guide to enable full YouTube Analytics with daily metrics, watch time, impressions, etc.

## Why OAuth?

The YouTube Data API v3 (API key only) provides **limited data**:
- ✅ Current channel stats (total views, subscribers)
- ❌ Daily/historical analytics
- ❌ Watch time, impressions, CTR, traffic sources

YouTube Analytics API with OAuth provides **full analytics**:
- ✅ Daily views, watch time, impressions
- ✅ Audience retention, demographics
- ✅ Traffic sources, engagement metrics
- ✅ Historical trends and comparisons

## Prerequisites

- Google account with access to your YouTube channel
- YouTube channel must be linked to your Google account
- Node.js installed locally (for running the setup script)

## Step-by-Step Setup

### 1. Enable YouTube Analytics API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (same one with YouTube Data API)
3. Navigate to **APIs & Services** → **Library**
4. Search for **"YouTube Analytics API"**
5. Click **Enable**

### 2. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type (unless you have Google Workspace)
3. Fill in the form:
   - **App name**: `Joyous Analytics Reporter`
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **Save and Continue**
5. On "Scopes" page, click **Add or Remove Scopes**
6. Add these scopes:
   ```
   https://www.googleapis.com/auth/youtube.readonly
   https://www.googleapis.com/auth/yt-analytics.readonly
   ```
7. Click **Update** then **Save and Continue**
8. On "Test users" page, click **+ ADD USERS**
9. Add your Google account email
10. Click **Save and Continue**
11. Review and click **Back to Dashboard**

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Analytics Reporter OAuth`
5. **Authorized redirect URIs**: Add:
   ```
   http://localhost:3000/oauth/callback
   ```
6. Click **Create**
7. **IMPORTANT**: Copy and save:
   - **Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-abc123xyz`)

### 4. Run the OAuth Setup Script

1. Open `scripts/youtube-oauth-setup.js` in your editor
2. Replace the placeholders:
   ```javascript
   const CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID_HERE';
   const CLIENT_SECRET = 'YOUR_ACTUAL_CLIENT_SECRET_HERE';
   ```
3. Save the file
4. Run the script:
   ```bash
   node scripts/youtube-oauth-setup.js
   ```
5. The script will print a URL - **copy and open it in your browser**
6. Sign in with your Google account (that owns the YouTube channel)
7. Click **Allow** to grant permissions
8. You'll be redirected to localhost - the script will automatically capture the token
9. **Copy the refresh token** from the terminal output

### 5. Add Environment Variables to Vercel

Go to your Vercel project → Settings → Environment Variables and add:

```bash
# Required for OAuth
YOUTUBE_OAUTH_REFRESH_TOKEN=1//your-long-refresh-token-here
YOUTUBE_OAUTH_CLIENT_ID=123456789-abc.apps.googleusercontent.com
YOUTUBE_OAUTH_CLIENT_SECRET=GOCSPX-abc123xyz

# Keep your existing ones
YOUTUBE_API_KEY=your-api-key
YOUTUBE_CHANNEL_ID=your-channel-id
```

### 6. Redeploy

After adding the environment variables:
1. Go to Vercel → Deployments
2. Click the three dots on the latest deployment
3. Click **Redeploy**

OR just push a dummy commit to trigger deployment.

### 7. Test It!

1. Go to your Analytics Reporter admin panel
2. Click **"Run Report Now"**
3. Check the logs in Vercel - you should see:
   ```
   [YouTube] Using OAuth for full analytics
   [YouTube] Fetched daily analytics: 7 days
   [AnalyticsReporter] youtube: 7 records (with detailed metrics)
   ```

## What You'll Get

With OAuth enabled, each day's data will include:

- **Views**: Actual daily views (not cumulative)
- **Watch Time**: Total minutes watched
- **Impressions**: How many times your videos were shown
- **Click-Through Rate (CTR)**: Impression → view conversion
- **Average View Duration**: How long people watch
- **Likes, Comments, Shares**: Engagement metrics
- **Subscribers Gained**: Net new subscribers per day
- **Traffic Sources**: Where views came from

## Troubleshooting

### "Access blocked: App not verified"
- Your app is in "Testing" mode
- Solution: Make sure you added yourself as a test user in OAuth consent screen

### "Invalid grant" error
- Refresh token expired or invalid
- Solution: Run the setup script again to get a new token

### Still seeing cumulative data
- OAuth environment variables not set correctly
- Solution: Double-check Vercel environment variables and redeploy

### "Insufficient permissions"
- Missing required scopes
- Solution: Go back to OAuth consent screen and add both YouTube scopes

## Security Notes

🔒 **Never commit OAuth secrets to git!**
- Keep them in Vercel environment variables only
- The setup script is safe to commit (without filled-in credentials)
- Add `scripts/youtube-oauth-setup.js` to `.gitignore` if you fill in credentials

📝 **Refresh tokens don't expire** (usually)
- Google may revoke them if unused for 6 months
- You'll need to reauthorize if this happens
- The reporter will fall back to API key mode if OAuth fails

## Need Help?

Check the Vercel logs for detailed error messages:
- Go to Vercel → Deployments → Click on deployment → Functions tab
- Look for `[YouTube]` log entries
- Common issues are authentication or scope problems
