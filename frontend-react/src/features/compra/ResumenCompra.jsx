import { useState } from 'react';
import IconoButaca from '../../components/ui/IconoButaca';
import Poster from '../../components/ui/Poster';
import { diaRelativo, horaCorta } from '../../lib/fechas';
import { etiquetaFormato, formatearPrecio } from '../../lib/formato';
import { renglonesDeEntradas } from './estadoCompra';
import { IconoCalendario, IconoEntrada, IconoFlecha } from './iconos';
import { useCompra } from './useCompra';
import styles from './compra.module.css';

export default function ResumenCompra({ paso, accion, esMovil, extra }) {
  const { funcion, pelicula, precios, estado } = useCompra();
  const [abierto, setAbierto] = useState(false);

  const renglones = renglonesDeEntradas(estado, precios);
  // Hasta que el backend crea la reserva, el total es una cuenta del navegador
  const aproximado = !estado.reserva;
  const total = estado.reserva ? Number(estado.reserva.compra.total) : renglones.reduce((suma, r) => suma + r.subtotal, 0);
  const butacas = estado.reserva
    ? estado.reserva.compra.entradas.map((e) => e.codigoButaca)
    : estado.butacas.map((b) => b.codigo);

  const secciones = (
    <div className={styles.secciones}>
      <Seccion icono={<Poster pelicula={pelicula} className={styles.miniatura} cargaDiferida={false} />} etiqueta="Película" poster>
        <strong>{pelicula.titulo}</strong>
        <span>
          {etiquetaFormato(funcion.formato)} · {funcion.idioma}
        </span>
      </Seccion>
      <Seccion icono={<IconoCalendario />} etiqueta="Cine, día y horario">
        <strong>{funcion.cineNombre}</strong>
        <span>{funcion.salaNombre}</span>
        <span>
          {diaRelativo(funcion.fechaHoraInicio)} · {horaCorta(funcion.fechaHoraInicio)}
        </span>
      </Seccion>
      <Seccion icono={<IconoEntrada />} etiqueta="Entradas">
        {renglones.length === 0 ? (
          <span>Todavía no elegiste entradas</span>
        ) : (
          <ul className={styles.renglones}>
            {renglones.map((r) => (
              <li key={r.tipo}>
                <span>
                  {r.cantidad} · {r.nombre}
                </span>
                <span>{formatearPrecio(r.subtotal)}</span>
              </li>
            ))}
          </ul>
        )}
      </Seccion>
      {paso >= 2 && (
        <Seccion icono={<IconoButaca tamano={20} />} etiqueta="Butacas">
          <span>{butacas.length ? butacas.join(' · ') : 'Todavía no elegiste butacas'}</span>
        </Seccion>
      )}
      {extra}
    </div>
  );

  return (
    <aside className={styles.resumen} aria-label="Resumen de la compra">
      {esMovil ? (
        <>
          <button
            type="button"
            className={styles.resumenAcordeon}
            aria-expanded={abierto}
            aria-controls="resumen-detalle"
            onClick={() => setAbierto((a) => !a)}
          >
            <span>Resumen</span>
            <span className={styles.resumenAcordeonTotal}>
              {formatearPrecio(total)}
              {aproximado && ' aprox.'}
              <IconoFlecha abierto={abierto} />
            </span>
          </button>
          <div id="resumen-detalle" hidden={!abierto}>
            {secciones}
          </div>
        </>
      ) : (
        <>
          <h2 className={styles.resumenTitulo}>Resumen</h2>
          {secciones}
        </>
      )}

      <div className={styles.barraTotal}>
        <div className={styles.total}>
          <span className={styles.totalEtiqueta}>{aproximado ? 'Total aprox.' : 'Total'}</span>
          <strong className={styles.totalMonto}>{formatearPrecio(total)}</strong>
        </div>
        <button
          type="button"
          className={`btn btn-primary ${styles.botonAccion}`}
          onClick={accion.onClick}
          disabled={accion.deshabilitado || accion.cargando}
          aria-busy={accion.cargando || undefined}
        >
          {accion.cargando ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Procesando…
            </>
          ) : (
            accion.texto
          )}
        </button>
      </div>
    </aside>
  );
}

function Seccion({ icono, etiqueta, poster = false, children }) {
  return (
    <section className={styles.seccion} aria-label={etiqueta}>
      <span className={poster ? styles.iconoPoster : styles.icono}>{icono}</span>
      <div className={styles.seccionTexto}>
        <span className={styles.seccionEtiqueta}>{etiqueta}</span>
        {children}
      </div>
    </section>
  );
}
