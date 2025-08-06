import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals, { initPerformanceMonitoring } from './reportWebVitals';
import * as serviceWorker from './utils/serviceWorker';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for offline functionality and performance
// Only register in development or when explicitly enabled
if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_ENABLE_SW === 'true') {
  serviceWorker.register({
    onSuccess: () => {
      console.log('App: Service worker registered successfully');
    },
    onUpdate: () => {
      console.log('App: New content available, please refresh');
      // You could show a notification to the user here
    },
    onError: (error) => {
      console.error('App: Service worker registration failed:', error);
    }
  });
} else {
  console.log('App: Service worker disabled in production');
  // Unregister any existing service worker
  serviceWorker.unregister();
}

// Initialize performance monitoring
initPerformanceMonitoring();

// Report Web Vitals
reportWebVitals((metric) => {
  console.log('Web Vital:', metric);
  // You could send this to an analytics service
  // analytics.track('web_vital', metric);
});