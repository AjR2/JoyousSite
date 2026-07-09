const jwt = require('jsonwebtoken');

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 30 * 60 * 1000; // 30 minutes

// In-memory store — resets on cold start, sufficient for Vercel serverless
const attempts = {};

function getRecord(ip) {
  const now = Date.now();
  if (!attempts[ip]) {
    attempts[ip] = { count: 0, windowStart: now, lockedUntil: null };
  }
  const rec = attempts[ip];
  // Reset window if expired
  if (now - rec.windowStart > WINDOW_MS && !rec.lockedUntil) {
    rec.count = 0;
    rec.windowStart = now;
  }
  return rec;
}

function getIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://theenactive.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getIP(req);
  const rec = getRecord(ip);
  const now = Date.now();

  // Check lockout
  if (rec.lockedUntil && now < rec.lockedUntil) {
    const minutesLeft = Math.ceil((rec.lockedUntil - now) / 60000);
    return res.status(429).json({
      error: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`
    });
  }

  // Clear expired lockout
  if (rec.lockedUntil && now >= rec.lockedUntil) {
    rec.count = 0;
    rec.windowStart = now;
    rec.lockedUntil = null;
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.error('Admin credentials not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Successful login — reset record
    attempts[ip] = { count: 0, windowStart: now, lockedUntil: null };
    const token = jwt.sign({ username }, secret, { expiresIn: '8h' });
    return res.status(200).json({ success: true, token });
  }

  // Failed login — increment counter
  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) {
    rec.lockedUntil = now + LOCKOUT_MS;
    return res.status(429).json({
      error: 'Too many failed attempts. Account locked for 30 minutes.'
    });
  }

  const remaining = MAX_ATTEMPTS - rec.count;
  return res.status(401).json({
    error: `Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
  });
};