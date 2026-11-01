import { useCallback, useEffect, useState } from 'react';

// Carga los datos de una pantalla de gestion. recargar() los vuelve a pedir sin mostrar el esqueleto
// (la tabla queda visible mientras se actualiza); reintentar() es para el estado de error.
export function useListado(cargar) {
  const [estado, setEstado] = useState({ cargando: true, error: false, datos: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignorar = false;
    cargar()
      .then((datos) => !ignorar && setEstado({ cargando: false, error: false, datos }))
      .catch(() => !ignorar && setEstado((e) => ({ cargando: false, error: !e.datos, datos: e.datos })));
    return () => {
      ignorar = true;
    };
    // cargar es fija por pantalla: solo se vuelve a pedir al cambiar la version
  }, [version]); // eslint-disable-line react-hooks/exhaustive-deps

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  const reintentar = useCallback(() => {
    setEstado({ cargando: true, error: false, datos: null });
    setVersion((v) => v + 1);
  }, []);

  return { ...estado, recargar, reintentar };
}
