// Cache management utilities for SAP Business Management Software

/**
 * Clear all browser caches (localStorage, sessionStorage, Service Worker cache)
 * Use this when you need to force a fresh start
 */
export const clearAllCaches = async () => {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear Service Worker caches
    if ('serviceWorker' in navigator && 'caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => {
          console.log('Clearing cache:', name);
          return caches.delete(name);
        })
      );
      
      // Tell service worker to clear its cache
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage('CLEAR_CACHE');
    }
    
    console.log('✅ All caches cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
    return false;
  }
};

/**
 * Force reload the page, bypassing all caches
 */
export const hardReload = () => {
  // Use location.reload(true) for hard reload
  window.location.reload();
};

/**
 * Clear caches and reload the application
 * This ensures a completely fresh start
 */
export const clearCachesAndReload = async () => {
  await clearAllCaches();
  
  // Wait a bit for caches to clear
  setTimeout(() => {
    hardReload();
  }, 500);
};

/**
 * Get cache size information
 */
export const getCacheInfo = async () => {
  if (!('caches' in window)) {
    return { supported: false };
  }
  
  try {
    const cacheNames = await caches.keys();
    const cacheInfo = await Promise.all(
      cacheNames.map(async (name) => {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        return {
          name,
          itemCount: keys.length
        };
      })
    );
    
    return {
      supported: true,
      caches: cacheInfo,
      totalCaches: cacheNames.length
    };
  } catch (error) {
    console.error('Error getting cache info:', error);
    return { supported: true, error: error.message };
  }
};

/**
 * Add cache clearing button to UI (for debugging)
 * Call this in development to add a floating button
 */
export const addCacheClearButton = () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  const button = document.createElement('button');
  button.innerHTML = '🗑️ Clear Cache';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 99999;
    padding: 10px 15px;
    background: #ff4d4f;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  `;
  
  button.onclick = async () => {
    button.innerHTML = '⏳ Clearing...';
    button.disabled = true;
    await clearCachesAndReload();
  };
  
  document.body.appendChild(button);
};

/**
 * Auto-clear cache on app version change
 */
export const autoVersionCheck = (currentVersion) => {
  const storedVersion = localStorage.getItem('app-version');
  
  if (storedVersion && storedVersion !== currentVersion) {
    console.log(`🔄 Version changed from ${storedVersion} to ${currentVersion}, clearing caches...`);
    clearAllCaches().then(() => {
      localStorage.setItem('app-version', currentVersion);
      window.location.reload();
    });
  } else if (!storedVersion) {
    localStorage.setItem('app-version', currentVersion);
  }
};

export default {
  clearAllCaches,
  hardReload,
  clearCachesAndReload,
  getCacheInfo,
  addCacheClearButton,
  autoVersionCheck
};
