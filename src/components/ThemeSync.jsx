import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectDarkMode } from '../store/slices/themeSlice';

/**
 * Syncs Redux theme state to document.documentElement for Tailwind dark: variant.
 * Runs on mount and when darkMode changes.
 */
export default function ThemeSync() {
  const darkMode = useSelector(selectDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return null;
}
