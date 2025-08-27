// Accessibility Provider for enhanced screen reader and keyboard navigation support

import React, { createContext, useContext, useEffect, useState } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [focusVisible, setFocusVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Detect user preferences
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(contrastQuery.matches);
    
    const handleContrastChange = (e) => setHighContrast(e.matches);
    contrastQuery.addEventListener('change', handleContrastChange);
    
    // Detect keyboard navigation
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setFocusVisible(true);
      }
    };
    
    const handleMouseDown = () => {
      setFocusVisible(false);
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Function to announce messages to screen readers
  const announce = (message, priority = 'polite') => {
    const id = Date.now();
    const announcement = { id, message, priority };
    
    setAnnouncements(prev => [...prev, announcement]);
    
    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 1000);
  };

  // Function to manage focus
  const manageFocus = (element) => {
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Skip to main content function
  const skipToMain = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      manageFocus(mainContent);
    }
  };

  const value = {
    announce,
    manageFocus,
    skipToMain,
    focusVisible,
    reducedMotion,
    highContrast,
    announcements
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          skipToMain();
        }}
      >
        Skip to main content
      </a>
      
      {/* Live region for announcements */}
      <div className="sr-only">
        {announcements.map(announcement => (
          <div
            key={announcement.id}
            aria-live={announcement.priority}
            aria-atomic="true"
          >
            {announcement.message}
          </div>
        ))}
      </div>
      
      {/* Apply accessibility classes to body */}
      <div 
        className={`
          ${focusVisible ? 'focus-visible' : ''}
          ${reducedMotion ? 'reduced-motion' : ''}
          ${highContrast ? 'high-contrast' : ''}
        `}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

// Higher-order component for accessible components
export const withAccessibility = (Component) => {
  return React.forwardRef((props, ref) => {
    const accessibility = useAccessibility();
    return <Component {...props} ref={ref} accessibility={accessibility} />;
  });
};

// Custom hooks for common accessibility patterns
export const useAnnounce = () => {
  const { announce } = useAccessibility();
  return announce;
};

export const useFocusManagement = () => {
  const { manageFocus } = useAccessibility();
  
  const focusFirst = (container) => {
    const focusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) manageFocus(focusable);
  };
  
  const focusLast = (container) => {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) manageFocus(focusable[focusable.length - 1]);
  };
  
  return { manageFocus, focusFirst, focusLast };
};

// Keyboard navigation hook
export const useKeyboardNavigation = (onEscape, onEnter) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          if (onEscape) onEscape(e);
          break;
        case 'Enter':
          if (onEnter) onEnter(e);
          break;
        default:
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onEnter]);
};

export default AccessibilityProvider;
