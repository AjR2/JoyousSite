import React, { useState, useCallback, useRef, useEffect } from 'react';
import './ClarityQuestionnaire.css';

// Permission statements based on context patterns
const PERMISSION_STATEMENTS = {
  stuck: [
    "You are allowed to act imperfectly here.",
    "Choosing a small step is not avoidance.",
    "You do not need to see the whole path to take one step."
  ],
  pressure: [
    "You do not need to prove anything to move forward.",
    "You are allowed to prioritize yourself here.",
    "Your worth is not determined by this outcome."
  ],
  avoiding: [
    "You are allowed to start before you feel ready.",
    "Choosing a small step is not avoidance.",
    "You do not need to resolve everything to move forward."
  ],
  overwhelmed: [
    "You are allowed to do less than you think you should.",
    "You do not need to resolve everything to move forward.",
    "One thing at a time is enough."
  ],
  transition: [
    "You are not required to explain this decision yet.",
    "Uncertainty is not the same as being lost.",
    "You are allowed to be in between."
  ]
};

// Action step templates based on context
const ACTION_TEMPLATES = {
  stuck: [
    "Draft the message. Do not send it.",
    "Write down the two options you're weighing. Choose neither yet.",
    "Block 20 minutes. Decide nothing else.",
    "Remove one option from consideration."
  ],
  pressure: [
    "Name one thing you will not do today.",
    "Take the smallest public step that doesn't require explanation.",
    "Write what you would say if you didn't have to impress anyone.",
    "Block 20 minutes. Decide nothing else."
  ],
  avoiding: [
    "Open the thing. Look at it for 2 minutes. Close it.",
    "Write one sentence about what you're avoiding.",
    "Set a timer for 10 minutes. Start anywhere.",
    "Draft the message. Do not send it."
  ],
  overwhelmed: [
    "Write down everything. Choose only one.",
    "Remove one option from consideration.",
    "Block 20 minutes. Decide nothing else.",
    "Name one thing you will not do today."
  ],
  transition: [
    "Write what you know is true right now.",
    "Take the smallest public step that doesn't require explanation.",
    "Name one thing that hasn't changed.",
    "Block 20 minutes. Decide nothing else."
  ]
};

const CONTEXT_OPTIONS = [
  { id: 'stuck', label: "I'm stuck deciding what to do next" },
  { id: 'pressure', label: "I feel pressure to perform or prove myself" },
  { id: 'avoiding', label: "I'm avoiding something I know matters" },
  { id: 'overwhelmed', label: "I'm overwhelmed and can't prioritize" },
  { id: 'transition', label: "I'm in a transition and feel ungrounded" }
];

function ClarityQuestionnaire({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedContext, setSelectedContext] = useState(null);
  const [constraints, setConstraints] = useState({
    cannotRisk: '',
    mustRemainTrue: '',
    alreadyDecided: ''
  });
  const [permission, setPermission] = useState('');
  const [actionStep, setActionStep] = useState('');
  const [retryUsed, setRetryUsed] = useState(false);

  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);

  // Generate permission based on context
  const generatePermission = useCallback((context) => {
    const statements = PERMISSION_STATEMENTS[context] || PERMISSION_STATEMENTS.stuck;
    return statements[Math.floor(Math.random() * statements.length)];
  }, []);

  // Generate action step based on context
  const generateActionStep = useCallback((context) => {
    const actions = ACTION_TEMPLATES[context] || ACTION_TEMPLATES.stuck;
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
      setSelectedContext(null);
      setConstraints({ cannotRisk: '', mustRemainTrue: '', alreadyDecided: '' });
      setPermission('');
      setActionStep('');
      setRetryUsed(false);
    }
  }, [isOpen]);

  const handleContextSelect = (contextId) => {
    setSelectedContext(contextId);
  };

  const handleConstraintChange = (field, value) => {
    setConstraints(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedContext) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Generate permission before showing step 3
      setPermission(generatePermission(selectedContext));
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Generate action before showing step 4
      setActionStep(generateActionStep(selectedContext));
      setCurrentStep(4);
    } else if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleRetry = () => {
    if (!retryUsed) {
      setRetryUsed(true);
      setActionStep(generateActionStep(selectedContext));
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
                Joyous is not therapy.<br />
                We don't fix, diagnose, or decide for you.
              </p>
              <p className="entry-promise">
                We help you take one clear step when acting alone feels risky.
              </p>
            </div>
            <div className="step-actions">
              <button
                className="btn-primary"
                onClick={handleNext}
                ref={firstFocusableRef}
              >
                Get clarity now (3–5 min)
              </button>
              <button
                className="btn-secondary"
                onClick={onClose}
              >
                Learn what Joyous is / isn't
              </button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="questionnaire-step step-context">
            <h2 className="step-title">What are you navigating <em>right now</em>?</h2>
            <div className="context-options">
              {CONTEXT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={`context-option ${selectedContext === option.id ? 'selected' : ''}`}
                  onClick={() => handleContextSelect(option.id)}
                  ref={option.id === 'stuck' ? firstFocusableRef : null}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="step-actions">
              <button
                className="btn-primary"
                onClick={handleNext}
                disabled={!selectedContext}
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="questionnaire-step step-constraints">
            <h2 className="step-title">Before choosing a next step, let's set boundaries.</h2>
            <div className="constraint-cards">
              <div className="constraint-card">
                <label htmlFor="cannotRisk">
                  What cannot be risked right now?
                </label>
                <span className="constraint-hint">(e.g., reputation, time, money, relationship, energy)</span>
                <textarea
                  id="cannotRisk"
                  value={constraints.cannotRisk}
                  onChange={(e) => handleConstraintChange('cannotRisk', e.target.value)}
                  placeholder="Type 1–2 lines..."
                  maxLength={200}
                  ref={firstFocusableRef}
                />
              </div>

              <div className="constraint-card">
                <label htmlFor="mustRemainTrue">
                  What must remain true for you to respect this choice later?
                </label>
                <span className="constraint-hint">(e.g., integrity, growth, rest, independence)</span>
                <textarea
                  id="mustRemainTrue"
                  value={constraints.mustRemainTrue}
                  onChange={(e) => handleConstraintChange('mustRemainTrue', e.target.value)}
                  placeholder="Type 1–2 lines..."
                  maxLength={200}
                />
              </div>

              <div className="constraint-card">
                <label htmlFor="alreadyDecided">
                  What is already decided — even if you don't like it?
                </label>
                <span className="constraint-hint">(e.g., deadline exists, conversation is coming, resource is limited)</span>
                <textarea
                  id="alreadyDecided"
                  value={constraints.alreadyDecided}
                  onChange={(e) => handleConstraintChange('alreadyDecided', e.target.value)}
                  placeholder="Type 1–2 lines..."
                  maxLength={200}
                />
              </div>
            </div>
            <div className="step-actions">
              <button
                className="btn-primary"
                onClick={handleNext}
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="questionnaire-step step-permission">
            <div className="permission-container">
              <p className="permission-statement" ref={firstFocusableRef} tabIndex={0}>
                {permission}
              </p>
            </div>
            <div className="step-actions">
              <button
                className="btn-primary"
                onClick={handleNext}
              >
                Okay. What's my next step?
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="questionnaire-step step-action">
            <h2 className="step-title">Based on your constraints, here is a defensible next step:</h2>
            <div className="action-container">
              <p className="action-statement" ref={firstFocusableRef} tabIndex={0}>
                {actionStep}
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
                  Show me a different step
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
                If you never come back, this was still a success.
              </p>
              <p className="exit-promise">
                Joyous exists to help you trust yourself — not depend on us.
              </p>
            </div>
            <div className="step-actions">
              <button
                className="btn-primary"
                onClick={handleTakeStep}
              >
                I'll take the next step
              </button>
              <button
                className="btn-secondary"
                onClick={handleSaveForLater}
              >
                Save this for later
              </button>
            </div>
            <div className="extra-assistance">
              <p className="extra-assistance-text">
                Need more support clearing mental weight?
              </p>
              <a
                href="/cognitive-offload-sprint"
                className="btn-link"
                onClick={onClose}
              >
                Explore our Cognitive Offload Sprint
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

        <h1 id="questionnaire-title" className="sr-only">Joyous Clarity Questionnaire</h1>
        {renderStep()}
      </div>
    </div>
  );
}

export default ClarityQuestionnaire;
