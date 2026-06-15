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
import { OpenLoop, ClosedLoop } from './components/LoopMark';
import IntakeForm from './components/IntakeForm';
const BriefsViewer = React.lazy(() => import('./components/BriefsViewer'));

// Lazy load components for code splitting
const Contact = React.lazy(() => import('./components/Contact'));
const TermsOfService = React.lazy(() => import('./components/TermsOfService'));
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy'));
const CognitiveOffloadSprint = React.lazy(() => import('./components/CognitiveOffloadSprint'));
const HowItWorks = React.lazy(() => import('./components/HowItWorks'));

import mtrLogo from './assets/minds-that-roam-logo.png';

// Import AdminAuth directly
import AdminAuth from './components/AdminAuth';
const PRINCIPLES = [
  {
    number: '01',
    title: 'Decisions are architecture, not willpower',
    short: "Open loops aren't a discipline problem. They're a structural one.",
    expanded: "We build the rules that close them — not frameworks to remember, not motivation. Rules that run automatically so your brain stops re-running what's already been decided.",
  },
  {
    number: '02',
    title: 'Signals precede symptoms',
    short: "Irritation, narrowing focus, sharpening humor — these aren't personality.",
    expanded: "They're load indicators. Execution degradation follows predictable threshold patterns. We catch them early — before visible failure, before the people around you notice.",
  },
  {
    number: '03',
    title: 'Containment over coping',
    short: "We don't teach you to manage the chaos.",
    expanded: "We build the structure that stops it from accumulating. The goal is not adaptation — it's architectural repair that removes the source of the load.",
  },
  {
    number: '04',
    title: 'Closure rules, not motivation',
    short: 'Every open loop gets a rule for when it closes.',
    expanded: "Not a pep talk. Not a framework to remember. A rule. You leave every session with a closure map — something your brain can actually use.",
  },
];

function PrincipleCard({ number, title, short, expanded }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const toggle = () => setIsExpanded(prev => !prev);
  return (
    <article
      className={`value-item${isExpanded ? ' value-item--expanded' : ''}`}
      role="button"
      tabIndex="0"
      aria-expanded={isExpanded}
      onClick={toggle}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
    >
      <header>
        <span className="value-number">{number}</span>
        <h3>{title}</h3>
      </header>
      <p className="value-short" aria-hidden={isExpanded}>{short}</p>
      <p className="value-expanded" aria-hidden={!isExpanded}>{expanded}</p>
    </article>
  );
}

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
                  {/* Rotating loop rings — background animation */}
                  <div className="hero-loop-bg" aria-hidden="true">
                    <div className="hero-loop-ring hero-loop-ring--outer">
                      <svg viewBox="0 0 24 24" fill="none" width="680" height="680">
                        <circle cx="12" cy="12" r="9" stroke="#2C5F5A" strokeWidth="0.6" strokeDasharray="48 8" strokeLinecap="round" transform="rotate(-90 12 12)" />
                      </svg>
                    </div>
                    <div className="hero-loop-ring hero-loop-ring--mid">
                      <svg viewBox="0 0 24 24" fill="none" width="460" height="460">
                        <circle cx="12" cy="12" r="9" stroke="#2C5F5A" strokeWidth="0.8" strokeDasharray="48 8" strokeLinecap="round" transform="rotate(-90 12 12)" />
                      </svg>
                    </div>
                    <div className="hero-loop-ring hero-loop-ring--inner">
                      <svg viewBox="0 0 24 24" fill="none" width="280" height="280">
                        <circle cx="12" cy="12" r="9" stroke="#2C5F5A" strokeWidth="1.2" strokeDasharray="48 8" strokeLinecap="round" transform="rotate(-90 12 12)" />
                      </svg>
                    </div>
                  </div>
                  <div className="hero-inner">
                    <div className="hero-pill-stack">
                      <span className="hero-mtr-pill">
                        <img src={mtrLogo} alt="" aria-hidden="true" className="hero-mtr-logo" />
                        <span className="hero-mtr-text">The structural work behind <strong>Roaming Minds</strong></span>
                      </span>
                      <span className="hero-eyebrow">Cognitive Systems · Founder Performance</span>
                    </div>
                    <h1 id="hero-heading">Your brain is still running<br />decisions you already made.</h1>
                    <p className="hero-description">
                      When too many things stay mentally open, focus degrades — not because you're doing too much, but because nothing fully closes. Enactive builds the structure to close them.
                    </p>
                    <div className="hero-cta-group">
                      <p className="hero-diagnostic-promise">
                        5 minutes. You leave with a closure map — your drift pattern named, your constraints mapped, your next two actions specified.
                      </p>
                      <button
                        className="button cta-button primary-cta"
                        onClick={() => setIsQuestionnaireOpen(true)}
                      >
                        Run the Drift Diagnostic
                      </button>
                      <span className="hero-cta-meta">Free · No signup · Less than 5 minutes</span>
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
                      <button
                        className="about-nudge-cta"
                        onClick={() => setIsQuestionnaireOpen(true)}
                      >
                        Not sure if this applies? Run the free diagnostic →
                      </button>
                    </div>
                    {/* Closure Map artifact — replaces stock photo */}
                    <div className="about-artifact" role="img" aria-label="Sample closure map output from a session">
                      <div className="artifact-header">
                        <span className="artifact-label">Closure Map</span>
                        <span className="artifact-meta">Session output — redacted</span>
                      </div>
                      <div className="artifact-body">
                        <div className="artifact-section">
                          <span className="artifact-section-label">Open loops identified</span>
                          <ul className="artifact-loops">
                            <li>
                              <span className="loop-icon"><OpenLoop size={14} /></span>
                              Hiring decision — unresolved for 6 weeks
                            </li>
                            <li>
                              <span className="loop-icon"><OpenLoop size={14} /></span>
                              Partnership terms — circling without closure
                            </li>
                            <li>
                              <span className="loop-icon"><OpenLoop size={14} /></span>
                              Q3 pricing model — re-opening after each call
                            </li>
                          </ul>
                        </div>
                        <div className="artifact-section">
                          <span className="artifact-section-label">Constraints</span>
                          <ul className="artifact-constraints">
                            <li>Cannot risk Series A timeline</li>
                            <li>Must protect lead engineer's focus</li>
                          </ul>
                        </div>
                        <div className="artifact-section artifact-section--accent">
                          <span className="artifact-section-label">Next actions</span>
                          <ol className="artifact-actions">
                            <li>Close hiring decision by Friday. Set closure rule — no further deliberation after that date.</li>
                            <li>Remove partnership from active consideration until Q3.</li>
                          </ol>
                        </div>
                        <div className="artifact-footer">
                          <ClosedLoop size={14} color="#2C5F5A" />
                          2 of 3 loops closed this session
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Drift Diagnostic Section */}
                <section className="page-section diagnostic-section" id="diagnostic" aria-labelledby="diagnostic-heading">
                  <div className="about-split diagnostic-split">
                    <div className="diagnostic-cta-block">
                      <button
                        className="button cta-button primary-cta diagnostic-cta-button"
                        onClick={() => setIsQuestionnaireOpen(true)}
                      >
                        Run Drift Diagnostic
                      </button>
                      <span className="diagnostic-meta">Less than 5 minutes · No signup</span>
                    </div>
                    <div className="about-split-text diagnostic-split-text">
                      <h2 id="diagnostic-heading">Drift diagnostic</h2>
                      <p className="about-description">
                        Most founders know something is off before they can name it. Shorter patience. Slower decisions. The sense that more effort is producing less movement.
                      </p>
                      <p className="about-description">
                        That is drift. And it has a structure.
                      </p>
                      <p className="about-mission">
                        The diagnostic identifies which decision loops are currently open, what they are costing you in execution capacity, and what needs to close first. It takes less than five minutes. You leave with a closure map — your problem named, your constraints mapped, your next two actions specified.
                      </p>
                      <p className="about-mission diagnostic-finisher">
                        Not a score. Not a category. A document you can use today.
                      </p>

                      <div className="sample-directive" aria-label="Sample closure map">
                        <span className="sample-directive-label">Sample output</span>
                        <div className="sample-directive-block">
                          <span className="sample-tag">PROBLEM</span>
                          <p>Three decisions are structurally unresolved, creating recursive loops that activate outside work hours.</p>
                        </div>
                        <div className="sample-directive-block sample-directive-block--accent">
                          <span className="sample-tag">NEXT ACTIONS</span>
                          <ol>
                            <li>Set a closure rule for the hiring decision by Friday — no further deliberation after that date.</li>
                            <li>Remove the partnership question from active consideration until Q3.</li>
                          </ol>
                        </div>
                        <p className="sample-directive-note">Redacted from a real session. Your closure map reflects your specific pattern.</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Operating Principles Section */}
                <section className="page-section values-section" id="values" aria-labelledby="values-heading">
                  <div className="section-inner">
                    <h2 id="values-heading" className="section-title">Operating Principles</h2>
                    <div className="values-grid" role="list" aria-label="Our operating principles">
                      {PRINCIPLES.map(p => (
                        <PrincipleCard key={p.number} {...p} />
                      ))}
                    </div>
                  </div>
                </section>

                {/* Who This Is For Section */}
                <section className="page-section icp-section" id="who" aria-labelledby="icp-heading">
                  <div className="section-inner">
                    <h2 id="icp-heading" className="section-title">Who this is for</h2>
                    <div className="icp-grid">
                      <div className="icp-col icp-col--yes">
                        <h3 className="icp-col-heading">This works if you are</h3>
                        <ul className="icp-list">
                          <li>An early-stage founder — pre-seed to Series A</li>
                          <li>Running a solo or small team (1–5 people)</li>
                          <li>Already naming the problem: decision fatigue, cognitive overload, work that follows you mentally after hours</li>
                          <li>Still functioning — not collapsed, but feeling the ceiling</li>
                        </ul>
                      </div>
                      <div className="icp-col icp-col--no">
                        <h3 className="icp-col-heading">This is not for</h3>
                        <ul className="icp-list icp-list--no">
                          <li>Employees, students, or freelancers</li>
                          <li>Founders seeking therapy or coaching</li>
                          <li>Executives at established companies</li>
                          <li>People who haven't yet named the problem</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Founder Credibility Section */}
                <section className="page-section founder-cred-section" id="founder" aria-labelledby="founder-cred-heading">
                  <div className="section-inner founder-cred-inner">
                    <div className="founder-cred-text">
                      <span className="section-eyebrow">Who runs the sessions</span>
                      <h2 id="founder-cred-heading">AJ Rudd</h2>
                      <p className="founder-cred-body">
                        AJ built the Spatial Influence framework — a structural model for mapping and closing the open decision loops that degrade founder execution. That framework underlies every diagnostic and every session.
                      </p>
                      <p className="founder-cred-body">
                        He also hosts <strong>Roaming Minds</strong>, a podcast on the cognitive architecture of high-performance operators, and is an Nvidia Inception Program member.
                      </p>
                      <p className="founder-cred-note">Sessions are 1:1. No team. No hand-offs.</p>
                    </div>
                    <div className="founder-cred-cta">
                      <button
                        className="button founder-cred-diagnostic-btn"
                        onClick={() => setIsQuestionnaireOpen(true)}
                      >
                        Run the Drift Diagnostic
                      </button>
                      <span className="founder-cred-meta">Free · 5 minutes · No signup</span>
                    </div>
                  </div>
                </section>

                {/* Offer Section */}
                <section className="page-section offer-section" id="offer" aria-labelledby="offer-heading">
                  <div className="section-inner">
                    <header className="kindred-header">
                      <h2 id="offer-heading" className="section-title" style={{ color: '#F0EDE8' }}>Sessions. Structured output. Closed loops.</h2>
                      <p className="kindred-description">
                        60-minute sessions with a concrete output — a closure map that names the open loops, maps the constraints, and specifies the next two actions. Not coaching. Not conversation. A document you can use the same day.
                      </p>
                    </header>

                    <div className="offer-grid">

                      <article className="offer-card" tabIndex="0">
                        <div className="offer-badge">Beta — limited spots</div>
                        <h3>Cognitive Offload Session</h3>
                        <span className="founder-service-type" style={{ color: 'rgba(240,237,232,0.5)' }}>Single session · 60 minutes · Zoom</span>
                        <p className="offer-body">
                          We identify the specific decision loops that are currently open and draining focus.
                          You leave with a closure map — the rules your brain needs to stop re-running what's already been decided.
                        </p>
                        <p className="founder-price" style={{ color: '#F0EDE8', background: 'rgba(240,237,232,0.08)', borderColor: 'rgba(240,237,232,0.15)' }}>$250 / session</p>
                        <a
                          href="https://calendly.com/ajrudd-theenactive/new-meeting-1"
                          className="button offer-cta-primary"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Book a closure session
                        </a>
                      </article>

                      <article className="offer-card" tabIndex="0">
                        <h3>Two-Week Offload Sprint</h3>
                        <span className="founder-service-type" style={{ color: 'rgba(240,237,232,0.5)' }}>2 weeks · Async support included</span>
                        <p className="offer-body">
                          Multiple loop identification sessions across two weeks. Includes text access between sessions
                          when a loop resurfaces or a new one opens. Built for founders managing multiple simultaneous stressors.
                        </p>
                        <p className="founder-price" style={{ color: '#F0EDE8', background: 'rgba(240,237,232,0.08)', borderColor: 'rgba(240,237,232,0.15)' }}>$1,000</p>
                        <a
                          href="https://calendly.com/ajrudd-theenactive/offload-sprint-clone"
                          className="button offer-cta-primary"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Book a closure session
                        </a>
                      </article>

                      <article className="offer-card" tabIndex="0">
                        <div className="offer-badge">5 spots open</div>
                        <h3>Monthly Containment</h3>
                        <span className="founder-service-type" style={{ color: 'rgba(240,237,232,0.5)' }}>1 month · Full async access</span>
                        <p className="offer-body">
                          The full sprint extended across a month with continuous access. For founders who need sustained
                          structural support while building — not periodic check-ins, but an ongoing containment system.
                        </p>
                        <p className="founder-price" style={{ color: '#F0EDE8', background: 'rgba(240,237,232,0.08)', borderColor: 'rgba(240,237,232,0.15)' }}>$1,750</p>
                        <a
                          href="https://calendly.com/ajrudd-theenactive/offload-sprint-2-week-clone"
                          className="button offer-cta-primary"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Book a closure session
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
                      Book a closure session
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

        <Route path="/howitworks" element={
          <>
            <Header />
            <Suspense fallback={
              <div className="loading-container" role="status" aria-label="Loading how it works">
                <LoadingSpinner />
                <span className="sr-only">Loading how it works...</span>
              </div>
            }>
              <HowItWorks />
            </Suspense>
            <Footer />
          </>
        } />

        <Route path="/intake" element={<IntakeForm />} />

        <Route path="/briefs" element={
          <Suspense fallback={
            <div className="loading-container" role="status">
              <LoadingSpinner />
            </div>
          }>
            <BriefsViewer />
          </Suspense>
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
