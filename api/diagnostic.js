'use strict';

const INFERENCE_URL = 'https://inference.theenactive.com/api/generate';
const MODEL = 'mistral:latest';

const REQUIRED = [
  'drift_pattern',
  'dominant_force',
  'closure_map_summary',
  'primary_open_loop',
  'recommended_action',
];

function buildPrompt(answers) {
  const indicators = answers
    .map((a, i) => `Indicator ${i + 1}: ${a}`)
    .join('. ');

  return `<s>[INST] You are an expert cognitive load analyst using Spatial Influence theory and the S-E-R-T framework (S=Structural, E=Environmental, R=Relational, T=Temporal). A founder has completed a diagnostic with the following indicators: ${indicators}. Respond ONLY with valid JSON. No preamble. No markdown. No explanation. All values must be strings, not arrays. dominant_force must be exactly one letter: S, E, R, or T. JSON only:\n{"drift_pattern": "", "dominant_force": "", "closure_map_summary": "", "primary_open_loop": "", "recommended_action": ""} [/INST]`;
}

async function callInference(prompt, timeoutMs) {
  const response = await fetch(INFERENCE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-inference-key': process.env.INFERENCE_SECRET,
    },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      options: { temperature: 0.1, presence_penalty: 0, num_predict: 500 },
      prompt,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`inference ${response.status}`);
  const data = await response.json();
  return data.response || '';
}

function parseAndValidate(raw) {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('no JSON object in response');
  const result = JSON.parse(match[0]);

  if (typeof result.dominant_force === 'string') {
    result.dominant_force = result.dominant_force.trim();
  }

  // Mistral reliably fills closure_map_summary but occasionally returns
  // an empty primary_open_loop. Derive it rather than failing the request.
  if (typeof result.primary_open_loop === 'string' && result.primary_open_loop.length === 0) {
    result.primary_open_loop = result.closure_map_summary || '';
  }

  const valid =
    REQUIRED.every((k) => typeof result[k] === 'string' && result[k].length > 0) &&
    ['S', 'E', 'R', 'T'].includes(result.dominant_force);
  return { result, valid };
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
  const prompt = buildPrompt(sanitized);

  // Two attempts — each ~12s, total well within the 30s function limit.
  // Mistral occasionally returns an empty field; a second call reliably fills it.
  for (let attempt = 1; attempt <= 2; attempt++) {
    let raw;
    try {
      raw = await callInference(prompt, 12000);
    } catch (err) {
      console.error(`[diag] attempt ${attempt} fetch failed:`, err.message);
      if (attempt === 2) return res.status(504).json({ error: 'Diagnostic timed out' });
      continue;
    }

    console.error(`[diag] attempt ${attempt} raw:`, JSON.stringify(raw));

    let result, valid;
    try {
      ({ result, valid } = parseAndValidate(raw));
    } catch (err) {
      console.error(`[diag] attempt ${attempt} parse error:`, err.message, JSON.stringify(raw));
      if (attempt === 2) return res.status(502).json({ error: 'Invalid diagnostic output' });
      continue;
    }

    console.error(`[diag] attempt ${attempt} parsed:`, JSON.stringify(result), 'valid:', valid);

    if (!valid) {
      if (attempt === 2) {
        console.error(`[diag] schema validation failed after ${attempt} attempts`);
        return res.status(502).json({ error: 'Invalid diagnostic output' });
      }
      continue;
    }

    return res.status(200).json(result);
  }
};
