import { useEffect } from 'react';

// Pone en <meta name="theme-color"> el fondo del tema activo (--bg): oscuro en el sitio, claro en el
// panel. Se lee del token para no repetir el color; los layouts lo llaman al montarse.
export function useColorDeTema() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    const fondo = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    if (meta && fondo) meta.setAttribute('content', fondo);
  }, []);
}
