// Clean App.js with proper routing structure
import React, { Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
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
import { faInstagram, faXTwitter, faTiktok } from '@fortawesome/free-brands-svg-icons';
import { faBlog, faPodcast } from '@fortawesome/free-solid-svg-icons';

// Wrapper component to use hooks outside of Router
function AppContent() {
  const navigate = useNavigate();
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);

  // Kindred has launched - no countdown needed
  const isLaunched = true;

  // Test log to verify component is loading
  console.log('KINDRED: AppContent component is rendering');

  const handleNavClick = (e, targetId) => {
    e.preventDefault();

    // Navigate to the main page first
    if (window.location.pathname !== '/') {
      navigate('/', { replace: false });
    }

    // Scroll to the target section after navigation
    setTimeout(() => {
      const target = document.getElementById(targetId);

      if (target) {
        const yOffset = -100; // Offset for the height of the navbar
        const yPosition = target.getBoundingClientRect().top + window.scrollY + yOffset;

        window.scrollTo({
          top: yPosition,
          behavior: 'smooth',
        });
      }
    }, 100);
  };

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
                        alt="Joyful woman with curly hair smiling warmly, representing mental wellness and happiness"
                        className="image"
                        width={400}
                        height={300}
                        loading="eager"
                      />
                      <figcaption className="sr-only">
                        A joyful woman representing mental wellness and happiness
                      </figcaption>
                    </figure>
                    <header className="text-content">
                      <h1 id="hero-heading">💫 How we define Joy?</h1>
                      <p className="hero-description">
                        Joy is the moment your mind exhales.
                      </p>
                      <p className="hero-details">
                        It's the quiet shift from anxious spirals to grounded presence.
                        It's not about fixing everything — it's about remembering you have a choice.
                        To pause. To breathe. To move.
                        To feel connected, even in chaos.
                      </p>
                      <p className="hero-details">
                        Joy is not a destination — it's a return to agency.
                        It's the emotional experience of freedom from attachment.
                        And it's always available — even in small moments.
                      </p>
                      <p className="hero-details">
                        At Joyous, we don't promise perfection. We create space for you to choose joy — again and again.
                      </p>
                      <p className="hero-tagline">
                        <strong>Choose Joy. Share Wellness.</strong>
                      </p>
                      <div className="hero-cta-group">
                        <a
                          href="https://buy.stripe.com/dRm6oGeMQ5KZbwC76sdjO00"
                          className="button cta-button primary-cta"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-describedby="get-started-description"
                        >
                          Get Started
                          <span id="get-started-description" className="sr-only">
                            Start your wellness journey with Joyous
                          </span>
                        </a>
                        <button
                          className="button cta-button secondary-cta"
                          onClick={() => setIsQuestionnaireOpen(true)}
                          aria-describedby="clarity-description"
                        >
                          Take the Quiz
                          <span id="clarity-description" className="sr-only">
                            Open the clarity questionnaire to get personalized guidance
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

                {/* About Section */}
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
                        alt="Group of diverse friends laughing together, representing joyful community and mental wellness support"
                        className="image"
                        width={400}
                        height={300}
                        loading="lazy"
                      />
                      <figcaption className="sr-only">
                        A diverse group of friends enjoying each other's company, representing the joyful community aspect of mental wellness
                      </figcaption>
                    </figure>
                    <div className="text-content">
                      <h2 id="about-heading">What We Do</h2>
                      <p className="about-description">
                        At Joyous, we bring together science, technology, and community to support your mental wellness—day by day, moment by moment.
                      </p>
                      <p className="about-mission">
                        We design smart tools that respond to your needs in real time, helping you feel lighter, more connected, and in control. Whether you're seeking peace of mind, emotional balance, or just a space to breathe, Joyous is here—with you, and for you.
                      </p>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Our Values Section */}
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
                    <h2 id="values-heading" className="section-title">Our Values</h2>
                  </header>
                  <div className="values-grid" role="list" aria-label="Our core values">
                    {/* Value Items */}
                    <article className="value-item" role="listitem" tabIndex="0">
                      <header>
                        <h3>Human-Centered Agency</h3>
                      </header>
                      <p className="value-short">
                        We build tools that grow with you—not tools you depend on.
                      </p>
                      <p className="value-expanded">
                        Joyous strengthens agency by evolving alongside the people who use it. Continued use is earned through relevance, not reliance.
                      </p>
                    </article>
                    <article className="value-item" role="listitem" tabIndex="0">
                      <header>
                        <h3>Psychological Safety by Design</h3>
                      </header>
                      <p className="value-short">
                        Safety is built into every interaction—by design.
                      </p>
                      <p className="value-expanded">
                        From UX to AI to human moderation, Joyous prioritizes clarity, consent, and emotional safety at every touchpoint.
                      </p>
                    </article>
                    <article className="value-item" role="listitem" tabIndex="0">
                      <header>
                        <h3>Human First, Technology in Service</h3>
                      </header>
                      <p className="value-short">
                        Technology should support humanity, not replace it.
                      </p>
                      <p className="value-expanded">
                        AI at Joyous exists to enhance connection and understanding—never to diagnose, judge, or take authority.
                      </p>
                    </article>
                    <article className="value-item" role="listitem" tabIndex="0">
                      <header>
                        <h3>Radical Clarity Builds Trust</h3>
                      </header>
                      <p className="value-short">
                        Trust comes from honesty—especially about limits.
                      </p>
                      <p className="value-expanded">
                        We communicate openly about how Joyous works, what it can do, and where human support or outside care is needed.
                      </p>
                    </article>
                    <article className="value-item" role="listitem" tabIndex="0">
                      <header>
                        <h3>Belonging Without Prescription</h3>
                      </header>
                      <p className="value-short">
                        Connection without conformity.
                      </p>
                      <p className="value-expanded">
                        Joyous welcomes difference. There's no single right way to participate, heal, or grow here.
                      </p>
                    </article>
                  </div>
                </AnimatedCard>

                {/* Kindred App Announcement Section */}
                <AnimatedCard
                  className="card kindred-section"
                  id="products"
                  aria-labelledby="kindred-heading"
                  circleColor="#F1C40F"
                  opacity={0.06}
                  speed={0.014}
                  circleSize={90}
                >
                  <header className="kindred-header">
                    <h2 id="kindred-heading" className="section-title">Coming Soon: Kindred by Joyous</h2>
                    <p className="kindred-subheader">A new way to connect, share, and heal—together.</p>
                    <p className="kindred-description">
                      Kindred is our upcoming peer support app, powered by Joyous tech and built for real, human connection.
                    </p>
                  </header>

                  {/* Conditional Countdown Timer or Launch Link */}
                  {!isLaunched ? (
                    /* Countdown Timer */
                    <div style={{
                      textAlign: 'center',
                      margin: '2rem 0',
                      padding: '2rem',
                      background: 'linear-gradient(135deg, rgba(29, 161, 242, 0.1), rgba(241, 196, 15, 0.1))',
                      borderRadius: '16px',
                      border: '2px solid rgba(29, 161, 242, 0.2)',
                      minHeight: '150px'
                    }}>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: '#1DA1F2',
                        marginBottom: '1rem'
                      }}>
                        🕒 Launches In:
                      </div>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: '#333',
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }}>
                        {countdown}
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#666',
                        marginTop: '1rem'
                      }}>
                        September 14th, 2025
                      </div>
                    </div>
                  ) : (
                    /* Launch Link */
                    <div style={{
                      textAlign: 'center',
                      margin: '2rem 0',
                      padding: '2rem',
                      background: 'linear-gradient(135deg, rgba(46, 204, 113, 0.1), rgba(241, 196, 15, 0.1))',
                      borderRadius: '16px',
                      border: '2px solid rgba(46, 204, 113, 0.3)',
                      minHeight: '150px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: '#2ECC71',
                        marginBottom: '1.5rem'
                      }}>
                        🚀 Kindred is Now Live!
                      </div>
                      <a
                        href="https://kindredpeer.com"
                        className="button"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                          color: 'white',
                          background: 'linear-gradient(135deg, #2ECC71, #27AE60)',
                          padding: '1rem 2rem',
                          borderRadius: '12px',
                          border: 'none',
                          textDecoration: 'none',
                          display: 'inline-block',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(46, 204, 113, 0.3)'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(46, 204, 113, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 15px rgba(46, 204, 113, 0.3)';
                        }}
                        aria-describedby="kindred-launch-description"
                      >
                        Visit Kindred Peer →
                        <span id="kindred-launch-description" className="sr-only">
                          Visit the newly launched Kindred peer support platform
                        </span>
                      </a>
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#666',
                        marginTop: '1rem'
                      }}>
                        Connect, share, and heal together
                      </div>
                    </div>
                  )}

                  {/* Conditional CTA Button */}
                  {!isLaunched && (
                    <div className="kindred-cta">
                      <a
                        href="https://discord.gg/s9qSQfk2"
                        className="button kindred-button"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-describedby="kindred-button-description"
                      >
                        Get Notified
                        <span id="kindred-button-description" className="sr-only">
                          Join our Discord community to be notified when Kindred launches
                        </span>
                      </a>
                    </div>
                  )}

                  <div className="kindred-why">
                    <h3 className="kindred-why-title">💬 Why Kindred?</h3>
                    <p className="kindred-why-text">
                      Because no one should have to navigate mental wellness alone. Kindred connects you with peers who get it, in a safe, supportive, and emotionally intelligent space.
                    </p>
                  </div>
                </AnimatedCard>

                {/* Social Media Section */}
                <section className="card social-section" id="socials" aria-labelledby="socials-heading">
                  <header>
                    <h2 id="socials-heading" className="section-title">Check us out on social media!</h2>
                  </header>
                  <nav className="socials-nav" aria-label="Social media links">
                    <ul className="socials-list" role="list">
                      <li role="listitem">
                        <a href="/blog" rel="noopener noreferrer" className="social-icon" aria-label="Visit our Blog">
                          <FontAwesomeIcon icon={faBlog} aria-hidden="true" />
                          <span className="social-label">Blog</span>
                        </a>
                      </li>
                      <li role="listitem">
                        <a href="https://mindsthatroam.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Visit our Podcast - Minds That Roam">
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
                        <span className="social-icon disabled-icon" aria-label="Twitter coming soon" aria-disabled="true">
                          <FontAwesomeIcon icon={faXTwitter} aria-hidden="true" />
                          <span className="social-label">Twitter (Coming Soon)</span>
                        </span>
                      </li>
                      <li role="listitem">
                        <a href="https://tiktok.com/@akeyreu/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Follow us on TikTok">
                          <FontAwesomeIcon icon={faTiktok} aria-hidden="true" />
                          <span className="social-label">TikTok</span>
                        </a>
                      </li>
                    </ul>
                  </nav>
                </section>

                {/* Discord Community Section */}
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
                    <h2 id="newsletter-heading" className="section-title">Want to learn more and meet the community?</h2>
                    <p className="newsletter-description">
                      Let's talk in real time—come hang out with us on Discord!
                    </p>
                  </header>
                  <div className="newsletter-cta">
                    <a
                      href="https://discord.gg/s9qSQfk2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button newsletter-button"
                      aria-describedby="newsletter-button-description"
                    >
                      Choose Joy
                      <span id="newsletter-button-description" className="sr-only">
                        Join our Discord community to connect with others on their mental wellness journey
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
          title="Joyous - Choose Joy, Share Wellness"
          description="Mental wellness starts with joy. Joy is the moment your mind exhales. Joyous is a human-centered technology platform supporting personal agency, wellbeing, and insight."
          keywords="mental wellness, joy, mindfulness, mental health, wellness, choose joy, personal growth, wellbeing"
          canonicalUrl="https://www.yourjoyousmind.com/"
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
