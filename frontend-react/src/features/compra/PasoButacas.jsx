import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/useAuth';
import EstadoError from '../../components/ui/EstadoError';
import { EsqueletoFilas } from '../../components/ui/Esqueletos';
import { useToast } from '../../components/ui/useToast';
import { cancelarCompra, crearReserva } from '../../services/compras';
import { getButacas } from '../../services/funciones';
import { cantidadDeEntradas, entradasParaReservar, nuevaReserva } from './estadoCompra';
import MapaButacas from './MapaButacas';
import PasoCompra from './PasoCompra';
import { useCompra } from './useCompra';
import styles from './compra.module.css';

export default function PasoButacas() {
  const { funcion, estado } = useCompra();
  const cantidad = cantidadDeEntradas(estado.entradas);
  if (cantidad === 0) return <Navigate to={`/compra/${funcion.id}/entradas`} replace />;
  return <MapaDelPaso cantidad={cantidad} />;
}

function MapaDelPaso({ cantidad }) {
  const { funcion, precios, estado, actualizar } = useCompra();
  const { user } = useAuth();
  const { mostrarAviso } = useToast();
  const navigate = useNavigate();
  const [butacas, setButacas] = useState(null);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);
  const [aviso, setAviso] = useState('');
  const [reservando, setReservando] = useState(false);
  const reservaAlEntrar = useRef(estado.reserva);
  const cancelacion = useRef(Promise.resolve());

  // Al volver al mapa con una reserva activa se cancela primero, para que sus butacas se vean libres
  useEffect(() => {
    let ignorar = false;
    const reserva = reservaAlEntrar.current;
    if (reserva) {
      reservaAlEntrar.current = null;
      cancelacion.current = cancelarCompra(reserva.compra.id).catch(() => {});
      actualizar({ reserva: null });
    }
    cancelacion.current
      .then(() => getButacas(funcion.id))
      .then((lista) => {
        if (!ignorar) setButacas(lista);
      })
      .catch(() => {
        if (!ignorar) setError(true);
      });
    return () => {
      ignorar = true;
    };
  }, [funcion.id, intento, actualizar]);

  // Si se bajo la cantidad en el paso 1 se conservan las primeras elegidas. Las que alguien ocupo
  // mientras tanto se descartan.
  const libres = new Set((butacas ?? []).filter((b) => b.disponible).map((b) => b.id));
  const elegidas = estado.butacas.filter((b) => !butacas || libres.has(b.id)).slice(0, cantidad);
  const palabra = cantidad === 1 ? 'butaca' : 'butacas';

  const alternar = (butaca) => {
    setAviso('');
    if (elegidas.some((b) => b.id === butaca.id)) {
      actualizar({ butacas: elegidas.filter((b) => b.id !== butaca.id) });
    } else if (elegidas.length >= cantidad) {
      mostrarAviso(`Ya elegiste ${cantidad} ${palabra}. Deseleccioná una para cambiarla`, 'info');
    } else {
      actualizar({ butacas: [...elegidas, { id: butaca.id, codigo: butaca.codigo }] });
    }
  };

  const continuar = async () => {
    setReservando(true);
    setAviso('');
    try {
      const compra = await crearReserva({
        clienteId: user.clienteId,
        funcionId: funcion.id,
        butacasIds: elegidas.map((b) => b.id),
        entradas: entradasParaReservar(estado.entradas, precios),
      });
      actualizar({ butacas: elegidas, reserva: nuevaReserva(compra) });
      navigate(`/compra/${funcion.id}/pago`);
    } catch (err) {
      if (err.status !== 409) {
        setAviso('No pudimos reservar las butacas. Probá de nuevo en unos segundos.');
      } else {
        // Alguien tomo una de las butacas: se refresca el mapa y se quitan solo las que ya no estan libres
        const lista = await getButacas(funcion.id).catch(() => null);
        if (lista) {
          setButacas(lista);
          const ahoraLibres = new Set(lista.filter((b) => b.disponible).map((b) => b.id));
          actualizar({ butacas: elegidas.filter((b) => ahoraLibres.has(b.id)) });
        }
        setAviso('Esa butaca se acaba de ocupar. Elegí otra');
      }
      setReservando(false);
    }
  };

  return (
    <PasoCompra
      titulo="Butacas"
      paso={2}
      onAtras={() => navigate(`/compra/${funcion.id}/entradas`)}
      accion={{
        texto: 'Continuar',
        deshabilitado: !butacas || elegidas.length !== cantidad,
        cargando: reservando,
        onClick: continuar,
      }}
    >
      <h2 className={styles.subtitulo}>Seleccioná tus butacas</h2>
      <p className={styles.indicacion}>
        Elegí {cantidad} {palabra}
        <span className={styles.contadorElegidas} aria-live="polite">
          {elegidas.length} de {cantidad} {cantidad === 1 ? 'elegida' : 'elegidas'}
        </span>
      </p>
      {aviso && (
        <p className={styles.alerta} role="alert" data-icono="error">
          {aviso}
        </p>
      )}
      {error && (
        <EstadoError
          titulo="No pudimos cargar la sala"
          onReintentar={() => {
            setError(false);
            setIntento((n) => n + 1);
          }}
        />
      )}
      {!butacas && !error && <EsqueletoFilas cantidad={1} alto={420} etiqueta="Cargando la sala" />}
      {butacas && <MapaButacas butacas={butacas} elegidas={elegidas} onAlternar={alternar} />}
    </PasoCompra>
  );
}
