import * as React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// --- Service Worker Registration ---
const IN_IFRAME = (() => { try { return window.self !== window.top; } catch { return true; } })();
const IS_PREVIEW = /\.scf\.usercontent\.goog$/i.test(window.location.hostname);

// Optional purge (behind env)
if ((import.meta as any).env?.VITE_SW_KILL === '1') {
  console.log('Service Worker: Purge flag is set. Unregistering all service workers and clearing caches.');
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations?.().then(registrations => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
  if (window.caches?.keys) {
    window.caches.keys().then(keys => {
      for (const key of keys) {
        window.caches.delete(key);
      }
    });
  }
} else if ('serviceWorker' in navigator && !IN_IFRAME && !IS_PREVIEW) {
  const registerServiceWorker = () => {
    // Construct a full, absolute URL to sw.js using the page's origin.
    // This is the most robust way to ensure the URL is correct and satisfies the same-origin policy.
    const swUrl = new URL('sw.js', window.location.origin);
    
    navigator.serviceWorker.register(swUrl, { type: 'module' })
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  };

  // Register the service worker after the page has fully loaded.
  // Checking `document.readyState` is more robust than just listening for the 'load' event,
  // as the event might have already fired if the script is deferred.
  if (document.readyState === 'complete') {
    registerServiceWorker();
  } else {
    window.addEventListener('load', registerServiceWorker);
  }
}
// --- End Service Worker Registration ---


const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
