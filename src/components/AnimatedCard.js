import React, { useRef } from 'react';
import FloatingCirclesBackground from './FloatingCirclesBackground';

const AnimatedCard = ({ 
  children, 
  className = '', 
  circleColor = '#1DA1F2',
  opacity = 0.08,
  speed = 0.015,
  circleSize = 60,
  ...props 
}) => {
  const cardRef = useRef(null);

  return (
    <div
      ref={cardRef}
      className={`animated-card ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...props.style
      }}
      {...props}
    >
      {/* Three.js Background Animation */}
      <FloatingCirclesBackground
        containerRef={cardRef}
        circleColor={circleColor}
        opacity={opacity}
        speed={speed}
        circleSize={circleSize}
      />
      
      {/* Card Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default AnimatedCard;
