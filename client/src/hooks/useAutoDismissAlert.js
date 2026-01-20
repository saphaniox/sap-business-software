import { useState, useEffect } from 'react';

/**
 * Custom hook for auto-dismissing alerts after a specified duration
 * @param {number} duration - Duration in milliseconds (default: 15000ms = 15 seconds)
 * @returns {boolean} visible - Whether the alert should be visible
 * @returns {function} setVisible - Function to manually control visibility
 */
export const useAutoDismissAlert = (duration = 15000) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return [visible, setVisible];
};
