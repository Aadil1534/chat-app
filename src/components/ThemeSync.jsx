import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectDarkMode } from '../store/slices/themeSlice';


export default function ThemeSync() {
  const darkMode = useSelector(selectDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return null;
}
