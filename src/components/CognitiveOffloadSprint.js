import React from 'react';
import { Helmet } from 'react-helmet-async';
import './CognitiveOffloadSprint.css';

function CognitiveOffloadSprint() {
  return (
    <>
      <Helmet>
        <title>Cognitive Offload Sprint | Joyous</title>
        <meta
          name="description"
          content="A focused 60-minute session to externalize decisions and reduce cognitive load. Convert mental noise into clear rules, decisions, and next steps."
        />
      </Helmet>

      <main className="main-content offload-page" id="main-content" role="main">
        {/* Hero Section */}
        <section className="card offload-hero" aria-labelledby="offload-heading">
          <header className="text-content">
            <h1 id="offload-heading">Joyous Cognitive Offload Sprint</h1>
            <p className="offload-headline">
              When your mind is overloaded, clarity isn't optional.
            </p>
            <p className="offload-subheadline">
              A focused 60-minute session to externalize decisions and reduce cognitive load.
            </p>
            <p className="offload-description">
              You don't need more productivity hacks. You need decisions made and mental weight removed.
              This session helps working professionals and teachers convert mental noise into clear rules,
              decisions, and next steps.
            </p>
            <a
              href="#payment-link-placeholder"
              className="button cta-button"
              aria-describedby="cta-description"
            >
              Book Your Cognitive Offload Sprint
              <span id="cta-description" className="sr-only">
                Proceed to book your 60-minute cognitive offload session
              </span>
            </a>
          </header>
        </section>

        {/* What This Is Section */}
        <section className="card offload-section" aria-labelledby="what-heading">
          <h2 id="what-heading" className="section-title">What This Is</h2>
          <p className="section-intro">A structured 1:1 session where we:</p>
          <ul className="offload-list" role="list">
            <li role="listitem">Identify what's mentally heavy</li>
            <li role="listitem">Surface looping thoughts and open decisions</li>
            <li role="listitem">Collapse ambiguity into clear rules</li>
            <li role="listitem">Remove what does not belong in working memory</li>
            <li role="listitem">Define up to 3 concrete next actions</li>
          </ul>
          <p className="section-closing">
            This is not therapy. This is cognitive compression.
          </p>
        </section>

        {/* Who This Is For Section */}
        <section className="card offload-section" aria-labelledby="who-heading">
          <h2 id="who-heading" className="section-title">Who This Is For</h2>
          <ul className="offload-list" role="list">
            <li role="listitem">Professionals juggling competing responsibilities</li>
            <li role="listitem">Teachers carrying invisible mental load</li>
            <li role="listitem">Founders holding too many open loops</li>
            <li role="listitem">Anyone whose brain feels "noisy" or overloaded</li>
          </ul>
        </section>

        {/* What You Leave With Section */}
        <section className="card offload-section" aria-labelledby="leave-heading">
          <h2 id="leave-heading" className="section-title">What You Leave With</h2>
          <p className="section-intro">Within 24 hours, you receive a written artifact including:</p>
          <ul className="offload-list" role="list">
            <li role="listitem">Context snapshot</li>
            <li role="listitem">Decisions externalized</li>
            <li role="listitem">Rules/defaults established</li>
            <li role="listitem">What no longer lives in working memory</li>
            <li role="listitem">Immediate next steps (max 3)</li>
          </ul>
        </section>

        {/* Session Details Section */}
        <section className="card offload-section offload-details" aria-labelledby="details-heading">
          <h2 id="details-heading" className="section-title">Session Details</h2>
          <div className="details-grid" role="list">
            <div className="detail-item" role="listitem">
              <span className="detail-label">Format</span>
              <span className="detail-value">1:1 live session (Zoom)</span>
            </div>
            <div className="detail-item" role="listitem">
              <span className="detail-label">Length</span>
              <span className="detail-value">60 minutes</span>
            </div>
            <div className="detail-item" role="listitem">
              <span className="detail-label">Investment</span>
              <span className="detail-value">$150</span>
            </div>
            <div className="detail-item" role="listitem">
              <span className="detail-label">Availability</span>
              <span className="detail-value">Limited to 2 sessions per week</span>
            </div>
          </div>
          <p className="detail-note">
            Payment is required before booking.
          </p>
        </section>

        {/* Final CTA Section */}
        <section className="card offload-section offload-final-cta" aria-labelledby="final-cta-heading">
          <h2 id="final-cta-heading" className="sr-only">Book Now</h2>
          <p className="final-cta-text">
            If your mind feels heavy, book a Cognitive Offload Sprint.
          </p>
          <a
            href="#payment-link-placeholder"
            className="button cta-button"
            aria-describedby="final-cta-description"
          >
            Book Your Cognitive Offload Sprint
            <span id="final-cta-description" className="sr-only">
              Proceed to book your 60-minute cognitive offload session
            </span>
          </a>
        </section>
      </main>
    </>
  );
}

export default CognitiveOffloadSprint;
