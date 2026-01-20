import { useEffect, useRef, useCallback } from 'react';
import { message } from 'antd';

/**
 * Auto-save Utilities
 * Provides automatic saving of form data to localStorage
 */

/**
 * Save data to localStorage
 */
export const saveToLocalStorage = (key, data) => {
  try {
    const serialized = JSON.stringify({
      data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

/**
 * Load data from localStorage
 */
export const loadFromLocalStorage = (key, maxAge = 24 * 60 * 60 * 1000) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const { data, timestamp } = JSON.parse(item);
    
    // Check if data is too old
    const age = Date.now() - new Date(timestamp).getTime();
    if (maxAge && age > maxAge) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

/**
 * Clear saved data from localStorage
 */
export const clearFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to clear from localStorage:', error);
    return false;
  }
};

/**
 * Custom Hook for Auto-save
 * @param {string} key - localStorage key
 * @param {Object} data - data to save
 * @param {number} delay - debounce delay in ms (default: 2000)
 * @param {boolean} enabled - whether auto-save is enabled (default: true)
 */
export const useAutoSave = (key, data, delay = 2000, enabled = true) => {
  const timeoutRef = useRef(null);
  const previousDataRef = useRef(null);

  useEffect(() => {
    if (!enabled || !data) return;

    // Check if data actually changed
    const currentData = JSON.stringify(data);
    if (currentData === previousDataRef.current) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      saveToLocalStorage(key, data);
      previousDataRef.current = currentData;
      message.success('Draft saved', 1);
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, data, delay, enabled]);
};

/**
 * Hook to load saved draft on mount
 */
export const useLoadDraft = (key, maxAge) => {
  const loadDraft = useCallback(() => {
    const draft = loadFromLocalStorage(key, maxAge);
    if (draft) {
      message.info('Draft loaded', 2);
    }
    return draft;
  }, [key, maxAge]);

  return loadDraft;
};

/**
 * Hook to clear draft
 */
export const useClearDraft = (key) => {
  const clearDraft = useCallback(() => {
    clearFromLocalStorage(key);
    message.success('Draft cleared');
  }, [key]);

  return clearDraft;
};

/**
 * Hook for form auto-save with draft management
 */
export const useFormAutoSave = (formKey, formData, options = {}) => {
  const {
    delay = 2000,
    enabled = true,
    maxAge = 24 * 60 * 60 * 1000, // 24 hours
    onSave,
    onLoad
  } = options;

  // Auto-save
  useAutoSave(formKey, formData, delay, enabled);

  // Load draft
  const loadDraft = useCallback(() => {
    const draft = loadFromLocalStorage(formKey, maxAge);
    if (draft && onLoad) {
      onLoad(draft);
    }
    return draft;
  }, [formKey, maxAge, onLoad]);

  // Clear draft
  const clearDraft = useCallback(() => {
    clearFromLocalStorage(formKey);
    if (onSave) {
      onSave();
    }
  }, [formKey, onSave]);

  return {
    loadDraft,
    clearDraft,
    hasDraft: () => loadFromLocalStorage(formKey, maxAge) !== null
  };
};

export default {
  saveToLocalStorage,
  loadFromLocalStorage,
  clearFromLocalStorage,
  useAutoSave,
  useLoadDraft,
  useClearDraft,
  useFormAutoSave
};
