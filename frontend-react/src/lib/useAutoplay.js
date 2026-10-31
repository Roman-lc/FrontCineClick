import { useEffect, useRef, useState } from 'react';

// Llama a alCumplirse cada "duracion" ms mientras "activo" sea true. Al pausar guarda el tiempo que
// faltaba y al reanudar sigue desde ahi; cambiar "reinicio" (por ejemplo, el slide actual) vuelve a
// contar desde cero. Ademas se pausa solo mientras la pestaña no esta visible.
// Devuelve si esta corriendo, para sincronizar la barra de progreso.
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

  // Corre despues de la limpieza del temporizador, asi un reinicio siempre arranca con el tiempo completo
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
