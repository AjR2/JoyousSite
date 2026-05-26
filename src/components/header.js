import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Wordmark from './Wordmark';
import './header.css';
import '../styles/accessibility.css';

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const navRef = useRef(null);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClickOutside = (event) => {
    if (navRef.current && !navRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const sectionIds = ['about', 'diagnostic', 'values', 'offer'];
    const observers = [];
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: '-25% 0px -65% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();

    if (window.location.pathname !== '/') {
      navigate('/', { replace: false });
    }

    setTimeout(() => {
      const target = document.getElementById(targetId);
      if (target) {
        const yOffset = -80;
        const yPosition = target.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: yPosition, behavior: 'smooth' });
      }
    }, 100);
    setIsMenuOpen(false);
  };

  return (
    <header role="banner">
      <Navbar className="navbar" expand="lg" ref={navRef} role="navigation" aria-label="Main navigation">
        <Navbar.Brand href="/#home">
          <div
            className="enactive-logo"
            onClick={(e) => handleNavClick(e, 'home')}
          >
            <Wordmark size={24} aria-label="Enactive" />
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
                className={`nav-link${activeSection === 'about' ? ' nav-link--active' : ''}`}
                onClick={(e) => handleNavClick(e, 'about')}
                aria-label="Navigate to About section"
                aria-current={activeSection === 'about' ? 'true' : undefined}
              >
                About
              </a>
            </li>
            <li className="nav-item">
              <a
                href="/#values"
                className={`nav-link${activeSection === 'values' ? ' nav-link--active' : ''}`}
                onClick={(e) => handleNavClick(e, 'values')}
                aria-label="Navigate to Principles section"
                aria-current={activeSection === 'values' ? 'true' : undefined}
              >
                Principles
              </a>
            </li>
            <li className="nav-item">
              <a
                href="/#offer"
                className={`nav-link${activeSection === 'offer' ? ' nav-link--active' : ''}`}
                onClick={(e) => handleNavClick(e, 'offer')}
                aria-label="Navigate to Pricing section"
                aria-current={activeSection === 'offer' ? 'true' : undefined}
              >
                Pricing
              </a>
            </li>
            <li className="nav-item">
              <a
                href="https://calendly.com/ajrudd-theenactive/new-meeting-1"
                className="nav-link nav-link-cta"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Book a closure session"
              >
                Book a closure session
              </a>
            </li>
          </ul>
        </nav>
      </Navbar>
    </header>
  );
};

export default Header;
