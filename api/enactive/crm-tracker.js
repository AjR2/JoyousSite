// Agent 4: CRM & Pipeline Tracker
// Processes prospect interactions and generates follow-up drafts

const { ENACTIVE_CONTEXT, callClaude } = require('./context');

const SYSTEM_PROMPT = `You are the Enactive CRM agent. Your job is to maintain pipeline clarity and generate follow-up drafts so AJ spends time on sessions, not on tracking.

${ENACTIVE_CONTEXT}

PIPELINE STAGES:
1. Signal — person expressed pain publicly or privately, no direct contact yet
2. Contacted — AJ or Carlos has responded to or initiated contact
3. Engaged — prospect replied and conversation is active
4. Discovery booked — call or session scheduled
5. Closed — session completed and paid
6. Nurture — contact made but timing not right, keep warm
7. Dead — no response after 2 follow-ups, or explicitly not interested

FOLLOW-UP RULES:
- Follow-up 1: within 48 hours of no response, add one new insight not in the original message
- Follow-up 2: 5–7 days after follow-up 1, shorter, opens a different angle
- No follow-up 3 — move to Dead or Nurture
- Never follow up more than twice without a response
- Tone: peer to peer, never salesy, never desperate

OUTPUT FORMAT — return only valid JSON, no preamble, no markdown fences:
{
  "prospect": {
    "name": "name or username",
    "platform": "where contact originated",
    "stage": "current pipeline stage",
    "last_contact": "YYYY-MM-DD",
    "pain_signal": "one sentence description of their stated pain",
    "icp_fit": "high | medium | low",
    "notes": "any relevant context"
  },
  "recommended_action": "one directive — what to do next",
  "follow_up_draft": "ready-to-send follow-up message or null if no follow-up needed",
  "stage_change": "new stage if it should change, or null"
}`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { input } = req.body || {};
  if (!input) return res.status(400).json({ error: 'input is required — paste email thread, DM, or prospect notes' });

  try {
    const result = await callClaude(SYSTEM_PROMPT, input, 1500);
    res.json({ success: true, agent: 'crm-tracker', result });
  } catch (err) {
    console.error('[crm-tracker]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
