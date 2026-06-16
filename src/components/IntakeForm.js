import React, { useState, useRef, useEffect } from 'react';
import './IntakeForm.css';

const NAME_QUESTION = {
  id: 'name',
  type: 'name',
  question: 'What\'s your name?',
  label: null,
};

const SERT_QUESTIONS = [
  { id: 'sert_s', type: 'text', section: 'S', label: 'Structural',   question: 'What decisions or systems feel unresolved right now?' },
  { id: 'sert_e', type: 'text', section: 'E', label: 'Environmental', question: 'What in your current environment is affecting your focus or energy?' },
  { id: 'sert_r', type: 'text', section: 'R', label: 'Relational',    question: 'What relationships feel like open loops?' },
  { id: 'sert_t', type: 'text', section: 'T', label: 'Temporal',      question: 'What deadlines or time pressures are you currently carrying?' },
];

const TLX_QUESTIONS = [
  { id: 'tlx_mental',      type: 'slider', label: 'Mental Demand',   question: 'How mentally demanding is your current situation?', low: 'Low',    high: 'High' },
  { id: 'tlx_effort',      type: 'slider', label: 'Effort',          question: 'How hard are you working right now?',              low: 'Low',    high: 'High' },
  { id: 'tlx_frustration', type: 'slider', label: 'Frustration',     question: 'How frustrated or stressed do you feel?',          low: 'Low',    high: 'High' },
  { id: 'tlx_temporal',    type: 'slider', label: 'Temporal Demand', question: 'How much time pressure are you operating under?',   low: 'Low',    high: 'High' },
  { id: 'tlx_performance', type: 'slider', label: 'Performance',     question: 'How well do you feel you are managing everything?', low: 'Poorly', high: 'Well' },
];

const ALL_STEPS = [NAME_QUESTION, ...SERT_QUESTIONS, ...TLX_QUESTIONS];
const TOTAL = ALL_STEPS.length;

export default function IntakeForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | done | error
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  const current = ALL_STEPS[step];
  const isName = current?.type === 'name';
  const isTLX = current?.type === 'slider';
  const isText = current?.type === 'text';
  const isLast = step === TOTAL - 1;
  const currentAnswer = answers[current?.id];

  const canContinue = isTLX
    ? true
    : typeof currentAnswer === 'string' && currentAnswer.trim().length > 0;

  const sliderValue = typeof currentAnswer === 'number' ? currentAnswer : 50;

  useEffect(() => {
    if (isName && inputRef.current) inputRef.current.focus();
    if (isText && textareaRef.current) textareaRef.current.focus();
  }, [step, isName, isText]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.classList.remove('intake-body--entered');
      void containerRef.current.offsetWidth;
      containerRef.current.classList.add('intake-body--entered');
    }
  }, [step]);

  function handleTextChange(e) {
    setAnswers(prev => ({ ...prev, [current.id]: e.target.value }));
  }

  function handleSliderChange(e) {
    setAnswers(prev => ({ ...prev, [current.id]: parseInt(e.target.value, 10) }));
  }

  function handleNext() {
    if (!canContinue) return;
    if (isTLX && typeof currentAnswer === 'undefined') {
      setAnswers(prev => ({ ...prev, [current.id]: 50 }));
    }
    if (isLast) handleSubmit();
    else setStep(s => s + 1);
  }

  function handleKeyDown(e) {
    if (isName && e.key === 'Enter') { e.preventDefault(); handleNext(); }
    if (isText && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleNext(); }
  }

  async function handleSubmit() {
    const finalAnswers = { ...answers };
    TLX_QUESTIONS.forEach(q => {
      if (typeof finalAnswers[q.id] === 'undefined') finalAnswers[q.id] = 50;
    });

    setStatus('submitting');
    try {
      const res = await fetch('/api/session-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalAnswers),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Submission failed');
      }
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  }

  if (status === 'done') {
    return (
      <div className="intake-page">
        <div className="intake-shell">
          <div className="intake-confirmation">
            <div className="intake-confirmation-mark" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15" stroke="#2C5F5A" strokeWidth="1.5" />
                <path d="M10 16.5l4.5 4.5 7.5-8" stroke="#2C5F5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="intake-confirmation-heading">Your session brief has been prepared.</h1>
            <p className="intake-confirmation-body">The practitioner will review it before your session.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'submitting') {
    return (
      <div className="intake-page">
        <div className="intake-shell">
          <div className="intake-loading">
            <div className="intake-loading-ring" aria-label="Preparing brief" role="status" />
            <p className="intake-loading-text">Preparing your brief…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="intake-page">
      <div className="intake-shell">
        <header className="intake-header">
          <span className="intake-eyebrow">Session Prep</span>
          <div
            className="intake-progress-track"
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={TOTAL}
            aria-label={`Question ${step + 1} of ${TOTAL}`}
          >
            {ALL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`intake-pip${i < step ? ' intake-pip--done' : i === step ? ' intake-pip--active' : ''}`}
              />
            ))}
          </div>
          <span className="intake-step-count">{step + 1}<span className="intake-step-of">/{TOTAL}</span></span>
        </header>

        <main className="intake-body intake-body--entered" ref={containerRef}>
          <div className="intake-section-tag">
            {isName && <span className="intake-tag-name">Before we begin</span>}
            {isText && <><span className="intake-tag-name">S-E-R-T</span><span className="intake-tag-dim">{current.section} — {current.label}</span></>}
            {isTLX && <><span className="intake-tag-name">Cognitive Load</span><span className="intake-tag-dim">{current.label}</span></>}
          </div>

          <h2 className="intake-question">{current.question}</h2>

          {isName && (
            <input
              ref={inputRef}
              type="text"
              className="intake-text-input"
              value={currentAnswer || ''}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Alex M."
              autoComplete="given-name"
              aria-label={current.question}
            />
          )}

          {isText && (
            <textarea
              ref={textareaRef}
              className="intake-textarea"
              value={currentAnswer || ''}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Write freely — this is private."
              rows={5}
              aria-label={current.question}
            />
          )}

          {isTLX && (
            <div className="intake-slider-wrap">
              <div className="intake-slider-value-display" aria-live="polite">{sliderValue}</div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={sliderValue}
                onChange={handleSliderChange}
                className="intake-slider"
                aria-label={current.question}
                aria-valuenow={sliderValue}
                aria-valuemin={0}
                aria-valuemax={100}
              />
              <div className="intake-slider-anchors">
                <span>{current.low}</span>
                <span>{current.high}</span>
              </div>
            </div>
          )}

          <div className="intake-actions">
            <button
              className={`intake-continue${canContinue ? '' : ' intake-continue--disabled'}`}
              onClick={handleNext}
              disabled={!canContinue}
            >
              {isLast ? 'Prepare my brief' : 'Continue'}
            </button>
            {isName && <span className="intake-hint">Return to continue</span>}
            {isText && <span className="intake-hint">⌘ Return to continue</span>}
          </div>

          {status === 'error' && (
            <p className="intake-error" role="alert">{errorMsg || 'Something went wrong. Please try again.'}</p>
          )}
        </main>
      </div>
    </div>
  );
}
