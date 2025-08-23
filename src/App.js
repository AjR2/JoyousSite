// Clean App.js with proper routing structure
import React, { Suspense, useState, useEffect } from 'react';
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

  // Simple countdown state
  const [countdown, setCountdown] = useState("Loading...");

  // Simple countdown effect
  useEffect(() => {
    console.log('COUNTDOWN: Component mounted, starting countdown...');

    const updateCountdown = () => {
      try {
        const now = new Date();
        const target = new Date('2025-09-08T00:00:00');
        const diff = target - now;

        console.log('COUNTDOWN: Calculating...', { now: now.toString(), target: target.toString(), diff });

        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          const countdownText = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
          console.log('COUNTDOWN: Setting text to:', countdownText);
          setCountdown(countdownText);
        } else {
          setCountdown("Launch time has arrived!");
        }
      } catch (error) {
        console.error('COUNTDOWN: Error:', error);
        setCountdown("Error calculating countdown");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => {
      console.log('COUNTDOWN: Cleaning up interval');
      clearInterval(interval);
    };
  }, []);

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
                        Choose Joy
                        <span id="discord-description" className="sr-only">
                          Join our Discord community to connect with others on their mental wellness journey
                        </span>
                      </a>
                    </header>
                  </div>
                </AnimatedCard>

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

                  {/* Simple Countdown Timer */}
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
                      September 8th, 2025
                    </div>
                  </div>

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
