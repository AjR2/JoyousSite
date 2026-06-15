'use strict';

const { list } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://theenactive.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-practitioner-key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (req.headers['x-practitioner-key'] !== process.env.PRACTITIONER_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { filename } = req.query;
  if (!filename || !/^brief-\d+\.md$/.test(filename)) {
    return res.status(400).json({ error: 'Valid filename required' });
  }

  let blobs;
  try {
    ({ blobs } = await list({ prefix: `briefs/${filename}`, limit: 1 }));
  } catch (err) {
    console.error('Blob list failed:', err.message);
    return res.status(502).json({ error: 'Failed to locate brief' });
  }

  const blob = blobs.find(b => b.pathname === `briefs/${filename}`);
  if (!blob) return res.status(404).json({ error: 'Brief not found' });

  let content;
  try {
    const blobRes = await fetch(blob.url, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    });
    if (!blobRes.ok) throw new Error(`blob fetch ${blobRes.status}`);
    content = await blobRes.text();
  } catch (err) {
    console.error('Blob fetch failed:', err.message);
    return res.status(502).json({ error: 'Failed to fetch brief content' });
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  return res.status(200).send(content);
};
