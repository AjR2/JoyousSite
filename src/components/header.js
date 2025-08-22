import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
// import logoImage from './../assets/blacklogo.png'; // Old logo - replaced with CSS version
import './header.css';
import '../styles/accessibility.css';

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null); // Ref to the navigation container

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClickOutside = (event) => {
    if (navRef.current && !navRef.current.contains(event.target)) {
      setIsMenuOpen(false); // Close the menu if the click is outside
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside); // Add event listener for clicks
    return () => {
      document.removeEventListener('mousedown', handleClickOutside); // Cleanup on unmount
    };
  }, []);

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
    setIsMenuOpen(false); // Close menu after clicking a link
  };

  return (
    <header role="banner">
      <Navbar className="navbar" expand="lg" ref={navRef} role="navigation" aria-label="Main navigation">
        <Navbar.Brand href="/#home">
          <div
            className="joyous-logo"
            onClick={(e) => handleNavClick(e, 'home')}
            role="img"
            aria-label="Joyous - Mental Wellness Through Neural Technology"
          >
            <span className="joyous-text">
              <span className="joyous-j">j</span>
              <span className="joyous-o1">o</span>
              <span className="joyous-y">y</span>
              <span className="joyous-o2">o</span>
              <span className="joyous-u">u</span>
              <span className="joyous-s">s</span>
            </span>
          </div>
        </Navbar.Brand>

        {/* Hamburger menu */}
        <button
          className="hamburger"
          onClick={handleMenuToggle}
          aria-expanded={isMenuOpen}
          aria-controls="main-navigation"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          type="button"
        >
          <span className="bar" aria-hidden="true"></span>
          <span className="bar" aria-hidden="true"></span>
          <span className="bar" aria-hidden="true"></span>
          <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
        </button>

        {/* Navigation Links */}
        <nav
          className={`nav ${isMenuOpen ? 'open' : ''}`}
          id="main-navigation"
          aria-hidden={!isMenuOpen}
          role="navigation"
          aria-label="Main navigation"
        >
          <ul className="nav-list" role="menubar">
            <li className="nav-item" role="none">
              <a
                href="/#home"
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'home')}
                role="menuitem"
                tabIndex={isMenuOpen ? 0 : -1}
                aria-label="Navigate to Home section"
              >
                Home
              </a>
            </li>
            <li className="nav-item" role="none">
              <a
                href="/#about"
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'about')}
                role="menuitem"
                tabIndex={isMenuOpen ? 0 : -1}
                aria-label="Navigate to About section"
              >
                About
              </a>
            </li>
            <li className="nav-item" role="none">
              <a
                href="/#values"
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'values')}
                role="menuitem"
                tabIndex={isMenuOpen ? 0 : -1}
                aria-label="Navigate to Our Values section"
              >
                Our Values
              </a>
            </li>
            <li className="nav-item" role="none">
              <a
                href="/#products"
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'products')}
                role="menuitem"
                tabIndex={isMenuOpen ? 0 : -1}
                aria-label="Navigate to Products section"
              >
                Products
              </a>
            </li>
            <li className="nav-item" role="none">
              <a
                href="/#socials"
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'socials')}
                role="menuitem"
                tabIndex={isMenuOpen ? 0 : -1}
                aria-label="Navigate to Social Media section"
              >
                Socials
              </a>
            </li>
            <li className="nav-item" role="none">
              <a
                href="/#learn-more"
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'learn-more')}
                role="menuitem"
                tabIndex={isMenuOpen ? 0 : -1}
                aria-label="Navigate to Learn More section"
              >
                Learn More
              </a>
            </li>
            <li className="nav-item" role="none">
              <a
                href="/blog"
                className="nav-link"
                role="menuitem"
                tabIndex={isMenuOpen ? 0 : -1}
                aria-label="Visit our Blog"
              >
                Blog
              </a>
            </li>
            <li className="nav-item" role="none">
              <a
                href="/mindful-breaks"
                className="nav-link"
                role="menuitem"
                tabIndex={isMenuOpen ? 0 : -1}
                aria-label="Visit Mindful Breaks page"
              >
                Mindful Breaks
              </a>
            </li>
            <li className="nav-item" role="none">
              <a
                href="/contact"
                className="nav-link"
                role="menuitem"
                tabIndex={isMenuOpen ? 0 : -1}
                aria-label="Visit Contact Us page"
              >
                Contact Us
              </a>
            </li>
            <li className="nav-item" role="none">
              <a
                href="https://ajr2.github.io/RoamingMinds/"
                className="nav-link"
                rel="noopener noreferrer"
                target="_blank"
                role="menuitem"
                tabIndex={isMenuOpen ? 0 : -1}
                aria-label="Visit our Podcast (opens in new tab)"
              >
                Podcast
              </a>
            </li>
          </ul>
        </nav>
      </Navbar>
    </header>
  );
};

export default Header;