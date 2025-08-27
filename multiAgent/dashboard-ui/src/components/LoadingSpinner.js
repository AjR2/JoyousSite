import React from 'react';
import { Spinner } from 'react-bootstrap';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', variant = 'primary' }) => {
  return (
    <div className="loading-spinner-container">
      <Spinner 
        animation="border" 
        variant={variant}
        size={size}
        className="loading-spinner"
      />
      {text && <div className="loading-text">{text}</div>}
    </div>
  );
};

export default LoadingSpinner;
