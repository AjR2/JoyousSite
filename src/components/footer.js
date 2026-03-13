import React from 'react';
import './footer.css';
import nvidia from './../assets/nvidia-badge.jpg';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">
            <span className="footer-logo-dark">En</span><span className="footer-logo-accent">act</span><span className="footer-logo-dark">ive</span>
          </span>
          <p className="footer-tagline">
            Structural interventions for cognitive flexibility and execution integrity.
          </p>
          <img
            src={nvidia}
            alt="Nvidia Inception Program member"
            className="footer-nvidia"
          />
        </div>

        <div className="footer-nav">
          <h4 className="footer-nav-heading">Navigate</h4>
          <ul className="footer-nav-list">
            <li><a href="/#about">About</a></li>
            <li><a href="/#values">Principles</a></li>
            <li><a href="/#founder">Enactive Founder</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="https://mindsthatroam.com" target="_blank" rel="noopener noreferrer">Podcast</a></li>
          </ul>
        </div>

        <div className="footer-nav">
          <h4 className="footer-nav-heading">Legal</h4>
          <ul className="footer-nav-list">
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Enactive. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
