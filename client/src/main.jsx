import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import serverWakeup from './services/serverWakeup.js'

// Wake up server IMMEDIATELY on app load (before anything else)
// This prevents delays when user tries to login or register
serverWakeup.initializeServer().then(isAwake => {
  if (isAwake) {
    console.log('✅ Server ready and waiting for requests');
  } else {
    console.warn('⚠️ Server is starting, requests may be slower initially');
  }
});

// Register service worker for caching and performance
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered:', registration.scope);
        
        // Check for updates every 5 minutes
        setInterval(() => {
          registration.update();
        }, 5 * 60 * 1000);
        
        // Update service worker on new version
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 New version available! Refreshing...');
              newWorker.postMessage('SKIP_WAITING');
              window.location.reload();
            }
          });
        });
      })
      .catch(err => console.log('❌ Service Worker registration failed:', err));
  });
  
  // Listen for controller change and reload
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('🔄 Service Worker updated, reloading page...');
    window.location.reload();
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
