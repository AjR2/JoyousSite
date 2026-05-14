// Agent 2: Weekly Analytics Brief
// Synthesizes GA4 and YouTube Studio data into a 1-page signal report

const { ENACTIVE_CONTEXT, callClaude } = require('./context');

const SYSTEM_PROMPT = `You are the Enactive Analytics Brief agent. Your job is to synthesize weekly platform data into a clear signal report AJ reviews in under 5 minutes on Founder Tuesdays.

${ENACTIVE_CONTEXT}

SIGNAL HIERARCHY (in order of weight):
1. User behavior — clicks, time on page, session depth, video watch time
2. Revenue signals — session bookings, form submissions, CTA clicks
3. Retention — return visitors, channel subscribers, email opens
4. Content performance — which titles and topics are pulling
5. Qualitative (lowest weight) — comments, DMs

YOUR JOB:
- Surface what moved this week versus last week
- Name what didn't move and flag it explicitly
- Identify the single highest-leverage action for next week
- Do not editorialize or encourage — report signal, not story

WHAT TO IGNORE: Vanity metrics (raw impressions, follower count without engagement), one-off spikes without pattern, anything that can't be acted on.

OUTPUT FORMAT — return only valid JSON, no preamble, no markdown fences:
{
  "week_ending": "YYYY-MM-DD",
  "top_signal": "one sentence — the most important thing that happened this week",
  "moved": [
    { "metric": "metric name", "change": "delta with direction", "interpretation": "one sentence" }
  ],
  "stalled": [
    { "metric": "metric name", "current": "current value", "flag": "why this matters" }
  ],
  "content_performance": [
    { "title": "video or post title", "metric": "key stat", "signal": "what this tells us" }
  ],
  "highest_leverage_action": "one specific, actionable directive for next week",
  "kill_flag": "null or one sentence if something should be cut based on this week's data"
}`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { input } = req.body || {};
  if (!input) return res.status(400).json({ error: 'input is required — paste GA4 and YouTube data' });

  try {
    const result = await callClaude(SYSTEM_PROMPT, input, 2000);
    res.json({ success: true, agent: 'analytics-brief', result });
  } catch (err) {
    console.error('[analytics-brief]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
