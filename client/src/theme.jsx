// Dark / Light mode: har page (landing, login, dashboard) yahi use karta hai, choice browser yaad rakhta hai
import { useEffect, useState } from 'react';
const isDark = () => localStorage.getItem('theme') === 'dark';
export function useTheme() {
  const [dark, setDark] = useState(isDark());
  useEffect(() => {
    const sync = () => setDark(isDark());
    window.addEventListener('themechange', sync);
    return () => window.removeEventListener('themechange', sync);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }, [dark]);
  const toggle = () => { localStorage.setItem('theme', isDark() ? 'light' : 'dark'); window.dispatchEvent(new Event('themechange')); };
  return [dark, toggle];
}
export function ThemeToggle({ className = '' }) {
  const [dark, toggle] = useTheme();
  return <button type="button" className={'themebtn ' + className} onClick={toggle} title={dark ? 'Light mode' : 'Dark mode'}>{dark ? '☀️' : '🌙'}</button>;
}
