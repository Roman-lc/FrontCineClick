import { useCallback, useEffect, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import Cargando from '../../components/ui/Cargando';
import EstadoVacio from '../../components/ui/EstadoVacio';
import MensajeError from '../../components/ui/MensajeError';
import { cancelarCompra } from '../../services/compras';
import { getFuncion, getPrecios } from '../../services/funciones';
import { getPelicula } from '../../services/peliculas';
import { funcionVigente } from '../../lib/fechas';
import { rutaPelicula } from '../../lib/slug';
import { estadoInicial, guardarCompra, leerCompraGuardada } from './estadoCompra';
import { CompraContext, useCuentaRegresiva } from './useCompra';

// Ruta padre de /compra/:funcionId/entradas, /butacas y /pago. La key reinicia todo al cambiar de funcion.
export default function CompraLayout() {
  const { funcionId } = useParams();
  return <FlujoCompra key={funcionId} funcionId={funcionId} />;
}

function FlujoCompra({ funcionId }) {
  const [carga, setCarga] = useState({ cargando: true, error: null, datos: null });
  const [intento, setIntento] = useState(0);
  const [estado, setEstado] = useState(() => estadoInicial(funcionId));
  const segundosRestantes = useCuentaRegresiva(estado.reserva?.fin);

  // Si quedo la reserva de otra funcion (una compra abandonada a mitad), se libera
  useEffect(() => {
    const anterior = leerCompraGuardada();
    if (anterior?.reserva && String(anterior.funcionId) !== String(funcionId)) {
      cancelarCompra(anterior.reserva.compra.id).catch(() => {});
    }
  }, [funcionId]);

  useEffect(() => {
    guardarCompra(estado);
  }, [estado]);

  useEffect(() => {
    let ignorar = false;
    Promise.all([getFuncion(funcionId), getPrecios(funcionId)])
      .then(async ([funcion, precios]) => {
        const pelicula = await getPelicula(funcion.peliculaId);
        if (!ignorar) setCarga({ cargando: false, error: null, datos: { funcion, pelicula, precios } });
      })
      .catch((error) => {
        if (!ignorar) setCarga({ cargando: false, error, datos: null });
      });
    return () => {
      ignorar = true;
    };
  }, [funcionId, intento]);

  const actualizar = useCallback(
    (cambios) => setEstado((anterior) => ({ ...anterior, ...(typeof cambios === 'function' ? cambios(anterior) : cambios) })),
    []
  );

  if (carga.cargando) {
    return (
      <section className="section">
        <Cargando texto="Cargando la función..." />
      </section>
    );
  }

  if (carga.error) {
    return (
      <section className="section">
        {carga.error.status === 404 ? (
          <EstadoVacio mensaje="La función que buscás no existe.">
            <Link to="/" className="btn btn-primary">
              Volver a la cartelera
            </Link>
          </EstadoVacio>
        ) : (
          <MensajeError
            mensaje={carga.error.message}
            onReintentar={() => {
              setCarga({ cargando: true, error: null, datos: null });
              setIntento((n) => n + 1);
            }}
          />
        )}
      </section>
    );
  }

  const { funcion, pelicula, precios } = carga.datos;
  if (!funcionVigente(funcion) && !estado.reserva) {
    return (
      <section className="section">
        <EstadoVacio mensaje="Esta función ya no está disponible para la venta.">
          <Link to={rutaPelicula(funcion.peliculaTitulo)} className="btn btn-primary">
            Ver otros horarios
          </Link>
        </EstadoVacio>
      </section>
    );
  }

  return (
    <CompraContext.Provider value={{ funcion, pelicula, precios, estado, actualizar, segundosRestantes }}>
      <Outlet />
    </CompraContext.Provider>
  );
}
