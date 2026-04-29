// Clean App.js with proper routing structure
import React, { Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './styles/mobile-optimizations.css';
import Header from './components/header';
import Footer from './components/footer';
import MetaTags from './components/MetaTags';
import SchemaMarkup from './components/SchemaMarkup';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import AccessibilityProvider from './components/AccessibilityProvider';
import ClarityQuestionnaire from './components/ClarityQuestionnaire';

// Lazy load components for code splitting
const Contact = React.lazy(() => import('./components/Contact'));
const TermsOfService = React.lazy(() => import('./components/TermsOfService'));
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy'));
const CognitiveOffloadSprint = React.lazy(() => import('./components/CognitiveOffloadSprint'));

import web1 from './assets/web1.png';
import web2 from './assets/web2.png';
import web3 from './assets/web3.png';
import mtrLogo from './assets/minds-that-roam-logo.png';

// Import AdminAuth directly
import AdminAuth from './components/AdminAuth';
// Wrapper component to use hooks outside of Router
function AppContent() {
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);

  return (
    <ErrorBoundary>
      <Routes>
        {/* Admin route without header */}
        <Route path="/admin" element={<AdminAuth />} />

        {/* All other routes with header */}
        <Route
          path="/"
          element={
            <>
              <Header />
              <main className="main-content" id="main-content" role="main">

                {/* Hero Section */}
                <section className="hero-section" id="home" aria-labelledby="hero-heading">
                  <img src={web1} className="hero-bg-photo" alt="" aria-hidden="true" />
                  <div className="hero-photo-overlay" aria-hidden="true" />
                  <div className="hero-inner">
                    <span className="hero-mtr-pill">
                      <img src={mtrLogo} alt="" aria-hidden="true" className="hero-mtr-logo" />
                      <span className="hero-mtr-text">The structural work behind <strong>Minds That Roam</strong></span>
                    </span>
                    <span className="hero-eyebrow">Cognitive Systems · Founder Performance</span>
                    <h1 id="hero-heading">Your brain is still running<br />decisions you already made.</h1>
                    <p className="hero-description">
                      When too many things stay mentally open, focus degrades — not because you're doing too much, but because nothing fully closes. Enactive builds the structure to change that.
                    </p>
                    <div className="hero-cta-group">
                      <button
                        className="button cta-button primary-cta"
                        onClick={() => setIsQuestionnaireOpen(true)}
                      >
                        Run Drift Diagnostic
                      </button>
                      <a href="#offer" className="hero-secondary-link">
                        See the offer ↓
                      </a>
                    </div>
                  </div>
                </section>

                {/* Clarity Questionnaire Modal */}
                <ClarityQuestionnaire
                  isOpen={isQuestionnaireOpen}
                  onClose={() => setIsQuestionnaireOpen(false)}
                />

                {/* About Section */}
                <section className="page-section about-section" id="about" aria-labelledby="about-heading">
                  <div className="about-split">
                    <div className="about-split-text">
                      <h2 id="about-heading">The real drain isn't the workload.</h2>
                      <p className="about-description">
                        It's the decisions that never fully resolve. The questions that run in the background.
                        The identity loops, the relationship monitoring, the timelines you've already set
                        but keep internally re-negotiating.
                      </p>
                      <p className="about-mission">
                        You're not burned out. You're cognitively overloaded by things that feel like they should be closed — but aren't.
                        That distinction matters. Because the solution isn't doing less. It's building the structure to close what's open.
                      </p>
                    </div>
                    <div className="about-split-photo">
                      <img src={web2} alt="Founder mid-thought, working late" className="about-photo" />
                    </div>
                  </div>
                </section>

                {/* Operating Principles Section */}
                <section className="page-section values-section" id="values" aria-labelledby="values-heading">
                  <div className="section-inner">
                    <h2 id="values-heading" className="section-title">Operating Principles</h2>
                    <div className="values-grid" role="list" aria-label="Our operating principles">
                      <article className="value-item" role="listitem" tabIndex="0">
                        <header>
                          <span className="value-number">01</span>
                          <h3>Decisions are architecture, not willpower</h3>
                        </header>
                        <p className="value-short">
                          Open loops aren't a discipline problem. They're a structural one.
                        </p>
                        <p className="value-expanded">
                          We build the rules that close them — not frameworks to remember, not motivation. Rules that run automatically so your brain stops re-running what's already been decided.
                        </p>
                      </article>
                      <article className="value-item" role="listitem" tabIndex="0">
                        <header>
                          <span className="value-number">02</span>
                          <h3>Signals precede symptoms</h3>
                        </header>
                        <p className="value-short">
                          Irritation, narrowing focus, sharpening humor — these aren't personality.
                        </p>
                        <p className="value-expanded">
                          They're load indicators. Execution degradation follows predictable threshold patterns. We catch them early — before visible failure, before the people around you notice.
                        </p>
                      </article>
                      <article className="value-item" role="listitem" tabIndex="0">
                        <header>
                          <span className="value-number">03</span>
                          <h3>Containment over coping</h3>
                        </header>
                        <p className="value-short">
                          We don't teach you to manage the chaos.
                        </p>
                        <p className="value-expanded">
                          We build the structure that stops it from accumulating. The goal is not adaptation — it's architectural repair that removes the source of the load.
                        </p>
                      </article>
                      <article className="value-item" role="listitem" tabIndex="0">
                        <header>
                          <span className="value-number">04</span>
                          <h3>Closure rules, not motivation</h3>
                        </header>
                        <p className="value-short">
                          Every open loop gets a rule for when it closes.
                        </p>
                        <p className="value-expanded">
                          Not a pep talk. Not a framework to remember. A rule. You leave every session with a written closure map — something your brain can actually use.
                        </p>
                      </article>
                    </div>
                  </div>
                </section>

                {/* Offer Section */}
                <section className="page-section founder-section offer-section" id="offer" aria-labelledby="offer-heading">
                  <img src={web3} className="offer-bg-photo" alt="" aria-hidden="true" />
                  <div className="section-inner">
                    <header className="kindred-header">
                      <h2 id="offer-heading" className="section-title">Built for founders who are still in the window.</h2>
                      <p className="kindred-description">
                        Not in crisis. Not collapsed. But carrying more than the work itself — and starting to feel it in the margins.
                        Less patience. Shorter tolerance. The sense that something is quietly draining focus even when nothing looks wrong.
                        That window is where this works. Before withdrawal. Before the cascade.
                      </p>
                    </header>

                    <div className="offer-grid">

                      <article className="offer-card" tabIndex="0">
                        <div className="offer-badge">Beta — limited spots</div>
                        <h3>Cognitive Offload Session</h3>
                        <span className="founder-service-type">Single session · 60 minutes · Zoom</span>
                        <p className="offer-body">
                          We identify the specific decision loops that are currently open and draining focus.
                          You leave with a written closure map — the rules your brain needs to stop re-running what's already been decided.
                        </p>
                        <p className="founder-price">$250 / session</p>
                        <a
                          href="https://calendly.com/ajrudd-theenactive/new-meeting-1"
                          className="button offer-cta-primary"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Book a session
                        </a>
                      </article>

                      <article className="offer-card" tabIndex="0">
                        <h3>Two-Week Offload Sprint</h3>
                        <span className="founder-service-type">2 weeks · Async support included</span>
                        <p className="offer-body">
                          Multiple loop identification sessions across two weeks. Includes text access between sessions
                          when a loop resurfaces or a new one opens. Built for founders managing multiple simultaneous stressors.
                        </p>
                        <p className="founder-price">$1,000</p>
                        <a
                          href="https://calendly.com/ajrudd-theenactive/offload-sprint-clone"
                          className="button offer-cta-secondary"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Learn more
                        </a>
                      </article>

                      <article className="offer-card" tabIndex="0">
                        <div className="offer-badge">5 spots open</div>
                        <h3>Monthly Containment</h3>
                        <span className="founder-service-type">1 month · Full async access</span>
                        <p className="offer-body">
                          The full sprint extended across a month with continuous access. For founders who need sustained
                          structural support while building — not periodic check-ins, but an ongoing containment system.
                        </p>
                        <p className="founder-price">$1,750</p>
                        <a
                          href="https://calendly.com/ajrudd-theenactive/offload-sprint-2-week-clone"
                          className="button offer-cta-secondary"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Learn more
                        </a>
                      </article>

                    </div>
                  </div>
                </section>

                {/* CTA Band */}
                <section className="cta-band" aria-labelledby="cta-band-heading">
                  <div className="cta-band-inner">
                    <p className="cta-band-trust">This isn't therapy. It isn't coaching. It's structural cognitive work — the kind that produces a document you can actually use the next time the load spikes.</p>
                    <h2 id="cta-band-heading">If you're a founder who's still functioning but starting to feel the ceiling — this is the window. Not after the collapse. Now.</h2>
                    <a
                      href="https://calendly.com/ajrudd-theenactive/new-meeting-1"
                      className="button cta-band-button"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Book a session
                    </a>
                  </div>
                </section>

                {/* Footer Component */}
                <Footer />
              </main>
            </>
          }
        />


        <Route path="/contact" element={
          <>
            <Header />
            <Suspense fallback={
              <div className="loading-container" role="status" aria-label="Loading contact page">
                <LoadingSpinner />
                <span className="sr-only">Loading contact page...</span>
              </div>
            }>
              <Contact />
            </Suspense>
          </>
        } />

        <Route path="/terms" element={
          <>
            <Header />
            <Suspense fallback={
              <div className="loading-container" role="status" aria-label="Loading terms of service">
                <LoadingSpinner />
                <span className="sr-only">Loading terms of service...</span>
              </div>
            }>
              <TermsOfService />
            </Suspense>
            <Footer />
          </>
        } />

        <Route path="/privacy" element={
          <>
            <Header />
            <Suspense fallback={
              <div className="loading-container" role="status" aria-label="Loading privacy policy">
                <LoadingSpinner />
                <span className="sr-only">Loading privacy policy...</span>
              </div>
            }>
              <PrivacyPolicy />
            </Suspense>
            <Footer />
          </>
        } />

        <Route path="/cognitive-offload-sprint" element={
          <>
            <Header />
            <Suspense fallback={
              <div className="loading-container" role="status" aria-label="Loading cognitive offload sprint">
                <LoadingSpinner />
                <span className="sr-only">Loading cognitive offload sprint...</span>
              </div>
            }>
              <CognitiveOffloadSprint />
            </Suspense>
            <Footer />
          </>
        } />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AccessibilityProvider>
        <MetaTags
          title="Enactive - Cognitive Systems for Execution Integrity"
          description="Structural interventions for operators who cannot afford execution failure. Pre-collapse prevention, decision drift containment, and founder performance stabilization."
          keywords="cognitive systems, execution integrity, founder performance, decision drift, containment, tactical intervention, pre-collapse prevention"
          canonicalUrl="https://theenactive.com/"
        />
        <SchemaMarkup type="organization" />
        <SchemaMarkup type="website" />
        <Router>
          <AppContent />
        </Router>
      </AccessibilityProvider>
    </HelmetProvider>
  );
}

export default App;
