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
import heroJoyousImage from './assets/hero-joyous.jpg';
import friendsImage from './assets/HappyHumans.png';
import OptimizedImage from './components/OptimizedImage';
import AnimatedCard from './components/AnimatedCard';
// import CountdownTimer from './components/CountdownTimer'; // Removed - using inline version
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';
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
                <AnimatedCard
                  className="card hero-section"
                  id="home"
                  aria-labelledby="hero-heading"
                  circleColor="#1DA1F2"
                  opacity={0.06}
                  speed={0.012}
                  circleSize={80}
                >
                  <div className="content">
                    <figure className="hero-image">
                      <OptimizedImage
                        src={heroJoyousImage}
                        alt="Founder maintaining execution clarity under pressure"
                        className="image"
                        width={400}
                        height={300}
                        loading="eager"
                      />
                      <figcaption className="sr-only">
                        Visual representation of cognitive systems and execution integrity
                      </figcaption>
                    </figure>
                    <header className="text-content">
                      <h1 id="hero-heading">Execution Degrades Before It Fails</h1>
                      <p className="hero-description">
                        You don't lose capacity overnight. You lose it in increments.
                      </p>
                      <p className="hero-details">
                        Decision drift. Threshold erosion. Containment failure.
                        The signals appear before the collapse — but most operators don't have systems to detect them.
                      </p>
                      <p className="hero-details">
                        Joyous is a cognitive systems company.
                        We build structural interventions that stabilize execution integrity
                        before degradation becomes visible to anyone else.
                      </p>
                      <p className="hero-details">
                        No frameworks. No theory. Just applied containment architecture for high-stakes operators.
                      </p>
                      <p className="hero-tagline">
                        <strong>Pre-Collapse Prevention. Execution Integrity. Structural Containment.</strong>
                      </p>
                      <div className="hero-cta-group">
                        <a
                          href="#founder"
                          className="button cta-button primary-cta"
                          aria-describedby="get-started-description"
                        >
                          Explore Joyous Founder
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
                    </header>
                  </div>
                </AnimatedCard>

                {/* Clarity Questionnaire Modal */}
                <ClarityQuestionnaire
                  isOpen={isQuestionnaireOpen}
                  onClose={() => setIsQuestionnaireOpen(false)}
                />

                {/* About Section - Cognitive Systems */}
                <AnimatedCard
                  className="card about-section"
                  id="about"
                  aria-labelledby="about-heading"
                  circleColor="#F1C40F"
                  opacity={0.05}
                  speed={0.018}
                  circleSize={60}
                >
                  <div className="content">
                    <figure className="about-image">
                      <OptimizedImage
                        src={friendsImage}
                        alt="Cognitive systems architecture visualization"
                        className="image"
                        width={400}
                        height={300}
                        loading="lazy"
                      />
                      <figcaption className="sr-only">
                        Representation of cognitive containment systems
                      </figcaption>
                    </figure>
                    <div className="text-content">
                      <h2 id="about-heading">Cognitive Systems, Not Coping Mechanisms</h2>
                      <p className="about-description">
                        Joyous builds structural interventions for operators who cannot afford execution failure.
                        We don't teach resilience. We install containment.
                      </p>
                      <p className="about-mission">
                        Our approach treats decision-making capacity as infrastructure — not a personality trait.
                        When that infrastructure degrades, performance collapses. We detect threshold signals early,
                        isolate drift vectors, and restore structural integrity before breakdown becomes public.
                      </p>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Operating Principles Section */}
                <AnimatedCard
                  className="card values-section"
                  id="values"
                  aria-labelledby="values-heading"
                  circleColor="#1DA1F2"
                  opacity={0.04}
                  speed={0.01}
                  circleSize={70}
                >
                  <header>
                    <h2 id="values-heading" className="section-title">Operating Principles</h2>
                  </header>
                  <div className="values-grid" role="list" aria-label="Our operating principles">
                    {/* Principle Items */}
                    <article className="value-item" role="listitem" tabIndex="0">
                      <header>
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
                </AnimatedCard>

                {/* Joyous Founder Vertical Section */}
                <AnimatedCard
                  className="card kindred-section"
                  id="founder"
                  aria-labelledby="founder-heading"
                  circleColor="#F1C40F"
                  opacity={0.06}
                  speed={0.014}
                  circleSize={90}
                >
                  <header className="kindred-header">
                    <h2 id="founder-heading" className="section-title">Joyous Founder</h2>
                    <p className="kindred-subheader">Founder Performance Stabilization</p>
                    <p className="kindred-description">
                      The first applied vertical of Joyous cognitive systems.
                      Designed for founders operating at capacity limits where execution failure carries existential stakes.
                    </p>
                  </header>

                  {/* Three Interventions Grid */}
                  <div className="values-grid" role="list" aria-label="Founder intervention services" style={{ marginTop: '2rem' }}>

                    {/* Founder Execution Reset */}
                    <article className="value-item" role="listitem" tabIndex="0">
                      <header>
                        <h3>Founder Execution Reset</h3>
                        <span style={{ fontSize: '0.9rem', color: '#666', display: 'block', marginTop: '0.25rem' }}>60-Minute Acute Tactical Intervention</span>
                      </header>
                      <p className="value-short">
                        When execution has already degraded. Rapid containment and restoration.
                      </p>
                      <p className="value-expanded">
                        A single session designed for founders who have crossed a threshold and need immediate structural repair.
                        We isolate the drift vector, establish containment perimeter, and restore decision-making capacity within 60 minutes.
                        Includes written artifact: context snapshot, decisions externalized, immediate next actions (max 3).
                      </p>
                      <p style={{ marginTop: '1rem', fontWeight: '600' }}>$250 | 60 minutes | Zoom</p>
                    </article>

                    {/* Founder Cognitive Integrity Sprint */}
                    <article className="value-item" role="listitem" tabIndex="0">
                      <header>
                        <h3>Founder Cognitive Integrity Sprint</h3>
                        <span style={{ fontSize: '0.9rem', color: '#666', display: 'block', marginTop: '0.25rem' }}>2-Week Structural Intervention</span>
                      </header>
                      <p className="value-short">
                        When the degradation is systemic. Structural rebuild over two weeks.
                      </p>
                      <p className="value-expanded">
                        For founders whose execution infrastructure has sustained cumulative damage.
                        Four sessions across 14 days. We map your decision architecture, identify load-bearing failures,
                        rebuild containment systems, and install threshold monitoring.
                        You exit with documented operating protocols and drift detection triggers.
                      </p>
                      <p style={{ marginTop: '1rem', fontWeight: '600' }}>$1,500 | 4 sessions over 2 weeks</p>
                    </article>

                    {/* Founder Drift Monitor */}
                    <article className="value-item" role="listitem" tabIndex="0">
                      <header>
                        <h3>Founder Drift Monitor</h3>
                        <span style={{ fontSize: '0.9rem', color: '#666', display: 'block', marginTop: '0.25rem' }}>Gated Diagnostic Tool</span>
                      </header>
                      <p className="value-short">
                        Continuous threshold signal tracking. Know before you cross.
                      </p>
                      <p className="value-expanded">
                        A structured self-assessment protocol that tracks your execution integrity markers over time.
                        Surfaces decision drift, containment erosion, and capacity threshold signals before they become visible failures.
                        Access granted after completing a Cognitive Integrity Sprint.
                      </p>
                      <p style={{ marginTop: '1rem', fontWeight: '600' }}>Available post-Sprint | Included</p>
                    </article>
                  </div>

                  {/* CTA */}
                  <div className="kindred-cta" style={{ marginTop: '2rem' }}>
                    <a
                      href="/cognitive-offload-sprint"
                      className="button kindred-button"
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
                      Joyous Founder exists because pre-collapse prevention is the only intervention that matters.
                    </p>
                  </div>
                </AnimatedCard>

                {/* Resources Section */}
                <section className="card social-section" id="socials" aria-labelledby="socials-heading">
                  <header>
                    <h2 id="socials-heading" className="section-title">Resources</h2>
                  </header>
                  <nav className="socials-nav" aria-label="Resource links">
                    <ul className="socials-list" role="list">
                      <li role="listitem">
                        <a href="/blog" rel="noopener noreferrer" className="social-icon" aria-label="Read our research and analysis">
                          <FontAwesomeIcon icon={faBlog} aria-hidden="true" />
                          <span className="social-label">Research</span>
                        </a>
                      </li>
                      <li role="listitem">
                        <a href="https://mindsthatroam.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Listen to Minds That Roam podcast">
                          <FontAwesomeIcon icon={faPodcast} aria-hidden="true" />
                          <span className="social-label">Podcast</span>
                        </a>
                      </li>
                      <li role="listitem">
                        <a href="https://twitter.com/joyouscognitive" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Follow on X/Twitter">
                          <FontAwesomeIcon icon={faXTwitter} aria-hidden="true" />
                          <span className="social-label">X / Twitter</span>
                        </a>
                      </li>
                    </ul>
                  </nav>
                </section>

                {/* Contact Section */}
                <AnimatedCard
                  className="card newsletter-section"
                  id="learn-more"
                  aria-labelledby="newsletter-heading"
                  circleColor="#1DA1F2"
                  opacity={0.07}
                  speed={0.016}
                  circleSize={75}
                >
                  <header>
                    <h2 id="newsletter-heading" className="section-title">Inquiries</h2>
                    <p className="newsletter-description">
                      For enterprise engagements, custom intervention protocols, or partnership discussions.
                    </p>
                  </header>
                  <div className="newsletter-cta">
                    <a
                      href="/contact"
                      className="button newsletter-button"
                      aria-describedby="newsletter-button-description"
                    >
                      Contact
                      <span id="newsletter-button-description" className="sr-only">
                        Contact Joyous for enterprise or partnership inquiries
                      </span>
                    </a>
                  </div>
                </AnimatedCard>

                {/* Footer Component*/}
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
          title="Joyous - Cognitive Systems for Execution Integrity"
          description="Structural interventions for operators who cannot afford execution failure. Pre-collapse prevention, decision drift containment, and founder performance stabilization."
          keywords="cognitive systems, execution integrity, founder performance, decision drift, containment, tactical intervention, pre-collapse prevention"
          canonicalUrl="https://www.joyous.com/"
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
