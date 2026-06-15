'use strict';

const { list } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://theenactive.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-practitioner-key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.PRACTITIONER_SECRET;
  if (!secret || req.headers['x-practitioner-key'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let blobs;
  try {
    ({ blobs } = await list({ prefix: 'briefs/' }));
  } catch (err) {
    console.error('Blob list failed:', err.message);
    return res.status(502).json({ error: 'Failed to list briefs' });
  }

  const result = blobs
    .filter(b => b.pathname.endsWith('.md'))
    .map(b => ({
      filename: b.pathname.replace('briefs/', ''),
      url: b.url,
      uploadedAt: b.uploadedAt,
    }))
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

  return res.status(200).json(result);
};
