import React, { useState, useCallback } from 'react';
import { authFetch } from '../utils/adminApi';
import './EnactiveAgents.css';

const AGENTS = [
  {
    id: 'outreach-monitor',
    label: 'Outreach Monitor',
    trigger: 'Weekly · Founder Tuesdays',
    description: 'Scans Reddit, X, and LinkedIn for ICP-matched founder pain posts and drafts responses.',
    placeholder: 'Paste raw post content, search results, or describe what platforms to scan this cycle.',
  },
  {
    id: 'analytics-brief',
    label: 'Analytics Brief',
    trigger: 'Weekly · Founder Tuesdays',
    description: 'Synthesizes GA4 and YouTube Studio data into a 5-minute signal report.',
    placeholder: 'Paste GA4 session/traffic export and YouTube Studio performance data.',
  },
  {
    id: 'content-pipeline',
    label: 'Content Pipeline',
    trigger: 'On demand · Post-session',
    description: 'Turns session insights into YouTube long-form, Shorts, podcast notes, LinkedIn, and X posts.',
    placeholder: 'Paste session notes, a mechanism description, or a topic angle.',
  },
  {
    id: 'crm-tracker',
    label: 'CRM Tracker',
    trigger: 'On demand · New inbound',
    description: 'Processes prospect interactions, sets pipeline stage, and drafts follow-ups.',
    placeholder: 'Paste email thread, DM conversation, or prospect name and prior notes.',
  },
  {
    id: 'session-prep',
    label: 'Session Prep',
    trigger: 'On demand · 1–2 hrs before session',
    description: 'Generates a pre-session brief mapping the founder\'s pattern before AJ enters the call.',
    placeholder: 'Paste prospect name, intake form responses, prior notes, or conversation history.',
  },
];

function JsonView({ data }) {
  const formatted = JSON.stringify(data, null, 2);
  return (
    <pre className="ea-json-output" aria-label="Agent output">
      {formatted}
    </pre>
  );
}

function AgentPanel({ agent }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const run = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await authFetch(`/api/enactive/${agent.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.error || 'Agent returned an error.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [agent.id, input]);

  const copy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [result]);

  return (
    <div className="ea-panel">
      <div className="ea-panel-meta">
        <span className="ea-trigger">{agent.trigger}</span>
        <p className="ea-description">{agent.description}</p>
      </div>

      <textarea
        className="ea-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={agent.placeholder}
        rows={6}
        disabled={loading}
      />

      <div className="ea-controls">
        <button
          className="ea-run-btn"
          onClick={run}
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <>
              <span className="ea-spinner" aria-hidden="true" />
              Running…
            </>
          ) : (
            'Run agent'
          )}
        </button>

        {result && (
          <button className="ea-copy-btn" onClick={copy}>
            {copied ? 'Copied' : 'Copy JSON'}
          </button>
        )}
      </div>

      {error && (
        <div className="ea-error" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && <JsonView data={result} />}
    </div>
  );
}

export default function EnactiveAgents() {
  const [activeAgent, setActiveAgent] = useState(0);

  return (
    <div className="ea-root">
      <header className="ea-header">
        <h2 className="ea-heading">Agent Ops</h2>
        <p className="ea-subheading">Five-agent system · Powered by Claude Sonnet</p>
      </header>

      <nav className="ea-tabs" role="tablist" aria-label="Enactive agents">
        {AGENTS.map((agent, i) => (
          <button
            key={agent.id}
            role="tab"
            aria-selected={activeAgent === i}
            aria-controls={`panel-${agent.id}`}
            className={`ea-tab ${activeAgent === i ? 'ea-tab--active' : ''}`}
            onClick={() => setActiveAgent(i)}
          >
            {agent.label}
          </button>
        ))}
      </nav>

      <div
        id={`panel-${AGENTS[activeAgent].id}`}
        role="tabpanel"
        className="ea-tabpanel"
      >
        <AgentPanel key={AGENTS[activeAgent].id} agent={AGENTS[activeAgent]} />
      </div>
    </div>
  );
}
