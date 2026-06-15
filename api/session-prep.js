// api/session-prep.js
// Vercel serverless function: S-E-R-T + TLX intake → Mistral → Session Prep Brief (.md)
// WAF header injected server-side from INFERENCE_SECRET env var — never exposed to client

'use strict';

const { put } = require('@vercel/blob');

const INFERENCE_URL = 'https://inference.theenactive.com/api/generate';
const MODEL = 'mistral:latest';

const SYSTEM_PROMPT = `You are a session preparation assistant for Enactive, a cognitive offload service for founders and professionals. Your job is to analyze a pre-session intake form and produce a structured Session Prep Brief for the practitioner.

The intake contains two sections:
1. S-E-R-T responses — free text answers across four dimensions: Structural, Environmental, Relational, and Temporal.
2. Cognitive Load responses — five slider values (0-100) across: Mental Demand, Effort, Frustration, Temporal Demand, and Performance.

Produce a Session Prep Brief with the following sections:

## Dominant S-E-R-T Dimension
Identify which dimension carries the most unresolved load based on the free text. State the dimension and one sentence explaining why.

## Open Loops
List the 3-5 most significant open loops surfaced across all four dimensions. Rank by signal strength — weight specificity, emotional charge, and unresolved state.

## Cognitive Load Profile
Summarize the five TLX scores. Flag any dimension above 70 as elevated. Note the overall load pattern in one sentence.

## Session Entry Point
Recommend where to begin the session based on the dominant dimension and highest-signal open loop.

## Opening Questions
Write 2-3 questions to open the session. Questions must be specific to the content of this intake — no generic questions.

Be precise. Be brief. Do not editorialize. The practitioner reads this in the 10 minutes before the session.`;

function buildPrompt(data) {
  return `<s>[INST] ${SYSTEM_PROMPT}

---
Intake Form Responses

S-E-R-T Section:

Structural — What decisions or systems feel unresolved right now?
${data.sert_s}

Environmental — What in your current environment is affecting your focus or energy?
${data.sert_e}

Relational — What relationships feel like open loops?
${data.sert_r}

Temporal — What deadlines or time pressures are you currently carrying?
${data.sert_t}

Cognitive Load (TLX) Scores (0–100):
Mental Demand: ${data.tlx_mental}
Effort: ${data.tlx_effort}
Frustration: ${data.tlx_frustration}
Temporal Demand: ${data.tlx_temporal}
Performance (self-rated, higher = managing well): ${data.tlx_performance}

Produce the Session Prep Brief now. Output in plain markdown only — no preamble, no closing remarks. [/INST]`;
}

function formatBrief(content, data, timestamp) {
  const isoDate = new Date(timestamp).toISOString();
  return `# Session Prep Brief
**Generated:** ${isoDate}

---

## Intake Summary

**S (Structural):** ${data.sert_s}

**E (Environmental):** ${data.sert_e}

**R (Relational):** ${data.sert_r}

**T (Temporal):** ${data.sert_t}

**TLX Scores:** Mental Demand ${data.tlx_mental} · Effort ${data.tlx_effort} · Frustration ${data.tlx_frustration} · Temporal Demand ${data.tlx_temporal} · Performance ${data.tlx_performance}

---

${content.trim()}
`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://theenactive.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const required = [
    'sert_s', 'sert_e', 'sert_r', 'sert_t',
    'tlx_mental', 'tlx_effort', 'tlx_frustration', 'tlx_temporal', 'tlx_performance',
  ];

  for (const field of required) {
    if (body[field] === undefined || body[field] === null) {
      return res.status(400).json({ error: `Missing field: ${field}` });
    }
  }

  const data = {
    sert_s: String(body.sert_s).slice(0, 1000).trim(),
    sert_e: String(body.sert_e).slice(0, 1000).trim(),
    sert_r: String(body.sert_r).slice(0, 1000).trim(),
    sert_t: String(body.sert_t).slice(0, 1000).trim(),
    tlx_mental:      clampInt(body.tlx_mental),
    tlx_effort:      clampInt(body.tlx_effort),
    tlx_frustration: clampInt(body.tlx_frustration),
    tlx_temporal:    clampInt(body.tlx_temporal),
    tlx_performance: clampInt(body.tlx_performance),
  };

  let inferenceRes;
  try {
    inferenceRes = await fetch(INFERENCE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-inference-key': process.env.INFERENCE_SECRET,
      },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        options: { temperature: 0.3, num_predict: 2000 },
        prompt: buildPrompt(data),
      }),
      signal: AbortSignal.timeout(25000),
    });
  } catch (err) {
    console.error('Inference fetch failed:', err.name, err.message);
    return res.status(504).json({ error: 'Brief generation timed out' });
  }

  if (!inferenceRes.ok) {
    console.error(`Inference server returned ${inferenceRes.status}`);
    return res.status(502).json({ error: 'Inference service unavailable' });
  }

  let inferenceData;
  try {
    inferenceData = await inferenceRes.json();
  } catch {
    console.error('Failed to parse inference response body');
    return res.status(502).json({ error: 'Inference service unavailable' });
  }

  const briefContent = typeof inferenceData.response === 'string' ? inferenceData.response.trim() : '';
  if (!briefContent) {
    console.error('Empty response from inference:', JSON.stringify(inferenceData));
    return res.status(502).json({ error: 'Empty response from inference' });
  }

  const timestamp = Date.now();
  const filename = `brief-${timestamp}.md`;
  const briefText = formatBrief(briefContent, data, timestamp);

  let blobUrl;
  try {
    const { url } = await put(`briefs/${filename}`, briefText, {
      access: 'private',
      contentType: 'text/markdown; charset=utf-8',
    });
    blobUrl = url;
  } catch (err) {
    console.error('Could not save brief to Vercel Blob:', err.message);
  }

  return res.status(200).json({ success: true, filename, url: blobUrl });
};

function clampInt(value) {
  const n = parseInt(value, 10);
  if (isNaN(n)) return 50;
  return Math.min(100, Math.max(0, n));
}
