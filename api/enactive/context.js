// Shared Enactive context and Claude API utility

const ENACTIVE_CONTEXT = `ENACTIVE_CONTEXT:

Enactive is a cognitive offload service for early-stage founders built around closing "open decision loops" — decisions that stay mentally active even after work stops. The core mechanism is S-E-R-T (Structural, Environmental/sensory, Relational, Temporal), grounded in a framework called Spatial Influence (SI).

Founder: AJ (CEO). Co-founder: Carlos Koudouovoh (CMRO, medical student).

Service tiers:
- Single 60-minute session
- Two-week sprint with async text support
- Monthly containment package

ICP (Ideal Customer Profile):
- Early-stage founders, pre-seed to Series A
- Solo or small team (1–5 people)
- Explicitly naming: decision fatigue, cognitive overload, inability to disconnect, work following them mentally after hours
- Already aware of their problem — naming it, not just venting
- NOT: employees, students, freelancers, large-company executives

Core positioning: Enactive is reductive, not additive. It subtracts cognitive noise. The target audience is already seeking elimination — demand is pre-existing, not requiring persuasion.

Brand voice: Direct, precise, mechanism-first. No false optimism. No generic encouragement. Names the pattern, not the feeling.`;

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

async function callClaude(systemPrompt, userInput, maxTokens = 2048) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.trim(),
        'anthropic-version': '2023-06-01',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userInput }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic API ${response.status}: ${err}`);
    }

    const data = await response.json();
    const text = data.content[0].text.trim();

    // Strip markdown fences before JSON parse
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return JSON.parse(cleaned);
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { ENACTIVE_CONTEXT, callClaude };
