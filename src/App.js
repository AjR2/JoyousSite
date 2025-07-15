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
                        alt="Person sitting peacefully on a bench reading, representing mental wellness and mindfulness"
                        className="image"
                        width={400}
                        height={300}
                        loading="eager"
                      />
                      <figcaption className="sr-only">
                        A peaceful scene representing mental wellness and mindfulness
                      </figcaption>
                    </figure>
                    <header className="text-content">
                      <h1 id="hero-heading">What Is Akeyreu?</h1>
                      <p className="hero-description">
                        We are not just another wellness company. We're your brain's new best friend. We aim to be the 'Ah-ha!' in your
                        mental wellness journey.
                      </p>
                      <p className="hero-details">
                        Don't be fooled by the name; it's quite easy to pronounce. When you are searching for
                        wellness solutions, remember <strong>"Ah-Key-Row"</strong>! Your key to neurological wellbeing.
                      </p>
                      <a
                        href="/#learn-more"
                        className="button cta-button"
                        onClick={(e) => handleNavClick(e, 'learn-more')}
                        aria-describedby="subscribe-description"
                      >
                        Subscribe Now!
                        <span id="subscribe-description" className="sr-only">
                          Subscribe to our newsletter to learn more about mental wellness
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
                        alt="Group of diverse friends laughing together, representing community and mental wellness support"
                        className="image"
                        width={400}
                        height={300}
                        loading="lazy"
                      />
                      <figcaption className="sr-only">
                        A diverse group of friends enjoying each other's company, representing the community aspect of mental wellness
                      </figcaption>
                    </figure>
                    <div className="text-content">
                      <h2 id="about-heading">What We Do</h2>
                      <p className="about-description">
                        Akeyreu is dedicated to pioneering the integration of advanced neural technologies and mental wellness practices,
                        striving to empower individuals with personalized tools that enhance mental clarity, emotional balance, and cognitive
                        performance.
                      </p>
                      <p className="about-mission">
                        We are dedicated to aiding you in your journey towards mental wellness, so that you can lead a happy and successful life.
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

                {/* Products Section */}
                <section className="card products-section" id="products" aria-labelledby="products-heading">
                  <header>
                    <h2 id="products-heading" className="section-title">Products</h2>
                  </header>
                  <div className="products-grid" role="list" aria-label="Our mental wellness products">
                    {/* Product Items */}
                    <article className="product-item" role="listitem">
                      <header>
                        <h3>nAura</h3>
                        <p className="product-tagline">Sleep Analysis & Optimization</p>
                      </header>
                      <div className="product-description">
                        <p>
                          nAura warmly welcomes you to a world where understanding your sleep is as comforting as the rest itself. By using your biomedical data, nAura comprehends your unique sleep patterns and leverages AI to offer personalized recommendations tailored just for you.
                        </p>
                        <dl className="product-features">
                          <dt>Track and analyze your sleep quality with precision:</dt>
                          <dd>Get cozy with detailed reports and actionable insights that are there to guide you to better nights.</dd>
                          <dt>Easy integration with existing smart home devices:</dt>
                          <dd>We make it simple to blend nAura into your home, ensuring your journey to restorative sleep is smooth and seamless.</dd>
                        </dl>
                      </div>
                    </article>
                    <article className="product-item" role="listitem">
                      <header>
                        <h3>Vza</h3>
                        <p className="product-tagline">Proactive CBT & Mental Wellness</p>
                      </header>
                      <div className="product-description">
                        <p>
                          Vza is here to support your mental wellness with a proactive CBT approach, wrapping you in a comforting embrace of technology.
                        </p>
                        <dl className="product-features">
                          <dt>Utilizes real-time biometric data:</dt>
                          <dd>We adapt our suggestions for mental exercises and relaxation techniques to fit your moment-to-moment needs, like a friend who knows exactly what you need when you need it.</dd>
                          <dt>Monitor your cognitive wellness journey:</dt>
                          <dd>Through personalized reports and milestones, we help you see how far you've come, celebrating every step of your journey with you.</dd>
                        </dl>
                      </div>
                    </article>
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
