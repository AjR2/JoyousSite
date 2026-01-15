#!/usr/bin/env node
/**
 * YouTube OAuth Setup Script
 * Run this to get your YouTube Analytics API refresh token
 *
 * Usage:
 *   node scripts/youtube-oauth-setup.js
 */

const http = require('http');
const { URL } = require('url');

// STEP 1: Fill these in from Google Cloud Console
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';
const REDIRECT_URI = 'http://localhost:3000/oauth/callback';

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly'
];

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║                                                           ║');
console.log('║    YOUTUBE OAUTH SETUP - Get Your Refresh Token          ║');
console.log('║                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

if (CLIENT_ID === 'YOUR_CLIENT_ID_HERE' || CLIENT_SECRET === 'YOUR_CLIENT_SECRET_HERE') {
  console.error('❌ ERROR: You need to edit this file first!\n');
  console.log('1. Open scripts/youtube-oauth-setup.js in your editor');
  console.log('2. Replace YOUR_CLIENT_ID_HERE with your OAuth Client ID');
  console.log('3. Replace YOUR_CLIENT_SECRET_HERE with your OAuth Client Secret');
  console.log('4. Save the file and run again\n');
  process.exit(1);
}

// STEP 2: Generate authorization URL
const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.append('client_id', CLIENT_ID);
authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
authUrl.searchParams.append('response_type', 'code');
authUrl.searchParams.append('scope', SCOPES.join(' '));
authUrl.searchParams.append('access_type', 'offline');
authUrl.searchParams.append('prompt', 'consent');

console.log('📋 Step 1: Authorize the application\n');
console.log('Open this URL in your browser:\n');
console.log(authUrl.toString());
console.log('\n');

// STEP 3: Start local server to receive callback
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:3000`);

  if (url.pathname === '/oauth/callback') {
    const code = url.searchParams.get('code');

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<h1>Error: No authorization code received</h1>');
      return;
    }

    console.log('✅ Authorization code received!\n');
    console.log('📋 Step 2: Exchanging code for refresh token...\n');

    try {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code'
        })
      });

      const tokens = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(JSON.stringify(tokens, null, 2));
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>Success!</title></head>
          <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px;">
            <h1 style="color: #4CAF50;">✅ Success!</h1>
            <p>Your refresh token has been generated. Check your terminal for the next steps.</p>
            <p>You can close this window now.</p>
          </body>
        </html>
      `);

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 SUCCESS! Your OAuth tokens:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      console.log('Add this to your Vercel environment variables:\n');
      console.log('YOUTUBE_OAUTH_REFRESH_TOKEN=' + tokens.refresh_token);
      console.log('\n');

      console.log('Also save these (you may need them later):\n');
      console.log('YOUTUBE_OAUTH_CLIENT_ID=' + CLIENT_ID);
      console.log('YOUTUBE_OAUTH_CLIENT_SECRET=' + CLIENT_SECRET);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      console.log('🔒 IMPORTANT: Keep these secrets secure!');
      console.log('   - Do NOT commit them to git');
      console.log('   - Add them to Vercel environment variables only\n');

      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 1000);

    } catch (error) {
      console.error('❌ Error exchanging code for tokens:', error.message);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<h1>Error: Failed to get tokens</h1><p>' + error.message + '</p>');
      server.close();
      process.exit(1);
    }
  }
});

server.listen(3000, () => {
  console.log('🚀 Local server started on http://localhost:3000');
  console.log('⏳ Waiting for authorization...\n');
});

// Timeout after 5 minutes
setTimeout(() => {
  console.log('\n⏰ Timeout: No authorization received after 5 minutes');
  server.close();
  process.exit(1);
}, 5 * 60 * 1000);
