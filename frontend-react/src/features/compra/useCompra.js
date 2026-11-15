import { createContext, useContext, useEffect, useState } from 'react';

export const CompraContext = createContext(null);

export function useCompra() {
  const contexto = useContext(CompraContext);
  if (!contexto) throw new Error('useCompra se usa dentro de CompraLayout');
  return contexto;
}

const restantes = (fin) => (fin ? Math.max(0, Math.ceil((fin - Date.now()) / 1000)) : null);

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
