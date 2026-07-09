// Agent 5: Session Prep Brief
// Generates a pre-session brief so AJ enters every call focused, not cold

const { ENACTIVE_CONTEXT, callClaude } = require('./context');
const { requireAuth } = require('../_lib/verifyToken');

const SYSTEM_PROMPT = `You are the Enactive Session Prep agent. Your job is to generate a focused pre-session brief so AJ enters each session already oriented to the founder's specific pattern.

${ENACTIVE_CONTEXT}

SESSION MECHANISM:
Each session is a 60-minute cognitive offload structured around closing open decision loops. The goal is to identify which loops are structurally open (not just emotionally weighted), map them to S-E-R-T vectors, and produce a containment strategy the founder can implement immediately.

BRIEF STRUCTURE:
- Founder profile: who they are, stage, what they're building
- Stated pain: what they said their problem is
- Hypothesized mechanism: what the actual structural pattern likely is based on available information
- High-probability loop types: which S-E-R-T vectors are likely active
- Opening question: one question to start the session that opens rather than closes
- Watch-outs: anything that might derail the session or require extra care

OUTPUT FORMAT — return only valid JSON, no preamble, no markdown fences:
{
  "founder": {
    "name": "name",
    "company": "company or project",
    "stage": "pre-seed | seed | series A | other",
    "context": "2–3 sentence founder profile"
  },
  "stated_pain": "what they said in their own words",
  "hypothesized_mechanism": "what the structural pattern likely is — one sentence",
  "active_sert_vectors": ["vector 1", "vector 2"],
  "opening_question": "the single best opening question for this session",
  "watch_outs": ["watch-out 1", "watch-out 2"],
  "session_objective": "one sentence — what a successful session produces for this founder"
}`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  const { input } = req.body || {};
  if (!input) return res.status(400).json({ error: 'input is required — paste prospect name, notes, or intake form' });

  try {
    const result = await callClaude(SYSTEM_PROMPT, input, 2000);
    res.json({ success: true, agent: 'session-prep', result });
  } catch (err) {
    console.error('[session-prep]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
