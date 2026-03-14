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
const Blog = React.lazy(() => import('./components/Blog'));
const BlogPost = React.lazy(() => import('./components/BlogPost'));
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
                    <span className="hero-eyebrow">Cognitive Systems for High-Stakes Operators</span>
                    <h1 id="hero-heading">Execution Degrades<br />Before It Fails</h1>
                    <p className="hero-description">
                      Decision drift. Threshold erosion. Containment failure. The signals appear long before the collapse—but most high-performers don't have systems to catch them.
                    </p>
                    <p className="hero-tagline">
                      <strong>Pre-Collapse Prevention · Execution Integrity · Structural Containment</strong>
                    </p>
                    <div className="hero-cta-group">
                      <a
                        href="#founder"
                        className="button cta-button primary-cta"
                        aria-describedby="get-started-description"
                      >
                        Explore Enactive Founder
                        <span id="get-started-description" className="sr-only">
                          Learn about founder performance stabilization
                        </span>
                      </a>
                      <button
                        className="button cta-button secondary-cta"
                        onClick={() => setIsQuestionnaireOpen(true)}
                        aria-describedby="clarity-description"
                      >
                        Run Drift Diagnostic
                        <span id="clarity-description" className="sr-only">
                          Assess your current execution integrity status
                        </span>
                      </button>
                    </div>
                    <p className="hero-credibility">Structural cognitive systems for high-stakes operators</p>
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
                    <h2 id="about-heading">Cognitive Systems, Not Coping Mechanisms</h2>
                    <p className="about-description">
                      Enactive builds structural interventions for operators who cannot afford execution failure.
                      We don't teach resilience. We install containment.
                    </p>
                    <p className="about-mission">
                      Our approach treats decision-making capacity as infrastructure — not a personality trait.
                      When that infrastructure degrades, performance collapses. We detect threshold signals early,
                      isolate drift vectors, and restore structural integrity before breakdown becomes public.
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
                          <h3>Containment Over Coping</h3>
                        </header>
                        <p className="value-short">
                          We don't teach you to manage chaos. We help you contain it.
                        </p>
                        <p className="value-expanded">
                          Structural interventions isolate drift before it propagates. The goal is not adaptation — it's architectural repair.
                        </p>
                      </article>
                      <article className="value-item" role="listitem" tabIndex="0">
                        <header>
                          <span className="value-number">02</span>
                          <h3>Threshold Detection</h3>
                        </header>
                        <p className="value-short">
                          Signals precede symptoms. We track the signals.
                        </p>
                        <p className="value-expanded">
                          Execution degradation follows predictable threshold patterns. Our systems detect when capacity limits approach — before visible failure.
                        </p>
                      </article>
                      <article className="value-item" role="listitem" tabIndex="0">
                        <header>
                          <span className="value-number">03</span>
                          <h3>Tactical Intervention Architecture</h3>
                        </header>
                        <p className="value-short">
                          Every engagement has a defined scope, deliverable, and exit.
                        </p>
                        <p className="value-expanded">
                          No open-ended engagements. Acute interventions restore function. Structural sprints rebuild integrity. Then you operate independently.
                        </p>
                      </article>
                      <article className="value-item" role="listitem" tabIndex="0">
                        <header>
                          <span className="value-number">04</span>
                          <h3>Decision Infrastructure</h3>
                        </header>
                        <p className="value-short">
                          Decisions are architecture, not willpower.
                        </p>
                        <p className="value-expanded">
                          We treat decision-making capacity as load-bearing structure. When it degrades, we don't ask you to try harder — we repair the system.
                        </p>
                      </article>
                      <article className="value-item" role="listitem" tabIndex="0">
                        <header>
                          <span className="value-number">05</span>
                          <h3>Pre-Collapse Prevention</h3>
                        </header>
                        <p className="value-short">
                          Intervention before the board notices.
                        </p>
                        <p className="value-expanded">
                          The best time to stabilize execution is before degradation becomes externally visible. We work in the window where correction is still private.
                        </p>
                      </article>
                    </div>
                  </div>
                </section>

                {/* Enactive Founder Section */}
                <section className="page-section founder-section" id="founder" aria-labelledby="founder-heading">
                  <div className="section-inner">
                    <header className="kindred-header">
                      <h2 id="founder-heading" className="section-title">Enactive Founder</h2>
                      <p className="kindred-subheader">Founder Performance Stabilization</p>
                      <p className="kindred-description">
                        The first applied vertical of Enactive cognitive systems.
                        Designed for founders operating at capacity limits where execution failure carries existential stakes.
                      </p>
                    </header>

                    <div className="founder-service-wrapper">
                      <article className="founder-service-card value-item" role="article" tabIndex="0">
                        <header>
                          <h3>Founder Execution Reset</h3>
                          <span className="founder-service-type">60-Minute Acute Tactical Intervention</span>
                        </header>
                        <p className="value-short">
                          When execution has already degraded. Rapid containment and restoration.
                        </p>
                        <p className="value-expanded">
                          A single session designed for founders who have crossed a threshold and need immediate structural repair.
                          We isolate the drift vector, establish containment perimeter, and restore decision-making capacity within 60 minutes.
                          Includes written artifact: context snapshot, decisions externalized, immediate next actions (max 3).
                        </p>
                        <p className="founder-price">$250 &middot; 60 minutes &middot; Zoom</p>
                      </article>
                    </div>

                    <div className="kindred-cta" style={{ marginTop: '2rem' }}>
                      <a
                        href="https://founder.enactive.ai"
                        className="button kindred-button"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-describedby="founder-cta-description"
                      >
                        Book Founder Execution Reset
                        <span id="founder-cta-description" className="sr-only">
                          Book a 60-minute founder execution reset session
                        </span>
                      </a>
                    </div>

                    <div className="kindred-why">
                      <h3 className="kindred-why-title">Why Founders?</h3>
                      <p className="kindred-why-text">
                        Founders operate in environments where execution failure cascades immediately.
                        No buffer. No recovery time. No one to hand it off to.
                        When cognitive infrastructure degrades, the entire system is at risk.
                        Enactive Founder exists because pre-collapse prevention is the only intervention that matters.
                      </p>
                    </div>
                  </div>
                </section>

                {/* CTA Band */}
                <section className="cta-band" aria-labelledby="cta-band-heading">
                  <div className="cta-band-inner">
                    <h2 id="cta-band-heading">Execution failure doesn't announce itself.</h2>
                    <p className="cta-band-sub">Enterprise engagements, custom intervention protocols, and partnership discussions welcome.</p>
                    <a
                      href="/contact"
                      className="button cta-band-button"
                      aria-label="Contact Enactive"
                    >
                      Contact Enactive
                    </a>
                  </div>
                </section>

                {/* Footer Component */}
                <Footer />
              </main>
            </>
          }
        />

        <Route path="/blog" element={
          <>
            <Header />
            <Suspense fallback={
              <div className="loading-container" role="status" aria-label="Loading blog content">
                <LoadingSpinner />
                <span className="sr-only">Loading blog content...</span>
              </div>
            }>
              <Blog />
            </Suspense>
          </>
        } />

        <Route path="/blog/:slug" element={
          <>
            <Header />
            <Suspense fallback={
              <div className="loading-container" role="status" aria-label="Loading blog post">
                <LoadingSpinner />
                <span className="sr-only">Loading blog post...</span>
              </div>
            }>
              <BlogPost />
            </Suspense>
          </>
        } />

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
          canonicalUrl="https://www.enactive.ai/"
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
