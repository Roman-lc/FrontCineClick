import { createContext, useContext, useEffect, useState } from 'react';

// Datos compartidos por los tres pasos (los carga CompraLayout):
// { funcion, pelicula, precios, estado, actualizar, segundosRestantes }
export const CompraContext = createContext(null);

export function useCompra() {
  const contexto = useContext(CompraContext);
  if (!contexto) throw new Error('useCompra se usa dentro de CompraLayout');
  return contexto;
}

const restantes = (fin) => (fin ? Math.max(0, Math.ceil((fin - Date.now()) / 1000)) : null);

// Segundos que faltan hasta "fin" (ms), o null si no hay reserva
export function useCuentaRegresiva(fin) {
  const [segundos, setSegundos] = useState(() => restantes(fin));
  useEffect(() => {
    const tic = () => setSegundos(restantes(fin));
    const primero = setTimeout(tic, 0);
    const intervalo = fin ? setInterval(tic, 1000) : null;
    return () => {
      clearTimeout(primero);
      clearInterval(intervalo);
    };
  }, [fin]);
  return segundos;
}
