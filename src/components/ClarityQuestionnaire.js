import React, { useState, useCallback, useRef, useEffect } from 'react';
import './ClarityQuestionnaire.css';

// Containment directives based on drift patterns
const CONTAINMENT_DIRECTIVES = {
  decision_drift: [
    "Isolate the decision. Do not expand scope.",
    "Name the single constraint that matters most. Ignore the rest.",
    "The drift stops when you commit to one path. Commit now, adjust later."
  ],
  threshold_erosion: [
    "You have already crossed a threshold. Acknowledge it.",
    "Capacity limits are structural, not personal. Respect the architecture.",
    "Reduce load now. Do not wait for permission."
  ],
  containment_failure: [
    "The perimeter has expanded beyond what you can hold. Contract it.",
    "You cannot contain everything. Choose what stays inside the boundary.",
    "Containment failure is not a character flaw. It's a structural signal."
  ],
  capacity_overload: [
    "You are operating beyond sustainable load. This is a system state, not a choice.",
    "Shed load now. The system will not stabilize until you do.",
    "Three priorities maximum. Everything else exits working memory."
  ],
  execution_stall: [
    "Execution has stopped. The cause is structural, not motivational.",
    "Identify the single blocker. Remove it or route around it.",
    "Movement restores function. Take one action. Any action."
  ]
};

// Tactical actions based on drift type
const TACTICAL_ACTIONS = {
  decision_drift: [
    "Write the decision. Set a 24-hour deadline. Do not revisit before then.",
    "Eliminate one option permanently. Now.",
    "State what you would decide if no one was watching. That's the decision.",
    "Block 30 minutes. Make the call. Move on."
  ],
  threshold_erosion: [
    "Cancel one commitment in the next 48 hours.",
    "Identify what you're protecting that no longer needs protection. Drop it.",
    "Name the threshold you crossed. Document when it happened.",
    "Reduce your active project count by one. Today."
  ],
  containment_failure: [
    "List everything currently inside your perimeter. Remove three items.",
    "Define what is explicitly outside your responsibility. Enforce the boundary.",
    "Delegate one thing you've been holding. No conditions.",
    "Say no to the next request. Practice the muscle."
  ],
  capacity_overload: [
    "Write down all open loops. Close three by deciding or delegating.",
    "Block 2 hours tomorrow with no inputs. Protect it.",
    "Identify your highest-leverage action. Do only that for the next 4 hours.",
    "Exit one recurring meeting permanently."
  ],
  execution_stall: [
    "Open the blocked item. Work on it for exactly 10 minutes. Stop.",
    "Send the message you've been drafting. Imperfect is acceptable.",
    "Schedule the conversation you've been avoiding. This week.",
    "Ship the thing at 80%. Done beats perfect."
  ]
};

const DRIFT_PATTERNS = [
  { id: 'decision_drift', label: "Decisions keep expanding instead of resolving" },
  { id: 'threshold_erosion', label: "Operating beyond sustainable capacity limits" },
  { id: 'containment_failure', label: "Boundaries are leaking — too much is inside the perimeter" },
  { id: 'capacity_overload', label: "Cognitive load exceeds processing bandwidth" },
  { id: 'execution_stall', label: "Movement has stopped on critical items" }
];

function ClarityQuestionnaire({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDriftPattern, setSelectedDriftPattern] = useState(null);
  const [constraints, setConstraints] = useState({
    cannotRisk: '',
    mustProtect: '',
    alreadyDecided: ''
  });
  const [directive, setDirective] = useState('');
  const [tacticalAction, setTacticalAction] = useState('');
  const [retryUsed, setRetryUsed] = useState(false);

  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);

  // Generate containment directive based on drift pattern
  const generateDirective = useCallback((pattern) => {
    const directives = CONTAINMENT_DIRECTIVES[pattern] || CONTAINMENT_DIRECTIVES.decision_drift;
    return directives[Math.floor(Math.random() * directives.length)];
  }, []);

  // Generate tactical action based on drift pattern
  const generateTacticalAction = useCallback((pattern) => {
    const actions = TACTICAL_ACTIONS[pattern] || TACTICAL_ACTIONS.decision_drift;
    return actions[Math.floor(Math.random() * actions.length)];
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      // Focus first element
      setTimeout(() => {
        if (firstFocusableRef.current) {
          firstFocusableRef.current.focus();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setSelectedDriftPattern(null);
      setConstraints({ cannotRisk: '', mustProtect: '', alreadyDecided: '' });
      setDirective('');
      setTacticalAction('');
      setRetryUsed(false);
    }
  }, [isOpen]);

  const handlePatternSelect = (patternId) => {
    setSelectedDriftPattern(patternId);
  };

  const handleConstraintChange = (field, value) => {
    setConstraints(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedDriftPattern) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Generate containment directive before showing step 3
      setDirective(generateDirective(selectedDriftPattern));
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Generate tactical action before showing step 4
      setTacticalAction(generateTacticalAction(selectedDriftPattern));
      setCurrentStep(4);
    } else if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleRetry = () => {
    if (!retryUsed) {
      setRetryUsed(true);
      setTacticalAction(generateTacticalAction(selectedDriftPattern));
    }
  };

  const handleAccept = () => {
    setCurrentStep(5);
  };

  const handleTakeStep = () => {
    window.open('https://yourkindredminds.com', '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleSaveForLater = () => {
    // Could add localStorage save functionality here
    onClose();
  };

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="questionnaire-step step-entry">
            <div className="step-content">
              <p className="entry-disclaimer">
                This is not therapy.<br />
                This is a drift diagnostic.
              </p>
              <p className="entry-promise">
                Identify your current execution degradation pattern and receive a tactical containment directive.
              </p>
            </div>
            <div className="step-actions">
              <button
                className="btn-primary"
                onClick={handleNext}
                ref={firstFocusableRef}
              >
                Run Diagnostic (3–5 min)
              </button>
              <button
                className="btn-secondary"
                onClick={onClose}
              >
                Learn about Enactive Founder
              </button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="questionnaire-step step-context">
            <h2 className="step-title">Identify the primary drift pattern:</h2>
            <div className="context-options">
              {DRIFT_PATTERNS.map((pattern) => (
                <button
                  key={pattern.id}
                  className={`context-option ${selectedDriftPattern === pattern.id ? 'selected' : ''}`}
                  onClick={() => handlePatternSelect(pattern.id)}
                  ref={pattern.id === 'decision_drift' ? firstFocusableRef : null}
                >
                  {pattern.label}
                </button>
              ))}
            </div>
            <div className="step-actions">
              <button
                className="btn-primary"
                onClick={handleNext}
                disabled={!selectedDriftPattern}
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="questionnaire-step step-constraints">
            <h2 className="step-title">Define containment parameters:</h2>
            <div className="constraint-cards">
              <div className="constraint-card">
                <label htmlFor="cannotRisk">
                  What cannot be risked in the current operating environment?
                </label>
                <span className="constraint-hint">(e.g., runway, key relationship, team stability, deal momentum)</span>
                <textarea
                  id="cannotRisk"
                  value={constraints.cannotRisk}
                  onChange={(e) => handleConstraintChange('cannotRisk', e.target.value)}
                  placeholder="State the constraint..."
                  maxLength={200}
                  ref={firstFocusableRef}
                />
              </div>

              <div className="constraint-card">
                <label htmlFor="mustProtect">
                  What must remain protected for long-term execution capacity?
                </label>
                <span className="constraint-hint">(e.g., decision authority, strategic focus, operational bandwidth)</span>
                <textarea
                  id="mustProtect"
                  value={constraints.mustProtect}
                  onChange={(e) => handleConstraintChange('mustProtect', e.target.value)}
                  placeholder="State what must be protected..."
                  maxLength={200}
                />
              </div>

              <div className="constraint-card">
                <label htmlFor="alreadyDecided">
                  What is already fixed in the current context?
                </label>
                <span className="constraint-hint">(e.g., deadline immovable, resource ceiling hit, commitment made)</span>
                <textarea
                  id="alreadyDecided"
                  value={constraints.alreadyDecided}
                  onChange={(e) => handleConstraintChange('alreadyDecided', e.target.value)}
                  placeholder="State the fixed constraints..."
                  maxLength={200}
                />
              </div>
            </div>
            <div className="step-actions">
              <button
                className="btn-primary"
                onClick={handleNext}
              >
                Generate Directive
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="questionnaire-step step-permission">
            <h2 className="step-title" style={{ marginBottom: '1rem', fontSize: '1rem', opacity: 0.7 }}>Containment Directive:</h2>
            <div className="permission-container">
              <p className="permission-statement" ref={firstFocusableRef} tabIndex={0}>
                {directive}
              </p>
            </div>
            <div className="step-actions">
              <button
                className="btn-primary"
                onClick={handleNext}
              >
                Generate Tactical Action
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="questionnaire-step step-action">
            <h2 className="step-title">Tactical action for immediate execution:</h2>
            <div className="action-container">
              <p className="action-statement" ref={firstFocusableRef} tabIndex={0}>
                {tacticalAction}
              </p>
            </div>
            <div className="step-actions">
              <button
                className="btn-primary"
                onClick={handleAccept}
              >
                Accept
              </button>
              {!retryUsed && (
                <button
                  className="btn-secondary"
                  onClick={handleRetry}
                >
                  Generate Alternative
                </button>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="questionnaire-step step-exit">
            <div className="exit-content">
              <p className="exit-statement" ref={firstFocusableRef} tabIndex={0}>
                Diagnostic complete. Execute the action.
              </p>
              <p className="exit-promise">
                If this resolved the immediate drift, no further intervention required.
              </p>
            </div>
            <div className="step-actions">
              <button
                className="btn-primary"
                onClick={handleTakeStep}
              >
                Execute Now
              </button>
              <button
                className="btn-secondary"
                onClick={handleSaveForLater}
              >
                Save Directive
              </button>
            </div>
            <div className="extra-assistance">
              <p className="extra-assistance-text">
                Drift pattern systemic? Structural intervention recommended.
              </p>
              <a
                href="/cognitive-offload-sprint"
                className="btn-link"
                onClick={onClose}
              >
                Book Founder Execution Reset
              </a>
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

        {/* Progress indicator */}
        {currentStep > 0 && currentStep < 5 && (
          <div className="questionnaire-progress">
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
