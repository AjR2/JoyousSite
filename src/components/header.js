import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import logoImage from './../assets/blacklogo.png';
import './header.css';

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
    <Navbar className="navbar" expand="lg" ref={navRef}>
      <Navbar.Brand href="/#home">
        <img
          src={logoImage}
          alt="Logo"
          className="logo-image"
          onClick={(e) => handleNavClick(e, 'home')}
        />
      </Navbar.Brand>

      {/* Hamburger menu */}
      <div className="hamburger" onClick={handleMenuToggle}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      {/* Navigation Links */}
      <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
        <ul className="nav-list">
          <li className="nav-item">
            <a href="/#home" className="nav-link" onClick={(e) => handleNavClick(e, 'home')}>
              Home
            </a>
          </li>
          <li className="nav-item">
            <a href="/#about" className="nav-link" onClick={(e) => handleNavClick(e, 'about')}>
              About
            </a>
          </li>
          <li className="nav-item">
            <a href="/#values" className="nav-link" onClick={(e) => handleNavClick(e, 'values')}>
              Our Values
            </a>
          </li>
          <li className="nav-item">
            <a href="/#products" className="nav-link" onClick={(e) => handleNavClick(e, 'products')}>
              Products
            </a>
          </li>
          <li className="nav-item">
            <a href="/#learn-more" className="nav-link" onClick={(e) => handleNavClick(e, 'learn-more')}>
              Learn More
            </a>
          </li>
          <li className="nav-item">
            <a href="/blog" className="nav-link">Blog</a>
          </li>
          <li className="nav-item">
            <a href="https://ajr2.github.io/RoamingMinds/" className="nav-link" rel="noopener noreferrer">
              Podcast
            </a>
          </li>
        </ul>
      </nav>
    </Navbar>
  );
};

export default Header;