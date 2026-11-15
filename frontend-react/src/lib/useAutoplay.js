import { useEffect, useRef, useState } from 'react';

export function useAutoplay({ activo, duracion, alCumplirse, reinicio }) {
  const [pestanaVisible, setPestanaVisible] = useState(() => document.visibilityState === 'visible');
  const restante = useRef(duracion);
  const callback = useRef(alCumplirse);

  useEffect(() => {
    callback.current = alCumplirse;
  });

  useEffect(() => {
    const cambio = () => setPestanaVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', cambio);
    return () => document.removeEventListener('visibilitychange', cambio);
  }, []);

  useEffect(() => {
    restante.current = duracion;
  }, [reinicio, duracion]);

  const corriendo = activo && pestanaVisible;

  useEffect(() => {
    if (!corriendo) return undefined;
    const inicio = performance.now();
    const temporizador = setTimeout(() => {
      restante.current = duracion;
      callback.current();
    }, restante.current);
    return () => {
      clearTimeout(temporizador);
      restante.current = Math.max(0, restante.current - (performance.now() - inicio));
    };
  }, [corriendo, reinicio, duracion]);

  return corriendo;
}
