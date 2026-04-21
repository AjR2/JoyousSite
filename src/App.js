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
                  {/* Cognitive infrastructure background layer */}
                  <svg className="hero-bg-svg" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" stroke="white" fill="none">
                    <line x1="80" y1="90" x2="280" y2="180" strokeWidth="0.8"/>
                    <line x1="280" y1="180" x2="480" y2="100" strokeWidth="0.8"/>
                    <line x1="480" y1="100" x2="680" y2="220" strokeWidth="0.8"/>
                    <line x1="680" y1="220" x2="880" y2="120" strokeWidth="0.8"/>
                    <line x1="880" y1="120" x2="1100" y2="190" strokeWidth="0.8"/>
                    <line x1="280" y1="180" x2="360" y2="340" strokeWidth="0.7"/>
                    <line x1="480" y1="100" x2="560" y2="290" strokeWidth="0.7"/>
                    <line x1="680" y1="220" x2="720" y2="390" strokeWidth="0.7"/>
                    <line x1="880" y1="120" x2="920" y2="330" strokeWidth="0.7"/>
                    <line x1="160" y1="330" x2="360" y2="340" strokeWidth="0.7"/>
                    <line x1="360" y1="340" x2="560" y2="290" strokeWidth="0.7"/>
                    <line x1="560" y1="290" x2="720" y2="390" strokeWidth="0.7"/>
                    <line x1="720" y1="390" x2="920" y2="330" strokeWidth="0.7"/>
                    <line x1="920" y1="330" x2="1100" y2="420" strokeWidth="0.7"/>
                    <line x1="360" y1="340" x2="300" y2="510" strokeWidth="0.6"/>
                    <line x1="560" y1="290" x2="620" y2="510" strokeWidth="0.6"/>
                    <line x1="720" y1="390" x2="780" y2="530" strokeWidth="0.6"/>
                    <line x1="80" y1="90" x2="160" y2="330" strokeDasharray="3 7" strokeWidth="0.5"/>
                    <line x1="1100" y1="190" x2="1100" y2="420" strokeDasharray="3 7" strokeWidth="0.5"/>
                    <line x1="120" y1="510" x2="300" y2="510" strokeDasharray="3 7" strokeWidth="0.5"/>
                    <circle cx="80" cy="90" r="4" fill="white" stroke="none"/>
                    <circle cx="280" cy="180" r="5" fill="white" stroke="none"/>
                    <circle cx="480" cy="100" r="3.5" fill="white" stroke="none"/>
                    <circle cx="680" cy="220" r="6" fill="white" stroke="none"/>
                    <circle cx="880" cy="120" r="4" fill="white" stroke="none"/>
                    <circle cx="1100" cy="190" r="3" fill="white" stroke="none"/>
                    <circle cx="160" cy="330" r="3.5" fill="white" stroke="none"/>
                    <circle cx="360" cy="340" r="5" fill="white" stroke="none"/>
                    <circle cx="560" cy="290" r="4" fill="white" stroke="none"/>
                    <circle cx="720" cy="390" r="6" fill="white" stroke="none"/>
                    <circle cx="920" cy="330" r="4.5" fill="white" stroke="none"/>
                    <circle cx="1100" cy="420" r="3" fill="white" stroke="none"/>
                    <circle cx="300" cy="510" r="3" fill="white" stroke="none"/>
                    <circle cx="120" cy="510" r="2.5" fill="white" stroke="none"/>
                    <circle cx="620" cy="510" r="3.5" fill="white" stroke="none"/>
                    <circle cx="780" cy="530" r="3" fill="white" stroke="none"/>
                  </svg>
                  <div className="hero-inner">
                    <span className="hero-eyebrow">For founders and operators who are still functioning — but feeling the weight of everything that hasn't closed yet.</span>
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
                  <div className="section-inner">
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
                <section className="page-section founder-section" id="offer" aria-labelledby="offer-heading">
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
                        <a href="/contact" className="button offer-cta-secondary">
                          Learn more
                        </a>
                      </article>

                      <article className="offer-card" tabIndex="0">
                        <h3>Monthly Containment</h3>
                        <span className="founder-service-type">1 month · Full async access</span>
                        <p className="offer-body">
                          The full sprint extended across a month with continuous access. For founders who need sustained
                          structural support while building — not periodic check-ins, but an ongoing containment system.
                        </p>
                        <p className="founder-price">$1,750</p>
                        <a href="/contact" className="button offer-cta-secondary">
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
