// Analytics tracking utility for visitor and performance tracking
import axios from 'axios';

// Remove /api suffix if present in VITE_API_URL
const baseUrl = import.meta.env.VITE_API_URL || 'https://sap-business-management-software.koyeb.app';
const API_BASE_URL = baseUrl.replace(/\/api$/, '');

let sessionId = null;
let currentPage = null;
let pageStartTime = null;

// Generate a unique session ID
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get session ID from sessionStorage or create new one
function getSessionId() {
  if (!sessionId) {
    sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
  }
  return sessionId;
}

// Get device type from user agent
function getDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// Get browser name
function getBrowserName() {
  const ua = navigator.userAgent;
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('SamsungBrowser') > -1) return 'Samsung Internet';
  if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
  if (ua.indexOf('Trident') > -1) return 'Internet Explorer';
  if (ua.indexOf('Edge') > -1) return 'Edge';
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1) return 'Safari';
  return 'Unknown';
}

// Get OS name
function getOSName() {
  const ua = navigator.userAgent;
  if (ua.indexOf('Win') > -1) return 'Windows';
  if (ua.indexOf('Mac') > -1) return 'MacOS';
  if (ua.indexOf('Linux') > -1) return 'Linux';
  if (ua.indexOf('Android') > -1) return 'Android';
  if (ua.indexOf('like Mac') > -1) return 'iOS';
  return 'Unknown';
}

// Track page visit
export async function trackPageView(page) {
  try {
    // Calculate duration on previous page
    let previousPageDuration = 0;
    if (pageStartTime && currentPage) {
      previousPageDuration = Math.floor((Date.now() - pageStartTime) / 1000);
    }

    // Update current page and start time
    currentPage = page;
    pageStartTime = Date.now();

    const sessionId = getSessionId();
    const deviceType = getDeviceType();
    const browser = getBrowserName();
    const os = getOSName();

    // Get user info if authenticated
    const authData = localStorage.getItem('auth');
    let userId = null;
    let companyId = null;
    let isAuthenticated = false;

    if (authData) {
      try {
        const auth = JSON.parse(authData);
        userId = auth.user?.id || null;
        companyId = auth.company?.id || null;
        isAuthenticated = true;
      } catch (e) {
        // Invalid auth data
      }
    }

    // Send page view to backend
    await axios.post(`${API_BASE_URL}/api/analytics/track`, {
      sessionId,
      page,
      deviceType,
      browser,
      os,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      isAuthenticated,
      userId,
      companyId,
      previousPageDuration
    }, {
      timeout: 3000, // Reduced timeout
      validateStatus: () => true // Don't throw on any status
    });
  } catch (error) {
    // Silently fail - don't disrupt user experience
    // Don't log in production to avoid console clutter
    if (import.meta.env.DEV) {
      console.debug('Analytics tracking error:', error.message);
    }
  }
}

// Update session when user leaves or closes tab
export async function endSession() {
  try {
    const sessionId = getSessionId();
    if (!sessionId) return;

    // Calculate final page duration
    let finalPageDuration = 0;
    if (pageStartTime) {
      finalPageDuration = Math.floor((Date.now() - pageStartTime) / 1000);
    }

    // Send session end to backend
    await axios.put(`${API_BASE_URL}/api/analytics/session/${sessionId}`, {
      finalPageDuration,
      endTime: new Date().toISOString()
    }, {
      timeout: 3000
    });

    // Clear session from storage (the module-level variable will be reset on next getSessionId call)
    sessionStorage.removeItem('analytics_session_id');
  } catch (error) {
    // Silently fail
    console.debug('Analytics session end error:', error.message);
  }
}

// Initialize analytics tracking
export function initializeAnalytics() {
  // Track initial page view
  trackPageView(window.location.pathname);

  // Track page visibility changes (tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // User switched away from tab
      if (pageStartTime) {
        const duration = Math.floor((Date.now() - pageStartTime) / 1000);
        console.debug(`Page hidden after ${duration}s`);
      }
    } else {
      // User returned to tab
      pageStartTime = Date.now();
    }
  });

  // Track session end on page unload
  window.addEventListener('beforeunload', () => {
    endSession();
  });

  // Track session end on page hide (mobile)
  window.addEventListener('pagehide', () => {
    endSession();
  });
}

// Manual session refresh (for long sessions)
export function refreshSession() {
  const sessionId = getSessionId();
  return sessionId;
}

// Export session ID getter for debugging
export function getCurrentSessionId() {
  return getSessionId();
}
