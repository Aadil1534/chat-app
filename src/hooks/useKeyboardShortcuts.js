import { useEffect, useCallback } from 'react';

export function useKeyboardShortcuts({ onNewChat, onNewGroup, onSearch, onShortcuts }) {
  const handleKeyDown = useCallback(
    (e) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        onNewChat?.();
      }
      if (mod && e.shiftKey && e.key === 'U') {
        e.preventDefault();
      }
      if (mod && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        onSearch?.();
      }
      if (mod && e.key === 'e' && !e.shiftKey) {
        e.preventDefault();
        // Emoji - would need input focus
      }
      if (mod && e.key === 'p' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        onShortcuts?.();
      }
    },
    [onNewChat, onSearch, onShortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
