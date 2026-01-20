import { useEffect, useCallback } from 'react';

/**
 * Custom Hook for Keyboard Shortcuts
 * Provides consistent keyboard shortcuts across the application
 */

/**
 * useKeyboardShortcuts Hook
 * @param {Object} shortcuts - Map of keyboard shortcuts to callbacks
 * Example: {
 *   'ctrl+s': handleSave,
 *   'escape': handleCancel,
 *   'ctrl+n': handleNew
 * }
 */
export const useKeyboardShortcuts = (shortcuts) => {
  const handleKeyDown = useCallback((event) => {
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey; // Support both Ctrl and Cmd (Mac)
    const shift = event.shiftKey;
    const alt = event.altKey;

    // Build shortcut string
    let shortcut = '';
    if (ctrl) shortcut += 'ctrl+';
    if (shift) shortcut += 'shift+';
    if (alt) shortcut += 'alt+';
    shortcut += key;

    // Execute callback if shortcut matches
    if (shortcuts[shortcut]) {
      event.preventDefault();
      shortcuts[shortcut](event);
    }

    // Handle special keys without modifiers
    if (!ctrl && !shift && !alt && shortcuts[key]) {
      if (
        // Don't trigger on input elements (unless explicitly wanted)
        event.target.tagName !== 'INPUT' && 
        event.target.tagName !== 'TEXTAREA' &&
        !event.target.isContentEditable
      ) {
        event.preventDefault();
        shortcuts[key](event);
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

/**
 * Common keyboard shortcuts for forms
 */
export const useFormShortcuts = (onSave, onCancel) => {
  useKeyboardShortcuts({
    'ctrl+s': onSave,
    'escape': onCancel
  });
};

/**
 * Common keyboard shortcuts for modals
 */
export const useModalShortcuts = (onClose) => {
  useKeyboardShortcuts({
    'escape': onClose
  });
};

export default useKeyboardShortcuts;
