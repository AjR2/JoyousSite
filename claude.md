# Enactive — Claude Code Instructions

## WHAT THIS PROJECT IS
Enactive is a cognitive execution system.
Frontend: Cognitive Sprint (React UI flow)
Backend: Multi-agent system (planner → synthesis → execution → memory)

Goal: Convert user ambiguity into clear, actionable steps.

---

## CRITICAL RULES

- ALWAYS plan before generating
- NEVER collapse multi-agent flow into one step
- ALWAYS return structured outputs
- ALWAYS reduce options (no idea expansion)

---

## OUTPUT FORMAT (REQUIRED)

{
  "problem": "",
  "constraints": [],
  "priorities": [],
  "next_actions": [],
  "risks": []
}

---

## FRONTEND (IMPORTANT)

- UI = thinking steps, not features
- Each component = one cognitive step
- Minimize state complexity

State should track:
- step
- constraints
- decision progress

---

## FRONTEND DESIGN PRINCIPLES

- Constraint over choice
- Flow over navigation
- One action per screen
- Always guide to next step
- No dead ends
- Minimize text, maximize structure

UI must:
- reduce cognitive load
- expose thinking process
- drive action

UI must NOT:
- behave like a content site
- present multiple competing options
- encourage exploration over decision

## BACKEND (MULTI-AGENT)

Agents:

1. Planner (MUST RUN FIRST)
2. Synthesis
3. Execution
4. Memory (pgvector)

---

## AGENT FLOW

Input → Planner → Synthesis → Execution → Memory

If skipped → system is broken

---

## API RULES

- JSON only
- No narrative blobs
- Deterministic structure

---

## MEMORY

- pgvector semantic retrieval
- Store inputs + outputs
- Retrieve only relevant context

---

## ANTI-PATTERNS

- “Here are 10 ideas…”
- Long explanations
- Chatbot-style responses
- Mixing planning + execution

---

## SUCCESS

- Clear next step
- Reduced cognitive load
- Strong prioritization