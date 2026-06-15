'use strict';

const INFERENCE_URL = 'https://inference.theenactive.com/api/generate';
const MODEL = 'mistral:latest';

function buildPrompt(answers) {
  const indicators = answers
    .map((a, i) => `Indicator ${i + 1}: ${a}`)
    .join('. ');

  return `<s>[INST] You are an expert cognitive load analyst using Spatial Influence theory and the S-E-R-T framework (S=Structural, E=Environmental, R=Relational, T=Temporal). A founder has completed a diagnostic with the following indicators: ${indicators}. Respond ONLY with valid JSON. No preamble. No markdown. No explanation. All values must be strings, not arrays. dominant_force must be exactly one letter: S, E, R, or T. JSON only:\n{"drift_pattern": "", "dominant_force": "", "closure_map_summary": "", "primary_open_loop": "", "recommended_action": ""} [/INST]`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://theenactive.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { answers } = req.body || {};
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid answers array' });
  }

  const sanitized = answers.map((a) => String(a).slice(0, 500));

  let response;
  try {
    response = await fetch(INFERENCE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-inference-key': process.env.INFERENCE_SECRET,
      },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        options: { temperature: 0.1, presence_penalty: 0, num_predict: 500 },
        prompt: buildPrompt(sanitized),
      }),
      signal: AbortSignal.timeout(25000),
    });
  } catch (err) {
    console.error('Inference fetch failed:', err.name);
    return res.status(504).json({ error: 'Diagnostic timed out' });
  }

  if (!response.ok) {
    console.error(`Inference server returned ${response.status}`);
    return res.status(502).json({ error: 'Inference service unavailable' });
  }

  let data;
  try {
    data = await response.json();
  } catch {
    console.error('Failed to parse inference response body');
    return res.status(502).json({ error: 'Inference service unavailable' });
  }

  let result;
  try {
    const raw = data.response.trim();
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    result = JSON.parse(cleaned);
  } catch {
    console.error('Model output was not valid JSON:', data.response);
    return res.status(502).json({ error: 'Invalid diagnostic output' });
  }

  const required = [
    'drift_pattern',
    'dominant_force',
    'closure_map_summary',
    'primary_open_loop',
    'recommended_action',
  ];
  const valid =
    required.every((k) => typeof result[k] === 'string' && result[k].length > 0) &&
    ['S', 'E', 'R', 'T'].includes(result.dominant_force);

  if (!valid) {
    console.error('Model output failed schema validation:', JSON.stringify(result));
    return res.status(502).json({ error: 'Invalid diagnostic output' });
  }

  return res.status(200).json(result);
};