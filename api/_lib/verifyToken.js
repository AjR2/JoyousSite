// Shared admin JWT verification — used by all admin-only API routes.
// Underscore-prefixed directory so Vercel does not expose this as a route.
const jwt = require('jsonwebtoken');

// Verifies the Authorization: Bearer <token> header. On failure, writes the
// error response itself and returns null — callers should `return` immediately
// when this returns null.
function requireAuth(req, res) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return null;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not configured');
    res.status(500).json({ error: 'Server configuration error' });
    return null;
  }

  try {
    return jwt.verify(match[1], secret);
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }
}

module.exports = { requireAuth };
