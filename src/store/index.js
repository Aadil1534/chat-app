import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
});

// Apply initial dark mode class on load
const saved = localStorage.getItem('chat-app-theme');
if (saved === 'dark' || (saved === null && window.matchMedia?.('(prefers-color-scheme: dark)')?.matches)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}
