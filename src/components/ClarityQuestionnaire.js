import React, { useState, useCallback, useRef, useEffect } from 'react';
import './ClarityQuestionnaire.css';

// ── Static fallback outputs (used when AI is unavailable) ──────────────────
// Format: { problem, priorities, next_actions, risks }
const PATTERN_OUTPUTS = {
  decision_drift: {
    problem: "Decisions are expanding rather than resolving. Cognitive load is increasing without forward movement.",
    priorities: ["Commit to one path — now", "Eliminate scope expansion at the source"],
    next_actions: [
      "Write the decision. Set a 24-hour commit deadline. Do not revisit before then.",
      "Eliminate one option permanently. Now."
    ],
    risks: [
      "Continued drift compounds decision fatigue",
      "Opportunity cost accelerates with each day of non-commitment"
    ]
  },
  threshold_erosion: {
    problem: "Operating beyond sustainable capacity. System integrity is degrading under cumulative load.",
    priorities: ["Restore operating headroom", "Protect the execution ceiling"],
    next_actions: [
      "Cancel one commitment in the next 48 hours. No negotiation.",
      "Reduce active project count by one. Today."
    ],
    risks: [
      "Threshold breach becomes permanent if load is not shed now",
      "Decision quality degrades below recovery threshold without intervention"
    ]
  },
  containment_failure: {
    problem: "Perimeter has expanded beyond what can be held. Scope is bleeding into non-essential territory.",
    priorities: ["Contract the perimeter immediately", "Enforce hard boundaries — no conditions"],
    next_actions: [
      "List everything inside your perimeter. Remove three items.",
      "Delegate one thing you've been holding. No conditions attached."
    ],
    risks: [
      "Boundary collapse is not recoverable without structural intervention",
      "Scope expansion accelerates if not contracted now"
    ]
  },
  capacity_overload: {
    problem: "Cognitive load exceeds processing bandwidth. System is in overload state.",
    priorities: ["Shed load immediately", "Restore processing capacity before any new intake"],
    next_actions: [
      "Write all open loops. Close three by deciding or delegating — this session.",
      "Block 2 hours tomorrow. Zero inputs. Protect it unconditionally."
    ],
    risks: [
      "Overload state masks highest-leverage actions",
      "Execution quality degrades before awareness registers — the lag is the danger"
    ]
  },
  execution_stall: {
    problem: "Forward movement has stopped on critical items. The stall is structural, not motivational.",
    priorities: ["Restore movement on the primary blocked item", "Remove or route around the single blocker"],
    next_actions: [
      "Open the blocked item. Work on it for exactly 10 minutes. Stop.",
      "Ship at 80%. Done restores function. Perfect sustains the stall."
    ],
    risks: [
      "Stall compounds — each day of inaction increases restart cost",
      "Motivation follows action. Waiting for readiness is the failure mode."
    ]
  }
};

const DRIFT_PATTERNS = [
  { id: 'decision_drift',      label: "Decisions keep expanding instead of resolving" },
  { id: 'threshold_erosion',   label: "Operating beyond sustainable capacity limits" },
  { id: 'containment_failure', label: "Boundaries are leaking — too much is inside the perimeter" },
  { id: 'capacity_overload',   label: "Cognitive load exceeds processing bandwidth" },
  { id: 'execution_stall',     label: "Movement has stopped on critical items" }
];

// Steps map to the agent pipeline: Planner → Synthesis → Execution → Commit
const STEP_LABELS = ['', 'PLANNER', 'SYNTHESIS', 'EXECUTION', 'COMMIT', ''];

// Expand the single-letter dominant force into a readable label
const FORCE_LABELS = { S: 'Structural', E: 'Environmental', R: 'Relational', T: 'Temporal' };

// Track diagnostic → session booking conversion
function trackDiagnosticConversion(driftPattern) {
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'diagnostic_to_session', {
        event_category: 'conversion',
        event_label: driftPattern || 'unknown',
        value: 1
      });
    }
  } catch (_) {}
}

// Derive an output object matching { problem, priorities, next_actions, risks }
// from the AI response — maps onto the existing display components unchanged.
function aiToOutput(ai) {
  const forceLabel = FORCE_LABELS[ai.dominant_force] || ai.dominant_force;
  return {
    problem:      ai.closure_map_summary,
    priorities:   [`${ai.drift_pattern} — ${forceLabel} force`],
    next_actions: [ai.recommended_action],
    risks:        [ai.primary_open_loop]
  };
}

function ClarityQuestionnaire({ isOpen, onClose }) {
  const [currentStep,          setCurrentStep]          = useState(0);
  const [selectedDriftPattern, setSelectedDriftPattern] = useState(null);
  const [problemStatement,     setProblemStatement]     = useState('');
  const [constraints,          setConstraints]          = useState({
    cannotRisk: '', mustProtect: '', alreadyDecided: ''
  });

  // AI integration state
  const [isLoading,   setIsLoading]   = useState(false);
  const [apiError,    setApiError]    = useState(null);   // string | null
  const [aiResult,    setAiResult]    = useState(null);   // raw API response | null
  const [useFallback, setUseFallback] = useState(false);  // user elected static output after error

  const modalRef        = useRef(null);
  const firstFocusableRef = useRef(null);

  // Escape key + scroll lock
  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      setTimeout(() => firstFocusableRef.current?.focus(), 100);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset all state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setSelectedDriftPattern(null);
      setProblemStatement('');
      setConstraints({ cannotRisk: '', mustProtect: '', alreadyDecided: '' });
      setIsLoading(false);
      setApiError(null);
      setAiResult(null);
      setUseFallback(false);
    }
  }, [isOpen]);

  const handleNext = () => setCurrentStep(prev => prev + 1);

  const handleCommit = () => setCurrentStep(prev => prev + 1);

  // Build the answers array that gets sent to the API
  const buildAnswers = useCallback(() => {
    const patternObj = DRIFT_PATTERNS.find(p => p.id === selectedDriftPattern);
    const answers = [];
    if (patternObj)                           answers.push(`Primary drift pattern: ${patternObj.label}`);
    if (problemStatement.trim())              answers.push(`Specific problem: ${problemStatement.trim()}`);
    if (constraints.cannotRisk.trim())        answers.push(`Cannot risk: ${constraints.cannotRisk.trim()}`);
    if (constraints.mustProtect.trim())       answers.push(`Must protect: ${constraints.mustProtect.trim()}`);
    if (constraints.alreadyDecided.trim())    answers.push(`Already fixed: ${constraints.alreadyDecided.trim()}`);
    return answers;
  }, [selectedDriftPattern, problemStatement, constraints]);

  // POST to /api/diagnostic; fall back gracefully on any failure
  const handleGenerateClosure = useCallback(async () => {
    setApiError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/diagnostic', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ answers: buildAnswers() }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${response.status}`);
      }

      const data = await response.json();
      setAiResult(data);
      setIsLoading(false);
      setCurrentStep(prev => prev + 1);
    } catch (err) {
      console.error('Diagnostic API error:', err.message);
      setIsLoading(false);
      setApiError(
        'The diagnostic engine is temporarily unavailable. Please try again in a few minutes.'
      );
    }
  }, [buildAnswers]);

  const handleUseFallback = () => {
    setApiError(null);
    setUseFallback(true);
    setCurrentStep(prev => prev + 1);
  };

  const handleRetry = () => {
    setApiError(null);
    handleGenerateClosure();
  };

  const buildConstraintsList = useCallback(() => {
    const items = [];
    if (constraints.cannotRisk.trim())     items.push(constraints.cannotRisk.trim());
    if (constraints.alreadyDecided.trim()) items.push(constraints.alreadyDecided.trim());
    return items;
  }, [constraints]);

  if (!isOpen) return null;

  // Resolve which output to display: AI → fallback static → null
  const staticOutput = selectedDriftPattern ? PATTERN_OUTPUTS[selectedDriftPattern] : null;
  const output = (aiResult && !useFallback) ? aiToOutput(aiResult) : staticOutput;

  const renderStep = () => {
    switch (currentStep) {
      // ── Step 0: Entry ──────────────────────────────────────────────────────
      case 0:
        return (
          <div className="questionnaire-step step-entry">
            <div className="step-content">
              <p className="entry-disclaimer">
                This is not therapy.<br />
                This is a drift diagnostic.
              </p>
              <p className="entry-promise">
                Identify your current execution degradation pattern. Receive a closure map — your problem named, constraints mapped, next actions specified.
              </p>
            </div>
            <div className="step-actions">
              <button className="cq-btn" onClick={handleNext} ref={firstFocusableRef}>
                Run Diagnostic (3–5 min)
              </button>
              <button className="cq-btn-ghost" onClick={onClose}>
                Not now
              </button>
            </div>
          </div>
        );

      // ── Step 1: PLANNER — identify pattern + state problem ─────────────────
      case 1:
        return (
          <div className="questionnaire-step step-context">
            <p className="step-counter">Step 1 of 4</p>
            <h2 className="step-title">Identify the primary drift pattern:</h2>
            <div className="context-options">
              {DRIFT_PATTERNS.map((pattern) => (
                <button
                  key={pattern.id}
                  className={`context-option ${selectedDriftPattern === pattern.id ? 'selected' : ''}`}
                  onClick={() => setSelectedDriftPattern(pattern.id)}
                  ref={pattern.id === 'decision_drift' ? firstFocusableRef : null}
                >
                  {pattern.label}
                </button>
              ))}
            </div>

            {selectedDriftPattern && (
              <div className="problem-input-wrapper">
                <label htmlFor="problemStatement">
                  State the specific problem in one sentence:
                </label>
                <textarea
                  id="problemStatement"
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="The problem is..."
                  maxLength={200}
                />
              </div>
            )}

            <div className="step-actions">
              <button
                className="cq-btn"
                onClick={handleNext}
                disabled={!selectedDriftPattern}
              >
                Continue
              </button>
            </div>
          </div>
        );

      // ── Step 2: SYNTHESIS — define constraints + trigger AI ────────────────
      case 2:
        // Loading state: replaces action area while inference runs
        if (isLoading) {
          return (
            <div className="questionnaire-step step-constraints">
              <p className="step-counter">Step 2 of 4</p>
              <h2 className="step-title">Define the operating constraints:</h2>
              <div className="cq-loading" aria-live="polite" aria-label="Running diagnostic">
                <span className="cq-loading-dots" aria-hidden="true">
                  <span /><span /><span />
                </span>
                <p className="cq-loading-text">Analyzing your drift pattern…</p>
              </div>
            </div>
          );
        }

        // Error state: shown below the form if API call failed
        return (
          <div className="questionnaire-step step-constraints">
            <p className="step-counter">Step 2 of 4</p>
            <h2 className="step-title">Define the operating constraints:</h2>
            <div className="constraint-cards">
              <div className="constraint-card">
                <label htmlFor="cannotRisk">What cannot be risked?</label>
                <span className="constraint-hint">Runway, key relationship, team stability, deal momentum</span>
                <textarea
                  id="cannotRisk"
                  value={constraints.cannotRisk}
                  onChange={(e) => setConstraints(prev => ({ ...prev, cannotRisk: e.target.value }))}
                  placeholder="State the constraint..."
                  maxLength={200}
                  ref={firstFocusableRef}
                />
              </div>

              <div className="constraint-card">
                <label htmlFor="mustProtect">What must remain protected?</label>
                <span className="constraint-hint">Decision authority, strategic focus, operational bandwidth</span>
                <textarea
                  id="mustProtect"
                  value={constraints.mustProtect}
                  onChange={(e) => setConstraints(prev => ({ ...prev, mustProtect: e.target.value }))}
                  placeholder="State what must be protected..."
                  maxLength={200}
                />
              </div>

              <div className="constraint-card">
                <label htmlFor="alreadyDecided">What is already fixed?</label>
                <span className="constraint-hint">Immovable deadline, resource ceiling, commitment already made</span>
                <textarea
                  id="alreadyDecided"
                  value={constraints.alreadyDecided}
                  onChange={(e) => setConstraints(prev => ({ ...prev, alreadyDecided: e.target.value }))}
                  placeholder="State the fixed constraints..."
                  maxLength={200}
                />
              </div>
            </div>

            {/* Error banner with retry + fallback options */}
            {apiError && (
              <div className="cq-error" role="alert">
                <p className="cq-error-message">{apiError}</p>
                <div className="cq-error-actions">
                  <button className="cq-btn" onClick={handleRetry}>
                    Try again
                  </button>
                  <button className="cq-btn-ghost" onClick={handleUseFallback}>
                    Use standard analysis
                  </button>
                </div>
              </div>
            )}

            {!apiError && (
              <div className="step-actions">
                <button className="cq-btn" onClick={handleGenerateClosure}>
                  Generate closure map
                </button>
              </div>
            )}
          </div>
        );

      // ── Step 3: EXECUTION — closure map output ─────────────────────────────
      case 3:
        return (
          <div className="questionnaire-step step-output">
            <p className="step-counter">Step 3 of 4 — Your output</p>
            <h2 className="step-title" style={{ marginBottom: '1.25rem' }}>Closure Map:</h2>

            {/* Source badge — only shown when fallback is active */}
            {useFallback && (
              <p className="cq-fallback-badge">Standard analysis — AI engine offline</p>
            )}

            <div className="structured-output">

              <div className="output-block">
                <span className="output-label">Problem</span>
                <p className="output-value" ref={firstFocusableRef} tabIndex={0}>
                  {problemStatement.trim() || output.problem}
                </p>
              </div>

              {buildConstraintsList().length > 0 && (
                <div className="output-block">
                  <span className="output-label">Constraints</span>
                  <ul className="output-list">
                    {buildConstraintsList().map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="output-block">
                <span className="output-label">Priorities</span>
                <ul className="output-list">
                  {output.priorities.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>

              <div className="output-block output-block--accent">
                <span className="output-label">Next Actions</span>
                <ol className="output-list output-list--ordered">
                  {output.next_actions.map((a, i) => <li key={i}>{a}</li>)}
                </ol>
              </div>

              <div className="output-block output-block--risk">
                <span className="output-label">
                  {(aiResult && !useFallback) ? 'Primary open loop' : 'Risks if unaddressed'}
                </span>
                <ul className="output-list">
                  {output.risks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>

            </div>
            <div className="step-actions">
              <button className="cq-btn" onClick={handleNext}>
                Commit to Action 1
              </button>
            </div>
          </div>
        );

      // ── Step 4: COMMIT — primary action ────────────────────────────────────
      case 4:
        return (
          <div className="questionnaire-step step-permission">
            <p className="step-counter">Step 4 of 4 — Commit</p>
            <h2 className="step-title" style={{ marginBottom: '1rem', fontSize: '0.9rem', opacity: 0.6, fontWeight: 400 }}>
              Primary action — committed:
            </h2>
            <div className="permission-container">
              <p className="permission-statement" ref={firstFocusableRef} tabIndex={0}>
                {output.next_actions[0]}
              </p>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#9CA3AF', textAlign: 'center', marginBottom: '1.5rem', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              No deliberation. No alternatives. Execute this.
            </p>
            <div className="step-actions">
              <button className="cq-btn" onClick={handleCommit}>
                Committed — close this
              </button>
            </div>
          </div>
        );

      // ── Step 5: EXIT — booking CTA ─────────────────────────────────────────
      case 5:
        return (
          <div className="questionnaire-step step-exit">
            <div className="exit-content">
              <p className="exit-statement" ref={firstFocusableRef} tabIndex={0}>
                One loop closes with action. The rest need structure.
              </p>
              <p className="exit-promise">
                The closure map surfaced the pattern. Executing the action closes one loop.
              </p>
            </div>

            <div className="exit-conversion">
              <span className="exit-conversion-label">If the drift is systemic</span>
              <p className="exit-conversion-text">
                A 60-minute closure session maps every open loop, defines the closure rules, and produces a full closure map — the structural document your brain needs to stop re-running what's already been decided.
              </p>
            </div>

            <div className="step-actions">
              <a
                className="cq-btn cq-btn--book"
                href="https://calendly.com/ajrudd-theenactive/new-meeting-1"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackDiagnosticConversion(selectedDriftPattern);
                  onClose();
                }}
              >
                Book a closure session
              </a>
              <button className="cq-btn-ghost" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="questionnaire-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="questionnaire-title"
    >
      <div className="questionnaire-modal" ref={modalRef}>
        <button
          className="questionnaire-close"
          onClick={onClose}
          aria-label="Close questionnaire"
        >
          ×
        </button>

        {currentStep > 0 && currentStep < 5 && (
          <div className="questionnaire-progress">
            <span className="step-agent-label">{STEP_LABELS[currentStep]}</span>
            <div className="progress-dots">
              {[1, 2, 3, 4].map((step) => (
                <span
                  key={step}
                  className={`progress-dot ${currentStep >= step ? 'active' : ''}`}
                  aria-label={`Step ${step} ${currentStep >= step ? '(completed)' : ''}`}
                />
              ))}
            </div>
          </div>
        )}

        <h1 id="questionnaire-title" className="sr-only">Founder Drift Diagnostic</h1>
        {renderStep()}
      </div>
    </div>
  );
}

export default ClarityQuestionnaire;
