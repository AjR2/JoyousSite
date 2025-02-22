import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Router components
import { Helmet } from 'react-helmet';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './components/header';
import Footer from './components/footer';
import Blog from './components/Blog';
import Podcast from './components/Podcast';
import readingImage from './assets/readingImage.png';
import friendsImage from './assets/HappyHumans.png';

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
    <Router>
      <Helmet>
        <title>Akeyreu: Mental wellness reimagined</title>
      </Helmet>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <div class="main-content">
              {/* First Card */}
              <div class="card" id="home">
                <div class="content">
                  <img
                    src={readingImage}
                    alt="Man sitting on a bench reading"
                    class="image"
                  />
                  <div class="text-content">
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
              <div class="card" id="about">
                <div class="content">
                  <img
                    src={friendsImage}
                    alt="Group of friends laughing together"
                    class="image"
                  />
                  <div class="text-content">
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
              <div class="card" id="values">
                <h2 class="section-title">Our Values</h2>
                <div class="values-section">
                  {/* Value Items */}
                  <div class="value-item">
                    <h3>Inspiration</h3>
                    <p>
                      Ignite the spark of innovation, lighting up the path to mental wellness and cognitive wellbeing for you.
                    </p>
                  </div>
                  <div class="value-item">
                    <h3>Transparency</h3>
                    <p>
                      Akeyreu's commitment to transparency ensures a clear mission in mental wellness, where every step is shared with trust and clarity.
                    </p>
                  </div>
                  <div class="value-item">
                    <h3>Integrity</h3>
                    <p>
                      At the heart of our neural tech lies integrity-trusted, ethical, and always centered around you, our fellow human.
                    </p>
                  </div>
                  <div class="value-item">
                    <h3>Accessibility</h3>
                    <p>
                      Akeyreu is here to open new horizons in mental wellness, making advanced technology accessible to everyone, because everyone deserves to explore this enriching journey.
                    </p>
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div class="card" id="products">
                <h2 class="section-title">Products</h2>
                <div class="products-section">
                  {/* Product Items */}
                  <div class="product-item">
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
                  <div class="product-item">
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

              {/*Sign Up Section*/}
              <div class="card" id="learn-more">
                <h2 class="section-title">Want to find out more?</h2>
                <p>Join our community by signing up for our newsletter and take the first step in control of your mental wellbeing!</p>
                <a href="http://eepurl.com/iMvslY" target="_blank">
                  <button type="submit" class="button" name="submit">Subscribe Here!</button>
                </a>
              </div>

              {/* Footer Component*/}
              <Footer />
            </div>
          }
        />
        <Route path="/blog" element={<Blog />} />
        <Route path="/podcast" element={<Podcast />} />
      </Routes>
    </Router>
  );
}

export default App;
