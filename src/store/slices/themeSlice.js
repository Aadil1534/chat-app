import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'chat-app-theme';

const loadInitialDarkMode = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === 'dark';
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    darkMode: loadInitialDarkMode(),
  },
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem(STORAGE_KEY, state.darkMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', state.darkMode);
    },
    setDarkMode: (state, action) => {
      state.darkMode = !!action.payload;
      localStorage.setItem(STORAGE_KEY, state.darkMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', state.darkMode);
    },
  },
});

export const { toggleTheme, setDarkMode } = themeSlice.actions;
export const selectDarkMode = (state) => state.theme.darkMode;
export default themeSlice.reducer;
