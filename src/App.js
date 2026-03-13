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
const MindfulBreaks = React.lazy(() => import('./components/MindfulBreaks'));
const TermsOfService = React.lazy(() => import('./components/TermsOfService'));
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy'));
const CognitiveOffloadSprint = React.lazy(() => import('./components/CognitiveOffloadSprint'));

// Import AdminAuth directly
import AdminAuth from './components/AdminAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faXTwitter, faTiktok } from '@fortawesome/free-brands-svg-icons';
import { faBlog, faPodcast } from '@fortawesome/free-solid-svg-icons';

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

                {/* Social Media Section */}
                <section className="page-section social-section" id="socials" aria-labelledby="socials-heading">
                  <div className="section-inner">
                    <h2 id="socials-heading" className="section-title">Connect</h2>
                    <nav className="socials-nav" aria-label="Social media links">
                      <ul className="socials-list" role="list">
                        <li role="listitem">
                          <a href="/blog" rel="noopener noreferrer" className="social-icon" aria-label="Read our blog">
                            <FontAwesomeIcon icon={faBlog} aria-hidden="true" />
                            <span className="social-label">Blog</span>
                          </a>
                        </li>
                        <li role="listitem">
                          <a href="https://mindsthatroam.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Listen to Minds That Roam podcast">
                            <FontAwesomeIcon icon={faPodcast} aria-hidden="true" />
                            <span className="social-label">Podcast</span>
                          </a>
                        </li>
                        <li role="listitem">
                          <a href="https://instagram.com/a_keyreu/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Follow us on Instagram">
                            <FontAwesomeIcon icon={faInstagram} aria-hidden="true" />
                            <span className="social-label">Instagram</span>
                          </a>
                        </li>
                        <li role="listitem">
                          <a href="https://twitter.com/enaboratehq" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Follow on X/Twitter">
                            <FontAwesomeIcon icon={faXTwitter} aria-hidden="true" />
                            <span className="social-label">X / Twitter</span>
                          </a>
                        </li>
                        <li role="listitem">
                          <a href="https://tiktok.com/@akeyreu/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Follow us on TikTok">
                            <FontAwesomeIcon icon={faTiktok} aria-hidden="true" />
                            <span className="social-label">TikTok</span>
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </section>

                {/* Inquiries Section */}
                <section className="page-section inquiries-section" id="learn-more" aria-labelledby="newsletter-heading">
                  <div className="section-inner">
                    <h2 id="newsletter-heading" className="section-title">Inquiries</h2>
                    <p className="newsletter-description">
                      For enterprise engagements, custom intervention protocols, or partnership discussions.
                    </p>
                    <div className="newsletter-cta">
                      <a
                        href="/contact"
                        className="button newsletter-button"
                        aria-describedby="newsletter-button-description"
                      >
                        Contact
                        <span id="newsletter-button-description" className="sr-only">
                          Contact Enactive for enterprise or partnership inquiries
                        </span>
                      </a>
                    </div>
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

        <Route path="/mindful-breaks" element={
          <>
            <Header />
            <Suspense fallback={
              <div className="loading-container" role="status" aria-label="Loading mindful breaks">
                <LoadingSpinner />
                <span className="sr-only">Loading mindful breaks...</span>
              </div>
            }>
              <MindfulBreaks />
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
