import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import enactiveLogo from '../assets/enactive-logo.svg';
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
            className="enactive-logo"
            onClick={(e) => handleNavClick(e, 'home')}
          >
            <img src={enactiveLogo} alt="Enactive" height="28" style={{ display: 'block' }} />
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
          role="navigation"
          aria-label="Main navigation"
        >
          <ul className="nav-list" role="list">
            <li className="nav-item">
              <a
                href="/#about"
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'about')}
                aria-label="Navigate to About section"
              >
                About
              </a>
            </li>
            <li className="nav-item">
              <a
                href="/#values"
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'values')}
                aria-label="Navigate to Principles section"
              >
                Principles
              </a>
            </li>
            <li className="nav-item">
              <a
                href="/#founder"
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'founder')}
                aria-label="Navigate to Founder section"
              >
                Founder
              </a>
            </li>
            <li className="nav-item">
              <a
                href="/blog"
                className="nav-link"
                aria-label="Visit our Blog"
              >
                Blog
              </a>
            </li>
            <li className="nav-item">
              <a
                href="/contact"
                className="nav-link nav-link-cta"
                aria-label="Contact Enactive"
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </Navbar>
    </header>
  );
};

export default Header;