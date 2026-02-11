import { useEffect, useRef } from 'react';

const SHORTCUTS = [
  { keys: ['Cmd/Ctrl', 'Shift', 'U'], action: 'Mark as unread' },
  { keys: ['Cmd/Ctrl', 'Shift', 'E'], action: 'Archive chat' },
  { keys: ['Cmd/Ctrl', 'Shift', 'P'], action: 'Pin chat' },
  { keys: ['Cmd/Ctrl', 'Shift', 'F'], action: 'Search chat' },
  { keys: ['Cmd/Ctrl', 'N'], action: 'New chat' },
  { keys: ['Cmd/Ctrl', 'Shift', 'N'], action: 'New group' },
  { keys: ['Ctrl', 'Tab'], action: 'Next chat' },
  { keys: ['Ctrl', 'Shift', 'Tab'], action: 'Previous chat' },
  { keys: ['Cmd/Ctrl', 'Shift', 'M'], action: 'Mute' },
  { keys: ['Cmd/Ctrl', 'Shift', 'D'], action: 'Delete chat' },
  { keys: ['Cmd/Ctrl', 'P'], action: 'Profile & About' },
  { keys: ['Cmd/Ctrl', 'E'], action: 'Emoji panel' },
  { keys: ['Shift', '.'], action: 'Increase voice speed' },
  { keys: ['Shift', ','], action: 'Decrease voice speed' },
];

export default function KeyboardShortcutsModal({ onClose, isMac }) {
  const modalRef = useRef(null);
  const firstFocusRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const focusable = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable?.length) {
      focusable[0]?.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    const el = modalRef.current;
    el?.addEventListener('keydown', handleKeyDown);
    return () => el?.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatKey = (k) => {
    if (k === 'Cmd/Ctrl') return isMac ? '⌘' : 'Ctrl';
    if (k === 'Cmd') return isMac ? '⌘' : 'Ctrl';
    return k;
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <h2 id="shortcuts-title" className="p-4 text-lg font-semibold text-gray-800 dark:text-white border-b dark:border-slate-700">
          Keyboard Shortcuts
        </h2>
        <div className="overflow-y-auto flex-1 p-4">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
            {isMac ? 'Mac' : 'Windows'} shortcuts
          </p>
          {SHORTCUTS.map((s, i) => (
            <div
              key={i}
              className="flex justify-between items-center py-2 border-b dark:border-slate-700 last:border-0"
            >
              <span className="text-sm text-gray-700 dark:text-slate-300">{s.action}</span>
              <span className="flex gap-1">
                {s.keys.map((k, j) => (
                  <kbd
                    key={j}
                    className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-slate-600 rounded"
                  >
                    {formatKey(k)}
                  </kbd>
                ))}
              </span>
            </div>
          ))}
        </div>
        <div className="p-4 border-t dark:border-slate-700">
          <button
            ref={firstFocusRef}
            onClick={onClose}
            className="w-full py-2.5 bg-[#6C3EF4] text-white rounded-lg hover:bg-[#5b2ed9] transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
