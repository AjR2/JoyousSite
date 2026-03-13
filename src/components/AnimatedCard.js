import React from 'react';

const AnimatedCard = ({ children, className = '', ...props }) => {
  return (
    <div className={`animated-card ${className}`} {...props}>
      {children}
    </div>
  );
};

export default AnimatedCard;
