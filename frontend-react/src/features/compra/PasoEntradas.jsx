import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Ayuda from '../../components/ui/Ayuda';
import { cancelarCompra } from '../../services/compras';
import { formatearPrecio } from '../../lib/formato';
import { MAXIMO_ENTRADAS, cantidadDeEntradas } from './estadoCompra';
import PasoCompra from './PasoCompra';
import { useCompra } from './useCompra';
import styles from './compra.module.css';

export default function PasoEntradas() {
  const { funcion, precios, estado, actualizar } = useCompra();
  const navigate = useNavigate();
  const total = cantidadDeEntradas(estado.entradas);
  const reservaAlEntrar = useRef(estado.reserva);

  // Volver a este paso con una reserva activa (por ejemplo con el boton atras del navegador) la cancela
  useEffect(() => {
    const reserva = reservaAlEntrar.current;
    if (!reserva) return;
    reservaAlEntrar.current = null;
    cancelarCompra(reserva.compra.id).catch(() => {});
    actualizar({ reserva: null });
  }, [actualizar]);

  const cambiar = (tipo, diferencia) =>
    actualizar((anterior) => ({
      entradas: { ...anterior.entradas, [tipo]: Math.max(0, (anterior.entradas[tipo] ?? 0) + diferencia) },
    }));

  return (
    <PasoCompra
      titulo="Entradas"
      paso={1}
      onAtras={() => navigate(`/peliculas/${funcion.peliculaId}`)}
      accion={{
        texto: 'Continuar',
        deshabilitado: total < 1,
        onClick: () => navigate(`/compra/${funcion.id}/butacas`),
      }}
    >
      <h2 className={styles.subtitulo}>Elegí el tipo de entrada</h2>
      {agruparPorSeccion(precios).map(([seccion, tipos]) => (
        <section key={seccion} className={styles.grupoEntradas} aria-label={seccion}>
          <h3 className={styles.grupoTitulo}>
            {seccion}
          </h3>
          <ul className={styles.tickets}>
            {tipos.map((tipo) => (
              <li key={tipo.tipo}>
                <TicketEntrada
                  tipo={tipo}
                  cantidad={estado.entradas[tipo.tipo] ?? 0}
                  puedeSumar={total < MAXIMO_ENTRADAS}
                  onCambiar={(diferencia) => cambiar(tipo.tipo, diferencia)}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className={styles.avisoMaximo} aria-live="polite">
        {total >= MAXIMO_ENTRADAS && `Máximo ${MAXIMO_ENTRADAS} entradas por compra`}
      </p>
    </PasoCompra>
  );
}

// Cada tipo de entrada es un "ticket": datos a la izquierda y contador a la derecha
function TicketEntrada({ tipo, cantidad, puedeSumar, onCambiar }) {
  return (
    <div className={styles.ticket}>
      <div className={styles.ticketDatos}>
        <p className={styles.ticketNombre}>
          {tipo.nombre}
          <Ayuda etiqueta={`Condiciones de la entrada ${tipo.nombre}`}>{tipo.condiciones}</Ayuda>
        </p>
        <p className={styles.ticketPrecio}>{formatearPrecio(tipo.precio)}</p>
      </div>
      <div className={styles.contador} role="group" aria-label={`Cantidad de entradas ${tipo.nombre}`}>
        <button
          type="button"
          className={styles.contadorBoton}
          onClick={() => onCambiar(-1)}
          disabled={cantidad === 0}
          aria-label={`Quitar una entrada ${tipo.nombre}`}
        >
          −
        </button>
        <output className={styles.contadorValor} aria-live="polite">
          {cantidad}
        </output>
        <button
          type="button"
          className={styles.contadorBoton}
          onClick={() => onCambiar(1)}
          disabled={!puedeSumar}
          aria-label={`Sumar una entrada ${tipo.nombre}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function agruparPorSeccion(precios) {
  const secciones = new Map();
  for (const precio of precios) {
    if (!secciones.has(precio.seccion)) secciones.set(precio.seccion, []);
    secciones.get(precio.seccion).push(precio);
  }
  return [...secciones.entries()];
}
