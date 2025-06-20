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
serviceWorker.register({
  onSuccess: () => {
    console.log('App: Service worker registered successfully');
  },
  onUpdate: () => {
    console.log('App: New content available, please refresh');
    // You could show a notification to the user here
  }
});

// Initialize performance monitoring
initPerformanceMonitoring();

// Report Web Vitals
reportWebVitals((metric) => {
  console.log('Web Vital:', metric);
  // You could send this to an analytics service
  // analytics.track('web_vital', metric);
});