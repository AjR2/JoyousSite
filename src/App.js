import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Router components
// import { Helmet } from 'react-helmet';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './components/header';
import Footer from './components/footer';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import Contact from './components/Contact'
import MetaTags from './components/MetaTags';
import SchemaMarkup from './components/SchemaMarkup';
import readingImage from './assets/readingImage.png';
import friendsImage from './assets/HappyHumans.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faXTwitter, faTiktok } from '@fortawesome/free-brands-svg-icons';
import { faBlog, faPodcast } from '@fortawesome/free-solid-svg-icons';

function App() {
  const handleNavClick = (e, targetId) => {
    e.preventDefault();

    // Navigate to the main page first
    if (window.location.pathname !== '/') {
      navigate('/', { replace: false }); // Navigate to the main page
    }

    // Scroll to the target section after navigation
    setTimeout(() => {
      const target = document.getElementById(targetId);

      if (target) {
        const yOffset = -100; // Offset for the height of the navbar
        const yPosition = target.getBoundingClientRect().top + window.scrollY + yOffset;

        window.scrollTo({
          top: yPosition,
          behavior: 'smooth', // Smooth scrolling
        });
      }
    }, 100); // Small delay to ensure navigation completes
  };

  return (
    <>
      <MetaTags
        title="Akeyreu: Mental Wellness Reimagined Through Neural Technology"
        description="Akeyreu integrates advanced neural technologies with mental wellness practices, making technology-enhanced wellness accessible to everyone through nAura and Vza."
        keywords="mental wellness, neural technology, sleep analysis, cognitive wellness, AI wellness, nAura, Vza"
        canonicalUrl="https://www.akeyreu.com/"
      />

      <SchemaMarkup type="organization" />
      <SchemaMarkup type="website" />

      <Router>
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <div className="main-content">
                {/* First Card */}
                <div className="card" id="home">
                  <div className="content">
                    <img
                      src={readingImage}
                      alt="Man sitting on a bench reading"
                      className="image"
                    />
                    <div className="text-content">
                      <h2>What Is Akeyreu?</h2>
                      <p>
                        We are not just another wellness company. We're your brain's new best friend. We aim to be the 'Ah-ha!' in your
                        mental wellness journey. <br /><br />Don't be fooled by the name; it's quite easy to pronounce. When you are searching for
                        wellness solutions, remember <strong>"Ah-Key-Row"</strong>! Your key to neurological wellbeing.
                        <br /><br />
                        <a href="/#learn-more" className="button" onClick={(e) => handleNavClick(e, 'learn-more')}>Subscribe Now!</a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Second Card */}
                <div className="card" id="about">
                  <div className="content">
                    <img
                      src={friendsImage}
                      alt="Group of friends laughing together"
                      className="image"
                    />
                    <div className="text-content">
                      <h2>What We Do</h2>
                      <p>
                        Akeyreu is dedicated to pioneering the integration of advanced neural technologies and mental wellness practices,
                        striving to empower individuals with personalized tools that enhance mental clarity, emotional balance, and cognitive
                        performance. We are dedicated to aiding you in your journey towards mental wellness, so that you can lead a happy and successful life.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Our Values Section */}
                <div className="card" id="values">
                  <h2 className="section-title">Our Values</h2>
                  <div className="values-section">
                    {/* Value Items */}
                    <div className="value-item">
                      <h3>Inspiration</h3>
                      <p>
                        Ignite the spark of innovation, lighting up the path to mental wellness and cognitive wellbeing for you.
                      </p>
                    </div>
                    <div className="value-item">
                      <h3>Transparency</h3>
                      <p>
                        Akeyreu's commitment to transparency ensures a clear mission in mental wellness, where every step is shared with trust and clarity.
                      </p>
                    </div>
                    <div className="value-item">
                      <h3>Integrity</h3>
                      <p>
                        At the heart of our neural tech lies integrity-trusted, ethical, and always centered around you, our fellow human.
                      </p>
                    </div>
                    <div className="value-item">
                      <h3>Accessibility</h3>
                      <p>
                        Akeyreu is here to open new horizons in mental wellness, making advanced technology accessible to everyone, because everyone deserves to explore this enriching journey.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Products Section */}
                <div className="card" id="products">
                  <h2 className="section-title">Products</h2>
                  <div className="products-section">
                    {/* Product Items */}
                    <div className="product-item">
                      <h3>nAura</h3>
                      <p>
                        nAura warmly welcomes you to a world where understanding your sleep is as comforting as the rest itself. By using your biomedical data, nAura comprehends your unique sleep patterns and leverages Al to offer personalized recommendations tailored just for you.
                        <br />
                        <br />
                        <b>Track and analyze your sleep quality with precision:</b><br />Get cozy with detailed reports and actionable insights that are there to guide you to better nights.
                        <br />
                        <b>Easy integration with existing smart home devices:</b><br />We make it simple to blend nAura into your home, ensuring your journey to restorative sleep is smooth and seamless.
                      </p>
                    </div>
                    <div className="product-item">
                      <h3>Vza</h3>
                      <p>
                        Vza is here to support your mental wellness with a proactive CBT approach, wrapping you in a comforting embrace of technology.
                        <br />
                        <br />
                        <b>Utilizes real-time biometric data:</b><br />We adapt our suggestions for mental exercises and relaxation techniques to fit your moment-to-moment needs, like a friend who knows exactly what you need when you need it.
                        <br />
                        <b> Monitor your cognitive wellness journey:</b><br />Through personalized reports and milestones, we help you see how far you've come, celebrating every step of your journey with you.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Socials Section */}
                <div className="card" id="socials">
                  <h2 className="section-title">Check us out on social media!</h2>
                  <div className="socials-section">
                    <a href="/blog" rel="noopener noreferrer" className="social-icon"><FontAwesomeIcon icon={faBlog} /></a>
                    {/*href="https://ajr2.github.io/RoamingMinds/" target="_blank" rel="noopener noreferrer"*/}
                    <a className="social-icon disabled-icon"><FontAwesomeIcon icon={faPodcast} /></a>
                    <a href="https://instagram.com/a_keyreu/" target="_blank" rel="noopener noreferrer" className="social-icon"><FontAwesomeIcon icon={faInstagram} /></a>
                    {/* <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="social-icon"><FontAwesomeIcon icon={faXTwitter} /></a> */}
                    <a className="social-icon disabled-icon"><FontAwesomeIcon icon={faXTwitter} /></a>
                    <a href="https://tiktok.com/@akeyreu/" target="_blank" rel="noopener noreferrer" className="social-icon"><FontAwesomeIcon icon={faTiktok} /></a>
                  </div>
                </div>

                {/*Sign Up Section*/}
                <div className="card" id="learn-more">
                  <h2 className="section-title">Want to find out more?</h2>
                  <p>Join our community by signing up for our newsletter and take the first step in control of your mental wellbeing!</p>
                  <a href="http://eepurl.com/iMvslY" target="_blank">
                    <button type="submit" className="button" name="submit">Subscribe Here!</button>
                  </a>
                </div>

                {/* Footer Component*/}
                <Footer />
              </div>
            }
          />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Router >
    </>
  );
};

export default App;
