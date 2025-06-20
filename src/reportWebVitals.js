// Enhanced Web Vitals reporting with performance monitoring
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then((webVitals) => {
      // Core Web Vitals - using correct function names for v4+
      const { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } = webVitals;

      if (onCLS) onCLS(onPerfEntry);
      if (onFID) onFID(onPerfEntry);
      if (onFCP) onFCP(onPerfEntry);
      if (onLCP) onLCP(onPerfEntry);
      if (onTTFB) onTTFB(onPerfEntry);
      if (onINP) onINP(onPerfEntry);
    }).catch((error) => {
      // Fallback if web-vitals is not available
      console.log('Web Vitals not available:', error);
    });
  }
};

// Enhanced performance monitoring
export const reportPerformanceMetrics = () => {
  // Report basic performance metrics
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    const metrics = {
      // Navigation timing
      domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
      loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),

      // Paint timing
      firstPaint: Math.round(paint.find(entry => entry.name === 'first-paint')?.startTime || 0),
      firstContentfulPaint: Math.round(paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0),

      // Connection info
      connectionType: navigator.connection?.effectiveType || 'unknown',

      // Memory usage (if available)
      memoryUsage: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : null
    };

    console.log('Performance Metrics:', metrics);

    // You could send these metrics to an analytics service
    // analytics.track('performance_metrics', metrics);

    return metrics;
  }

  return null;
};

// Monitor long tasks that block the main thread
export const monitorLongTasks = () => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn('Long Task detected:', {
            duration: Math.round(entry.duration),
            startTime: Math.round(entry.startTime),
            name: entry.name
          });

          // You could send this to analytics
          // analytics.track('long_task', { duration: entry.duration });
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.log('Long task monitoring not supported');
    }
  }
};

// Monitor layout shifts
export const monitorLayoutShifts = () => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.value > 0.1) { // Only report significant shifts
            console.warn('Layout Shift detected:', {
              value: entry.value,
              sources: entry.sources?.map(source => ({
                node: source.node,
                currentRect: source.currentRect,
                previousRect: source.previousRect
              }))
            });
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.log('Layout shift monitoring not supported');
    }
  }
};

// Initialize all performance monitoring
export const initPerformanceMonitoring = () => {
  // Wait for page load to complete
  window.addEventListener('load', () => {
    setTimeout(() => {
      reportPerformanceMetrics();
      monitorLongTasks();
      monitorLayoutShifts();
    }, 1000);
  });
};

export default reportWebVitals;
