// Simple loading spinner component
import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
    return (
        <div className="spinner-container" aria-label="Loading content">
            <div className="spinner"></div>
        </div>
    );
};

export default LoadingSpinner;
