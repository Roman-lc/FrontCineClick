import { useSyncExternalStore } from 'react';

// true mientras la media query se cumpla, ej. useMediaQuery('(max-width: 860px)')
export function useMediaQuery(consulta) {
  return useSyncExternalStore(
    (avisar) => {
      const lista = window.matchMedia(consulta);
      lista.addEventListener('change', avisar);
      return () => lista.removeEventListener('change', avisar);
    },
    () => window.matchMedia(consulta).matches
  );
}
