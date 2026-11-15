import { useCallback, useEffect, useState } from 'react';

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
  }, [version]); // eslint-disable-line react-hooks/exhaustive-deps

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  const reintentar = useCallback(() => {
    setEstado({ cargando: true, error: false, datos: null });
    setVersion((v) => v + 1);
  }, []);

  return { ...estado, recargar, reintentar };
}
