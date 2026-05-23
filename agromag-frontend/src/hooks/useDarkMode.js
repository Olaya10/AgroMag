import { useState, useEffect, useCallback } from 'react';

/**
 * Hook genérico para gestionar el modo oscuro.
 * - Lee la preferencia del `localStorage` (clave "theme") al montar.
 * - Si no hay preferencia guardada, usa la preferencia del sistema (`prefers-color-scheme`).
 * - Añade o elimina la clase `dark` en `<html>` (document.documentElement).
 * - Persiste la elección en `localStorage`.
 *
 * @returns {[boolean, () => void]} isDark y toggleDarkMode
 */
export default function useDarkMode() {
  // Lectura inicial (lazy) para evitar flash de UI y tomar preferencia del sistema si no está guardada
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    // Detectar preferencia del sistema
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sincronizamos la clase del <html> cada vez que cambie `isDark`
  useEffect(() => {
    const htmlEl = document.documentElement;
    if (isDark) {
      htmlEl.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      htmlEl.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Función de toggle – memoizada
  const toggleDarkMode = useCallback(() => setIsDark(prev => !prev), []);

  return [isDark, toggleDarkMode];
}
