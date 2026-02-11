import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectDarkMode, toggleTheme } from '../store/slices/themeSlice';
import ProfileEdit from './ProfileEdit';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';

const SETTINGS_MENU = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'privacy', label: 'Privacy', icon: '🔒' },
  { id: 'security', label: 'Security', icon: '🛡️' },
  { id: 'theme', label: 'Theme', icon: '🎨' },
  { id: 'wallpaper', label: 'Chat Wallpaper', icon: '🖼️' },
  { id: 'account', label: 'Request Account Info', icon: '📋' },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: '⌨️' },
  { id: 'help', label: 'Help', icon: '❓' },
];

export default function SettingsSidebar({ currentUser, onClose }) {
  const [activeSection, setActiveSection] = useState('profile');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const darkMode = useSelector(selectDarkMode);
  const dispatch = useDispatch();

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const mod = isMac ? '⌘' : 'Ctrl';

  return (
    <div className="w-[320px] bg-white dark:bg-slate-800 border-l dark:border-slate-700 flex flex-col h-full">
      <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Settings</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-300"
        >
          ✕
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {SETTINGS_MENU.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'shortcuts') setShowShortcuts(true);
              else setActiveSection(item.id);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeSection === item.id
                ? 'bg-[#6C3EF4]/20 text-[#6C3EF4]'
                : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {activeSection === 'profile' && currentUser && (
        <div className="flex-1 overflow-y-auto border-t dark:border-slate-700">
          <ProfileEdit
            user={{ ...currentUser, uid: currentUser.uid, displayName: currentUser.displayName, photoURL: currentUser.photoURL }}
            onClose={() => {}}
          />
        </div>
      )}

      {activeSection === 'theme' && (
        <div className="p-4 border-t dark:border-slate-700">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3">Theme</h3>
          <button
            onClick={() => dispatch(toggleTheme())}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gray-100 dark:bg-slate-700"
          >
            <span className="text-gray-700 dark:text-slate-300">Dark mode</span>
            <span className="text-sm text-gray-500">{darkMode ? 'On' : 'Off'}</span>
          </button>
        </div>
      )}

      {activeSection === 'notifications' && (
        <div className="p-4 border-t dark:border-slate-700">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3">Notifications</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">Configure notification preferences here.</p>
        </div>
      )}

      {activeSection === 'privacy' && (
        <div className="p-4 border-t dark:border-slate-700">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3">Privacy</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">Manage your privacy settings.</p>
        </div>
      )}

      {activeSection === 'security' && (
        <div className="p-4 border-t dark:border-slate-700">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3">Security</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">Security and two-factor authentication.</p>
        </div>
      )}

      {activeSection === 'wallpaper' && (
        <div className="p-4 border-t dark:border-slate-700">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3">Chat Wallpaper</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">Customize your chat background.</p>
        </div>
      )}

      {activeSection === 'account' && (
        <div className="p-4 border-t dark:border-slate-700">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3">Request Account Info</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">Download a copy of your data.</p>
        </div>
      )}

      {activeSection === 'help' && (
        <div className="p-4 border-t dark:border-slate-700">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3">Help</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">Get help and support.</p>
        </div>
      )}

      {showShortcuts && (
        <KeyboardShortcutsModal
          onClose={() => setShowShortcuts(false)}
          isMac={isMac}
        />
      )}
    </div>
  );
}
