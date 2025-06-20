// Enhanced loading spinner component
import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({
  size = 'medium',
  text = 'Loading...',
  showText = true,
  className = ''
}) => {
  const sizeClasses = {
    small: 'loading-spinner--small',
    medium: 'loading-spinner--medium',
    large: 'loading-spinner--large'
  };

  return (
    <div className={`loading-spinner ${sizeClasses[size]} ${className}`} role="status">
      <div className="loading-spinner__circle" aria-hidden="true">
        <div className="loading-spinner__path"></div>
      </div>
      {showText && (
        <span className="loading-spinner__text" aria-live="polite">
          {text}
        </span>
      )}
      <span className="sr-only">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
