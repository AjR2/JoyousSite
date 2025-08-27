// Vercel API function to serve sw.js
export default function handler(req, res) {
  // Set proper headers for service worker
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Return the service worker code
  const serviceWorkerCode = `
// Minimal Service Worker for Akeyreu Website
// Simplified to avoid security issues in production

const CACHE_NAME = 'akeyreu-v2';

self.addEventListener('install', function(event) {
  console.log('Service Worker: Installing');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activating');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API requests and external resources
  if (event.request.url.includes('/api/') ||
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(function() {
      // Only return cached response for navigation requests
      if (event.request.mode === 'navigate') {
        return caches.match('/');
      }
    })
  );
});
`;

  res.status(200).send(serviceWorkerCode.trim());
}
