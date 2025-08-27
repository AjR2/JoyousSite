import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faCogs, faComments, faUsers, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import ConnectionStatus from './ConnectionStatus';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <Navbar className="navbar" expand="lg" ref={navRef}>
      <Navbar.Brand onClick={() => handleNavClick('/')} style={{ cursor: 'pointer' }}>
        <div className="logo-container">
          <FontAwesomeIcon icon={faRobot} className="logo-icon" />
          <span className="logo-text">Nimbus AI</span>
        </div>
      </Navbar.Brand>

      {/* Hamburger menu */}
      <div className="hamburger" onClick={handleMenuToggle}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      {/* Connection Status */}
      <div className="header-status">
        <ConnectionStatus />
      </div>

      {/* Navigation Links */}
      <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
        <ul className="nav-list">
          <li className="nav-item">
            <button
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => handleNavClick('/')}
            >
              <FontAwesomeIcon icon={faComments} className="nav-icon" />
              Dashboard
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${location.pathname === '/agents' ? 'active' : ''}`}
              onClick={() => handleNavClick('/agents')}
            >
              <FontAwesomeIcon icon={faCogs} className="nav-icon" />
              Configuration
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${location.pathname === '/help' ? 'active' : ''}`}
              onClick={() => handleNavClick('/help')}
            >
              <FontAwesomeIcon icon={faQuestionCircle} className="nav-icon" />
              Help
            </button>
          </li>
        </ul>
      </nav>
    </Navbar>
  );
};

export default Header;
