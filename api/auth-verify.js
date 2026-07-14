// Lightweight endpoint the frontend calls on mount to confirm a stored
// admin_token is still valid (not just present) before rendering the dashboard.
const { requireAuth } = require('./_lib/verifyToken');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const payload = requireAuth(req, res);
  if (!payload) return;

  return res.status(200).json({ valid: true, username: payload.username });
};
