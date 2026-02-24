import React from 'react';
import { Helmet } from 'react-helmet-async';
import './CognitiveOffloadSprint.css';

function CognitiveOffloadSprint() {
  return (
    <>
      <Helmet>
        <title>Founder Execution Reset | Enactive Founder</title>
        <meta
          name="description"
          content="A 60-minute acute tactical intervention for founders experiencing execution degradation. Isolate drift vectors, establish containment, restore decision-making capacity."
        />
      </Helmet>

      <main className="main-content offload-page" id="main-content" role="main">
        {/* Hero Section */}
        <section className="card offload-hero" aria-labelledby="offload-heading">
          <header className="text-content">
            <h1 id="offload-heading">Founder Execution Reset</h1>
            <p className="offload-headline">
              Acute Tactical Intervention — 60 Minutes
            </p>
            <p className="offload-subheadline">
              When execution has already degraded and you need immediate structural repair.
            </p>
            <p className="offload-description">
              You don't need a coach. You don't need a framework. You need containment.
              This session isolates your current drift vector, establishes a containment perimeter,
              and restores decision-making capacity before degradation becomes externally visible.
            </p>
            <a
              href="https://buy.stripe.com/dRm6oGeMQ5KZbwC76sdjO00"
              className="button cta-button"
              target="_blank"
              rel="noopener noreferrer"
              aria-describedby="cta-description"
            >
              Book Founder Execution Reset — $250
              <span id="cta-description" className="sr-only">
                Proceed to book your 60-minute founder execution reset session
              </span>
            </a>
          </header>
        </section>

        {/* What This Is Section */}
        <section className="card offload-section" aria-labelledby="what-heading">
          <h2 id="what-heading" className="section-title">Intervention Protocol</h2>
          <p className="section-intro">A structured 1:1 session where we:</p>
          <ul className="offload-list" role="list">
            <li role="listitem">Identify the active drift pattern and threshold breach</li>
            <li role="listitem">Isolate what is consuming decision-making bandwidth</li>
            <li role="listitem">Establish containment perimeter — what stays in, what exits</li>
            <li role="listitem">Collapse open loops into committed positions or explicit deferrals</li>
            <li role="listitem">Define up to 3 immediate tactical actions</li>
          </ul>
          <p className="section-closing">
            This is not coaching. This is execution triage.
          </p>
        </section>

        {/* Who This Is For Section */}
        <section className="card offload-section" aria-labelledby="who-heading">
          <h2 id="who-heading" className="section-title">Indication Criteria</h2>
          <p className="section-intro">This intervention is designed for founders who:</p>
          <ul className="offload-list" role="list">
            <li role="listitem">Have crossed a capacity threshold and know it</li>
            <li role="listitem">Are experiencing decision drift on critical items</li>
            <li role="listitem">Cannot afford visible execution failure in current context</li>
            <li role="listitem">Need to restore function before the board/team/investors notice</li>
          </ul>
        </section>

        {/* What You Leave With Section */}
        <section className="card offload-section" aria-labelledby="leave-heading">
          <h2 id="leave-heading" className="section-title">Deliverable Artifact</h2>
          <p className="section-intro">Within 24 hours, you receive a written document including:</p>
          <ul className="offload-list" role="list">
            <li role="listitem">Context snapshot — operating environment at time of intervention</li>
            <li role="listitem">Drift pattern identified — primary vector of degradation</li>
            <li role="listitem">Containment perimeter — what is inside/outside your responsibility</li>
            <li role="listitem">Decisions externalized — committed positions documented</li>
            <li role="listitem">Immediate tactical actions (max 3) — with execution sequence</li>
          </ul>
        </section>

        {/* Session Details Section */}
        <section className="card offload-section offload-details" aria-labelledby="details-heading">
          <h2 id="details-heading" className="section-title">Session Parameters</h2>
          <div className="details-grid" role="list">
            <div className="detail-item" role="listitem">
              <span className="detail-label">Format</span>
              <span className="detail-value">1:1 live session (Zoom)</span>
            </div>
            <div className="detail-item" role="listitem">
              <span className="detail-label">Duration</span>
              <span className="detail-value">60 minutes</span>
            </div>
            <div className="detail-item" role="listitem">
              <span className="detail-label">Investment</span>
              <span className="detail-value">$250</span>
            </div>
            <div className="detail-item" role="listitem">
              <span className="detail-label">Availability</span>
              <span className="detail-value">Limited to 3 sessions per week</span>
            </div>
          </div>
          <p className="detail-note">
            Payment required before scheduling. Artifact delivered within 24 hours of session.
          </p>
        </section>

        {/* Cognitive Integrity Sprint Upsell */}
        <section className="card offload-section" aria-labelledby="sprint-heading">
          <h2 id="sprint-heading" className="section-title">Systemic Degradation?</h2>
          <p className="section-intro">
            If the drift pattern is structural rather than acute, consider the Founder Cognitive Integrity Sprint:
          </p>
          <ul className="offload-list" role="list">
            <li role="listitem">4 sessions over 2 weeks</li>
            <li role="listitem">Full decision architecture mapping</li>
            <li role="listitem">Containment system rebuild</li>
            <li role="listitem">Threshold monitoring installation</li>
            <li role="listitem">Access to Founder Drift Monitor tool</li>
          </ul>
          <p className="section-closing" style={{ marginTop: '1rem' }}>
            <strong>$1,500 | 2-week structural intervention</strong>
          </p>
        </section>

        {/* Final CTA Section */}
        <section className="card offload-section offload-final-cta" aria-labelledby="final-cta-heading">
          <h2 id="final-cta-heading" className="sr-only">Book Now</h2>
          <p className="final-cta-text">
            Execution degradation compounds. Intervene before it becomes visible.
          </p>
          <a
            href="https://buy.stripe.com/dRm6oGeMQ5KZbwC76sdjO00"
            className="button cta-button"
            target="_blank"
            rel="noopener noreferrer"
            aria-describedby="final-cta-description"
          >
            Book Founder Execution Reset — $250
            <span id="final-cta-description" className="sr-only">
              Proceed to book your 60-minute founder execution reset session
            </span>
          </a>
        </section>
      </main>
    </>
  );
}

export default CognitiveOffloadSprint;
