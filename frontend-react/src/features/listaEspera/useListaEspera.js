import { useEffect, useState } from 'react';
import { useAuth } from '../../app/useAuth';
import { getListaEspera } from '../../services/listaEspera';

// Peliculas en las que el cliente pidio aviso. Sin sesion de cliente la lista esta vacia.
export function useListaEspera() {
  const { user } = useAuth();
  const clienteId = user?.clienteId;
  const [anotadas, setAnotadas] = useState(() => new Set());

  useEffect(() => {
    if (!clienteId) return undefined;
    let ignorar = false;
    getListaEspera(clienteId)
      .then((lista) => {
        if (!ignorar) setAnotadas(new Set(lista.map((aviso) => aviso.peliculaId)));
      })
      .catch(() => {});
    return () => {
      ignorar = true;
    };
  }, [clienteId]);

  const marcar = (peliculaId, anotada) =>
    setAnotadas((actuales) => {
      const nuevas = new Set(actuales);
      if (anotada) nuevas.add(peliculaId);
      else nuevas.delete(peliculaId);
      return nuevas;
    });

  return { anotadas: clienteId ? anotadas : new Set(), marcar };
}
