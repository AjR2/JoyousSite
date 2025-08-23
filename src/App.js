// Clean App.js with proper routing structure
import React, { Suspense } from 'react';
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

// Lazy load components for code splitting
const Blog = React.lazy(() => import('./components/Blog'));
const BlogPost = React.lazy(() => import('./components/BlogPost'));
const Contact = React.lazy(() => import('./components/Contact'));
const MindfulBreaks = React.lazy(() => import('./components/MindfulBreaks'));

// Import AdminAuth directly
import AdminAuth from './components/AdminAuth';
import readingImage from './assets/readingImage.png';
import friendsImage from './assets/HappyHumans.png';
import OptimizedImage from './components/OptimizedImage';
import CountdownTimer from './components/CountdownTimer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faXTwitter, faTiktok } from '@fortawesome/free-brands-svg-icons';
import { faBlog, faPodcast } from '@fortawesome/free-solid-svg-icons';

// Wrapper component to use hooks outside of Router
function AppContent() {
  const navigate = useNavigate();

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
                <section className="card hero-section" id="home" aria-labelledby="hero-heading">
                  <div className="content">
                    <figure className="hero-image">
                      <OptimizedImage
                        src={readingImage}
                        alt="Person sitting peacefully on a bench reading, representing joyful mental wellness and mindfulness"
                        className="image"
                        width={400}
                        height={300}
                        loading="eager"
                      />
                      <figcaption className="sr-only">
                        A peaceful scene representing joyful mental wellness and mindfulness
                      </figcaption>
                    </figure>
                    <header className="text-content">
                      <h1 id="hero-heading">Mental Wellness Starts with Joy</h1>
                      <p className="hero-description">
                        Joyous is your path to mental clarity.
                      </p>
                      <p className="hero-details">
                        Blending neuroscience and real-time tech with emotional connection, we help you feel seen, supported, and empowered, one joyful moment at a time.
                      </p>
                      <p className="hero-tagline">
                        <strong>Choose Joy. Share Wellness.</strong>
                      </p>
                      <a
                        href="https://discord.gg/s9qSQfk2"
                        className="button cta-button"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-describedby="discord-description"
                      >
                        Step into Joy
                        <span id="discord-description" className="sr-only">
                          Join our Discord community to connect with others on their mental wellness journey
                        </span>
                      </a>
                    </header>
                  </div>
                </section>

                {/* About Section */}
                <section className="card about-section" id="about" aria-labelledby="about-heading">
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
                </section>

                {/* Our Values Section */}
                <section className="card values-section" id="values" aria-labelledby="values-heading">
                  <header>
                    <h2 id="values-heading" className="section-title">Our Values</h2>
                  </header>
                  <div className="values-grid" role="list" aria-label="Our core values">
                    {/* Value Items */}
                    <article className="value-item" role="listitem">
                      <header>
                        <h3>Inspiration</h3>
                      </header>
                      <p>
                        Ignite the spark of innovation, lighting up the path to mental wellness and cognitive wellbeing for you.
                      </p>
                    </article>
                    <article className="value-item" role="listitem">
                      <header>
                        <h3>Transparency</h3>
                      </header>
                      <p>
                        Akeyreu's commitment to transparency ensures a clear mission in mental wellness, where every step is shared with trust and clarity.
                      </p>
                    </article>
                    <article className="value-item" role="listitem">
                      <header>
                        <h3>Integrity</h3>
                      </header>
                      <p>
                        At the heart of our neural tech lies integrity-trusted, ethical, and always centered around you, our fellow human.
                      </p>
                    </article>
                    <article className="value-item" role="listitem">
                      <header>
                        <h3>Accessibility</h3>
                      </header>
                      <p>
                        Akeyreu is here to open new horizons in mental wellness, making advanced technology accessible to everyone, because everyone deserves to explore this enriching journey.
                      </p>
                    </article>
                  </div>
                </section>

                {/* Kindred App Announcement Section */}
                <section className="card kindred-section" id="products" aria-labelledby="kindred-heading">
                  <header className="kindred-header">
                    <h2 id="kindred-heading" className="section-title">Coming Soon: Kindred by Joyous</h2>
                    <p className="kindred-subheader">A new way to connect, share, and heal—together.</p>
                    <p className="kindred-description">
                      Kindred is our upcoming peer support app, powered by Joyous tech and built for real, human connection.
                    </p>
                  </header>

                  <CountdownTimer
                    targetDate="2025-12-31T00:00:00"
                    className="kindred-countdown"
                  />

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

                  <div className="kindred-why">
                    <h3 className="kindred-why-title">💬 Why Kindred?</h3>
                    <p className="kindred-why-text">
                      Because no one should have to navigate mental wellness alone. Kindred connects you with peers who get it, in a safe, supportive, and emotionally intelligent space.
                    </p>
                  </div>
                </section>

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

                {/* Newsletter Sign Up Section */}
                <section className="card newsletter-section" id="learn-more" aria-labelledby="newsletter-heading">
                  <header>
                    <h2 id="newsletter-heading" className="section-title">Want to find out more?</h2>
                    <p className="newsletter-description">
                      Join our community by signing up for our newsletter and take the first step in control of your mental wellbeing!
                    </p>
                  </header>
                  <div className="newsletter-cta">
                    <a
                      href="https://eepurl.com/iMvslY"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button newsletter-button"
                      aria-describedby="newsletter-button-description"
                    >
                      Subscribe Here!
                      <span id="newsletter-button-description" className="sr-only">
                        Opens newsletter signup form in a new tab
                      </span>
                    </a>
                  </div>
                </section>

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
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AccessibilityProvider>
        <MetaTags />
        <SchemaMarkup />
        <Router>
          <AppContent />
        </Router>
      </AccessibilityProvider>
    </HelmetProvider>
  );
}

export default App;
