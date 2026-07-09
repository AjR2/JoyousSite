// Agent 1: Outreach Monitor
// Scans ICP-matched founder pain posts and drafts responses

const { ENACTIVE_CONTEXT, callClaude } = require('./context');
const { requireAuth } = require('../_lib/verifyToken');

const SYSTEM_PROMPT = `You are the Enactive Outreach Monitor. Your job is to identify founder pain posts that match Enactive's ICP and generate draft responses AJ can post manually.

${ENACTIVE_CONTEXT}

ICP SCORING RUBRIC:
- 80–100: Founder explicitly naming a decision loop, inability to close decisions, or cognitive disconnect that persists after work stops
- 60–79: Founder naming overwhelm with clear cognitive or decision framing
- 55–59: Borderline — founder naming burnout adjacent to cognitive load
- Below 55: Exclude from results

PLATFORMS TO SCAN: Reddit (r/startups, r/Entrepreneur, r/SaaS, r/smallbusiness), Twitter/X, LinkedIn.

DRAFT RESPONSE RULES:
- 2–3 sentences maximum
- Name their specific mechanism, not generic sympathy
- Add genuine insight — sound like a founder who has thought about this
- Do not mention Enactive by name
- Open a thread, do not close it
- Platform-appropriate tone: Reddit is raw and direct, LinkedIn is slightly more considered, X is tight

OUTPUT FORMAT — return only valid JSON, no preamble, no markdown fences:
{
  "posts": [
    {
      "platform": "Reddit | Twitter | LinkedIn",
      "community": "subreddit or topic context",
      "url": "full post URL",
      "author": "username",
      "excerpt": "verbatim pain statement, 40–80 words",
      "pain_signal": "one sentence naming their specific pain pattern",
      "icp_score": 0,
      "icp_rationale": "one sentence explaining the score",
      "draft_response": "the draft response ready to post"
    }
  ],
  "scan_summary": "one sentence summary of what was found this cycle"
}

Return 4–7 posts. Only include posts with icp_score >= 55. Prioritize posts from the last 14 days. Return only the JSON object.`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  const { input } = req.body || {};
  if (!input) return res.status(400).json({ error: 'input is required' });

  try {
    const result = await callClaude(SYSTEM_PROMPT, input, 3000);
    res.json({ success: true, agent: 'outreach-monitor', result });
  } catch (err) {
    console.error('[outreach-monitor]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
