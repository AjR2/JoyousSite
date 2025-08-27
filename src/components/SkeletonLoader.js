// Skeleton loading components for better UX
import React from 'react';
import './SkeletonLoader.css';

// Base skeleton component
export const Skeleton = ({ 
  width = '100%', 
  height = '1rem', 
  borderRadius = '4px',
  className = '',
  variant = 'rectangular',
  animation = 'pulse'
}) => {
  const style = {
    width,
    height,
    borderRadius: variant === 'circular' ? '50%' : borderRadius
  };

  return (
    <div 
      className={`skeleton skeleton--${variant} skeleton--${animation} ${className}`}
      style={style}
      aria-label="Loading content"
      role="status"
    />
  );
};

// Text skeleton for single lines
export const SkeletonText = ({ 
  lines = 1, 
  width = '100%',
  className = ''
}) => {
  if (lines === 1) {
    return <Skeleton width={width} height="1rem" className={className} />;
  }

  return (
    <div className={`skeleton-text ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton 
          key={index}
          width={index === lines - 1 ? '75%' : '100%'}
          height="1rem"
          className="skeleton-text__line"
        />
      ))}
    </div>
  );
};

// Avatar skeleton
export const SkeletonAvatar = ({ 
  size = '40px',
  className = ''
}) => {
  return (
    <Skeleton 
      width={size}
      height={size}
      variant="circular"
      className={`skeleton-avatar ${className}`}
    />
  );
};

// Card skeleton for blog posts
export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`skeleton-card ${className}`}>
      <div className="skeleton-card__header">
        <SkeletonText lines={2} />
        <Skeleton width="80px" height="0.875rem" className="skeleton-card__date" />
      </div>
      <div className="skeleton-card__content">
        <SkeletonText lines={3} />
      </div>
    </div>
  );
};

// Blog list skeleton
export const SkeletonBlogList = ({ count = 3, className = '' }) => {
  return (
    <div className={`skeleton-blog-list ${className}`}>
      <div className="skeleton-blog-list__header">
        <Skeleton width="200px" height="2rem" className="skeleton-blog-list__title" />
        <SkeletonText width="300px" />
      </div>
      <div className="skeleton-blog-list__posts">
        {Array.from({ length: count }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
};

// Navigation skeleton
export const SkeletonNavigation = ({ className = '' }) => {
  return (
    <div className={`skeleton-navigation ${className}`}>
      <Skeleton width="120px" height="40px" className="skeleton-navigation__logo" />
      <div className="skeleton-navigation__menu">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton 
            key={index}
            width="80px" 
            height="1rem" 
            className="skeleton-navigation__item"
          />
        ))}
      </div>
    </div>
  );
};

// Form skeleton
export const SkeletonForm = ({ fields = 4, className = '' }) => {
  return (
    <div className={`skeleton-form ${className}`}>
      <Skeleton width="200px" height="2rem" className="skeleton-form__title" />
      <SkeletonText width="300px" className="skeleton-form__description" />
      
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="skeleton-form__field">
          <Skeleton width="100px" height="1rem" className="skeleton-form__label" />
          <Skeleton width="100%" height="2.5rem" className="skeleton-form__input" />
        </div>
      ))}
      
      <Skeleton width="120px" height="2.5rem" className="skeleton-form__button" />
    </div>
  );
};

// Table skeleton
export const SkeletonTable = ({ 
  rows = 5, 
  columns = 4,
  showHeader = true,
  className = '' 
}) => {
  return (
    <div className={`skeleton-table ${className}`}>
      {showHeader && (
        <div className="skeleton-table__header">
          {Array.from({ length: columns }, (_, index) => (
            <Skeleton 
              key={index}
              width="100px" 
              height="1rem" 
              className="skeleton-table__header-cell"
            />
          ))}
        </div>
      )}
      <div className="skeleton-table__body">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="skeleton-table__row">
            {Array.from({ length: columns }, (_, colIndex) => (
              <Skeleton 
                key={colIndex}
                width="100%" 
                height="1rem" 
                className="skeleton-table__cell"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced loading spinner with text
export const LoadingSpinner = ({ 
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

// Page loading overlay
export const PageLoader = ({ 
  text = 'Loading page...',
  className = ''
}) => {
  return (
    <div className={`page-loader ${className}`} role="status">
      <div className="page-loader__content">
        <LoadingSpinner size="large" text={text} />
      </div>
    </div>
  );
};

// Inline loader for buttons
export const InlineLoader = ({ 
  size = 'small',
  className = ''
}) => {
  return (
    <div className={`inline-loader inline-loader--${size} ${className}`} role="status">
      <div className="inline-loader__spinner" aria-hidden="true"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Progress bar
export const ProgressBar = ({ 
  progress = 0,
  showPercentage = true,
  className = '',
  label = 'Progress'
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <div className={`progress-bar ${className}`} role="progressbar" aria-label={label}>
      <div className="progress-bar__track">
        <div 
          className="progress-bar__fill"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <span className="progress-bar__text">
          {Math.round(clampedProgress)}%
        </span>
      )}
    </div>
  );
};

export default {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonBlogList,
  SkeletonNavigation,
  SkeletonForm,
  SkeletonTable,
  LoadingSpinner,
  PageLoader,
  InlineLoader,
  ProgressBar
};
