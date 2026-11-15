import { useEffect } from 'react';

export function useColorDeTema() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    const fondo = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    if (meta && fondo) meta.setAttribute('content', fondo);
  }, []);
}
